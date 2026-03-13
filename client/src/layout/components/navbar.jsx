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
  const isUser = role === "user";

  const NavItem = ({ to, icon, label }) => (
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
            className="brand-icon d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
            style={{
              width: 40, height: 40,
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
              {isUser ? "Customer Portal" : "Management System"}
            </small>
          </div>
        </div>

        <hr className="sidebar-divider mx-3 my-0 border-white border-opacity-10" />

        {/* Navigation */}
        <nav className="flex-grow-1 overflow-auto py-2 sidebar-nav">

          {/* ---- NORMAL USER MENU ---- */}
          {isUser && (
            <>
              <p className="sidebar-section-label px-4 pt-3 pb-1 text-uppercase text-white-50 fw-semibold" style={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>
                Shop
              </p>
              <NavItem to="/store" icon="bi-shop" label="Medicine Store" />
              <NavItem to="/prescriptions" icon="bi-receipt" label="My Prescriptions" />

              <p className="sidebar-section-label px-4 pt-3 pb-1 text-uppercase text-white-50 fw-semibold" style={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>
                More
              </p>
              <NavItem to="/promotions" icon="bi-megaphone" label="Promotions" />
              <NavItem to="/feedback" icon="bi-chat-heart" label="Feedback" />
              <NavItem to="/profile" icon="bi-person" label="My Profile" />
            </>
          )}

          {/* ---- STAFF / ADMIN MENU ---- */}
          {isStaff && (
            <>
              <NavItem to="/dashboard" icon="bi-speedometer2" label="Dashboard" />
              <NavItem to="/store" icon="bi-shop" label="Store" />
              <NavItem to="/medicines" icon="bi-capsule" label="Inventory" />
              <NavItem to="/sales" icon="bi-cart-check" label="Sales" />
              <NavItem to="/bills" icon="bi-receipt" label="Billing" />
              <NavItem to="/prescriptions" icon="bi-receipt" label="Prescriptions" />
              <NavItem to="/supply-requests" icon="bi-truck" label="Supply Chain" />
              <NavItem to="/deliveries" icon="bi-bicycle" label="Deliveries" />
              <NavItem to="/suppliers" icon="bi-building" label="Suppliers" />

              <NavItem to="/administration" icon="bi-shield-lock" label="Administration" />

              <NavItem to="/promotions" icon="bi-megaphone" label="Promotions" />
              <NavItem to="/feedback" icon="bi-chat-heart" label="Feedback" />
              <NavItem to="/profile" icon="bi-person" label="My Profile" />
            </>
          )}
        </nav>

        {/* Footer: User Info */}
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
                {role === "user" ? "Customer" : user?.role || "Pharmacist"}
              </div>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
};

export default Nav;
