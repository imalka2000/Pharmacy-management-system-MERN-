import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';

const PrescriptionFormModal = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [formData, setFormData] = useState({
        customer: '',
        doctorName: '',
        notes: '',
        medicines: [{ name: '', dosage: '', frequency: '', duration: '', quantity: 1 }]
    });

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, medsRes] = await Promise.all([
                    axios.get('http://localhost:5001/api/auth/users', config),
                    axios.get('http://localhost:5001/api/medicines', config)
                ]);
                setCustomers(usersRes.data.filter(u => u.role === 'user'));
                setMedicines(medsRes.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [user]);

    const handleMedicineChange = (index, field, value) => {
        const newMedicines = [...formData.medicines];
        newMedicines[index][field] = value;

        // Auto-fill medicine ID if name matches existing medicine
        if (field === 'name') {
            const matchedMed = medicines.find(m => m.name.toLowerCase() === value.toLowerCase());
            if (matchedMed) newMedicines[index].medicine = matchedMed._id;
        }

        setFormData({ ...formData, medicines: newMedicines });
    };

    const addMedicineRow = () => {
        setFormData({
            ...formData,
            medicines: [...formData.medicines, { name: '', dosage: '', frequency: '', duration: '', quantity: 1 }]
        });
    };

    const removeMedicineRow = (index) => {
        const newMedicines = formData.medicines.filter((_, i) => i !== index);
        setFormData({ ...formData, medicines: newMedicines });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/api/prescriptions', formData, config);
            toast.success('Prescription created');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating prescription');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">New Prescription</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition"><X size={24} className="text-slate-500" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                            <select
                                className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                required
                                value={formData.customer}
                                onChange={e => setFormData({ ...formData, customer: e.target.value })}
                            >
                                <option value="">Select Customer</option>
                                {customers.map(c => <option key={c._id} value={c._id}>{c.fullName} ({c.phone})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Doctor Name</label>
                            <input
                                className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Dr. Name"
                                value={formData.doctorName}
                                onChange={e => setFormData({ ...formData, doctorName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-slate-700">Medicines</label>
                            <button type="button" onClick={addMedicineRow} className="text-indigo-600 text-sm font-medium hover:underline flex items-center">
                                <Plus size={16} className="mr-1" /> Add Item
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData.medicines.map((item, index) => (
                                <div key={index} className="flex gap-2 items-start">
                                    <input
                                        className="flex-1 border p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Medicine Name"
                                        required
                                        value={item.name}
                                        list="meds-list"
                                        onChange={e => handleMedicineChange(index, 'name', e.target.value)}
                                    />
                                    <input
                                        className="w-24 border p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Dosage"
                                        value={item.dosage}
                                        onChange={e => handleMedicineChange(index, 'dosage', e.target.value)}
                                    />
                                    <input
                                        className="w-24 border p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Freq"
                                        value={item.frequency}
                                        onChange={e => handleMedicineChange(index, 'frequency', e.target.value)}
                                    />
                                    <input
                                        className="w-24 border p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Duration"
                                        value={item.duration}
                                        onChange={e => handleMedicineChange(index, 'duration', e.target.value)}
                                    />
                                    <button type="button" onClick={() => removeMedicineRow(index)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                                        <Trash size={16} />
                                    </button>
                                </div>
                            ))}
                            <datalist id="meds-list">
                                {medicines.map(m => <option key={m._id} value={m.name} />)}
                            </datalist>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                        <textarea
                            className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                            rows="2"
                            placeholder="Additional instructions..."
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 border rounded-xl hover:bg-slate-50 font-medium text-slate-600 transition">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition">Create Prescription</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PrescriptionFormModal;
