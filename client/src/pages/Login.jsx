import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, InputGroup, Alert, Spinner } from 'react-bootstrap';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const res = await login(formData.username, formData.password);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark position-relative overflow-hidden"
            style={{
                background: 'radial-gradient(circle at top left, #0d6efd 0%, #000 100%)',
                perspective: '1000px'
            }}>
            {/* Ambient Background Elements */}
            <div className="position-absolute top-0 start-0 w-100 h-100 opacity-20 pointer-events-none">
                <div className="position-absolute top-10 start-10 bg-primary rounded-circle blur-3xl" style={{ width: '400px', height: '400px', filter: 'blur(100px)' }}></div>
                <div className="position-absolute bottom-10 end-10 bg-info rounded-circle blur-3xl" style={{ width: '300px', height: '300px', filter: 'blur(100px)' }}></div>
            </div>

            <Container className="position-relative z-1">
                <Row className="justify-content-center">
                    <Col md={6} lg={5} xl={4}>
                        <div className="text-center mb-5">
                            <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4 shadow-primary border border-primary border-4"
                                style={{ width: '96px', height: '96px' }}>
                                <i className="bi bi-capsule-pill text-primary display-4"></i>
                            </div>
                            <h1 className="text-white fw-black m-0 display-4 letter-spacing-n2">PharmaCare</h1>
                            <p className="text-white-50 letter-spacing-2 fw-black xxs text-uppercase mt-2 opacity-75">Intelligence Engine & Logistics Control</p>
                        </div>

                        <Card className="border-0 shadow-2xl rounded-5 overflow-hidden bg-white hover-card transition-slow animate-float">
                            <Card.Body className="p-5">
                                <div className="mb-5 text-center">
                                    <h3 className="fw-black text-dark mb-2">Secure Access</h3>
                                    <p className="text-muted fw-bold small text-uppercase letter-spacing-1">Authentication Protocol Required</p>
                                </div>

                                {error && (
                                    <Alert variant="danger" className="py-3 small border-0 text-center mb-5 rounded-4 shadow-sm fw-black text-uppercase letter-spacing-1">
                                        <i className="bi bi-shield-slash me-2"></i>
                                        {error}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="xxs fw-black text-muted mb-2 letter-spacing-1 text-uppercase">Operator Identity</Form.Label>
                                        <InputGroup className="bg-light border rounded-4 overflow-hidden p-1 shadow-inner">
                                            <InputGroup.Text className="bg-transparent border-0 pe-0 ms-2">
                                                <i className="bi bi-person-badge text-primary opacity-50"></i>
                                            </InputGroup.Text>
                                            <Form.Control
                                                className="bg-transparent border-0 py-2 ms-0 shadow-none fw-bold text-dark"
                                                placeholder="Enter ID / Username"
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                required
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    <Form.Group className="mb-5">
                                        <Form.Label className="xxs fw-black text-muted mb-2 letter-spacing-1 text-uppercase">Security Key</Form.Label>
                                        <InputGroup className="bg-light border rounded-4 overflow-hidden p-1 shadow-inner">
                                            <InputGroup.Text className="bg-transparent border-0 pe-0 ms-2">
                                                <i className="bi bi-key text-primary opacity-50"></i>
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="password"
                                                className="bg-transparent border-0 py-2 ms-0 shadow-none fw-bold text-dark"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                required
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-100 py-3 fw-black rounded-4 shadow-primary border-0 transition-slow hover-lift text-uppercase letter-spacing-1 mb-4"
                                        disabled={loading}
                                        style={{ background: 'linear-gradient(45deg, #0d6efd, #0056b3)' }}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner size="sm" className="me-2" />
                                                Decrypting...
                                            </>
                                        ) : 'Authorize Entry'}
                                    </Button>

                                    <div className="text-center">
                                        <a href="#" className="text-muted fw-bold xxs text-decoration-none text-uppercase letter-spacing-1 hover-primary opacity-50">Forgot Security Credentials?</a>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>

                        <div className="text-center mt-5">
                            <p className="text-white-50 xxs fw-bold letter-spacing-1 m-0 text-uppercase">&copy; 2026 PharmaCare OS. All functional nodes operational.</p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Login;
