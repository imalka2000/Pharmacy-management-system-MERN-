import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { Plus, Edit, Trash, Search } from 'lucide-react';
import ViewMedicineModal from '../components/ViewMedicineModal';

const Medicines = () => {
    const { user } = useAuth();
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [formData, setFormData] = useState({
        name: '', batchNumber: '', expiryDate: '', price: '', quantity: '', manufacturer: ''
    });
    const [searchTerm, setSearchTerm] = useState('');

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        fetchMedicines();
    }, [user]);

    const fetchMedicines = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/medicines', config);
            setMedicines(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`http://localhost:5000/api/medicines/${id}`, config);
                fetchMedicines();
            } catch (error) {
                alert('Failed to delete');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/medicines', formData, config);
            setShowModal(false);
            fetchMedicines();
            setFormData({ name: '', batchNumber: '', expiryDate: '', price: '', quantity: '', manufacturer: '' });
        } catch (error) {
            alert('Error saving medicine');
        }
    };

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Medicines</h1>
                    <p className="text-gray-500">Manage medicine inventory</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-teal-800 transition shadow-sm"
                >
                    <Plus size={18} className="mr-2" /> Add Medicine
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition">
                    <Search size={18} className="text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search by name or batch..."
                        className="outline-none w-full"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Name</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Batch</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Expiry</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Price</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Stock</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr><td className="p-4 text-center text-gray-500" colSpan="6">Loading...</td></tr>
                            ) : filteredMedicines.length === 0 ? (
                                <tr><td className="p-4 text-center text-gray-500" colSpan="6">No medicines found.</td></tr>
                            ) : (
                                filteredMedicines.map((med) => (
                                    <tr
                                        key={med._id}
                                        className="hover:bg-gray-50 transition cursor-pointer"
                                        onClick={() => setSelectedMedicine(med)}
                                    >
                                        <td className="p-4 font-medium text-gray-800">{med.name}</td>
                                        <td className="p-4 text-gray-600">{med.batchNumber}</td>
                                        <td className="p-4 text-gray-600">{new Date(med.expiryDate).toLocaleDateString()}</td>
                                        <td className="p-4 text-gray-800 font-medium">${med.price}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${med.quantity < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {med.quantity}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); /* Edit logic */ }} className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                                                {user.role === 'admin' && (
                                                    <button onClick={(e) => handleDelete(e, med._id)} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"><Trash size={18} /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Add Medicine</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <input className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Batch Number" required value={formData.batchNumber} onChange={e => setFormData({ ...formData, batchNumber: e.target.value })} />
                            <input className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-primary outline-none" type="date" required value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} />
                            <div className="flex gap-2">
                                <input className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-primary outline-none" type="number" placeholder="Price" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                <input className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-primary outline-none" type="number" placeholder="Quantity" required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                            </div>
                            <input className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Manufacturer" value={formData.manufacturer} onChange={e => setFormData({ ...formData, manufacturer: e.target.value })} />
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-teal-800 transition">Save Medicine</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedMedicine && (
                <ViewMedicineModal
                    medicine={selectedMedicine}
                    onClose={() => setSelectedMedicine(null)}
                />
            )}
        </div>
    );
};

export default Medicines;
