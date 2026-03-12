import { useState, useEffect } from 'react';
import apiClient from '../api-request/config';
import useAuth from '../hooks/useAuth';
import { Container, Row, Col, Card, Button, Form, Spinner, Badge } from 'react-bootstrap';
import toast from 'react-hot-toast';

const Feedback = () => {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    // For customers submitting feedback
    const [formData, setFormData] = useState({ rating: 5, comments: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user?.token && user?.role === 'admin') {
            fetchFeedbacks();
        } else {
            setLoading(false); // Non-admins just see the form
        }
    }, [user]);

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/feedback');
            setFeedbacks(data);
        } catch (error) {
            toast.error('Failed to load feedback bank');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiClient.post('/feedback', formData);
            toast.success('Validation success: Feedback submitted');
            setFormData({ rating: 5, comments: '' });
        } catch (error) {
            toast.error('Failed to transmit feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    const markReviewed = async (id) => {
        try {
            await apiClient.put(`/feedback/${id}/status`, { status: 'Reviewed' });
            toast.success('Status updated: Reviewed');
            fetchFeedbacks();
        } catch (error) {
            toast.error('Control error: Failed to update status');
        }
    };

    const renderStars = (rating, interactive = false) => {
        return (
            <div className="d-flex gap-1 justify-content-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <i
                        key={star}
                        onClick={interactive ? () => setFormData({ ...formData, rating: star }) : null}
                        className={`bi ${star <= (interactive ? formData.rating : rating) ? 'bi-star-fill text-warning' : 'bi-star text-muted'} ${interactive ? 'cursor-pointer fs-2 px-1 hover-scale transition' : 'fs-5'}`}
                        style={{ cursor: interactive ? 'pointer' : 'default' }}
                    ></i>
                ))}
            </div>
        );
    };

    if (user?.role !== 'admin') {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col lg={6} md={8}>
                        <Card className="border-0 shadow-lg rounded-5 overflow-hidden">
                            <Card.Body className="p-5 text-center">
                                <div className="bg-primary bg-opacity-10 rounded-circle p-4 d-inline-block mb-4">
                                    <i className="bi bi-chat-heart-fill text-primary fs-1"></i>
                                </div>
                                <h2 className="fw-black text-dark mb-2">Share Your Experience</h2>
                                <p className="text-muted mb-4 px-lg-5">Your insights help us refine our pharmaceutical services and logistics.</p>

                                <Form onSubmit={handleSubmit} className="text-start mt-4">
                                    <Form.Group className="mb-4 text-center">
                                        <Form.Label className="small fw-bold text-muted text-uppercase letter-spacing-1 mb-3">Service Rating</Form.Label>
                                        {renderStars(0, true)}
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="small fw-bold text-muted text-uppercase letter-spacing-1">Your Detailed Feedback</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            className="bg-light border-0 py-3 rounded-4 shadow-none fw-medium"
                                            placeholder="Tell us what you loved or how we can improve..."
                                            required
                                            value={formData.comments}
                                            onChange={e => setFormData({ ...formData, comments: e.target.value })}
                                        />
                                    </Form.Group>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        size="lg"
                                        className="w-100 py-3 rounded-4 fw-bold shadow-lg"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <><Spinner animation="border" size="sm" className="me-2" /> Submitting...</>
                                        ) : 'Send Feedback'}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    // Admin View
    return (
        <Container fluid>
            <div className="mb-4">
                <h2 className="fw-bold text-dark m-0">Customer Satisfaction</h2>
                <p className="text-muted small m-0">Analyze and manage incoming service reviews</p>
            </div>

            <Row className="g-4">
                {loading ? (
                    <Col xs={12} className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted fw-medium">Accessing feedback vault...</p>
                    </Col>
                ) : feedbacks.length === 0 ? (
                    <Col xs={12}>
                        <Card className="border-0 shadow-sm rounded-4 text-center py-5 bg-white">
                            <Card.Body>
                                <i className="bi bi-chat-square-dots fs-1 text-muted opacity-25 d-block mb-3"></i>
                                <h5 className="fw-bold text-muted">No feedback recorded</h5>
                            </Card.Body>
                        </Card>
                    </Col>
                ) : (
                    feedbacks.map(fb => (
                        <Col key={fb._id} lg={6}>
                            <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden hover-lift transition">
                                <Card.Body className="p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px' }}>
                                                <i className="bi bi-person-fill fs-4"></i>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark">{fb.customer?.fullName || 'Anonymous Resident'}</div>
                                                <small className="text-muted fw-bold">{new Date(fb.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</small>
                                            </div>
                                        </div>
                                        <Badge bg={fb.status === 'Reviewed' ? 'success-subtle' : 'warning-subtle'} text={fb.status === 'Reviewed' ? 'success' : 'warning'} className="px-3 py-2 rounded-pill fw-bold border border-white shadow-sm">
                                            {fb.status}
                                        </Badge>
                                    </div>

                                    <div className="mb-3">
                                        {renderStars(fb.rating)}
                                    </div>

                                    <Card className="bg-light border-0 rounded-4 p-3 mb-0 flex-grow-1 border border-primary border-opacity-10 position-relative">
                                        <i className="bi bi-quote fs-1 text-primary opacity-10 position-absolute end-0 top-0 me-3 mt-1"></i>
                                        <p className="text-dark fw-medium small mb-0 lh-base italic position-relative text-muted">"{fb.comments}"</p>
                                    </Card>

                                    {fb.status === 'Pending' && (
                                        <div className="mt-4 pt-3 border-top border-light text-end">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="rounded-3 fw-bold px-3 py-2 shadow-none"
                                                onClick={() => markReviewed(fb._id)}
                                            >
                                                <i className="bi bi-check2-circle me-2"></i> Mark as Reviewed
                                            </Button>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>
        </Container>
    );
};

export default Feedback;
