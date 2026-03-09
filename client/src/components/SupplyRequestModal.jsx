import { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';

const SupplyRequestModal = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const [medicines, setMedicines] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [formData, setFormData] = useState({
        medicine: '',
        supplier: '',
        quantity: 1,
        expectedDate: '',
        notes: '',
        requestedBy: user?._id || ''
    });

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [medsRes, suppRes] = await Promise.all([
                    axios.get('http://localhost:5001/api/medicines', config),
                    axios.get('http://localhost:5001/api/suppliers', config)
                ]);
                setMedicines(medsRes.data);
                setSuppliers(suppRes.data);
            } catch (error) {
                console.error('Error fetching data for supply request form:', error);
                toast.error('Failed to load initial data');
            }
        };
        fetchData();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Need the logged-in user id
            const payload = { ...formData, requestedBy: user._id };
            await axios.post('http://localhost:5001/api/supply-requests', payload, config);
            toast.success('Supply request created successfully');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating supply request');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">New Supply Request</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition"><X size={24} className="text-slate-500" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Medicine</label>
                        <select
                            className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            required
                            value={formData.medicine}
                            onChange={e => setFormData({ ...formData, medicine: e.target.value })}
                        >
                            <option value="">Select Medicine</option>
                            {medicines.map(m => (
                                <option key={m._id} value={m._id}>{m.name} (Current Stock: {m.stock})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                        <select
                            className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            required
                            value={formData.supplier}
                            onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                        >
                            <option value="">Select Supplier</option>
                            {suppliers.map(s => (
                                <option key={s._id} value={s._id}>{s.name} ({s.contactPerson})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                            <input
                                type="number"
                                min="1"
                                className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Expected Date (Optional)</label>
                            <input
                                type="date"
                                className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                value={formData.expectedDate}
                                onChange={e => setFormData({ ...formData, expectedDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                        <textarea
                            className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                            rows="3"
                            placeholder="Additional notes for supplier or internal use..."
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 border rounded-xl hover:bg-slate-50 font-medium text-slate-600 transition">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition">Create Request</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupplyRequestModal;
