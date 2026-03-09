import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { NavDropdown, Image, Button } from 'react-bootstrap';

function Header({ toggleSidebar }) {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="header sticky-top bg-white border-bottom shadow-sm py-2 px-4" style={{ zIndex: 1050, height: '70px' }}>
            <div className="d-flex align-items-center justify-content-between h-100">
                <div className="d-flex align-items-center">
                    <Button
                        variant="link"
                        className="text-dark p-0 me-4 transition hover-lift"
                        onClick={toggleSidebar}
                    >
                        <i className="bi bi-list-nested fs-3"></i>
                    </Button>

                    <a href="/" className="text-decoration-none d-flex align-items-center">
                        <div className="bg-primary rounded-circle p-2 me-2 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <i className="bi bi-capsule-pill text-white fs-5"></i>
                        </div>
                        <span className="fw-black text-dark fs-4 letter-spacing-n1 m-0 d-none d-sm-block">PharmaCare</span>
                    </a>
                </div>

                <div className="d-flex align-items-center">
                    <div className="d-none d-md-flex align-items-center me-4">
                        <div className="text-end me-3">
                            <div className="fw-black text-dark small mb-0 fs-6">{user?.name || 'Authorized Operator'}</div>
                            <div className="xxs fw-bold text-muted text-uppercase letter-spacing-1 opacity-75">{user?.role || 'Pharmacist Officer'}</div>
                        </div>
                    </div>

                    <NavDropdown
                        title={
                            <div className="d-inline-block p-1 border rounded-circle shadow-sm hover-lift transition">
                                <Image
                                    src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0d6efd&color=fff&bold=true`}
                                    roundedCircle
                                    style={{ width: '42px', height: '42px' }}
                                />
                            </div>
                        }
                        id="user-dropdown"
                        align="end"
                        className="no-caret border-0 shadow-2xl"
                    >
                        <div className="px-4 py-3 border-bottom d-md-none">
                            <div className="fw-black text-dark">{user?.name || 'User'}</div>
                            <div className="xxs text-muted text-uppercase fw-bold letter-spacing-1">{user?.role || 'Pharmacist'}</div>
                        </div>

                        <NavDropdown.Item className="py-2 px-4 fw-bold text-muted transition hover-primary small">
                            <i className="bi bi-person-badge me-2"></i> Security Profile
                        </NavDropdown.Item>
                        <NavDropdown.Item className="py-2 px-4 fw-bold text-muted transition hover-primary small">
                            <i className="bi bi-shield-check me-2"></i> Access Logs
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item
                            onClick={logout}
                            className="py-2 px-4 fw-black text-danger transition small text-uppercase letter-spacing-1"
                        >
                            <i className="bi bi-box-arrow-right me-2"></i> Terminate Session
                        </NavDropdown.Item>
                    </NavDropdown>
                </div>
            </div>
        </div>
    );
}

export default Header;
