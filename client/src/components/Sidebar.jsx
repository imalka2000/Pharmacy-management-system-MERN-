import { Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Sidebar = () => {
    const { pathname } = useLocation();
    const { logout, user } = useAuth();

    const links = [
        { title: 'Dashboard', path: '/', icon: 'bi-grid-1x2-fill' },
        { title: 'Medicine Inventory', path: '/medicines', icon: 'bi-capsule' },
        { title: 'Sales', path: '/sales', icon: 'bi-receipt-cutoff' },
        { title: 'Prescriptions', path: '/prescriptions', icon: 'bi-file-earmark-medical' },
        { title: 'Supply Chain', path: '/supply-chain', icon: 'bi-diagram-3-fill' },
        { title: 'Deliveries', path: '/deliveries', icon: 'bi-truck', role: 'admin' },
        { title: 'Driver Portal', path: '/driver-portal', icon: 'bi-scooter', role: 'driver' },
        { title: 'Suppliers', path: '/suppliers', icon: 'bi-building-up', role: 'admin' },
        { title: 'Employees', path: '/employees', icon: 'bi-people-fill', role: 'admin' },
        { title: 'Patients', path: '/users', icon: 'bi-person-badge', role: 'admin' },
        { title: 'Promotions', path: '/promotions', icon: 'bi-megaphone-fill' },
        { title: 'Feedback', path: '/feedback', icon: 'bi-chat-dots-fill' },
        { title: 'Reports', path: '/reports', icon: 'bi-bar-chart-line-fill', role: 'admin' },
    ];

    return (
        <aside className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark shadow-lg border-end border-opacity-10" style={{ width: '280px', height: '100vh', position: 'fixed', zIndex: 1050 }}>
            <div className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none p-3 pb-4">
                <div className="p-2 rounded-3 bg-primary bg-gradient shadow-sm me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-shield-plus fs-4"></i>
                </div>
                <span className="fs-4 fw-black letter-spacing-1 text-uppercase">Pharma<span className="text-primary">Sys</span></span>
            </div>

            <hr className="bg-light opacity-10 mx-3 mb-4" />

            <ul className="nav nav-pills flex-column mb-auto overflow-y-auto px-2 custom-scrollbar">
                <li className="nav-item mb-2 ps-2">
                    <small className="text-uppercase fw-bold text-muted xxs opacity-50 letter-spacing-2">Main Operations</small>
                </li>
                {links.map((link) => {
                    if (link.role && user?.role !== link.role) return null;
                    const isActive = pathname === link.path;

                    return (
                        <li key={link.path} className="nav-item mb-1">
                            <Link
                                to={link.path}
                                className={`nav-link d-flex align-items-center py-3 px-3 rounded-4 transition-all ${isActive ? 'active bg-primary bg-gradient shadow-lg text-white' : 'text-secondary hover-bg-dark-light'}`}
                                style={{ border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent' }}
                            >
                                <i className={`bi ${link.icon} me-3 fs-5 ${isActive ? 'text-white' : 'text-muted'}`}></i>
                                <span className="fw-bold small">{link.title}</span>
                                {isActive && <i className="bi bi-circle-fill ms-auto xxs text-white opacity-50 pulse-animation"></i>}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <div className="mt-auto px-2 pb-3">
                <div className="bg-light bg-opacity-10 rounded-4 p-3 mb-3 border border-white border-opacity-10 overflow-hidden position-relative">
                    <div className="d-flex align-items-center position-relative" style={{ zIndex: 1 }}>
                        <div className="rounded-circle bg-primary bg-gradient d-flex align-items-center justify-content-center me-3 border border-dark border-2 shadow-sm" style={{ width: '48px', height: '48px' }}>
                            <span className="fw-black fs-5 text-white">{user?.username?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="overflow-hidden">
                            <h6 className="mb-0 text-white fw-black text-truncate">{user?.username}</h6>
                            <small className="text-primary fw-bold text-uppercase xxs letter-spacing-1">{user?.role}</small>
                        </div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="btn btn-outline-danger w-100 py-3 rounded-4 fw-black text-uppercase letter-spacing-2 small d-flex align-items-center justify-content-center transition border-0 hover-lift"
                    style={{ background: 'rgba(220, 53, 69, 0.05)' }}
                >
                    <i className="bi bi-power me-2 fs-5"></i> Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
