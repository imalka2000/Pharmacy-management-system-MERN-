import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { Plus, Edit, Trash, Search, LayoutGrid, List as ListIcon, Upload, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import ViewMedicineModal from '../components/ViewMedicineModal';

const Medicines = () => {
    const { user } = useAuth();
    // ... (state remains same)
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [formData, setFormData] = useState({
        name: '', batchNumber: '', expiryDate: '', price: '', quantity: '', manufacturer: '', imageUrl: ''
    });
    const [uploading, setUploading] = useState(false);
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
        if (window.confirm('Are you sure you want to delete this medicine?')) {
            try {
                await axios.delete(`http://localhost:5000/api/medicines/${id}`, config);
                toast.success('Medicine deleted successfully');
                fetchMedicines();
            } catch (error) {
                toast.error('Failed to delete medicine');
            }
        }
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fd = new FormData();
        fd.append('image', file);
        setUploading(true);

        try {
            const { data } = await axios.post('http://localhost:5000/api/upload', fd, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user?.token}`
                },
            });
            setFormData({ ...formData, imageUrl: data });
            setUploading(false);
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Upload Error:', error);
            setUploading(false);
            toast.error(error.response?.data?.message || 'Image upload failed. Is server running?');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/medicines', formData, config);
            setShowModal(false);
            toast.success('Medicine added successfully');
            fetchMedicines();
            setFormData({ name: '', batchNumber: '', expiryDate: '', price: '', quantity: '', manufacturer: '', imageUrl: '' });
        } catch (error) {
            toast.error('Error saving medicine');
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
                <div className="flex gap-4">
                    <div className="bg-white border rounded-lg p-1 flex">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100 text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <ListIcon size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-teal-800 transition shadow-sm"
                    >
                        <Plus size={18} className="mr-2" /> Add Medicine
                    </button>
                </div>
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

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading...</div>
                ) : filteredMedicines.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No medicines found.</div>
                ) : viewMode === 'list' ? (
                    // LIST VIEW
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="p-4 font-semibold text-gray-600 text-sm uppercase w-16">Image</th>
                                        <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Name</th>
                                        <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Batch</th>
                                        <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Expiry</th>
                                        <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Price</th>
                                        <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Stock</th>
                                        <th className="p-4 font-semibold text-gray-600 text-sm uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredMedicines.map((med) => (
                                        <tr
                                            key={med._id}
                                            className="hover:bg-gray-50 transition cursor-pointer"
                                            onClick={() => setSelectedMedicine(med)}
                                        >
                                            <td className="p-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                                                    {med.imageUrl ? (
                                                        <img
                                                            src={med.imageUrl.startsWith('http') ? med.imageUrl : `http://localhost:5000${med.imageUrl}`}
                                                            alt={med.name}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                                        />
                                                    ) : null}
                                                    <ImageIcon size={18} className={`text-gray-400 ${med.imageUrl ? 'hidden' : ''}`} />
                                                </div>
                                            </td>
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
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    // GRID VIEW
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMedicines.map((med) => (
                            <div
                                key={med._id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer flex flex-col group"
                                onClick={() => setSelectedMedicine(med)}
                            >
                                <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                                    {med.imageUrl ? (
                                        <img
                                            src={med.imageUrl.startsWith('http') ? med.imageUrl : `http://localhost:5000${med.imageUrl}`}
                                            alt={med.name}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                                        />
                                    ) : (
                                        <ImageIcon size={48} className="text-gray-300" />
                                    )}
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                                        ${med.price}
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{med.name}</h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ml-2 ${med.quantity < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {med.quantity} left
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-4">Batch: {med.batchNumber}</p>

                                    <div className="mt-auto flex justify-end gap-2 pt-3 border-t">
                                        <button onClick={(e) => { e.stopPropagation(); /* Edit logic */ }} className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition"><Edit size={18} /></button>
                                        <button onClick={(e) => handleDelete(e, med._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"><Trash size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Add Medicine</h2>
                            <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><Trash size={20} className="hidden" />X</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Image</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
                                    <input
                                        type="file"
                                        onChange={uploadFileHandler}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {formData.imageUrl ? (
                                        <div className="relative h-32 w-full">
                                            <img src={`http://localhost:5000${formData.imageUrl}`} alt="Preview" className="h-full w-full object-contain mx-auto" />
                                            {uploading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center">Uploading...</div>}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-4">
                                            <Upload className="text-gray-400 mb-2" size={32} />
                                            <p className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Click to upload or drag and drop'}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 text-center text-xs text-gray-400">OR</div>
                                <input
                                    className="w-full border p-2 mt-2 rounded-lg text-sm"
                                    placeholder="Paste Image URL"
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                />
                            </div>

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
