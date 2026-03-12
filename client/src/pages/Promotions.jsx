import { useState, useEffect } from 'react';
import apiClient from '../api-request/config';
import useAuth from '../hooks/useAuth';
import { Container, Row, Col, Card, Button, Form, Modal, Spinner, Badge } from 'react-bootstrap';
import toast from 'react-hot-toast';

const Promotions = () => {
    const { user } = useAuth();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form for new promotion
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discountPercentage: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        if (user?.token) fetchPromotions();
    }, [user]);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/promotions');
            setPromotions(data);
        } catch (error) {
            toast.error('Failed to load marketing campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiClient.post('/promotions', formData);
            toast.success('Campaign launched successfully');
            setShowModal(false);
            setFormData({ title: '', description: '', discountPercentage: '', startDate: '', endDate: '' });
            fetchPromotions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Campaign creation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Terminate this promotion campaign?')) {
            try {
                await apiClient.delete(`/promotions/${id}`);
                toast.success('Campaign terminated');
                fetchPromotions();
            } catch (error) {
                toast.error('Failed to terminate campaign');
            }
        }
    };

    return (
        <Container fluid>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold text-dark m-0">Marketing & Campaigns</h2>
                    <p className="text-muted small m-0">Drive sales with targeted discounts and events</p>
                </div>
                {user?.role === 'admin' && (
                    <Button
                        variant="primary"
                        className="shadow-sm rounded-3 d-flex align-items-center px-4 py-2"
                        onClick={() => setShowModal(true)}
                    >
                        <i className="bi bi-megaphone-fill me-2"></i> Launch New Campaign
                    </Button>
                )}
            </div>

            <Row className="g-4">
                {loading ? (
                    <Col xs={12} className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted fw-medium">Syncing campaign data...</p>
                    </Col>
                ) : promotions.length === 0 ? (
                    <Col xs={12}>
                        <Card className="border-0 shadow-sm rounded-4 text-center py-5 bg-white border border-dashed">
                            <Card.Body>
                                <i className="bi bi-tag-fill fs-1 text-muted opacity-25 d-block mb-3"></i>
                                <h5 className="fw-bold text-muted">No Active Campaigns</h5>
                                <p className="text-muted small px-3">Start a new promotion to boost customer engagement.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                ) : (
                    promotions.map(promo => (
                        <Col key={promo._id} md={6} lg={4}>
                            <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden hover-lift transition">
                                <Card.Body className="p-4 d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="rounded-4 bg-primary bg-opacity-10 text-primary p-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '56px', height: '56px' }}>
                                            <i className="bi bi-tag-fill fs-3"></i>
                                        </div>
                                        <div className="d-flex flex-column align-items-end">
                                            <Badge bg={promo.status === 'Active' ? 'success' : 'secondary'} className="px-3 py-2 rounded-pill fw-bold mb-2">
                                                {promo.status}
                                            </Badge>
                                            {user?.role === 'admin' && (
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="rounded-circle text-danger shadow-none"
                                                    onClick={() => handleDelete(promo._id)}
                                                >
                                                    <i className="bi bi-trash3-fill"></i>
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <h5 className="fw-black text-dark mb-1">{promo.title}</h5>
                                    <div className="display-6 fw-black text-primary mb-3">
                                        {promo.discountPercentage}% <small className="fs-6 fw-bold text-muted">SAVINGS</small>
                                    </div>

                                    <p className="text-muted small mb-4 flex-grow-1 lh-base">
                                        {promo.description || 'Exclusive limited-time offer for our valued customers.'}
                                    </p>

                                    <div className="mt-auto pt-3 border-top border-light">
                                        <div className="d-flex align-items-center text-muted">
                                            <div className="bg-light p-2 rounded-3 me-3">
                                                <i className="bi bi-calendar-event text-dark"></i>
                                            </div>
                                            <div>
                                                <label className="xxs fw-bold text-uppercase letter-spacing-1 d-block mb-0">EXPIRY DATE</label>
                                                <span className="fw-bold text-dark small">{new Date(promo.endDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Campaign Architect</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleCreate}>
                        <Row className="g-3 mb-4">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">CAMPAIGN TITLE</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g. Summer Wellness Festival"
                                        className="bg-light border-0 py-2 rounded-3 shadow-none fw-bold"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">OFFER DESCRIPTION</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        className="bg-light border-0 py-2 rounded-3 shadow-none fw-bold"
                                        placeholder="Detailed explanation of the promotion..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">DISCOUNT (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="1" max="100"
                                        className="bg-light border-0 py-2 rounded-3 shadow-none fw-bold text-center"
                                        required
                                        value={formData.discountPercentage}
                                        onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">START DATE</Form.Label>
                                    <Form.Control
                                        type="date"
                                        className="bg-light border-0 py-2 rounded-3 shadow-none fw-bold"
                                        required
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">END DATE</Form.Label>
                                    <Form.Control
                                        type="date"
                                        className="bg-light border-0 py-2 rounded-3 shadow-none fw-bold"
                                        required
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-grid gap-2">
                            <Button variant="primary" type="submit" size="lg" className="py-3 rounded-4 fw-bold shadow-lg" disabled={submitting}>
                                {submitting ? 'Calibrating Campaign...' : 'Finalize and Launch'}
                            </Button>
                            <Button variant="link" className="text-muted text-decoration-none fw-bold small" onClick={() => setShowModal(false)}>
                                Abandon Setup
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Promotions;
