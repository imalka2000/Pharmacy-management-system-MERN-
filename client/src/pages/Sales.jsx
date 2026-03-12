import { useState, useEffect } from 'react';
import apiClient from '../api-request/config';
import useAuth from '../hooks/useAuth';
import { Button, Table, Card, Spinner } from 'react-bootstrap';
import CreateSaleModal from '../components/CreateSaleModal';
import ViewSaleModal from '../components/ViewSaleModal';
import toast from 'react-hot-toast';

const Sales = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.token) fetchSales();
    }, [user]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/sales');
            setSales(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch sales history');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark m-0">Sales History</h2>
                    <p className="text-muted small m-0">Review and manage recent transactions</p>
                </div>
                <Button
                    variant="primary"
                    className="shadow-sm rounded-3 d-flex align-items-center px-4 py-2"
                    onClick={() => setIsModalOpen(true)}
                >
                    <i className="bi bi-cart-plus-fill me-2"></i> New Sale
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Loading transaction records...</p>
                </div>
            ) : sales.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
                    <i className="bi bi-receipt fs-1 text-muted opacity-25"></i>
                    <p className="mt-3 text-muted">No sales records found.</p>
                </div>
            ) : (
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                    <Table hover responsive className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 text-muted small fw-bold text-uppercase">Invoice #</th>
                                <th className="py-3 text-muted small fw-bold text-uppercase">Date & Time</th>
                                <th className="py-3 text-muted small fw-bold text-uppercase">Pharmacist</th>
                                <th className="py-3 text-muted small fw-bold text-uppercase text-center">Items</th>
                                <th className="pe-4 py-3 text-end text-muted small fw-bold text-uppercase">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map(sale => (
                                <tr
                                    key={sale._id}
                                    className="align-middle"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setSelectedSale(sale)}
                                >
                                    <td className="ps-4">
                                        <span className="fw-bold text-dark">{sale.invoiceNumber}</span>
                                    </td>
                                    <td>
                                        <div className="text-muted d-flex align-items-center">
                                            <i className="bi bi-calendar3 text-primary opacity-50 me-2"></i>
                                            {new Date(sale.createdAt).toLocaleDateString()}
                                            <span className="ms-2 small opacity-75">{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-muted d-flex align-items-center">
                                            <i className="bi bi-person text-primary opacity-50 me-2"></i>
                                            {sale.pharmacist?.username || 'System'}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                                            {sale.items.length} {sale.items.length === 1 ? 'Item' : 'Items'}
                                        </span>
                                    </td>
                                    <td className="pe-4 text-end">
                                        <span className="fw-bold text-primary fs-5">
                                            ${sale.grandTotal.toFixed(2)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            )}

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
