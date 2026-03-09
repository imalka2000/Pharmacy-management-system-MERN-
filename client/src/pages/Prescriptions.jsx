import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { Plus, Search, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import PrescriptionFormModal from '../components/PrescriptionFormModal';

const Prescriptions = () => {
    const { user } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        if (user?.token) fetchPrescriptions();
    }, [user]);

    const fetchPrescriptions = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/api/prescriptions', config);
            setPrescriptions(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:5001/api/prescriptions/${id}/status`, { status }, config);
            toast.success(`Status updated to ${status}`);
            fetchPrescriptions();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'Processing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Picked Up': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const filteredPrescriptions = prescriptions.filter(p => {
        const matchesSearch = p.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p._id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Prescriptions</h1>
                    <p className="text-slate-500 mt-1">Manage and track customer prescriptions</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                >
                    <Plus size={20} className="mr-2" />
                    New Prescription
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex-1 max-w-md flex items-center">
                    <Search size={20} className="text-slate-400 mr-3" />
                    <input
                        type="text"
                        placeholder="Search by customer..."
                        className="outline-none w-full text-slate-600 placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 outline-none text-slate-600 font-medium"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Picked Up">Picked Up</option>
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
                {loading ? (
                    <div className="col-span-2 text-center py-10 text-slate-400">Loading prescriptions...</div>
                ) : filteredPrescriptions.length === 0 ? (
                    <div className="col-span-2 text-center py-10 text-slate-400">No prescriptions found.</div>
                ) : (
                    filteredPrescriptions.map(p => (
                        <div key={p._id} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 hover:shadow-xl transition duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mr-4">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{p.customer?.fullName || 'Unknown Customer'}</h3>
                                        <p className="text-sm text-slate-500">Dr. {p.doctorName || 'N/A'}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(p.status)}`}>
                                    {p.status}
                                </span>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2">
                                {p.medicines.map((med, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-700">{med.name}</span>
                                        <span className="text-slate-500">{med.dosage} ({med.frequency}) - {med.duration}</span>
                                    </div>
                                ))}
                            </div>

                            {p.notes && (
                                <p className="text-sm text-slate-500 italic mb-4 border-l-2 border-slate-300 pl-3">
                                    "{p.notes}"
                                </p>
                            )}

                            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                <span className="text-xs text-slate-400">
                                    {new Date(p.createdAt).toLocaleDateString()}
                                </span>
                                <div className="flex gap-2">
                                    {p.status === 'Pending' && (
                                        <button onClick={() => updateStatus(p._id, 'Processing')} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition">
                                            Start Processing
                                        </button>
                                    )}
                                    {p.status === 'Processing' && (
                                        <button onClick={() => updateStatus(p._id, 'Completed')} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition">
                                            Mark Completed
                                        </button>
                                    )}
                                    {p.status === 'Completed' && (
                                        <button onClick={() => updateStatus(p._id, 'Picked Up')} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition">
                                            Picked Up
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <PrescriptionFormModal
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchPrescriptions}
                />
            )}
        </div>
    );
};

export default Prescriptions;
