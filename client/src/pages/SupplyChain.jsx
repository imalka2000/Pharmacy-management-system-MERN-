import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { Plus, Search, Truck, Package, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import SupplyRequestModal from '../components/SupplyRequestModal';

const SupplyChain = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        if (user?.token) fetchRequests();
    }, [user]);

    const fetchRequests = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/supply-requests', config);
            setRequests(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching supply requests:', error);
            toast.error('Failed to load supply chain data');
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/supply-requests/${id}/status`, { status }, config);
            toast.success(`Request marked as ${status}`);
            if (status === 'Received') {
                toast.success('Inventory stock updated automatically'); // Highlight core feature
            }
            fetchRequests();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Sent to Supplier': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Received': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const StatusIcon = ({ status }) => {
        switch (status) {
            case 'Pending': return <Clock size={20} className="text-yellow-500" />;
            case 'Sent to Supplier': return <Truck size={20} className="text-blue-500" />;
            case 'Received': return <CheckCircle size={20} className="text-emerald-500" />;
            default: return <Package size={20} className="text-slate-500" />;
        }
    };

    const filteredRequests = requests.filter(r => {
        const matchesSearch = r.medicine?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Supply Chain</h1>
                    <p className="text-slate-500 mt-1">Manage stock replenishment requests</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                >
                    <Plus size={20} className="mr-2" />
                    New Request
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex-1 max-w-md flex items-center">
                    <Search size={20} className="text-slate-400 mr-3" />
                    <input
                        type="text"
                        placeholder="Search by medicine or supplier..."
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
                    <option value="Sent to Supplier">Sent to Supplier</option>
                    <option value="Received">Received</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                {loading ? (
                    <div className="col-span-full text-center py-10 text-slate-400">Loading supply requests...</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-slate-400">No supply requests found.</div>
                ) : (
                    filteredRequests.map(req => (
                        <div key={req._id} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 hover:shadow-xl transition duration-300 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border w-max mb-3 flex items-center gap-1.5 ${getStatusStyle(req.status)}`}>
                                        <StatusIcon status={req.status} /> {req.status}
                                    </span>
                                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{req.medicine?.name || 'Unknown Medicine'}</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Qty: <span className="text-indigo-600 font-bold">{req.quantity}</span></p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 mb-4 text-sm flex-1">
                                <div className="mb-2">
                                    <span className="text-slate-400 block text-xs uppercase font-semibold">Supplier</span>
                                    <span className="text-slate-700 font-medium">{req.supplier?.name || 'Unknown Supplier'}</span>
                                </div>
                                <div className="mb-2">
                                    <span className="text-slate-400 block text-xs uppercase font-semibold">Expected Date</span>
                                    <span className="text-slate-700">{req.expectedDate ? new Date(req.expectedDate).toLocaleDateString() : 'Not set'}</span>
                                </div>
                                {req.notes && (
                                    <div className="mt-3 pt-3 border-t border-slate-200">
                                        <p className="text-slate-500 italic">"{req.notes}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 mt-auto pt-2">
                                {req.status === 'Pending' && (
                                    <button onClick={() => updateStatus(req._id, 'Sent to Supplier')} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition w-full text-sm">
                                        Mark Sent
                                    </button>
                                )}
                                {req.status === 'Sent to Supplier' && (
                                    <button onClick={() => updateStatus(req._id, 'Received')} className="px-4 py-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 font-medium hover:bg-emerald-600 transition w-full flex items-center justify-center gap-2 text-sm">
                                        <Package size={16} /> Mark Received
                                    </button>
                                )}
                                {(req.status === 'Pending' || req.status === 'Sent to Supplier') && (
                                    <button onClick={() => updateStatus(req._id, 'Cancelled')} className="p-2 border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 rounded-xl transition" title="Cancel Request">
                                        <X size={18} />
                                    </button>
                                )}
                                {req.status === 'Received' && (
                                    <div className="w-full text-center py-2 text-sm font-semibold text-emerald-600 flex items-center justify-center gap-1">
                                        <CheckCircle size={16} /> Stock Updated
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <SupplyRequestModal
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchRequests}
                />
            )}
        </div>
    );
};

export default SupplyChain;
