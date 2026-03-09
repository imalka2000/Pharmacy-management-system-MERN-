import { useState, useEffect } from 'react';
import apiClient from '../api-request/config';
import useAuth from '../hooks/useAuth';
import { Modal, Button, Form, Table, Card, Spinner, Row, Col, Badge, InputGroup } from 'react-bootstrap';
import toast from 'react-hot-toast';
import ViewMedicineModal from '../components/ViewMedicineModal';

const Medicines = () => {
    const { user } = useAuth();
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [formData, setFormData] = useState({
        name: '', batchNumber: '', expiryDate: '', price: '', quantity: '', manufacturer: '', imageUrl: ''
    });
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user?.token) fetchMedicines();
    }, [user]);

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/medicines');
            setMedicines(data);
        } catch (error) {
            console.error('Inventory sync error:', error);
            toast.error('Failed to rationalize inventory nodes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to terminate this inventory node?')) {
            try {
                await apiClient.delete(`/medicines/${id}`);
                toast.success('Inventory node successfully purged');
                fetchMedicines();
            } catch (error) {
                toast.error('Termination sequence interrupted');
            }
        }
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fd = new FormData();
        fd.append('image', file);
        setUploading(true);

        try {
            const { data } = await apiClient.post('/upload', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setFormData({ ...formData, imageUrl: data });
            toast.success('Visual artifact successfully uploaded');
        } catch (error) {
            toast.error('Artifact transmission failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/medicines', formData);
            setShowAddModal(false);
            toast.success('New pharmaceutical identity established');
            fetchMedicines();
            setFormData({ name: '', batchNumber: '', expiryDate: '', price: '', quantity: '', manufacturer: '', imageUrl: '' });
        } catch (error) {
            toast.error('Protocol failure during establishing node');
        }
    };

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid">
            <div className="d-flex flex-wrap justify-content-between align-items-end mb-5 gap-3">
                <div>
                    <h1 className="fw-black text-dark m-0 letter-spacing-n1">Inventory Logic</h1>
                    <p className="text-muted fw-bold small m-0 uppercase opacity-75">Pharmaceutical Asset & Stock Management</p>
                </div>
                <div className="d-flex gap-3">
                    <div className="bg-white border rounded-4 shadow-sm p-1 d-flex">
                        <Button
                            variant={viewMode === 'list' ? 'primary' : 'link'}
                            className={`rounded-3 border-0 px-3 py-2 ${viewMode === 'list' ? 'shadow-primary text-white' : 'text-muted'}`}
                            onClick={() => setViewMode('list')}
                        >
                            <i className="bi bi-list-ul"></i>
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'primary' : 'link'}
                            className={`rounded-3 border-0 px-3 py-2 ${viewMode === 'grid' ? 'shadow-primary text-white' : 'text-muted'}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <i className="bi bi-grid-fill"></i>
                        </Button>
                    </div>
                    <Button
                        variant="dark"
                        className="shadow-lg rounded-4 d-flex align-items-center px-4 py-3 fw-black border-0 transition hover-lift text-uppercase letter-spacing-1"
                        onClick={() => setShowAddModal(true)}
                        style={{ background: 'linear-gradient(45deg, #212529, #343a40)' }}
                    >
                        <i className="bi bi-plus-lg me-2 fs-5"></i> Establish Node
                    </Button>
                </div>
            </div>

            <Row className="mb-5">
                <Col md={6} lg={4}>
                    <InputGroup className="bg-white border rounded-4 shadow-sm overflow-hidden p-1">
                        <InputGroup.Text className="bg-transparent border-0 pe-0 ms-2">
                            <i className="bi bi-search text-muted"></i>
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Identify node by appellation or batch..."
                            className="bg-transparent border-0 py-2 ms-0 shadow-none fw-bold small"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
            </Row>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="grow" variant="primary" />
                    <p className="mt-3 xxs fw-black text-muted text-uppercase letter-spacing-1">Synchronizing Inventory Matrix...</p>
                </div>
            ) : filteredMedicines.length === 0 ? (
                <Card className="border-0 shadow-sm rounded-5 py-5 text-center bg-white border">
                    <i className="bi bi-box-seam display-1 text-muted opacity-10 mb-3"></i>
                    <h4 className="fw-black text-muted">No Nodes Isolated</h4>
                    <p className="text-muted small uppercase fw-bold letter-spacing-1">The inventory matrix is currently depleted</p>
                </Card>
            ) : viewMode === 'list' ? (
                <Card className="border-0 shadow-sm rounded-5 overflow-hidden bg-white border">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light border-bottom">
                            <tr>
                                <th className="ps-4 py-4 text-muted xxs fw-black text-uppercase letter-spacing-1">Visual ID</th>
                                <th className="py-4 text-muted xxs fw-black text-uppercase letter-spacing-1">Appellation & Batch</th>
                                <th className="py-4 text-muted xxs fw-black text-uppercase letter-spacing-1">Expiry Protocol</th>
                                <th className="py-4 text-muted xxs fw-black text-uppercase letter-spacing-1">Unit Compensation</th>
                                <th className="py-4 text-muted xxs fw-black text-uppercase letter-spacing-1">Volume Status</th>
                                <th className="pe-4 py-4 text-muted xxs fw-black text-uppercase letter-spacing-1 text-end">Operations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMedicines.map((med) => (
                                <tr
                                    key={med._id}
                                    className="transition border-bottom border-light cursor-pointer"
                                    onClick={() => setSelectedMedicine(med)}
                                >
                                    <td className="ps-4 py-4">
                                        <div className="rounded-4 bg-light d-flex align-items-center justify-content-center overflow-hidden border shadow-inner" style={{ width: '64px', height: '64px' }}>
                                            {med.imageUrl ? (
                                                <img
                                                    src={med.imageUrl.startsWith('http') ? med.imageUrl : `http://localhost:5001${med.imageUrl}`}
                                                    alt={med.name}
                                                    className="w-100 h-100 object-cover"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.classList.remove('d-none'); }}
                                                />
                                            ) : null}
                                            <i className={`bi bi-image text-muted fs-4 opacity-50 ${med.imageUrl ? 'd-none' : ''}`}></i>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="fw-black text-dark fs-6 mb-0">{med.name}</div>
                                        <small className="text-muted fw-bold xxs text-uppercase letter-spacing-1">Batch: {med.batchNumber}</small>
                                    </td>
                                    <td>
                                        <Badge bg="light" text="dark" className="border px-3 py-2 rounded-4 fw-bold xxs text-uppercase letter-spacing-1 shadow-sm">
                                            {new Date(med.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </Badge>
                                    </td>
                                    <td>
                                        <span className="fw-black text-primary">${med.price.toFixed(2)}</span>
                                    </td>
                                    <td>
                                        <Badge
                                            bg={med.quantity < 10 ? 'danger' : 'success'}
                                            className={`rounded-pill px-3 py-2 fw-black xxs text-uppercase letter-spacing-1 shadow-sm ${med.quantity < 10 ? 'bg-opacity-10 text-danger border border-danger border-opacity-25' : 'bg-opacity-10 text-success border border-success border-opacity-25'}`}
                                        >
                                            {med.quantity} Units Available
                                        </Badge>
                                    </td>
                                    <td className="pe-4 text-end">
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button variant="outline-dark" size="sm" className="rounded-4 fw-black xxs text-uppercase letter-spacing-1 border-2 py-2 px-3" onClick={(e) => { e.stopPropagation(); /* Edit logic */ }}>
                                                Modify
                                            </Button>
                                            {user.role === 'admin' && (
                                                <Button variant="outline-danger" size="sm" className="rounded-4 fw-black xxs text-uppercase letter-spacing-1 border-2 py-2 px-2" onClick={(e) => handleDelete(e, med._id)}>
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            ) : (
                <Row className="g-4">
                    {filteredMedicines.map((med) => (
                        <Col key={med._id} xs={12} sm={6} lg={4} xl={3}>
                            <Card className="border-0 shadow-sm rounded-5 h-100 overflow-hidden hover-card transition bg-white border" onClick={() => setSelectedMedicine(med)}>
                                <div className="position-relative bg-light overflow-hidden shadow-inner" style={{ height: '220px' }}>
                                    {med.imageUrl ? (
                                        <img
                                            src={med.imageUrl.startsWith('http') ? med.imageUrl : `http://localhost:5001${med.imageUrl}`}
                                            alt={med.name}
                                            className="w-100 h-100 object-cover transition-slow"
                                        />
                                    ) : (
                                        <div className="w-100 h-100 d-flex align-items-center justify-content-center opacity-25">
                                            <i className="bi bi-image display-4 text-muted"></i>
                                        </div>
                                    )}
                                    <div className="position-absolute top-0 end-0 m-3 px-3 py-2 bg-white shadow-lg rounded-pill fw-black text-primary xxs letter-spacing-1">
                                        ${med.price.toFixed(2)}
                                    </div>
                                    <div className="position-absolute bottom-0 start-0 m-3">
                                        <Badge bg={med.quantity < 10 ? 'danger' : 'success'} className="rounded-pill px-3 py-2 fw-black xxs text-uppercase letter-spacing-1 shadow-lg">
                                            {med.quantity} Stocked
                                        </Badge>
                                    </div>
                                </div>
                                <Card.Body className="p-4">
                                    <div className="mb-4">
                                        <h5 className="fw-black text-dark mb-1 text-truncate">{med.name}</h5>
                                        <p className="text-muted fw-bold xxs uppercase letter-spacing-1 mb-0 opacity-75">Ref: {med.batchNumber}</p>
                                    </div>

                                    <div className="bg-light rounded-4 p-3 mb-4 text-start border border-dashed">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="xxs fw-bold text-muted uppercase">Manufacturer</span>
                                            <span className="fw-bold text-dark xxs">{med.manufacturer || 'Unknown'}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="xxs fw-bold text-muted uppercase">Expiry</span>
                                            <span className="fw-bold text-dark xxs">{new Date(med.expiryDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2 pt-2">
                                        <Button variant="outline-dark" size="sm" className="w-100 rounded-4 fw-black xxs text-uppercase letter-spacing-1 py-2 border-2" onClick={(e) => { e.stopPropagation(); /* Edit logic */ }}>
                                            Configure
                                        </Button>
                                        <Button variant="outline-danger" size="sm" className="rounded-4 fw-black xxs border-2 py-2 px-3" onClick={(e) => handleDelete(e, med._id)}>
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Add Medicine Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg" className="border-0">
                <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
                    <Modal.Title className="fw-black display-6 text-dark letter-spacing-n1">Establish Node</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 pt-2">
                    <p className="text-muted fw-bold small text-uppercase mb-4 letter-spacing-1">Register new inventory asset identity</p>
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-4 mb-4">
                            <Col lg={4}>
                                <div className="border border-2 border-dashed rounded-5 p-4 text-center bg-light position-relative overflow-hidden h-100 d-flex align-items-center justify-content-center transition shadow-inner">
                                    <input type="file" className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer" style={{ zIndex: 10 }} onChange={uploadFileHandler} />
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl.startsWith('http') ? formData.imageUrl : `http://localhost:5001${formData.imageUrl}`} className="img-fluid rounded-4 shadow-sm" style={{ maxHeight: '180px' }} alt="Preview" />
                                    ) : (
                                        <div className="py-2">
                                            <i className="bi bi-cloud-arrow-up display-4 text-primary opacity-25"></i>
                                            <p className="text-muted xxs fw-black mt-2 mb-0 uppercase letter-spacing-1">{uploading ? 'Processing...' : 'Upload Image'}</p>
                                        </div>
                                    )}
                                </div>
                            </Col>
                            <Col lg={8}>
                                <Row className="g-3">
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="xxs fw-bold text-muted uppercase letter-spacing-1">Pharmaceutical Appellation</Form.Label>
                                            <Form.Control required className="bg-light border-0 py-3 rounded-4 shadow-none fw-black" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="xxs fw-bold text-muted uppercase letter-spacing-1">Batch Identification</Form.Label>
                                            <Form.Control required className="bg-light border-0 py-3 rounded-4 shadow-none fw-black" value={formData.batchNumber} onChange={e => setFormData({ ...formData, batchNumber: e.target.value })} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="xxs fw-bold text-muted uppercase letter-spacing-1">Expiry Protocol Date</Form.Label>
                                            <Form.Control type="date" required className="bg-light border-0 py-3 rounded-4 shadow-none fw-black" value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="xxs fw-bold text-muted uppercase letter-spacing-1">Market Compensation ($)</Form.Label>
                                            <Form.Control type="number" step="0.01" required className="bg-light border-0 py-3 rounded-4 shadow-none fw-black" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="xxs fw-bold text-muted uppercase letter-spacing-1">Inventory Quantity</Form.Label>
                                            <Form.Control type="number" required className="bg-light border-0 py-3 rounded-4 shadow-none fw-black" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                        <Form.Group className="mb-5">
                            <Form.Label className="xxs fw-bold text-muted uppercase letter-spacing-1">Manufacturing Component</Form.Label>
                            <Form.Control className="bg-light border-0 py-3 rounded-4 shadow-none fw-black" value={formData.manufacturer} onChange={e => setFormData({ ...formData, manufacturer: e.target.value })} />
                        </Form.Group>

                        <div className="d-flex gap-3">
                            <Button variant="light" className="w-100 py-3 rounded-4 fw-black text-muted uppercase letter-spacing-1 border" onClick={() => setShowAddModal(false)}>
                                Abort
                            </Button>
                            <Button variant="primary" type="submit" className="w-100 py-3 rounded-4 fw-black uppercase letter-spacing-1 shadow-primary border-0">
                                Authorize Deployment
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {selectedMedicine && (
                <ViewMedicineModal
                    medicine={selectedMedicine}
                    onClose={() => setSelectedMedicine(null)}
                />
            )}
        </div>
    );
};

export default Medicines;
