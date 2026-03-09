import { useState, useEffect } from 'react';
import apiClient from '../api-request/config';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';

const DriverPortal = () => {
    const { user } = useAuth();
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.token) fetchDeliveries();
    }, [user]);

    const fetchDeliveries = async () => {
        try {
            const { data } = await apiClient.get('/deliveries/my-deliveries');
            setDeliveries(data);
        } catch (error) {
            console.error('Error fetching deliveries:', error);
            toast.error('Failed to load mission list');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await apiClient.put(`/deliveries/${id}/status`, { status });
            toast.success(`Mission status: ${status}`);
            fetchDeliveries();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return { bg: 'warning-subtle', text: 'warning', icon: 'bi-clock' };
            case 'Picked Up': return { bg: 'info-subtle', text: 'info', icon: 'bi-box-seam' };
            case 'In Transit': return { bg: 'primary-subtle', text: 'primary', icon: 'bi-truck' };
            case 'Delivered': return { bg: 'success-subtle', text: 'success', icon: 'bi-check-circle-fill' };
            case 'Cancelled': return { bg: 'danger-subtle', text: 'danger', icon: 'bi-x-circle-fill' };
            default: return { bg: 'light', text: 'secondary', icon: 'bi-question-circle' };
        }
    };

    return (
        <Container fluid>
            <div className="mb-4">
                <h2 className="fw-bold text-dark m-0">Mission Dashboard</h2>
                <p className="text-muted small m-0">Field agent operational portal</p>
            </div>

            <Row className="g-4">
                {loading ? (
                    <Col xs={12} className="text-center py-5">
                        <Spinner animation="grow" variant="primary" />
                        <p className="mt-3 text-muted fw-medium">Syncing dispatch data...</p>
                    </Col>
                ) : deliveries.length === 0 ? (
                    <Col xs={12}>
                        <Card className="border-0 shadow-sm rounded-4 text-center py-5 bg-light border border-dashed">
                            <Card.Body>
                                <i className="bi bi-mailbox2 fs-1 text-muted opacity-25 d-block mb-3"></i>
                                <h5 className="fw-bold text-muted">No Tasks Assigned</h5>
                                <p className="text-muted small">You are currently on standby. Check back later for new missions.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                ) : (
                    deliveries.map(delivery => {
                        const style = getStatusStyle(delivery.status);
                        return (
                            <Col key={delivery._id} xs={12} md={6} lg={4}>
                                <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden position-relative hover-lift transition">
                                    <Card.Body className="p-4 d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <Badge bg={style.bg} text={style.text} className="px-3 py-2 rounded-pill fw-bold border border-white shadow-sm">
                                                <i className={`bi ${style.icon} me-1`}></i> {delivery.status}
                                            </Badge>
                                            <div className="text-muted small fw-bold">ID: {delivery._id.slice(-6).toUpperCase()}</div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="xxs fw-bold text-muted text-uppercase letter-spacing-1 mb-1 d-block">RECIPIENT</label>
                                            <h5 className="fw-bold text-dark mb-0">{delivery.customer?.fullName || 'Anonymous Resident'}</h5>
                                            <p className="text-muted small mb-0 fw-bold">{delivery.customer?.phone || 'Priority Dispatch'}</p>
                                        </div>

                                        <Card className="bg-light border-0 rounded-4 p-3 mb-4 flex-grow-1 border border-primary border-opacity-10">
                                            <div className="d-flex">
                                                <i className="bi bi-geo-alt-fill text-danger me-2 mt-1 fs-5"></i>
                                                <div>
                                                    <label className="xxs fw-bold text-muted text-uppercase mb-1 d-block">DELIVERY LOCATION</label>
                                                    <p className="text-dark fw-bold small mb-0 lh-sm">{delivery.address}</p>
                                                </div>
                                            </div>
                                        </Card>

                                        {delivery.notes && (
                                            <div className="bg-warning bg-opacity-10 rounded-3 p-3 mb-4 border border-warning border-opacity-25">
                                                <div className="d-flex align-items-center mb-1">
                                                    <i className="bi bi-info-circle-fill text-warning me-2 small"></i>
                                                    <span className="xxs fw-bold text-warning text-uppercase">AGENTS NOTES</span>
                                                </div>
                                                <p className="text-dark small mb-0 fw-medium italic text-muted">"{delivery.notes}"</p>
                                            </div>
                                        )}

                                        <div className="mt-auto pt-3 border-top border-light">
                                            {delivery.status === 'Pending' && (
                                                <Button onClick={() => updateStatus(delivery._id, 'Picked Up')} variant="primary" className="w-100 py-3 rounded-4 fw-bold shadow-sm">
                                                    Initialize Pickup
                                                </Button>
                                            )}
                                            {delivery.status === 'Picked Up' && (
                                                <Button onClick={() => updateStatus(delivery._id, 'In Transit')} variant="info" className="w-100 py-3 rounded-4 fw-bold text-white shadow-sm">
                                                    <i className="bi bi-truck me-2"></i> Start Transit
                                                </Button>
                                            )}
                                            {delivery.status === 'In Transit' && (
                                                <Button onClick={() => updateStatus(delivery._id, 'Delivered')} variant="success" className="w-100 py-3 rounded-4 fw-bold shadow-sm">
                                                    <i className="bi bi-check-circle-fill me-2"></i> Complete Drop-off
                                                </Button>
                                            )}
                                            {delivery.status === 'Delivered' && (
                                                <div className="text-center bg-success bg-opacity-10 py-3 rounded-4 border border-success border-opacity-25">
                                                    <div className="text-success fw-bold small">
                                                        <i className="bi bi-shield-check me-2"></i> MISSION VERIFIED
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card.Body>
                                    <i className="bi bi-truck position-absolute text-light opacity-25" style={{ fontSize: '100px', bottom: '-20px', right: '-20px', zIndex: 0 }}></i>
                                </Card>
                            </Col>
                        );
                    })
                )}
            </Row>
        </Container>
    );
};

export default DriverPortal;
