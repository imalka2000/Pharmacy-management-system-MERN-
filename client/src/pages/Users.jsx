import { useState, useEffect } from 'react';
import apiClient from '../api-request/config';
import useAuth from '../hooks/useAuth';
import { Button, Form, Row, Col, Card, Modal, Table, Spinner, InputGroup, Badge } from 'react-bootstrap';
import toast from 'react-hot-toast';

const Users = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'user',
        fullName: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        if (user?.token) fetchUsers();
    }, [user]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/auth/users');
            setUsers(data.filter(u => u.role === 'user')); // Filter only customers
        } catch (error) {
            console.error('Customer registry error:', error);
            toast.error('Failed to sync patient directory');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiClient.post('/auth/register', formData);
            toast.success('Patient profile institutionalized');
            setShowModal(false);
            fetchUsers();
            setFormData({ username: '', password: '', role: 'user', fullName: '', email: '', phone: '', address: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Profile generation failure');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid px-0">
            <div className="d-flex flex-wrap justify-content-between align-items-end mb-5 gap-3">
                <div>
                    <h1 className="fw-black text-dark m-0 letter-spacing-n1">Patient Directory</h1>
                    <p className="text-muted fw-bold small m-0 uppercase opacity-75">Customer Accounts & Health Profiles</p>
                </div>
                <Button
                    variant="primary"
                    className="shadow-primary rounded-4 d-flex align-items-center px-4 py-3 fw-black border-0 transition hover-lift text-uppercase letter-spacing-1"
                    onClick={() => setShowModal(true)}
                >
                    <i className="bi bi-person-plus-fill me-2 fs-5"></i> Enroll Patient
                </Button>
            </div>

            <Row className="mb-5">
                <Col md={6} lg={4}>
                    <InputGroup className="bg-white border rounded-4 shadow-sm overflow-hidden p-1">
                        <InputGroup.Text className="bg-transparent border-0 pe-0 ms-2">
                            <i className="bi bi-search text-muted"></i>
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Filter by name, username or email..."
                            className="bg-transparent border-0 py-2 ms-0 shadow-none fw-bold small"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm rounded-5 overflow-hidden bg-white border">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light border-bottom">
                        <tr>
                            <th className="ps-4 py-4 text-muted xxs fw-black text-uppercase letter-spacing-1">Patient Identity</th>
                            <th className="py-4 text-muted xxs fw-black text-uppercase letter-spacing-1">Communication Channels</th>
                            <th className="py-4 text-muted xxs fw-black text-uppercase letter-spacing-1">Registry Date</th>
                            <th className="pe-4 py-4 text-muted xxs fw-black text-uppercase letter-spacing-1 text-end">Operations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="text-center py-5">
                                    <Spinner animation="grow" variant="primary" size="sm" />
                                    <p className="mt-3 xxs fw-black text-muted text-uppercase letter-spacing-1">Scanning Patient Records...</p>
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-5">
                                    <i className="bi bi-person-x display-4 text-muted opacity-10 d-block mb-3"></i>
                                    <h5 className="fw-black text-muted m-0">No Patient Records Located</h5>
                                    <p className="text-muted small fw-bold uppercase letter-spacing-1">The directory is currently vacuum-sealed</p>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map(u => (
                                <tr key={u._id} className="transition border-bottom border-light">
                                    <td className="ps-4 py-4">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-black me-3 shadow-sm border border-primary border-opacity-10" style={{ width: '52px', height: '52px' }}>
                                                {(u.fullName?.charAt(0) || u.username.charAt(0)).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="fw-black text-dark mb-0 fs-6">{u.fullName || 'Anonymous Patient'}</div>
                                                <small className="text-muted fw-bold xxs text-uppercase letter-spacing-1">@{u.username}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-muted">
                                        <div className="d-flex align-items-center mb-1">
                                            <i className="bi bi-envelope-at-fill text-primary text-opacity-25 me-2 fs-6"></i>
                                            <span className="fw-bold small">{u.email || <span className="opacity-50">—</span>}</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-telephone-fill text-primary text-opacity-25 me-2 fs-6"></i>
                                            <span className="fw-bold small">{u.phone || <span className="opacity-50">—</span>}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <Badge bg="light" text="dark" className="border px-3 py-2 rounded-4 fw-bold small shadow-sm">
                                            {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </Badge>
                                    </td>
                                    <td className="pe-4 py-4 text-end">
                                        <Button variant="outline-dark" size="sm" className="rounded-4 fw-black xxs text-uppercase letter-spacing-1 py-2 px-3 border-2">
                                            View Profile
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" className="border-0">
                <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
                    <Modal.Title className="fw-black display-6 text-dark letter-spacing-n1">Enroll New Patient</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 pt-2">
                    <p className="text-muted fw-bold small text-uppercase mb-4 letter-spacing-1">Establish patient health custody account</p>
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-4 mb-4">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="xxs fw-bold text-muted uppercase letter-spacing-1">Full Legal Appellation</Form.Label>
                                    <Form.Control className="bg-light border-0 py-3 rounded-4 shadow-none fw-black" required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="xxs fw-bold text-muted uppercase letter-spacing-1">System Identity (Username)</Form.Label>
                                    <Form.Control className="bg-light border-0 py-3 rounded-4 shadow-none fw-black" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="xxs fw-bold text-muted uppercase letter-spacing-1">Security Credential (Password)</Form.Label>
                                    <Form.Control className="bg-light border-0 py-3 rounded-4 shadow-none fw-black" type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Card className="bg-light border-0 p-4 rounded-5 mb-5 border border-light">
                            <h6 className="xxs fw-black text-muted uppercase letter-spacing-2 mb-4">Communication & Location Intelligence</h6>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Control className="bg-white border-0 py-3 rounded-4 shadow-sm fw-bold" placeholder="Email Address" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </Col>
                                <Col md={6}>
                                    <Form.Control className="bg-white border-0 py-3 rounded-4 shadow-sm fw-bold" placeholder="Contact Number" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </Col>
                                <Col md={12}>
                                    <Form.Control as="textarea" rows={2} className="bg-white border-0 py-3 rounded-4 shadow-sm fw-bold resize-none" placeholder="Residential Address Records" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                </Col>
                            </Row>
                        </Card>

                        <div className="d-grid gap-3">
                            <Button variant="primary" type="submit" size="lg" className="py-3 rounded-4 fw-black text-uppercase letter-spacing-1 shadow-primary border-0" disabled={submitting}>
                                {submitting ? 'Propagating Profile...' : 'Authorize Registration'}
                            </Button>
                            <Button variant="link" className="text-muted text-decoration-none fw-bold small uppercase letter-spacing-1" onClick={() => setShowModal(false)} disabled={submitting}>
                                Discard Application
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Users;
