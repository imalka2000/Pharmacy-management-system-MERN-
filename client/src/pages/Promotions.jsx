import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { Plus, Tag, Calendar, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Promotions = () => {
    const { user } = useAuth();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form for new promotion
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discountPercentage: '',
        startDate: '',
        endDate: ''
    });

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        if (user?.token) fetchPromotions();
    }, [user]);

    const fetchPromotions = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/api/promotions', config);
            setPromotions(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load promotions');
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/api/promotions', formData, config);
            toast.success('Promotion created successfully');
            setShowModal(false);
            setFormData({ title: '', description: '', discountPercentage: '', startDate: '', endDate: '' });
            fetchPromotions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create promotion');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this promotion?')) {
            try {
                await axios.delete(`http://localhost:5001/api/promotions/${id}`, config);
                toast.success('Promotion deleted');
                fetchPromotions();
            } catch (error) {
                toast.error('Failed to delete promotion');
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Promotions & Campaigns</h1>
                    <p className="text-slate-500 mt-1">Manage discounts and promotional events</p>
                </div>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                    >
                        <Plus size={20} className="mr-2" />
                        New Promotion
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                {loading ? (
                    <div className="col-span-full py-10 text-center text-slate-400">Loading promotions...</div>
                ) : promotions.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
                        No active promotions.
                    </div>
                ) : (
                    promotions.map(promo => (
                        <div key={promo._id} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 flex flex-col hover:shadow-xl transition relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition">
                                {user?.role === 'admin' && (
                                    <button onClick={() => handleDelete(promo._id)} className="text-rose-400 hover:text-rose-600 bg-rose-50 p-2 rounded-lg hover:bg-rose-100 transition">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
                                    <Tag size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{promo.title}</h3>
                                    <span className={`text-xs font-bold uppercase tracking-wider ${promo.status === 'Active' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        {promo.status}
                                    </span>
                                </div>
                            </div>

                            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 mb-2">
                                {promo.discountPercentage}% OFF
                            </div>

                            <p className="text-slate-600 text-sm mb-6 flex-1 line-clamp-2">
                                {promo.description || 'No description provided.'}
                            </p>

                            <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 border border-slate-100 mt-auto">
                                <Calendar size={18} className="text-slate-400 shrink-0" />
                                <div className="text-xs text-slate-600 font-medium">
                                    <span className="block text-slate-400 uppercase tracking-wider text-[10px]">Valid Until</span>
                                    {new Date(promo.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">New Promotion</h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-full transition"><X size={24} className="text-slate-500" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows="2"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Discount %</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                    value={formData.discountPercentage}
                                    onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border rounded-xl hover:bg-slate-50 font-medium text-slate-600 transition">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Promotions;
