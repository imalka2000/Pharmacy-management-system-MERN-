import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { NavDropdown, Image, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Header({ toggleSidebar }) {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom fixed-top shadow-sm" style={{ height: "56px", zIndex: 1050 }}>
            <div className="container-fluid">
                <div className="d-flex align-items-center">
                    <Link className="navbar-brand d-flex align-items-center me-4" to="/">
                        <div className="bg-primary rounded-circle p-1 me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                            <i className="bi bi-capsule-pill text-white fs-6"></i>
                        </div>
                        <span className="fw-bold text-primary d-none d-sm-inline">PharmaCare</span>
                    </Link>
                    <button className="btn btn-link text-dark p-0 me-3" onClick={toggleSidebar}>
                        <i className="bi bi-list fs-4"></i>
                    </button>
                </div>

                <div className="d-flex align-items-center ms-auto">
                    {/* User Profile */}
                    <NavDropdown
                        title={
                            <div className="d-flex align-items-center">
                                <Image
                                    className="rounded-circle border me-2"
                                    src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0d6efd&color=fff&bold=true`}
                                    alt="User"
                                    width="32"
                                    height="32"
                                />
                                <div className="d-none d-md-block text-start">
                                    <div className="fw-bold small text-dark leading-none" style={{ lineHeight: 1 }}>{user?.name || 'Authorized Operator'}</div>
                                    <div className="extra-small text-muted">{user?.role || 'Pharmacist'}</div>
                                </div>
                            </div>
                        }
                        id="user-dropdown"
                        align="end"
                        className="no-caret border-0"
                    >
                        <li className="px-3 py-2 border-bottom border-light">
                            <div className="fw-bold small">{user?.name}</div>
                            <div className="text-muted extra-small">{user?.role}</div>
                        </li>
                        <NavDropdown.Item as={Link} to="/profile" className="py-2"><i className="bi bi-person me-2"></i> Profile</NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="/settings" className="py-2"><i className="bi bi-gear me-2"></i> Settings</NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item onClick={logout} className="py-2 text-danger"><i className="bi bi-box-arrow-right me-2"></i> Logout</NavDropdown.Item>
                    </NavDropdown>
                </div>
            </div>
        </nav>
    );
}

export default Header;
