import { useState, useEffect } from 'react';
import apiClient from '../api-request/config';
import useAuth from '../hooks/useAuth';
import { Button, Form, Row, Col, Card, Badge, Spinner, InputGroup } from 'react-bootstrap';
import toast from 'react-hot-toast';
import PrescriptionFormModal from '../components/PrescriptionFormModal';

const Prescriptions = () => {
    const { user } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        if (user?.token) fetchPrescriptions();
    }, [user]);

    const fetchPrescriptions = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/prescriptions');
            setPrescriptions(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load prescriptions');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await apiClient.put(`/prescriptions/${id}/status`, { status });
            toast.success(`Marked as ${status}`);
            fetchPrescriptions();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed': return <Badge bg="success-subtle" text="success" className="px-3 py-2 rounded-pill fw-bold border border-success-subtle">Completed</Badge>;
            case 'Processing': return <Badge bg="primary-subtle" text="primary" className="px-3 py-2 rounded-pill fw-bold border border-primary-subtle">Processing</Badge>;
            case 'Pending': return <Badge bg="warning-subtle" text="warning" className="px-3 py-2 rounded-pill fw-bold border border-warning-subtle">Pending</Badge>;
            case 'Picked Up': return <Badge bg="secondary-subtle" text="secondary" className="px-3 py-2 rounded-pill fw-bold border border-secondary-subtle">Picked Up</Badge>;
            default: return <Badge bg="light" text="dark" className="px-3 py-2 rounded-pill fw-bold border">Unknown</Badge>;
        }
    };

    const filteredPrescriptions = prescriptions.filter(p => {
        const matchesSearch = p.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p._id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark m-0">Prescriptions</h2>
                    <p className="text-muted small m-0">Track and fulfill medical orders</p>
                </div>
                <Button
                    variant="primary"
                    className="shadow-sm rounded-3 d-flex align-items-center px-4 py-2"
                    onClick={() => setShowModal(true)}
                >
                    <i className="bi bi-file-earmark-plus-fill me-2"></i> New Prescription
                </Button>
            </div>

            <Row className="mb-4 g-3">
                <Col md={8} lg={6}>
                    <InputGroup className="bg-white border-0 shadow-sm rounded-4 overflow-hidden">
                        <InputGroup.Text className="bg-transparent border-0 pe-0 ms-2">
                            <i className="bi bi-search text-muted"></i>
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Search by customer name or ID..."
                            className="bg-transparent border-0 py-2 ms-0 shadow-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={4} lg={3}>
                    <Form.Select
                        className="bg-white border-0 shadow-sm rounded-4 py-2 px-4 shadow-none fw-bold text-muted"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Picked Up">Picked Up</option>
                    </Form.Select>
                </Col>
            </Row>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Retrieving medical records...</p>
                </div>
            ) : filteredPrescriptions.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
                    <i className="bi bi-file-medical fs-1 text-muted opacity-25"></i>
                    <p className="mt-3 text-muted">No prescriptions match your filters.</p>
                </div>
            ) : (
                <Row className="g-4 pb-4">
                    {filteredPrescriptions.map(p => (
                        <Col key={p._id} lg={6}>
                            <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden hover-card">
                                <Card.Header className="bg-white border-0 pt-4 px-4 pb-0">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                                                <i className="bi bi-person-fill-check fs-4"></i>
                                            </div>
                                            <div>
                                                <h5 className="fw-bold mb-0 text-dark">{p.customer?.fullName || 'Guest Patient'}</h5>
                                                <small className="text-muted"><i className="bi bi-hospital me-1"></i> Dr. {p.doctorName || 'N/A'}</small>
                                            </div>
                                        </div>
                                        {getStatusBadge(p.status)}
                                    </div>
                                </Card.Header>
                                <Card.Body className="p-4">
                                    <div className="bg-light rounded-4 p-3 mb-4 border border-light">
                                        <h6 className="small fw-bold text-muted text-uppercase mb-3"><i className="bi bi-capsule me-2"></i>Prescribed Medicines</h6>
                                        <div className="space-y-2">
                                            {p.medicines.map((med, idx) => (
                                                <div key={idx} className="d-flex justify-content-between align-items-center py-1">
                                                    <span className="fw-bold text-dark">{med.name}</span>
                                                    <Badge bg="light" text="dark" className="border px-2 py-1 rounded-pill small">
                                                        {med.dosage} · {med.frequency} · {med.duration}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {p.notes && (
                                        <div className="p-3 bg-indigo-subtle border-start border-indigo border-4 rounded-3 mb-4">
                                            <small className="text-dark d-block"><strong>Notes:</strong> {p.notes}</small>
                                        </div>
                                    )}

                                    <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-2">
                                        <div className="text-muted small">
                                            <i className="bi bi-clock me-2"></i>
                                            {new Date(p.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="d-flex gap-2">
                                            {p.status === 'Pending' && (
                                                <Button variant="primary" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => updateStatus(p._id, 'Processing')}>
                                                    Start Work
                                                </Button>
                                            )}
                                            {p.status === 'Processing' && (
                                                <Button variant="success" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => updateStatus(p._id, 'Completed')}>
                                                    Mark Done
                                                </Button>
                                            )}
                                            {p.status === 'Completed' && (
                                                <Button variant="outline-secondary" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => updateStatus(p._id, 'Picked Up')}>
                                                    Hand Over
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {showModal && (
                <PrescriptionFormModal
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchPrescriptions}
                />
            )}
        </div>
    );
};

export default Prescriptions;
