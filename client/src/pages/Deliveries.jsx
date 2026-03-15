import { useState, useEffect } from 'react';
import apiClient from '../api-request/config';
import useAuth from '../hooks/useAuth';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Spinner, InputGroup } from 'react-bootstrap';
import toast from 'react-hot-toast';

const Deliveries = () => {
    const { user } = useAuth();
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [drivers, setDrivers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({ driver: '', customer: '', address: '', notes: '' });

    useEffect(() => {
        if (user?.token) {
            fetchDeliveries();
            fetchFormDependencies();
        }
    }, [user]);

    const fetchDeliveries = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/deliveries');
            setDeliveries(data);
        } catch (error) {
            toast.error('Failed to load delivery list');
        } finally {
            setLoading(false);
        }
    };

    const fetchFormDependencies = async () => {
        try {
            const [usersRes, empRes] = await Promise.all([
                apiClient.get('/auth/users?role=user'),
                apiClient.get('/auth/users?role=driver')
            ]);
            setCustomers(usersRes.data);
            setDrivers(empRes.data);
        } catch (error) {
            console.error('Error fetching dependencies', error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiClient.post('/deliveries', formData);
            toast.success('Logistics task assigned');
            setShowModal(false);
            setFormData({ driver: '', customer: '', address: '', notes: '' });
            fetchDeliveries();
        } catch (error) {
            toast.error('Failed to assign task');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return { bg: 'warning-subtle', text: 'warning', icon: 'bi-clock-history' };
            case 'Picked Up': return { bg: 'info-subtle', text: 'info', icon: 'bi-box-seam' };
            case 'In Transit': return { bg: 'primary-subtle', text: 'primary', icon: 'bi-truck' };
            case 'Delivered': return { bg: 'success-subtle', text: 'success', icon: 'bi-check-circle-fill' };
            case 'Cancelled': return { bg: 'danger-subtle', text: 'danger', icon: 'bi-x-circle-fill' };
            default: return { bg: 'light', text: 'secondary', icon: 'bi-question-circle' };
        }
    };

    const filteredDeliveries = deliveries.filter(d => {
        const matchSearch = (d.customer?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.driver?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'All' || d.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <Container fluid>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold text-dark m-0">Deliveries</h2>
                    <p className="text-muted small m-0">Manage and track your deliveries</p>
                </div>
                <Button
                    variant="primary"
                    className="shadow-sm rounded-3 d-flex align-items-center px-4 py-2"
                    onClick={() => setShowModal(true)}
                >
                    <i className="bi bi-plus-circle-fill me-2"></i> New Delivery
                </Button>
            </div>

            <Row className="mb-4 g-3">
                <Col md={6} lg={4}>
                    <InputGroup className="bg-white border-0 shadow-sm rounded-4 overflow-hidden">
                        <InputGroup.Text className="bg-transparent border-0 pe-0 ms-2">
                            <i className="bi bi-search text-muted"></i>
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Search by customer or driver..."
                            className="bg-transparent border-0 py-2 ms-0 shadow-none fw-medium"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={4} lg={3}>
                    <Form.Select
                        className="bg-white border-0 shadow-sm rounded-4 py-2 px-3 fw-bold text-muted shadow-none"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Deliveries</option>
                        <option value="Pending">Pending</option>
                        <option value="Picked Up">Picked Up</option>
                        <option value="In Transit">On the Way</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </Form.Select>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted fw-medium">Loading deliveries...</p>
                    </div>
                ) : (
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light border-bottom">
                            <tr>
                                <th className="ps-4 py-3 text-muted small fw-bold text-uppercase">Delivery Details</th>
                                <th className="py-3 text-muted small fw-bold text-uppercase">Driver</th>
                                <th className="py-3 text-muted small fw-bold text-uppercase">Destination</th>
                                <th className="pe-4 py-3 text-muted small fw-bold text-uppercase text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDeliveries.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted">
                                        <i className="bi bi-truck fs-1 opacity-25 d-block mb-3"></i>
                                        No active deliveries found.
                                    </td>
                                </tr>
                            ) : (
                                filteredDeliveries.map(delivery => {
                                    const style = getStatusStyle(delivery.status);
                                    return (
                                        <tr key={delivery._id}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-4 bg-light p-2 me-3 text-center" style={{ width: '45px' }}>
                                                        <i className="bi bi-person-fill text-muted"></i>
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{delivery.customer?.fullName || 'Anonymous'}</div>
                                                        <small className="text-muted fw-bold">{delivery.customer?.phone || 'No contact'}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="fw-bold text-dark small">{delivery.driver?.fullName || 'Pending...'}</div>
                                                <div className="text-muted xxs text-uppercase fw-bold letter-spacing-1">Role: Driver</div>
                                            </td>
                                            <td className="py-3">
                                                <div className="d-flex align-items-center text-muted small" style={{ maxWidth: '250px' }}>
                                                    <i className="bi bi-geo-alt-fill me-2 text-danger opacity-75"></i>
                                                    <span className="truncate" title={delivery.address}>{delivery.address}</span>
                                                </div>
                                            </td>
                                            <td className="pe-4 py-3 text-center">
                                                <Badge bg={style.bg} text={style.text} className="px-3 py-2 rounded-pill fw-bold border border-white shadow-sm">
                                                    <i className={`bi ${style.icon} me-1`}></i> {delivery.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </Table>
                )}
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">New Delivery</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleCreate}>
                        <Row className="g-3 mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">CUSTOMER</Form.Label>
                                    <Form.Select
                                        className="bg-light border-0 py-2 rounded-3 shadow-none fw-bold"
                                        required
                                        value={formData.customer}
                                        onChange={e => {
                                            const c = customers.find(x => x._id === e.target.value);
                                            setFormData({ ...formData, customer: e.target.value, address: c?.address || '' });
                                        }}
                                    >
                                        <option value="">Select Recipient</option>
                                        {customers.map(c => <option key={c._id} value={c._id}>{c.fullName} ({c.username})</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">DRIVER</Form.Label>
                                    <Form.Select
                                        className="bg-light border-0 py-2 rounded-3 shadow-none fw-bold"
                                        required
                                        value={formData.driver}
                                        onChange={e => setFormData({ ...formData, driver: e.target.value })}
                                    >
                                        <option value="">Select Driver</option>
                                        {drivers.map(d => <option key={d._id} value={d._id}>{d.fullName}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">DELIVERY ADDRESS</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        className="bg-light border-0 py-2 rounded-3 shadow-none fw-bold"
                                        rows={2}
                                        required
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">NOTES</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        className="bg-light border-0 py-2 rounded-3 shadow-none fw-bold"
                                        rows={2}
                                        placeholder="Add instructions for the driver..."
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-grid gap-2">
                            <Button variant="primary" type="submit" size="lg" className="py-3 rounded-4 fw-bold shadow-lg" disabled={submitting}>
                                {submitting ? 'Creating Delivery...' : 'Assign Delivery'}
                            </Button>
                            <Button variant="link" className="text-muted text-decoration-none fw-bold small" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Deliveries;
