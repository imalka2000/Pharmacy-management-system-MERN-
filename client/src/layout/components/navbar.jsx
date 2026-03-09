import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Collapse, Badge, Image, Button } from "react-bootstrap";
import useAuth from "../../hooks/useAuth";

const Nav = ({ isOpen }) => {
    const [openGroup, setOpenGroup] = useState(null);
    const { user, logout } = useAuth();

    const toggleGroup = (group) => {
        setOpenGroup(openGroup === group ? null : group);
    };

    const navLinks = [
        { to: "/dashboard", label: "Operations Command", icon: "bi-grid-fill", badge: null },
        { to: "/medicines", label: "Inventory Logic", icon: "bi-capsule", badge: "Live" },
        { to: "/suppliers", label: "Vendor Nodes", icon: "bi-truck", badge: null },
        { to: "/sales", label: "Revenue Stream", icon: "bi-cart-fill", badge: null },
        { to: "/supply-requests", label: "Supply Chain", icon: "bi-file-earmark-text", badge: null },
        { to: "/prescriptions", label: "Prescription Lab", icon: "bi-receipt", badge: null },
        { to: "/deliveries", label: "Logistic Hub", icon: "bi-mailbox", badge: null },
        { to: "/driver-portal", label: "Driver Portal", icon: "bi-steering", badge: null },
        { to: "/promotions", label: "Campaigns", icon: "bi-megaphone", badge: "New" },
        { to: "/feedback", label: "Patient Vox", icon: "bi-chat-left-dots", badge: null },
        { to: "/reports", label: "Intelligence Reports", icon: "bi-graph-up-arrow", badge: null },
    ];

    return (
        <div className={`side-nav shadow-sm d-flex flex-column ${isOpen ? 'active' : 'folded'}`}>
            {/* User Profile Header */}
            {isOpen && (
                <div className="p-4 pt-5 border-bottom bg-light bg-opacity-10">
                    <div className="d-flex align-items-center mb-0">
                        <div className="position-relative">
                            <Image
                                src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0d6efd&color=fff&bold=true`}
                                roundedCircle
                                style={{ width: '48px', height: '48px', border: '2px solid #fff' }}
                                className="shadow-sm"
                            />
                            <span className="position-absolute bottom-0 end-0 p-1 bg-success border border-white border-2 rounded-circle"></span>
                        </div>
                        <div className="ms-3 overflow-hidden text-nowrap">
                            <div className="fw-black text-dark text-truncate small mb-0">{user?.name || 'Authorized Operator'}</div>
                            <div className="xxs fw-bold text-primary text-uppercase letter-spacing-1">{user?.role || 'Officer'}</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="side-nav-inner p-3 flex-grow-1 overflow-auto custom-scrollbar">
                <div className="side-nav-menu">
                    <div className="px-3 mb-4 mt-2">
                        <span className="xxs fw-black text-muted uppercase opacity-50 letter-spacing-2">System Core</span>
                    </div>

                    <div className="d-grid gap-2">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    `d-flex align-items-center p-3 rounded-4 text-decoration-none transition-slow hover-lift ${isActive ? 'bg-primary text-white shadow-primary fw-black' : 'text-muted fw-bold'}`
                                }
                            >
                                <span className="icon-holder fs-5 me-3">
                                    <i className={`bi ${link.icon}`} />
                                </span>
                                {isOpen && (
                                    <>
                                        <span className="title small uppercase letter-spacing-1">{link.label}</span>
                                        {link.badge && (
                                            <Badge bg={link.badge === 'Live' ? 'success' : 'info'} className="ms-auto xxs rounded-pill px-2">
                                                {link.badge}
                                            </Badge>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}

                        <hr className="my-4 opacity-10" />

                        <div className="px-3 mb-3">
                            <span className="xxs fw-black text-muted uppercase opacity-50 letter-spacing-2">Governance</span>
                        </div>

                        <div className={`d-flex align-items-center p-3 rounded-4 text-decoration-none transition-slow hover-lift cursor-pointer ${openGroup === 'admin' ? 'bg-light text-dark shadow-sm' : 'text-muted fw-bold'}`}
                            onClick={() => toggleGroup('admin')}>
                            <span className="icon-holder fs-5 me-3">
                                <i className="bi bi-shield-lock" />
                            </span>
                            {isOpen && (
                                <>
                                    <span className="title small uppercase letter-spacing-1">Administration</span>
                                    <i className={`ms-auto bi ${openGroup === "admin" ? "bi-chevron-down" : "bi-chevron-right"} xxs`} />
                                </>
                            )}
                        </div>

                        <Collapse in={openGroup === "admin" && isOpen}>
                            <div className="ps-4 d-grid gap-1 mt-1">
                                <NavLink to="/users" className={({ isActive }) =>
                                    `d-block p-2 px-3 rounded-3 text-decoration-none small fw-bold transition ${isActive ? 'text-primary' : 'text-muted'}`
                                }>
                                    Patient Registry
                                </NavLink>
                                <NavLink to="/employees" className={({ isActive }) =>
                                    `d-block p-2 px-3 rounded-3 text-decoration-none small fw-bold transition ${isActive ? 'text-primary' : 'text-muted'}`
                                }>
                                    Staff Directory
                                </NavLink>
                            </div>
                        </Collapse>
                    </div>
                </div>
            </div>

            {/* Bottom Branding & Session Section */}
            <div className="p-4 border-top bg-light bg-opacity-50 mt-auto">
                {isOpen && (
                    <div className="d-flex align-items-center mb-3">
                        <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                            <i className="bi bi-patch-check-fill text-primary"></i>
                        </div>
                        <div>
                            <div className="fw-black text-dark xxs uppercase letter-spacing-1">PharmaCare OS</div>
                            <div className="text-muted xxs">v2.4.0 Deployment</div>
                        </div>
                    </div>
                )}
                <Button
                    variant="outline-danger"
                    size="sm"
                    className="w-100 fw-black text-uppercase letter-spacing-1 border-0 rounded-3 py-2 transition-slow hover-lift"
                    style={{ background: 'rgba(220, 53, 69, 0.05)' }}
                    onClick={logout}
                >
                    <i className="bi bi-power me-2"></i>
                    {isOpen && "Terminate Session"}
                </Button>
            </div>
        </div>
    );
};

export default Nav;
