import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button } from 'react-bootstrap';

const Administration = () => {
    const navigate = useNavigate();

    const adminSections = [
        {
            title: 'Employee Management',
            description: 'Manage pharmacist and staff profiles, roles, and access.',
            icon: 'bi-people-fill',
            path: '/employees',
            color: 'primary'
        },
        {
            title: 'Patient/User Database',
            description: 'View and manage registered patients and their transaction history.',
            icon: 'bi-person-badge',
            path: '/users',
            color: 'success'
        },
        {
            title: 'System Reports',
            description: 'Generate comprehensive financial, inventory, and sales reports.',
            icon: 'bi-bar-chart-line-fill',
            path: '/reports',
            color: 'info'
        }
    ];

    return (
        <div className="admin-hub animate__animated animate__fadeIn">
            <div className="bg-white border-bottom p-4 mb-4 shadow-sm rounded-4">
                <h2 className="fw-black text-dark m-0 d-flex align-items-center">
                    <i className="bi bi-shield-lock-fill text-primary me-3 fs-1"></i>
                    Administration Hub
                </h2>
                <p className="text-muted small m-0 ms-1">High-level system management and organizational control</p>
            </div>

            <div className="px-1">
                <Row className="g-4">
                    {adminSections.map((section, idx) => (
                        <Col lg={4} key={idx}>
                            <Card className="border-0 shadow-sm rounded-4 h-100 transition-all hover-lift">
                                <Card.Body className="p-4 d-flex flex-column">
                                    <div className={`rounded-4 p-3 mb-4 bg-${section.color}-subtle text-${section.color} d-inline-block`} style={{ width: 'fit-content' }}>
                                        <i className={`bi ${section.icon} fs-2`}></i>
                                    </div>
                                    <h4 className="fw-black text-dark mb-3">{section.title}</h4>
                                    <p className="text-muted mb-4 flex-grow-1">{section.description}</p>
                                    <Button 
                                        variant={section.color} 
                                        className="w-100 py-3 rounded-3 fw-black text-uppercase letter-spacing-1 border-0 shadow-sm"
                                        onClick={() => navigate(section.path)}
                                    >
                                        Manage {section.title.split(' ')[0]}
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
                
                <Card className="border-0 shadow-sm rounded-4 mt-4 bg-dark text-white overflow-hidden">
                    <Card.Body className="p-5 d-flex align-items-center justify-content-between">
                        <div>
                            <h3 className="fw-black mb-2">Advanced Configuration</h3>
                            <p className="text-secondary mb-0">Coming soon: System-wide settings and API integration keys.</p>
                        </div>
                        <i className="bi bi-gear-wide-connected fs-1 opacity-25"></i>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default Administration;
