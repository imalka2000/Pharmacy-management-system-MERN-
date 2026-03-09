import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { Plus, Trash, Eye, Phone, Mail, MapPin } from 'lucide-react';
import AddSupplierModal from '../components/AddSupplierModal';
import ViewSupplierModal from '../components/ViewSupplierModal';

const Suppliers = () => {
    const { user } = useAuth();
    const [suppliers, setSuppliers] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        if (user?.token && suppliers.length === 0) fetchSuppliers();
    }, [user]);

    const fetchSuppliers = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/api/suppliers', config);
            setSuppliers(data);
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent row click
        if (window.confirm('Delete Supplier?')) {
            try {
                await axios.delete(`http://localhost:5001/api/suppliers/${id}`, config);
                fetchSuppliers();
            } catch (e) { console.error(e); }
        }
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Suppliers</h1>
                    <p className="text-gray-500">Manage your medicine suppliers</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition shadow-sm"
                >
                    <Plus size={20} className="mr-2" />
                    Add Supplier
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase">Supplier Name</th>
                                <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase">Contact</th>
                                <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase">Email</th>
                                <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase">Address</th>
                                <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {suppliers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">No suppliers found.</td>
                                </tr>
                            ) : (
                                suppliers.map(sup => (
                                    <tr
                                        key={sup._id}
                                        className="hover:bg-gray-50 transition cursor-pointer"
                                        onClick={() => setSelectedSupplier(sup)}
                                    >
                                        <td className="py-4 px-6 font-medium text-gray-800">{sup.name}</td>
                                        <td className="py-4 px-6 text-gray-600">
                                            <div className="flex items-center">
                                                <Phone size={16} className="mr-2 text-gray-400" />
                                                {sup.contactNumber}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">
                                            <div className="flex items-center">
                                                <Mail size={16} className="mr-2 text-gray-400" />
                                                {sup.email || '-'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600 truncate max-w-xs">{sup.address || '-'}</td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={(e) => handleDelete(e, sup._id)}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAddModalOpen && (
                <AddSupplierModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={fetchSuppliers}
                />
            )}

            {selectedSupplier && (
                <ViewSupplierModal
                    supplier={selectedSupplier}
                    onClose={() => setSelectedSupplier(null)}
                />
            )}
        </div>
    );
};

export default Suppliers;
