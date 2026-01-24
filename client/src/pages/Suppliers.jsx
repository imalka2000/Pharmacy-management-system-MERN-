import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { Plus, Trash } from 'lucide-react';

const Suppliers = () => {
    const { user } = useAuth();
    const [suppliers, setSuppliers] = useState([]);
    const [formData, setFormData] = useState({ name: '', contactNumber: '', address: '', email: '' });
    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        fetchSuppliers();
    }, [user]);

    const fetchSuppliers = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/suppliers', config);
            setSuppliers(data);
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/suppliers', formData, config);
            fetchSuppliers();
            setFormData({ name: '', contactNumber: '', address: '', email: '' });
        } catch (e) { alert('Error'); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete Supplier?')) {
            await axios.delete(`http://localhost:5000/api/suppliers/${id}`, config);
            fetchSuppliers();
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Suppliers</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4">Add Supplier</h2>
                    <form onSubmit={handleSubmit}>
                        <input className="w-full border p-2 mb-2 rounded" placeholder="Supplier Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        <input className="w-full border p-2 mb-2 rounded" placeholder="Contact Number" required value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} />
                        <input className="w-full border p-2 mb-2 rounded" placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        <textarea className="w-full border p-2 mb-4 rounded" placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                        <button className="bg-primary text-white px-4 py-2 rounded block w-full">Add Supplier</button>
                    </form>
                </div>

                <div className="bg-white p-6 rounded shadow overflow-y-auto max-h-[500px]">
                    <h2 className="text-xl font-bold mb-4">Supplier List</h2>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="pb-2">Name</th>
                                <th className="pb-2">Contact</th>
                                <th className="pb-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map(sup => (
                                <tr key={sup._id} className="border-b">
                                    <td className="py-3">{sup.name}</td>
                                    <td className="py-3">{sup.contactNumber}</td>
                                    <td className="py-3 text-right">
                                        <button onClick={() => handleDelete(sup._id)} className="text-red-500"><Trash size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Suppliers;
