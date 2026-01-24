import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

const Reports = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState([]);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/sales', {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                setSales(data);
            } catch (e) { console.error(e); }
        };
        fetchSales();
    }, [user]);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Sales Report</h1>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4">Invoice</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Items</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Pharmacist</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map(sale => (
                            <tr key={sale._id} className="border-t hover:bg-gray-50">
                                <td className="p-4 font-mono">{sale.invoiceNumber}</td>
                                <td className="p-4">{new Date(sale.createdAt).toLocaleDateString()}</td>
                                <td className="p-4">{sale.items.length} Items</td>
                                <td className="p-4 font-bold text-green-600">${sale.grandTotal}</td>
                                <td className="p-4">{sale.pharmacist?.username || 'Unknown'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;
