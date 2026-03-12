import { useState, useEffect } from 'react';
import apiClient from '../api-request/config';
import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';

const SupplyRequestModal = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const [medicines, setMedicines] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        medicine: '',
        supplier: '',
        quantity: 1,
        expectedDate: '',
        notes: '',
        requestedBy: user?._id || ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [medsRes, suppRes] = await Promise.all([
                    apiClient.get('/medicines'),
                    apiClient.get('/suppliers')
                ]);
                setMedicines(medsRes.data);
                setSuppliers(suppRes.data);
            } catch (error) {
                console.error('Data pull error:', error);
                toast.error('Logistics Sync: Failed to load resource catalogs');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...formData, requestedBy: user._id };
            await apiClient.post('/supply-requests', payload);
            toast.success('Supply Request: Dispatched to pipeline');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Transmission error: Request failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal show={true} onHide={onClose} centered size="lg">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-black text-dark">Resource Procurement</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="grow" variant="primary" />
                        <p className="mt-3 text-muted fw-bold small uppercase letter-spacing-1">Syncing Resource Catalogs...</p>
                    </div>
                ) : (
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-4 mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="xxs fw-bold text-muted text-uppercase mb-2">Target Medicine</Form.Label>
                                    <Form.Select
                                        className="bg-light border-0 py-2 rounded-3 shadow-none fw-bold"
                                        required
                                        value={formData.medicine}
                                        onChange={e => setFormData({ ...formData, medicine: e.target.value })}
                                    >
                                        <option value="">Select Resource</option>
                                        {medicines.map(m => (
                                            <option key={m._id} value={m._id}>{m.name} (Stock: {m.stock})</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="xxs fw-bold text-muted text-uppercase mb-2">Preferred Supplier</Form.Label>
                                    <Form.Select
                                        className="bg-light border-0 py-2 rounded-3 shadow-none fw-bold"
                                        required
                                        value={formData.supplier}
                                        onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                                    >
                                        <option value="">Select Entity</option>
                                        {suppliers.map(s => (
                                            <option key={s._id} value={s._id}>{s.name} ({s.contactPerson})</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="xxs fw-bold text-muted text-uppercase mb-2">Replenishment Quantity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        className="bg-light border-0 py-2 rounded-3 shadow-none fw-black"
                                        required
                                        value={formData.quantity}
                                        onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="xxs fw-bold text-muted text-uppercase mb-2">Expected Arrival</Form.Label>
                                    <Form.Control
                                        type="date"
                                        className="bg-light border-0 py-2 rounded-3 shadow-none fw-bold text-muted"
                                        value={formData.expectedDate}
                                        onChange={e => setFormData({ ...formData, expectedDate: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="xxs fw-bold text-muted text-uppercase mb-2">Operational Notes</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        className="bg-light border-0 py-3 rounded-4 shadow-none fw-medium"
                                        placeholder="Add mission-critical details for this procurement..."
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-grid gap-2 border-top border-light pt-4">
                            <Button
                                variant="primary"
                                type="submit"
                                size="lg"
                                className="py-3 rounded-4 fw-bold shadow-lg"
                                disabled={submitting}
                            >
                                {submitting ? 'Transmitting Request...' : 'Finalize Procurement Request'}
                            </Button>
                            <Button variant="link" className="text-muted text-decoration-none fw-bold small" onClick={onClose}>
                                Cancel Request
                            </Button>
                        </div>
                    </Form>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default SupplyRequestModal;
