import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { Plus, Search, Calendar, DollarSign, User } from 'lucide-react';
import CreateSaleModal from '../components/CreateSaleModal';
import ViewSaleModal from '../components/ViewSaleModal';

const Sales = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [loading, setLoading] = useState(true);

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    // ... (fetchSales function remains same)

    const fetchSales = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('http://localhost:5000/api/sales', config);
            setSales(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, [user]);

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sales History</h1>
                    <p className="text-gray-500">Manage and view your sales records</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition shadow-sm"
                >
                    <Plus size={20} className="mr-2" />
                    New Sale
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase">Invoice #</th>
                                <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase">Date</th>
                                <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase">Pharmacist</th>
                                <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase">Items</th>
                                <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">Loading sales...</td>
                                </tr>
                            ) : sales.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">No sales records found.</td>
                                </tr>
                            ) : (
                                sales.map(sale => (
                                    <tr
                                        key={sale._id}
                                        className="hover:bg-gray-50 transition cursor-pointer"
                                        onClick={() => setSelectedSale(sale)}
                                    >
                                        <td className="py-4 px-6 font-medium text-gray-800">{sale.invoiceNumber}</td>
                                        <td className="py-4 px-6 text-gray-600">
                                            <div className="flex items-center">
                                                <Calendar size={16} className="mr-2 text-gray-400" />
                                                {new Date(sale.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">
                                            <div className="flex items-center">
                                                <User size={16} className="mr-2 text-gray-400" />
                                                {sale.pharmacist?.username || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">{sale.items.length} items</td>
                                        <td className="py-4 px-6 font-bold text-green-600">
                                            <div className="flex items-center">
                                                <DollarSign size={16} className="mr-1" />
                                                {sale.grandTotal}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <CreateSaleModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchSales}
                />
            )}

            {selectedSale && (
                <ViewSaleModal
                    sale={selectedSale}
                    onClose={() => setSelectedSale(null)}
                />
            )}
        </div>
    );
};

export default Sales;
