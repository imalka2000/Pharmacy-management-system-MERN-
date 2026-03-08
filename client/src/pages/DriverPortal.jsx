import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Truck, MapPin, CheckCircle, Clock } from 'lucide-react';

const DriverPortal = () => {
    const { user } = useAuth();
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        if (user?.token) fetchDeliveries();
    }, [user]);

    const fetchDeliveries = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/deliveries/my-deliveries', config);
            setDeliveries(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching deliveries:', error);
            toast.error('Failed to load deliveries');
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/deliveries/${id}/status`, { status }, config);
            toast.success(`Delivery status updated to ${status}`);
            fetchDeliveries();
        } catch (error) {
            toast.error('Failed to update status');
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

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Driver Portal</h1>
                <p className="text-slate-500 mt-1">Manage your delivery tasks</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                {loading ? (
                    <div className="col-span-full py-10 text-center text-slate-400">Loading your deliveries...</div>
                ) : deliveries.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
                        No deliveries assigned to you yet.
                    </div>
                ) : (
                    deliveries.map(delivery => (
                        <div key={delivery._id} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 flex flex-col hover:shadow-xl transition relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusStyle(delivery.status)}`}>
                                    {delivery.status}
                                </span>
                            </div>

                            <div className="mb-4">
                                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Customer</div>
                                <div className="font-bold text-slate-800 text-lg">{delivery.customer?.fullName || 'Unknown Customer'}</div>
                                <div className="text-sm text-slate-500">{delivery.customer?.phone || 'No phone provided'}</div>
                            </div>

                            <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-4 mb-5 border border-slate-100 flex-1">
                                <MapPin size={20} className="text-indigo-500 mt-0.5 shrink-0" />
                                <div>
                                    <div className="text-slate-400 text-xs font-semibold uppercase">Delivery Address</div>
                                    <div className="text-slate-700 font-medium text-sm mt-0.5">{delivery.address}</div>
                                </div>
                            </div>

                            {delivery.notes && (
                                <div className="text-sm text-slate-600 italic bg-amber-50 p-3 rounded-xl mb-4 border border-amber-100 line-clamp-2">
                                    "{delivery.notes}"
                                </div>
                            )}

                            <div className="mt-auto grid grid-cols-1 gap-2 border-t pt-4 border-slate-100">
                                {delivery.status === 'Pending' && (
                                    <button onClick={() => updateStatus(delivery._id, 'Picked Up')} className="bg-purple-100 text-purple-700 hover:bg-purple-200 py-2.5 rounded-xl font-medium transition text-sm">
                                        Mark Picked Up
                                    </button>
                                )}
                                {delivery.status === 'Picked Up' && (
                                    <button onClick={() => updateStatus(delivery._id, 'In Transit')} className="bg-blue-100 text-blue-700 hover:bg-blue-200 py-2.5 rounded-xl font-medium transition text-sm flex items-center justify-center gap-2">
                                        <Truck size={16} /> Mark In Transit
                                    </button>
                                )}
                                {delivery.status === 'In Transit' && (
                                    <button onClick={() => updateStatus(delivery._id, 'Delivered')} className="bg-emerald-500 text-white hover:bg-emerald-600 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-500/30 transition text-sm flex items-center justify-center gap-2">
                                        <CheckCircle size={16} /> Mark Delivered
                                    </button>
                                )}
                                {delivery.status === 'Delivered' && (
                                    <div className="text-center text-emerald-600 font-semibold py-2 flex justify-center items-center gap-2 text-sm">
                                        <CheckCircle size={18} /> Delivery Completed
                                    </div>
                                )}
                            </div>

                            {/* Decorative background icon */}
                            <Truck size={120} className="absolute -bottom-6 -right-6 text-slate-50 opacity-50 z-0 pointer-events-none" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DriverPortal;
