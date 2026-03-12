import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Collapse } from "react-bootstrap";
import useAuth from "../../hooks/useAuth";

const Nav = ({ isOpen }) => {
  const { user } = useAuth();
  const [openGroup, setOpenGroup] = useState(null);

  const toggleGroup = (group) => {
    setOpenGroup(openGroup === group ? null : group);
  };

  const role = user?.role || "user";
  const isStaff = ["admin", "pharmacist"].includes(role);
  const isAdmin = role === "admin";

  const navItem = (to, icon, label) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-link d-flex align-items-center gap-3 ${isActive ? "active" : ""}`
      }
    >
      <span className="icon-holder">
        <i className={`bi ${icon}`} />
      </span>
      <span className="title">{label}</span>
    </NavLink>
  );

  return (
    <aside className={`sidebar ${isOpen ? "" : "closed"}`}>
      <div className="sidebar-inner d-flex flex-column">
        {/* Brand */}
        <div className="sidebar-brand d-flex align-items-center gap-2 px-4 py-3">
          <div
            className="brand-icon d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: 40,
              height: 40,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            <i className="bi bi-capsule-pill text-white fs-5" />
          </div>
          <div>
            <span className="fw-bold text-white fs-5 lh-1 d-block">PharmaCare</span>
            <small className="text-white-50" style={{ fontSize: "0.7rem" }}>
              Management System
            </small>
          </div>
        </div>

        <hr className="sidebar-divider mx-3 my-0 border-white border-opacity-10" />

        {/* Nav Menu */}
        <nav className="flex-grow-1 overflow-auto py-2 sidebar-nav">
          <p className="sidebar-section-label px-4 pt-3 pb-1 text-uppercase text-white-50 fw-semibold" style={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>
            Main
          </p>

          {navItem("/dashboard", "bi-speedometer2", "Dashboard")}

          {isStaff && navItem("/medicines", "bi-capsule", "Inventory")}
          {isStaff && navItem("/sales", "bi-cart-check", "Sales & Billing")}

          {navItem("/prescriptions", "bi-receipt", "Prescriptions")}

          {isStaff && navItem("/supply-requests", "bi-truck", "Supply Chain")}
          {isStaff && navItem("/deliveries", "bi-bicycle", "Deliveries")}
          {isStaff && navItem("/suppliers", "bi-building", "Suppliers")}

          {isAdmin && (
            <>
              <p className="sidebar-section-label px-4 pt-3 pb-1 text-uppercase text-white-50 fw-semibold" style={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>
                Administration
              </p>

              <button
                className={`nav-link d-flex align-items-center gap-3 w-100 border-0 bg-transparent text-start ${openGroup === "admin" ? "active-parent" : ""}`}
                onClick={() => toggleGroup("admin")}
              >
                <span className="icon-holder">
                  <i className="bi bi-shield-lock" />
                </span>
                <span className="title flex-grow-1">Admin</span>
                <i className={`bi ${openGroup === "admin" ? "bi-chevron-down" : "bi-chevron-right"} small me-1`} />
              </button>

              <Collapse in={openGroup === "admin"}>
                <div className="navigation-collapse">
                  <NavLink to="/users" className={({ isActive }) => `nav-link d-block ${isActive ? "active" : ""}`}>
                    User Accounts
                  </NavLink>
                  <NavLink to="/employees" className={({ isActive }) => `nav-link d-block ${isActive ? "active" : ""}`}>
                    Staff Directory
                  </NavLink>
                  <NavLink to="/reports" className={({ isActive }) => `nav-link d-block ${isActive ? "active" : ""}`}>
                    System Reports
                  </NavLink>
                </div>
              </Collapse>
            </>
          )}

          <p className="sidebar-section-label px-4 pt-3 pb-1 text-uppercase text-white-50 fw-semibold" style={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>
            Engagement
          </p>

          {navItem("/promotions", "bi-megaphone", "Promotions")}
          {navItem("/feedback", "bi-chat-heart", "Feedback")}
          {navItem("/profile", "bi-person", "My Profile")}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer px-3 py-3 border-top border-white border-opacity-10">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
              style={{ width: 36, height: 36, background: "var(--active-menu)", fontSize: "0.8rem" }}
            >
              {(user?.name || user?.username || "U").charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-white fw-semibold small text-truncate">
                {user?.name || user?.username || "User"}
              </div>
              <div className="text-white-50" style={{ fontSize: "0.7rem" }}>
                {user?.role || "Pharmacist"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Nav;
