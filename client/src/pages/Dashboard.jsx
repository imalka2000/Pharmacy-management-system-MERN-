import { useEffect, useState } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
        if (user?.token) fetchStats();
    }, [user]);

    if (!stats) return <div>Loading...</div>;

    const data = [
        { name: 'Medicines', count: stats.totalMedicines },
        { name: 'Suppliers', count: stats.totalSuppliers },
        { name: 'Sales', count: stats.totalSales },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded shadow-md border-l-4 border-blue-500">
                    <h3 className="text-gray-500">Total Revenue</h3>
                    <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded shadow-md border-l-4 border-green-500">
                    <h3 className="text-gray-500">Total Sales</h3>
                    <p className="text-2xl font-bold">{stats.totalSales}</p>
                </div>
                <div className="bg-white p-6 rounded shadow-md border-l-4 border-orange-500">
                    <h3 className="text-gray-500">Low Stock Items</h3>
                    <p className="text-2xl font-bold">{stats.lowStock}</p>
                </div>
                <div className="bg-white p-6 rounded shadow-md border-l-4 border-red-500">
                    <h3 className="text-gray-500">Out of Stock</h3>
                    <p className="text-2xl font-bold">{stats.outOfStock}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded shadow-md h-96">
                <h3 className="text-xl font-bold mb-4">Overview</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#0f766e" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Dashboard;
