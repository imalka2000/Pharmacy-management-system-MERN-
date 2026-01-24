import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { Plus, Edit, Trash, Search } from 'lucide-react';

const Medicines = () => {
    const { user } = useAuth();
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
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

    const handleDelete = async (id) => {
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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Medicines</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded flex items-center hover:bg-teal-800"
                >
                    <Plus size={18} className="mr-2" /> Add Medicine
                </button>
            </div>

            <div className="bg-white p-4 rounded shadow mb-6">
                <div className="flex items-center border rounded px-3 py-2">
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

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Batch</th>
                            <th className="p-4">Expiry</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td className="p-4">Loading...</td></tr> : filteredMedicines.map((med) => (
                            <tr key={med._id} className="border-t hover:bg-gray-50">
                                <td className="p-4 font-medium">{med.name}</td>
                                <td className="p-4">{med.batchNumber}</td>
                                <td className="p-4">{new Date(med.expiryDate).toLocaleDateString()}</td>
                                <td className="p-4">${med.price}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs ${med.quantity < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {med.quantity}
                                    </span>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                                    {user.role === 'admin' && (
                                        <button onClick={() => handleDelete(med._id)} className="text-red-500 hover:text-red-700"><Trash size={18} /></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add Medicine</h2>
                        <form onSubmit={handleSubmit}>
                            <input className="w-full border p-2 mb-2 rounded" placeholder="Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <input className="w-full border p-2 mb-2 rounded" placeholder="Batch Number" required value={formData.batchNumber} onChange={e => setFormData({ ...formData, batchNumber: e.target.value })} />
                            <input className="w-full border p-2 mb-2 rounded" type="date" required value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} />
                            <div className="flex gap-2 mb-2">
                                <input className="w-full border p-2 rounded" type="number" placeholder="Price" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                <input className="w-full border p-2 rounded" type="number" placeholder="Quantity" required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                            </div>
                            <input className="w-full border p-2 mb-4 rounded" placeholder="Manufacturer" value={formData.manufacturer} onChange={e => setFormData({ ...formData, manufacturer: e.target.value })} />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Medicines;
