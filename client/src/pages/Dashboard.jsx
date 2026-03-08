import { useEffect, useState } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Truck, MessageSquare, Tag, Package } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = user.token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('http://localhost:5000/api/reports/dashboard', config);
                setStats(data);
            } catch (error) {
                console.error(error);
            }
        };
        if (user?.token && !stats) fetchStats();
    }, [user, stats]);

    if (!stats) return <div className="p-10 text-center text-slate-500">Loading Dashboard...</div>;

    const data = [
        { name: 'Medicines', count: stats.totalMedicines || 0 },
        { name: 'Suppliers', count: stats.totalSuppliers || 0 },
        { name: 'Sales', count: stats.totalSales || 0 },
        { name: 'Promos', count: stats.activePromotions || 0 },
        { name: 'Deliveries', count: stats.pendingDeliveries || 0 }
    ];

    return (
        <div className="max-w-7xl mx-auto pb-10">
            <h1 className="text-3xl font-extrabold mb-8 text-slate-800 tracking-tight">Admin Dashboard V2</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Revenue Card */}
                <div className="relative overflow-hidden rounded-2xl shadow-lg border border-blue-100 group hover:shadow-xl transition-all duration-300 bg-white">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="p-6 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-semibold text-blue-500 uppercase tracking-wider mb-1">Total Revenue</p>
                                <h3 className="text-3xl font-bold text-slate-800">${(stats.totalRevenue || 0).toFixed(2)}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sales Card */}
                <div className="relative overflow-hidden rounded-2xl shadow-lg border border-emerald-100 group hover:shadow-xl transition-all duration-300 bg-white">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="p-6 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-1">Total Sales</p>
                                <h3 className="text-3xl font-bold text-slate-800">{stats.totalSales || 0}</h3>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Low Stock */}
                <div className="relative overflow-hidden rounded-2xl shadow-lg border border-orange-100 group hover:shadow-xl transition-all duration-300 bg-white">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-orange-500 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="p-6 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-semibold text-orange-500 uppercase tracking-wider mb-1">Low Stock</p>
                                <h3 className="text-3xl font-bold text-slate-800">{stats.lowStock || 0}</h3>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Out of Stock */}
                <div className="relative overflow-hidden rounded-2xl shadow-lg border border-rose-100 group hover:shadow-xl transition-all duration-300 bg-white">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-rose-500 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="p-6 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-semibold text-rose-500 uppercase tracking-wider mb-1">Out of Stock</p>
                                <h3 className="text-3xl font-bold text-slate-800">{stats.outOfStock || 0}</h3>
                            </div>
                            <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* V2 Integration Cards */}
            <h2 className="text-xl font-bold mb-4 text-slate-800 tracking-tight">V2 Integrations Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                    <Truck size={24} className="mb-3 opacity-90" />
                    <h3 className="text-2xl font-black mb-1">{stats.pendingDeliveries || 0}</h3>
                    <p className="text-sm font-medium opacity-90 uppercase tracking-widest text-indigo-100">Pending Deliveries</p>
                </div>
                <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-5 rounded-2xl text-white shadow-lg shadow-pink-500/20">
                    <Tag size={24} className="mb-3 opacity-90" />
                    <h3 className="text-2xl font-black mb-1">{stats.activePromotions || 0}</h3>
                    <p className="text-sm font-medium opacity-90 uppercase tracking-widest text-pink-100">Active Promos</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-5 rounded-2xl text-white shadow-lg shadow-amber-500/20">
                    <MessageSquare size={24} className="mb-3 opacity-90" />
                    <h3 className="text-2xl font-black mb-1">{stats.pendingFeedback || 0}</h3>
                    <p className="text-sm font-medium opacity-90 uppercase tracking-widest text-amber-100">New Feedback</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-5 rounded-2xl text-white shadow-lg shadow-cyan-500/20">
                    <Package size={24} className="mb-3 opacity-90" />
                    <h3 className="text-2xl font-black mb-1">{stats.pendingSupplyRequests || 0}</h3>
                    <p className="text-sm font-medium opacity-90 uppercase tracking-widest text-cyan-100">Supply Orders</p>
                </div>
            </div>

            {/* Chart Area */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 h-96">
                <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-indigo-500"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                    System Statistics Overview
                </h3>
                <ResponsiveContainer width="100%" height="100%" className="-ml-4">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip
                            cursor={{ fill: '#f1f5f9' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                        />
                        <Bar dataKey="count" fill="url(#colorGradient)" radius={[6, 6, 0, 0]} barSize={50} />
                        <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                <stop offset="100%" stopColor="#4338ca" stopOpacity={0.8} />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Dashboard;
