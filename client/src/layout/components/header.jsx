import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { NavDropdown, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Header({ toggleSidebar }) {
    const { user, logout } = useContext(AuthContext);

    const userAvatar = user?.profileImage 
        ? (user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`)
        : `https://ui-avatars.com/api/?name=${user?.name || user?.username || 'User'}&background=0d6efd&color=fff&bold=true`;

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom fixed-top shadow-sm p-0" style={{ height: "56px", zIndex: 1050 }}>
            <div className="container-fluid h-100 d-flex align-items-center">
                <div className="d-flex align-items-center h-100">
                    <Link className="navbar-brand d-flex align-items-center me-4" to="/">
                        <div className="bg-primary rounded-circle p-1 me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                            <i className="bi bi-capsule-pill text-white fs-6"></i>
                        </div>
                        <span className="fw-bold text-primary d-none d-sm-inline">PharmaCare</span>
                    </Link>
                    <button className="btn btn-link text-dark p-0 me-3 d-flex align-items-center" onClick={toggleSidebar}>
                        <i className="bi bi-list fs-4"></i>
                    </button>
                </div>

                <div className="ms-auto d-flex align-items-center h-100">
                    {/* User Profile */}
                    <NavDropdown
                        title={
                            <div className="d-flex align-items-center">
                                <Image
                                    className="rounded-circle border me-2 object-fit-cover"
                                    src={userAvatar}
                                    alt="User"
                                    width="32"
                                    height="32"
                                />
                                <div className="d-none d-md-block text-start" style={{ lineHeight: '1.1' }}>
                                    <div className="fw-bold small text-dark">{user?.name || user?.username || 'Authorized Operator'}</div>
                                    <div className="extra-small text-muted">{user?.role || 'Pharmacist'}</div>
                                </div>
                            </div>
                        }
                        id="user-dropdown"
                        align="end"
                        className="no-caret border-0 d-flex align-items-center h-100"
                    >
                        <div className="px-3 py-2 border-bottom border-light">
                            <div className="fw-bold small">{user?.name || user?.username}</div>
                            <div className="text-muted extra-small">{user?.role}</div>
                        </div>
                        <NavDropdown.Item as={Link} to="/profile" className="py-2 small"><i className="bi bi-person me-2"></i> Profile</NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="/settings" className="py-2 small"><i className="bi bi-gear me-2"></i> Settings</NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item onClick={logout} className="py-2 text-danger small"><i className="bi bi-box-arrow-right me-2"></i> Logout</NavDropdown.Item>
                    </NavDropdown>
                </div>
            </div>
        </nav>
    );
}

export default Header;
