import { useState, useEffect } from 'react';
import apiClient from '../api-request/config';
import { Table, Button, Badge, Form, Row, Col, InputGroup, Card } from 'react-bootstrap';
import toast from 'react-hot-toast';
import CreatePurchaseOrderModal from '../components/CreatePurchaseOrderModal';

const PurchaseOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await apiClient.get('/purchase-orders');
            setOrders(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load purchase orders');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (order, status) => {
        try {
            await apiClient.put(`/purchase-orders/${order._id}`, { status });
            
            if (status === 'Received') {
                // Record Expense Transaction
                await apiClient.post('/transactions', {
                    type: 'Expense',
                    category: 'Purchase',
                    amount: order.totalAmount,
                    referenceId: order._id,
                    onModel: 'PurchaseOrder',
                    description: `Payment for Purchase Order ${order.purchaseOrderNumber}`
                });
            }

            toast.success(`Order marked as ${status}`);
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-black text-uppercase letter-spacing-1 mb-0">Purchase Orders</h2>
                    <p className="text-muted small mb-0">Manage inventory procurement from suppliers</p>
                </div>
                <Button 
                    variant="primary" 
                    className="rounded-4 px-4 py-2 fw-bold shadow-sm"
                    onClick={() => setShowCreateModal(true)}
                >
                    <i className="bi bi-plus-lg me-2"></i> Create Order
                </Button>
            </div>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Header className="bg-white border-0 py-3">
                    <Row className="align-items-center">
                        <Col md={4}>
                            <InputGroup className="bg-light rounded-3 border-0">
                                <InputGroup.Text className="bg-transparent border-0 pe-0">
                                    <i className="bi bi-search text-muted"></i>
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Search POs..."
                                    className="bg-transparent border-0 shadow-none ps-2"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                </Card.Header>
                <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 text-uppercase xxs letter-spacing-2 fw-black text-muted">PO Number</th>
                                <th className="text-uppercase xxs letter-spacing-2 fw-black text-muted">Supplier</th>
                                <th className="text-uppercase xxs letter-spacing-2 fw-black text-muted">Subject</th>
                                <th className="text-uppercase xxs letter-spacing-2 fw-black text-muted">Amount</th>
                                <th className="text-uppercase xxs letter-spacing-2 fw-black text-muted">Status</th>
                                <th className="text-uppercase xxs letter-spacing-2 fw-black text-muted">Date</th>
                                <th className="text-end pe-4 text-uppercase xxs letter-spacing-2 fw-black text-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        <i className="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>
                                        No purchase orders found
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id}>
                                        <td className="ps-4 fw-bold">{order.purchaseOrderNumber}</td>
                                        <td>{order.supplier?.name}</td>
                                        <td>{order.subject || '-'}</td>
                                        <td className="fw-bold">${order.totalAmount?.toFixed(2)}</td>
                                        <td>
                                            <Badge bg={
                                                order.status === 'Received' ? 'success' :
                                                order.status === 'Sent' ? 'info' :
                                                order.status === 'Cancelled' ? 'danger' : 'secondary'
                                            } className="rounded-pill px-3 py-2">
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="small text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="text-end pe-4">
                                            {order.status === 'Sent' && (
                                                <Button 
                                                    variant="outline-success" 
                                                    size="sm" 
                                                    className="rounded-3 me-2"
                                                    onClick={() => handleUpdateStatus(order, 'Received')}
                                                >
                                                    Mark Received
                                                </Button>
                                            )}
                                            <Button variant="link" className="text-secondary p-0">
                                                <i className="bi bi-three-dots-vertical"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>

            <CreatePurchaseOrderModal 
                show={showCreateModal} 
                onHide={() => setShowCreateModal(false)}
                onSuccess={fetchOrders}
            />
        </div>
    );
};

export default PurchaseOrders;
