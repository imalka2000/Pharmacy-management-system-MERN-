import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { MessageSquare, Star, Reply, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Feedback = () => {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    // For customers submitting feedback
    const [formData, setFormData] = useState({ rating: 5, comments: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        if (user?.token && user?.role === 'admin') {
            fetchFeedbacks();
        } else {
            setLoading(false); // Non-admins just see the form
        }
    }, [user]);

    const fetchFeedbacks = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/api/feedback', config);
            setFeedbacks(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load feedback');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axios.post('http://localhost:5001/api/feedback', formData, config);
            toast.success('Thank you for your feedback!');
            setFormData({ rating: 5, comments: '' });
        } catch (error) {
            toast.error('Failed to submit feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    const markReviewed = async (id) => {
        try {
            await axios.put(`http://localhost:5001/api/feedback/${id}/status`, { status: 'Reviewed' }, config);
            toast.success('Marked as reviewed');
            fetchFeedbacks();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star key={i} size={i < rating ? 20 : 16} className={i < rating ? "text-amber-400 fill-amber-400" : "text-slate-300"} />
        ));
    };

    if (user?.role !== 'admin') {
        return (
            <div className="max-w-3xl mx-auto h-full flex flex-col items-center justify-center py-10">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 w-full text-center">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageSquare size={40} className="text-indigo-500" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">We value your feedback</h1>
                    <p className="text-slate-500 mb-8">Help us improve our service by sharing your experience.</p>

                    <form onSubmit={handleSubmit} className="text-left space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3 text-center">How would you rate us?</label>
                            <div className="flex justify-center gap-2 mb-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star size={40} className={star <= formData.rating ? "text-amber-400 fill-amber-400 drop-shadow-sm" : "text-slate-200"} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Additional Comments</label>
                            <textarea
                                className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition text-slate-700 bg-slate-50 focus:bg-white"
                                rows="5"
                                required
                                placeholder="Tell us what you loved or what we can do better..."
                                value={formData.comments}
                                onChange={e => setFormData({ ...formData, comments: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Admin View
    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Customer Feedback</h1>
                <p className="text-slate-500 mt-1">Review what your customers are saying</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                {loading ? (
                    <div className="col-span-full py-10 text-center text-slate-400">Loading feedback...</div>
                ) : feedbacks.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-300">
                        <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
                        No feedback received yet.
                    </div>
                ) : (
                    feedbacks.map(fb => (
                        <div key={fb._id} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 flex flex-col transition hover:shadow-xl">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-200">
                                        {fb.customer?.fullName?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800">{fb.customer?.fullName || 'Unknown Customer'}</div>
                                        <div className="text-xs text-slate-400">{new Date(fb.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${fb.status === 'Reviewed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                    {fb.status}
                                </div>
                            </div>

                            <div className="flex items-center gap-1 mb-3">
                                {renderStars(fb.rating)}
                            </div>

                            <p className="text-slate-700 italic flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                "{fb.comments}"
                            </p>

                            {fb.status === 'Pending' && (
                                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                                    <button
                                        onClick={() => markReviewed(fb._id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-medium rounded-xl transition text-sm border hover:border-emerald-200"
                                    >
                                        <CheckCircle size={16} /> Mark as Reviewed
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Feedback;
