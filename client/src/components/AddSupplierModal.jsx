import { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';

const AddSupplierModal = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({ name: '', contactNumber: '', address: '', email: '' });
    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/api/suppliers', formData, config);
            toast.success('Supplier added successfully');
            onSuccess();
            onClose();
        } catch (e) {
            console.error(e);
            toast.error('Error adding supplier');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Add Supplier</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                            <input
                                className="w-full border border-gray-300 p-2 rounded-lg outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                placeholder="Enter name"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                            <input
                                className="w-full border border-gray-300 p-2 rounded-lg outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                placeholder="Enter phone number"
                                required
                                value={formData.contactNumber}
                                onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                className="w-full border border-gray-300 p-2 rounded-lg outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                placeholder="Enter email address"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea
                                className="w-full border border-gray-300 p-2 rounded-lg outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 h-24 resize-none"
                                placeholder="Enter full address"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <div className="pt-2">
                            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold transition">
                                Add Supplier
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddSupplierModal;
