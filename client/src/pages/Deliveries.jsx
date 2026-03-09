import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { Plus, Search, MapPin, Loader, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Deliveries = () => {
    const { user } = useAuth();
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Create new delivery logic simplified for Admin
    const [showModal, setShowModal] = useState(false);
    const [drivers, setDrivers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({ driver: '', customer: '', address: '', notes: '' });

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        if (user?.token) {
            fetchDeliveries();
            fetchFormDependencies();
        }
    }, [user]);

    const fetchDeliveries = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/api/deliveries', config);
            setDeliveries(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load deliveries');
            setLoading(false);
        }
    };

    const fetchFormDependencies = async () => {
        try {
            const [usersRes, empRes] = await Promise.all([
                axios.get('http://localhost:5001/api/auth/users?role=user', config),
                axios.get('http://localhost:5001/api/auth/users?role=driver', config)
            ]);
            setCustomers(usersRes.data);
            setDrivers(empRes.data);
        } catch (error) {
            console.error('Error fetching dependencies', error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/api/deliveries', formData, config);
            toast.success('Delivery assigned successfully!');
            setShowModal(false);
            setFormData({ driver: '', customer: '', address: '', notes: '' });
            fetchDeliveries();
        } catch (error) {
            toast.error('Failed to assign delivery');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            case 'Picked Up': return 'bg-purple-100 text-purple-700';
            case 'In Transit': return 'bg-blue-100 text-blue-700';
            case 'Delivered': return 'bg-emerald-100 text-emerald-700';
            case 'Cancelled': return 'bg-rose-100 text-rose-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const filteredDeliveries = deliveries.filter(d => {
        const matchSearch = d.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.driver?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'All' || d.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Delivery Management</h1>
                    <p className="text-slate-500 mt-1">Assign and track all deliveries</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                >
                    <Plus size={20} className="mr-2" />
                    Assign Delivery
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex-1 max-w-md flex items-center">
                    <Search size={20} className="text-slate-400 mr-3" />
                    <input
                        type="text"
                        placeholder="Search customer or driver..."
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
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Picked Up">Picked Up</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex-1 mb-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                        <Loader className="animate-spin mb-4" size={32} />
                        <p>Loading deliveries...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-semibold w-1/4">Customer</th>
                                    <th className="p-4 font-semibold w-1/4">Assigned Driver</th>
                                    <th className="p-4 font-semibold max-w-xs">Address</th>
                                    <th className="p-4 font-semibold text-center w-32">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredDeliveries.map(delivery => (
                                    <tr key={delivery._id} className="hover:bg-slate-50/50 transition duration-150">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{delivery.customer?.fullName || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500">{delivery.customer?.phone}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-slate-700">{delivery.driver?.fullName || 'Unassigned'}</div>
                                            <div className="text-xs text-slate-500">{delivery.driver?.phone}</div>
                                        </td>
                                        <td className="p-4 max-w-xs">
                                            <div className="text-sm text-slate-600 truncate flex items-center gap-1.5" title={delivery.address}>
                                                <MapPin size={14} className="text-slate-400 shrink-0" />
                                                <span className="truncate">{delivery.address}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusStyle(delivery.status)}`}>
                                                {delivery.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredDeliveries.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-slate-500">
                                            No deliveries found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal for Creating Delivery */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">Assign Delivery</h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-full transition"><X size={24} className="text-slate-500" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Customer</label>
                                <select
                                    className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    required
                                    value={formData.customer}
                                    onChange={e => {
                                        const c = customers.find(x => x._id === e.target.value);
                                        setFormData({ ...formData, customer: e.target.value, address: c?.address || '' });
                                    }}
                                >
                                    <option value="">Select Customer</option>
                                    {customers.map(c => <option key={c._id} value={c._id}>{c.fullName} ({c.email})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Driver</label>
                                <select
                                    className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    required
                                    value={formData.driver}
                                    onChange={e => setFormData({ ...formData, driver: e.target.value })}
                                >
                                    <option value="">Select Driver</option>
                                    {drivers.map(d => <option key={d._id} value={d._id}>{d.fullName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address</label>
                                <textarea
                                    className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    rows="2"
                                    required
                                    placeholder="Enter full address"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                                <textarea
                                    className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    rows="2"
                                    placeholder="Any specific instructions..."
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border rounded-xl hover:bg-slate-50 font-medium text-slate-600 transition">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition">Assign Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Deliveries;
