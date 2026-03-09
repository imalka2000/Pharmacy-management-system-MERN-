import { useState, useEffect } from 'react';
import apiClient from '../api-request/config';
import { Modal, Button, Form, Row, Col, Card } from 'react-bootstrap';
import toast from 'react-hot-toast';

const PrescriptionFormModal = ({ onClose, onSuccess }) => {
    const [customers, setCustomers] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customer: '',
        doctorName: '',
        notes: '',
        medicines: [{ name: '', dosage: '', frequency: '', duration: '', quantity: 1 }]
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, medsRes] = await Promise.all([
                    apiClient.get('/auth/users'),
                    apiClient.get('/medicines')
                ]);
                setCustomers(usersRes.data.filter(u => u.role === 'user'));
                setMedicines(medsRes.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    const handleMedicineChange = (index, field, value) => {
        const newMedicines = [...formData.medicines];
        newMedicines[index][field] = value;

        if (field === 'name') {
            const matchedMed = medicines.find(m => m.name.toLowerCase() === value.toLowerCase());
            if (matchedMed) newMedicines[index].medicine = matchedMed._id;
        }

        setFormData({ ...formData, medicines: newMedicines });
    };

    const addMedicineRow = () => {
        setFormData({
            ...formData,
            medicines: [...formData.medicines, { name: '', dosage: '', frequency: '', duration: '', quantity: 1 }]
        });
    };

    const removeMedicineRow = (index) => {
        const newMedicines = formData.medicines.filter((_, i) => i !== index);
        setFormData({ ...formData, medicines: newMedicines });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.post('/prescriptions', formData);
            toast.success('Prescription generated successfully');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating prescription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={true} onHide={onClose} centered size="lg" className="border-0">
            <Modal.Header closeButton className="border-0 pb-0 shadow-sm z-1">
                <Modal.Title className="fw-bold">Fill New Prescription</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
                <Form onSubmit={handleSubmit}>
                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                        <Card.Body className="p-4">
                            <h6 className="small fw-bold text-muted text-uppercase mb-3">General Information</h6>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold">Select Patient</Form.Label>
                                        <Form.Select
                                            className="bg-light border-0 py-2 rounded-3 shadow-none fw-medium"
                                            required
                                            value={formData.customer}
                                            onChange={e => setFormData({ ...formData, customer: e.target.value })}
                                        >
                                            <option value="">Choose a registered user...</option>
                                            {customers.map(c => <option key={c._id} value={c._id}>{c.fullName} ({c.phone})</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold">Physician's Name</Form.Label>
                                        <Form.Control
                                            placeholder="Dr. John Doe"
                                            className="bg-light border-0 py-2 rounded-3 shadow-none fw-medium"
                                            value={formData.doctorName}
                                            onChange={e => setFormData({ ...formData, doctorName: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="small fw-bold text-muted text-uppercase m-0">Prescribed Medicines</h6>
                                <Button variant="link" className="p-0 text-primary fw-bold text-decoration-none small" onClick={addMedicineRow}>
                                    <i className="bi bi-plus-circle me-1"></i> Add Another Medicine
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {formData.medicines.map((item, index) => (
                                    <Card key={index} className="bg-light border-0 p-3 rounded-4 mb-2">
                                        <Row className="g-2">
                                            <Col md={12} lg={4}>
                                                <Form.Control
                                                    placeholder="Medicine name"
                                                    required
                                                    className="bg-white border-0 py-2 rounded-3 shadow-none text-dark fw-bold"
                                                    value={item.name}
                                                    list="meds-list"
                                                    onChange={e => handleMedicineChange(index, 'name', e.target.value)}
                                                />
                                            </Col>
                                            <Col xs={4} lg={2}>
                                                <Form.Control
                                                    placeholder="Dosage"
                                                    className="bg-white border-0 py-2 rounded-3 shadow-none text-center"
                                                    value={item.dosage}
                                                    onChange={e => handleMedicineChange(index, 'dosage', e.target.value)}
                                                />
                                            </Col>
                                            <Col xs={4} lg={2}>
                                                <Form.Control
                                                    placeholder="Freq"
                                                    className="bg-white border-0 py-2 rounded-3 shadow-none text-center"
                                                    value={item.frequency}
                                                    onChange={e => handleMedicineChange(index, 'frequency', e.target.value)}
                                                />
                                            </Col>
                                            <Col xs={4} lg={3}>
                                                <Form.Control
                                                    placeholder="Duration"
                                                    className="bg-white border-0 py-2 rounded-3 shadow-none text-center"
                                                    value={item.duration}
                                                    onChange={e => handleMedicineChange(index, 'duration', e.target.value)}
                                                />
                                            </Col>
                                            <Col xs={12} lg={1} className="text-end">
                                                {formData.medicines.length > 1 && (
                                                    <Button variant="light" className="text-danger rounded-circle p-2" onClick={() => removeMedicineRow(index)}>
                                                        <i className="bi bi-trash-fill"></i>
                                                    </Button>
                                                )}
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}
                                <datalist id="meds-list">
                                    {medicines.map(m => <option key={m._id} value={m.name} />)}
                                </datalist>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                        <Card.Body className="p-4">
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase mb-2">Internal Notes / Instructions</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="Pharmacist notes, allergies, or special requirements..."
                                    className="bg-light border-0 py-2 rounded-3 shadow-none resize-none"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    <Row className="g-3">
                        <Col md={6}>
                            <Button variant="light" size="lg" className="w-100 py-3 rounded-4 fw-bold border text-muted" onClick={onClose} disabled={loading}>
                                Discard Form
                            </Button>
                        </Col>
                        <Col md={6}>
                            <Button variant="primary" type="submit" size="lg" className="w-100 py-3 rounded-4 fw-bold shadow-lg" disabled={loading}>
                                {loading ? 'Saving...' : 'Generate Prescription'}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default PrescriptionFormModal;
