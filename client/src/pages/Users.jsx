import apiClient, { BASE_URL } from '../api-request/config';
import useAuth from '../hooks/useAuth';
import { Button, Form, Row, Col, Card, Modal, Table, Spinner, InputGroup, Badge, Image } from 'react-bootstrap';
import toast from 'react-hot-toast';

const Users = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'user',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        profileImage: ''
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
            toast.error('Failed to load patient data');
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
            toast.success('Patient identifier image uploaded');
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
            toast.success('Patient registered successfully');
            setShowModal(false);
            fetchUsers();
            setFormData({ username: '', password: '', role: 'user', fullName: '', email: '', phone: '', address: '', profileImage: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to register patient');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid px-0">
            <div className="d-flex flex-wrap justify-content-between align-items-end mb-5 gap-3">
                <div>
                    <h1 className="fw-black text-dark m-0 letter-spacing-n1">Patients</h1>
                    <p className="text-muted fw-bold small m-0 uppercase opacity-75">Manage patient accounts and records</p>
                </div>
                <Button
                    variant="primary"
                    className="shadow-primary rounded-4 d-flex align-items-center px-4 py-3 fw-black border-0 transition hover-lift text-uppercase letter-spacing-1"
                    onClick={() => setShowModal(true)}
                >
                    <i className="bi bi-person-plus-fill me-2 fs-5"></i> Add Patient
                </Button>
            </div>

            <Row className="mb-5">
                <Col md={6} lg={4}>
                    <InputGroup className="bg-white border rounded-4 shadow-sm overflow-hidden p-1">
                        <InputGroup.Text className="bg-transparent border-0 pe-0 ms-2">
                            <i className="bi bi-search text-muted"></i>
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Search by name, username or email..."
                            className="bg-transparent border-0 py-2 ms-0 shadow-none fw-bold small"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm rounded-5 overflow-hidden bg-white border">
                <Table hover responsive className="mb-0 align-middle text-nowrap">
                    <thead className="bg-light border-bottom">
                        <tr>
                            <th className="ps-4 py-4 text-muted xxs fw-black text-uppercase letter-spacing-1">Patient Name</th>
                            <th className="py-4 text-muted xxs fw-black text-uppercase letter-spacing-1">Contact Information</th>
                            <th className="py-4 text-muted xxs fw-black text-uppercase letter-spacing-1">Date Joined</th>
                            <th className="pe-4 py-4 text-muted xxs fw-black text-uppercase letter-spacing-1 text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="text-center py-5">
                                    <Spinner animation="grow" variant="primary" size="sm" />
                                    <p className="mt-3 xxs fw-black text-muted text-uppercase letter-spacing-1">Loading Patient Records...</p>
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-5">
                                    <i className="bi bi-person-x display-4 text-muted opacity-10 d-block mb-3"></i>
                                    <h5 className="fw-black text-muted m-0">No Patients Found</h5>
                                    <p className="text-muted small fw-bold uppercase letter-spacing-1">The patient directory is currently empty</p>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map(u => {
                                const patientAvatar = u.profileImage 
                                ? (u.profileImage.startsWith('http') ? u.profileImage : `http://localhost:5000${u.profileImage}`)
                                : null;

                                return (
                                    <tr key={u._id} className="transition border-bottom border-light">
                                        <td className="ps-4 py-4">
                                            <div className="d-flex align-items-center">
                                                {patientAvatar ? (
                                                    <Image 
                                                        src={patientAvatar} 
                                                        roundedCircle 
                                                        className="me-3 shadow-sm object-fit-cover border" 
                                                        style={{ width: '52px', height: '52px' }}
                                                    />
                                                ) : (
                                                    <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-black me-3 shadow-sm border border-primary border-opacity-10" style={{ width: '52px', height: '52px' }}>
                                                        {(u.fullName?.charAt(0) || u.username.charAt(0)).toUpperCase()}
                                                    </div>
                                                )}
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
                                            <Badge bg="light" text="dark" className="border px-3 py-2 rounded-4 fw-bold small shadow-sm text-uppercase">
                                                {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </Badge>
                                        </td>
                                        <td className="pe-4 py-4 text-end">
                                            <Button variant="outline-dark" size="sm" className="rounded-4 fw-black xxs text-uppercase letter-spacing-1 py-2 px-3 border-2">
                                                View Profile
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showModal} onHide={() => { setShowModal(false); setFormData({...formData, profileImage: ''}); }} centered size="lg" className="border-0">
                <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
                    <Modal.Title className="fw-black display-6 text-dark letter-spacing-n1">Add New Patient</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 pt-2">
                    <p className="text-muted fw-bold small text-uppercase mb-4 letter-spacing-1">Register a new patient account</p>
                    <Form onSubmit={handleSubmit}>
                        <div className="text-center mb-4">
                            <div className="position-relative d-inline-block">
                                <Image
                                    src={formData.profileImage ? (formData.profileImage.startsWith('http') ? formData.profileImage : `${BASE_URL}${formData.profileImage}`) : `https://ui-avatars.com/api/?name=${formData.fullName || 'Patient'}&background=random`}
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
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="xxs fw-bold text-muted uppercase letter-spacing-1">Full Name</Form.Label>
                                    <Form.Control className="bg-light border-0 py-3 rounded-4 shadow-none fw-black" required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                                </Form.Group>
                            </Col>
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
                        </Row>

                        <Card className="bg-light border-0 p-4 rounded-5 mb-5 border border-light">
                            <h6 className="xxs fw-black text-muted uppercase letter-spacing-2 mb-4">Contact & Address Information</h6>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Control className="bg-white border-0 py-3 rounded-4 shadow-sm fw-bold" placeholder="Email Address" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </Col>
                                <Col md={6}>
                                    <Form.Control className="bg-white border-0 py-3 rounded-4 shadow-sm fw-bold" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </Col>
                                <Col md={12}>
                                    <Form.Control as="textarea" rows={2} className="bg-white border-0 py-3 rounded-4 shadow-sm fw-bold resize-none" placeholder="Home Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                </Col>
                            </Row>
                        </Card>

                        <div className="d-grid gap-3">
                            <Button variant="primary" type="submit" size="lg" className="py-3 rounded-4 fw-black text-uppercase letter-spacing-1 shadow-primary border-0" disabled={submitting || uploading}>
                                {submitting ? 'Registering...' : 'Register Patient'}
                            </Button>
                            <Button variant="link" className="text-muted text-decoration-none fw-bold small uppercase letter-spacing-1" onClick={() => setShowModal(false)} disabled={submitting}>
                                Cancel
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Users;
