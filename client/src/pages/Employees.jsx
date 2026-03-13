import { useState, useEffect } from 'react';
import apiClient from '../api-request/config';
import useAuth from '../hooks/useAuth';
import { Button, Form, Row, Col, Card, Badge, Modal, Spinner, InputGroup, Image } from 'react-bootstrap';
import toast from 'react-hot-toast';

const Employees = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'pharmacist',
        fullName: '',
        email: '',
        phone: '',
        salary: '',
        profileImage: ''
    });

    useEffect(() => {
        if (user?.token) fetchEmployees();
    }, [user]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/auth/users');
            setEmployees(data.filter(u => u.role !== 'user')); // Filter staff only
        } catch (error) {
            console.error('Directory sync error:', error);
            toast.error('Failed to connect to employee database');
        } finally {
            setLoading(false);
        }
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        setUploading(true);

        try {
            const { data } = await apiClient.post('/upload', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData({ ...formData, profileImage: data });
            toast.success('Profile image uploaded');
        } catch (error) {
            console.error(error);
            toast.error('Image transmission failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiClient.post('/auth/register', formData);
            toast.success('Employee added successfully');
            setShowModal(false);
            fetchEmployees();
            setFormData({ username: '', password: '', role: 'pharmacist', fullName: '', email: '', phone: '', salary: '', profileImage: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to register employee');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredEmployees = employees.filter(u =>
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleConfig = (role) => {
        switch (role) {
            case 'admin': return { bg: 'danger', icon: 'bi-shield-lock-fill', label: 'Admin' };
            case 'driver': return { bg: 'warning', icon: 'bi-truck', label: 'Driver / Delivery' };
            default: return { bg: 'success', icon: 'bi-capsule', label: 'Pharmacist' };
        }
    };

    return (
        <div className="container-fluid px-0">
            <div className="d-flex flex-wrap justify-content-between align-items-end mb-5 gap-3">
                <div>
                    <h1 className="fw-black text-dark m-0 letter-spacing-n1">Employees</h1>
                    <p className="text-muted fw-bold small m-0 uppercase opacity-75">Manage staff accounts and access</p>
                </div>
                <Button
                    variant="dark"
                    className="shadow-lg rounded-4 d-flex align-items-center px-4 py-3 fw-bold border-0 transition hover-lift"
                    onClick={() => setShowModal(true)}
                    style={{ background: 'linear-gradient(45deg, #212529, #343a40)' }}
                >
                    <i className="bi bi-person-plus-fill me-2 fs-5"></i> Add New Employee
                </Button>
            </div>

            <Row className="mb-5">
                <Col md={6} lg={4}>
                    <InputGroup className="bg-white border rounded-4 shadow-sm overflow-hidden p-1">
                        <InputGroup.Text className="bg-transparent border-0 pe-0 ms-2">
                            <i className="bi bi-search text-muted"></i>
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Search by name, ID or role..."
                            className="bg-transparent border-0 py-2 ms-0 shadow-none fw-bold small"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
            </Row>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted fw-bold small uppercase letter-spacing-2">Loading Employee Data...</p>
                </div>
            ) : filteredEmployees.length === 0 ? (
                <Card className="border-0 shadow-sm rounded-5 py-5 text-center bg-white">
                    <i className="bi bi-people display-1 text-muted opacity-10 mb-3"></i>
                    <h4 className="fw-black text-muted">No Employees Found</h4>
                    <p className="text-muted small uppercase fw-bold letter-spacing-1">Try adjusting your search</p>
                </Card>
            ) : (
                <Row className="g-4">
                    {filteredEmployees.map(emp => {
                        const config = getRoleConfig(emp.role);
                        const empAvatar = emp.profileImage 
                        ? (emp.profileImage.startsWith('http') ? emp.profileImage : `http://localhost:5000${emp.profileImage}`)
                        : null;

                        return (
                            <Col key={emp._id} md={6} lg={4} xl={3}>
                                <Card className="border-0 shadow-sm rounded-5 h-100 overflow-hidden hover-lift transition bg-white border">
                                    <div className={`py-5 bg-${config.bg} bg-opacity-10 d-flex justify-content-center border-bottom border-${config.bg} border-opacity-10 position-relative`}>
                                        <div className="position-absolute top-0 end-0 p-3">
                                            <Badge bg={config.bg} className="rounded-pill px-3 py-2 fw-black letter-spacing-1 shadow-sm uppercase xxs">
                                                {emp.role}
                                            </Badge>
                                        </div>
                                        {empAvatar ? (
                                            <Image 
                                                src={empAvatar} 
                                                roundedCircle 
                                                className="shadow-lg object-fit-cover bg-white" 
                                                style={{ width: '90px', height: '90px', border: `4px solid #fff` }}
                                            />
                                        ) : (
                                            <div className={`bg-white rounded-circle shadow-lg d-flex align-items-center justify-content-center text-${config.bg} fw-black display-6`} style={{ width: '90px', height: '90px', border: `4px solid #fff` }}>
                                                {emp.fullName?.charAt(0) || emp.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <Card.Body className="p-4 text-center">
                                        <div className="mb-4">
                                            <h5 className="fw-black text-dark m-0 mb-1">{emp.fullName || emp.username}</h5>
                                            <span className="text-muted fw-bold xxs text-uppercase opacity-75 letter-spacing-1">
                                                <i className={`bi ${config.icon} me-1`}></i> {config.label}
                                            </span>
                                        </div>

                                        <div className="bg-light rounded-4 p-3 mb-4 text-start border border-dashed">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="xxs fw-bold text-muted uppercase letter-spacing-1">Salary</span>
                                                <span className="fw-black text-dark small">${emp.salary || '0'}.00</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="xxs fw-bold text-muted uppercase letter-spacing-1">Joined Date</span>
                                                <span className="fw-bold text-muted small">{new Date(emp.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <Button variant="outline-dark" size="sm" className="w-100 rounded-4 fw-black text-uppercase letter-spacing-1 py-2 border-2 small">
                                            Edit Details
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}

            <Modal show={showModal} onHide={() => { setShowModal(false); setFormData({...formData, profileImage: ''}); }} centered size="lg" className="border-0">
                <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
                    <Modal.Title className="fw-black display-6 text-dark letter-spacing-n1">Add Employee</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 pt-2">
                    <p className="text-muted fw-bold small text-uppercase mb-4 letter-spacing-1">Add a new employee to the system</p>
                    <Form onSubmit={handleSubmit}>
                        <div className="text-center mb-4">
                            <div className="position-relative d-inline-block">
                                <Image
                                    src={formData.profileImage ? `http://localhost:5000${formData.profileImage}` : `https://ui-avatars.com/api/?name=User&background=f8f9fa&color=adb5bd&bold=true`}
                                    roundedCircle
                                    className="border shadow-sm object-fit-cover"
                                    width="100"
                                    height="100"
                                />
                                <Form.Label className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 shadow-sm cursor-pointer mb-0" style={{ width: '35px', height: '35px', fontSize: '12px' }}>
                                    <i className="bi bi-camera-fill"></i>
                                    <Form.Control type="file" className="d-none" onChange={uploadFileHandler} />
                                </Form.Label>
                            </div>
                            {uploading && <div className="mt-2 small fw-bold text-primary">Uploading image...</div>}
                        </div>

                        <Row className="g-4 mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="xxs fw-bold text-muted uppercase letter-spacing-1">Username</Form.Label>
                                    <Form.Control className="bg-light border-0 py-3 rounded-4 shadow-none fw-black" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="xxs fw-bold text-muted uppercase letter-spacing-1">Password</Form.Label>
                                    <Form.Control className="bg-light border-0 py-3 rounded-4 shadow-none fw-black" type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="xxs fw-bold text-muted uppercase letter-spacing-1">Employee Role</Form.Label>
                                    <Form.Select className="bg-light border-0 py-3 rounded-4 shadow-none fw-black" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="pharmacist">Pharmacist</option>
                                        <option value="driver">Driver / Delivery</option>
                                        <option value="admin">Administrator</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="xxs fw-bold text-muted uppercase letter-spacing-1">Base Salary ($)</Form.Label>
                                    <Form.Control className="bg-light border-0 py-3 rounded-4 shadow-none fw-black" type="number" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Card className="bg-primary bg-opacity-10 border-0 p-4 rounded-5 mb-4 border border-primary border-opacity-10">
                            <h6 className="xxs fw-black text-primary uppercase letter-spacing-2 mb-4">Personal & Contact Information</h6>
                            <Row className="g-3">
                                <Col md={12}>
                                    <Form.Control className="bg-white border-0 py-3 rounded-4 shadow-sm fw-bold" placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                                </Col>
                                <Col md={6}>
                                    <Form.Control className="bg-white border-0 py-3 rounded-4 shadow-sm fw-bold" placeholder="Email Address" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </Col>
                                <Col md={6}>
                                    <Form.Control className="bg-white border-0 py-3 rounded-4 shadow-sm fw-bold" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </Col>
                            </Row>
                        </Card>

                        <div className="d-flex gap-3">
                            <Button variant="light" className="w-100 py-3 rounded-4 fw-black text-muted uppercase letter-spacing-1 border" onClick={() => setShowModal(false)} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" className="w-100 py-3 rounded-4 fw-black uppercase letter-spacing-1 shadow-primary border-0" disabled={submitting || uploading}>
                                {submitting ? 'Adding...' : 'Save Employee'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Employees;
