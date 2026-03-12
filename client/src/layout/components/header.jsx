import { useContext, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import { NavDropdown, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Header({ toggleSidebar }) {
    const { user, logout } = useContext(AuthContext);
    const [searchQuery, setSearchQuery] = useState('');

    const userAvatar = user?.profileImage
        ? (user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`)
        : `https://ui-avatars.com/api/?name=${user?.name || user?.username || 'User'}&background=184737&color=fff&bold=true`;

    return (
        <nav className="app-header navbar-expand-lg fixed-top d-flex align-items-center justify-content-between px-3 px-lg-4" style={{ zIndex: 1050 }}>
            {/* Left: Toggle + Brand */}
            <div className="d-flex align-items-center gap-3">
                <button
                    className="header-toggle btn p-0 d-flex align-items-center justify-content-center"
                    onClick={toggleSidebar}
                    aria-label="Toggle Sidebar"
                >
                    <i className="bi bi-list fs-4" />
                </button>

                <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
                    <div
                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{ width: 32, height: 32, background: 'var(--theme-color)' }}
                    >
                        <i className="bi bi-capsule-pill text-white" style={{ fontSize: '0.85rem' }} />
                    </div>
                    <span className="fw-bold d-none d-sm-inline" style={{ color: 'var(--theme-color)', fontSize: '1rem' }}>
                        PharmaCare
                    </span>
                </Link>
            </div>

            {/* Center: Search */}
            <div className="d-none d-md-flex align-items-center header-search-wrapper">
                <i className="bi bi-search header-search-icon" />
                <input
                    type="text"
                    className="header-search-input"
                    placeholder="Type to search..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Right: Actions + Profile */}
            <div className="d-flex align-items-center gap-2">
                <button className="header-icon-btn btn d-flex align-items-center justify-content-center" title="Notifications">
                    <i className="bi bi-bell" />
                </button>

                <NavDropdown
                    title={
                        <div className="d-flex align-items-center gap-2">
                            <Image
                                className="rounded-circle object-fit-cover"
                                src={userAvatar}
                                alt="User"
                                width="34"
                                height="34"
                                style={{ border: '2px solid var(--theme-color)' }}
                            />
                            <div className="d-none d-lg-block text-start" style={{ lineHeight: '1.2' }}>
                                <div className="fw-semibold small" style={{ color: '#333', fontSize: '0.82rem' }}>
                                    {user?.name || user?.username || 'User'}
                                </div>
                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                    {user?.role || 'Pharmacist'}
                                </div>
                            </div>
                            <i className="bi bi-chevron-down small text-muted d-none d-lg-inline" />
                        </div>
                    }
                    id="user-dropdown"
                    align="end"
                    className="no-caret border-0 d-flex align-items-center"
                >
                    <div className="px-3 py-2 border-bottom">
                        <div className="fw-bold small">{user?.name || user?.username}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user?.email || user?.role}</div>
                    </div>
                    <NavDropdown.Item as={Link} to="/profile" className="py-2 small">
                        <i className="bi bi-person me-2 text-muted" />Profile
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={logout} className="py-2 text-danger small">
                        <i className="bi bi-box-arrow-right me-2" />Logout
                    </NavDropdown.Item>
                </NavDropdown>
            </div>
        </nav>
    );
}

export default Header;
