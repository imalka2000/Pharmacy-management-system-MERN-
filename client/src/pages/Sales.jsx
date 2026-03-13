import { useState, useEffect } from 'react';
import apiClient from '../api-request/config';
import useAuth from '../hooks/useAuth';
import { Button, Table, Card, Spinner, Badge, InputGroup, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ViewSaleModal from '../components/ViewSaleModal';
import toast from 'react-hot-toast';

const Sales = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sales, setSales] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
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
            toast.error('Failed to fetch billing history');
        } finally {
            setLoading(false);
        }
    };

    const filteredSales = sales.filter(sale => 
        sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.customerInfo?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.customerInfo?.phone || '').includes(searchTerm)
    );

    return (
        <div className="px-0 animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-4 rounded-4 shadow-sm border border-light">
                <div>
                    <h2 className="fw-black text-dark m-0 d-flex align-items-center">
                        <i className="bi bi-cart-check-fill text-primary me-3 fs-2"></i>
                        Sales Orders
                    </h2>
                    <p className="text-muted small m-0">Monitor order fulfillment and transaction statuses</p>
                </div>
                <div className="d-flex gap-2">
                    <Button
                        variant="light"
                        className="shadow-sm rounded-4 px-4 py-3 fw-bold border"
                        onClick={fetchSales}
                    >
                        <i className="bi bi-arrow-clockwise me-2"></i> Refresh
                    </Button>
                </div>
            </div>

            <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                <Card.Body className="p-0">
                    <div className="p-4 bg-light border-bottom border-light">
                        <InputGroup className="bg-white rounded-3 shadow-sm border-0 overflow-hidden px-2" style={{ maxWidth: '400px' }}>
                            <InputGroup.Text className="bg-transparent border-0 pe-0">
                                <i className="bi bi-search text-muted"></i>
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Filter orders..."
                                className="bg-transparent border-0 py-3 shadow-none fw-bold small"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="grow" variant="primary" />
                            <p className="mt-3 fw-bold text-muted">Loading orders...</p>
                        </div>
                    ) : filteredSales.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-receipt fs-1 text-muted opacity-25"></i>
                            <p className="mt-3 text-muted fw-bold">No orders found.</p>
                        </div>
                    ) : (
                        <Table hover responsive className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4 py-4 text-muted small fw-black text-uppercase letter-spacing-1 border-0">Invoice</th>
                                    <th className="py-4 text-muted small fw-black text-uppercase letter-spacing-1 border-0">Order Date</th>
                                    <th className="py-4 text-muted small fw-black text-uppercase letter-spacing-1 border-0">Customer</th>
                                    <th className="py-4 text-muted small fw-black text-uppercase letter-spacing-1 border-0 text-center">Status</th>
                                    <th className="pe-4 py-4 text-end text-muted small fw-black text-uppercase letter-spacing-1 border-0">Total</th>
                                </tr>
                            </thead>
                            <tbody className="border-top-0">
                                {filteredSales.map(sale => (
                                    <tr
                                        key={sale._id}
                                        className="align-middle border-bottom border-light transition-all"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setSelectedSale(sale)}
                                    >
                                        <td className="ps-4 py-4">
                                            <Badge bg="primary-subtle" text="primary" className="fw-black px-3 py-2 rounded-2 fs-6 border border-primary-subtle">
                                                {sale.invoiceNumber}
                                            </Badge>
                                        </td>
                                        <td className="py-4">
                                            <div className="text-dark fw-bold">{new Date(sale.createdAt).toLocaleDateString()}</div>
                                            <small className="text-muted">{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                                        </td>
                                        <td className="py-4">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-light p-2 rounded-circle me-3 border">
                                                    <i className="bi bi-person text-secondary"></i>
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{sale.customerInfo?.name || 'Guest Customer'}</div>
                                                    <small className="text-muted">{sale.customerInfo?.phone || 'No Contact'}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-center">
                                            <Badge 
                                                bg={sale.status === 'Completed' ? 'success' : sale.status === 'Packaged' ? 'info' : 'warning'} 
                                                className={`rounded-pill px-4 py-2 fw-black text-uppercase letter-spacing-1 fs-xs border border-${sale.status === 'Completed' ? 'success' : sale.status === 'Packaged' ? 'info' : 'warning'} border-opacity-25`}
                                                style={{ minWidth: '100px' }}
                                            >
                                                {sale.status || 'Pending'}
                                            </Badge>
                                        </td>
                                        <td className="pe-4 py-4 text-end">
                                            <span className="fw-black text-primary fs-4">
                                                ${sale.grandTotal.toFixed(2)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

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
