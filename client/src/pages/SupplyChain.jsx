import { useState, useEffect } from 'react';
import apiClient from '../api-request/config';
import useAuth from '../hooks/useAuth';
import { Container, Row, Col, Card, Button, Form, Badge, Spinner, InputGroup } from 'react-bootstrap';
import toast from 'react-hot-toast';
import SupplyRequestModal from '../components/SupplyRequestModal';

const SupplyChain = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        if (user?.token) fetchRequests();
    }, [user]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/supply-requests');
            setRequests(data);
        } catch (error) {
            console.error('Error fetching supply requests:', error);
            toast.error('Failed to load supply requests');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await apiClient.put(`/supply-requests/${id}/status`, { status });
            toast.success(`Request status: ${status}`);
            if (status === 'Received') {
                toast.success('Inventory stock updated');
            }
            fetchRequests();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Pending': return { bg: 'warning-subtle', text: 'warning', icon: 'bi-hourglass-split' };
            case 'Sent to Supplier': return { bg: 'primary-subtle', text: 'primary', icon: 'bi-truck' };
            case 'Received': return { bg: 'success-subtle', text: 'success', icon: 'bi-check-circle-fill' };
            case 'Cancelled': return { bg: 'danger-subtle', text: 'danger', icon: 'bi-x-circle-fill' };
            default: return { bg: 'light', text: 'secondary', icon: 'bi-box' };
        }
    };

    const filteredRequests = requests.filter(r => {
        const matchesSearch = r.medicine?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <Container fluid>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold text-dark m-0">Supply Chain</h2>
                    <p className="text-muted small m-0">Manage medicine stock and supplier coordination</p>
                </div>
                <Button
                    variant="primary"
                    className="shadow-sm rounded-3 d-flex align-items-center px-4 py-2"
                    onClick={() => setShowModal(true)}
                >
                    <i className="bi bi-plus-lg me-2"></i> New Request
                </Button>
            </div>

            <Row className="mb-4 g-3">
                <Col lg={4} md={6}>
                    <InputGroup className="shadow-sm rounded-3 overflow-hidden">
                        <InputGroup.Text className="bg-white border-0">
                            <i className="bi bi-search text-muted"></i>
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Search medicine or supplier..."
                            className="border-0 shadow-none py-2 fw-medium"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col lg={2} md={6}>
                    <Form.Select
                        className="shadow-sm border-0 rounded-3 py-2 fw-bold text-muted cursor-pointer shadow-none"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Requests</option>
                        <option value="Pending">Pending</option>
                        <option value="Sent to Supplier">Sent</option>
                        <option value="Received">Received</option>
                        <option value="Cancelled">Cancelled</option>
                    </Form.Select>
                </Col>
            </Row>

            <Row className="g-4">
                {loading ? (
                    <Col xs={12} className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted fw-medium">Loading supply data...</p>
                    </Col>
                ) : filteredRequests.length === 0 ? (
                    <Col xs={12}>
                        <Card className="border-0 shadow-sm rounded-4 text-center py-5 bg-white border border-dashed">
                            <Card.Body>
                                <i className="bi bi-diagram-3 fs-1 text-muted opacity-25 d-block mb-3"></i>
                                <h5 className="fw-bold text-muted">No supply requests found</h5>
                            </Card.Body>
                        </Card>
                    </Col>
                ) : (
                    filteredRequests.map(req => {
                        const style = getStatusConfig(req.status);
                        return (
                            <Col key={req._id} xl={4} lg={6}>
                                <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden hover-lift transition">
                                    <Card.Body className="p-4 d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <Badge bg={style.bg} text={style.text} className="px-3 py-2 rounded-pill fw-bold border border-white shadow-sm">
                                                <i className={`bi ${style.icon} me-1`}></i> {req.status}
                                            </Badge>
                                            <div className="text-muted xxs fw-bold uppercase letter-spacing-1">ID: {req._id.slice(-6).toUpperCase()}</div>
                                        </div>

                                        <div className="mb-4">
                                            <h5 className="fw-black text-dark mb-1">{req.medicine?.name || 'Unknown Medicine'}</h5>
                                            <div className="d-flex align-items-center">
                                                <Badge bg="primary" className="rounded-pill px-2 py-1 me-2">Qty: {req.quantity}</Badge>
                                                <small className="text-muted fw-bold">Units</small>
                                            </div>
                                        </div>

                                        <Card className="bg-light border-0 rounded-4 p-3 mb-4 flex-grow-1 border border-primary border-opacity-10">
                                            <Row className="g-2">
                                                <Col xs={6}>
                                                    <label className="xxs fw-bold text-muted text-uppercase mb-1 d-block">Supplier</label>
                                                    <p className="text-dark fw-bold small mb-0 lh-sm">{req.supplier?.name || 'Local Warehouse'}</p>
                                                </Col>
                                                <Col xs={6}>
                                                    <label className="xxs fw-bold text-muted text-uppercase mb-1 d-block">Expected Arrival</label>
                                                    <p className="text-dark fw-bold small mb-0 lh-sm">
                                                        {req.expectedDate ? new Date(req.expectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD'}
                                                    </p>
                                                </Col>
                                            </Row>
                                        </Card>

                                        {req.notes && (
                                            <div className="bg-info bg-opacity-10 rounded-3 p-3 mb-4 border border-info border-opacity-25">
                                                <p className="text-info small mb-0 fw-medium italic text-muted">"{req.notes}"</p>
                                            </div>
                                        )}

                                        <div className="mt-auto d-flex gap-2 pt-3 border-top border-light">
                                            {req.status === 'Pending' && (
                                                <Button onClick={() => updateStatus(req._id, 'Sent to Supplier')} variant="primary" className="flex-grow-1 py-2 rounded-3 fw-bold shadow-sm">
                                                    Send to Supplier
                                                </Button>
                                            )}
                                            {req.status === 'Sent to Supplier' && (
                                                <Button onClick={() => updateStatus(req._id, 'Received')} variant="success" className="flex-grow-1 py-2 rounded-3 fw-bold shadow-sm">
                                                    Confirm Receipt
                                                </Button>
                                            )}
                                            {(req.status === 'Pending' || req.status === 'Sent to Supplier') && (
                                                <Button onClick={() => updateStatus(req._id, 'Cancelled')} variant="outline-danger" className="rounded-3 px-3 border-0 shadow-none">
                                                    <i className="bi bi-x-lg"></i>
                                                </Button>
                                            )}
                                            {req.status === 'Received' && (
                                                <div className="w-100 text-center bg-success bg-opacity-10 py-2 rounded-3 border border-success border-opacity-25">
                                                    <div className="text-success fw-bold small">
                                                        <i className="bi bi-shield-check me-2"></i> Inventory Updated
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })
                )}
            </Row>

            {showModal && (
                <SupplyRequestModal
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchRequests}
                />
            )}
        </Container>
    );
};

export default SupplyChain;
