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

  const role = user?.role || 'user';

  // Role permissions check
  const isStaff = ['admin', 'pharmacist'].includes(role);
  const isAdmin = role === 'admin';

  return (
    <aside className={`sidebar pt-3 ${isOpen ? "" : "closed"}`}>
      <div className="px-4 mb-4">
        <h6 className="text-uppercase text-muted fw-bold extra-small mb-0">Menu</h6>
      </div>

      <nav className="nav flex-column">
        <NavLink to="/dashboard" className="nav-link py-3 px-4 d-flex align-items-center text-dark">
          <i className="bi bi-speedometer2 fs-5 me-3"></i>
          <span>Dashboard</span>
        </NavLink>

        {isStaff && (
          <NavLink to="/medicines" className="nav-link py-3 px-4 d-flex align-items-center text-dark">
            <i className="bi bi-capsule fs-5 me-3"></i>
            <span>Inventory</span>
          </NavLink>
        )}

        {isStaff && (
          <NavLink to="/sales" className="nav-link py-3 px-4 d-flex align-items-center text-dark">
            <i className="bi bi-cart-check fs-5 me-3"></i>
            <span>Sales & Billing</span>
          </NavLink>
        )}

        <NavLink to="/prescriptions" className="nav-link py-3 px-4 d-flex align-items-center text-dark">
          <i className="bi bi-receipt fs-5 me-3"></i>
          <span>Prescriptions</span>
        </NavLink>

        {isStaff && (
          <NavLink to="/supply-requests" className="nav-link py-3 px-4 d-flex align-items-center text-dark">
            <i className="bi bi-truck fs-5 me-3"></i>
            <span>Supply Chain</span>
          </NavLink>
        )}

        {isStaff && (
          <NavLink to="/deliveries" className="nav-link py-3 px-4 d-flex align-items-center text-dark">
            <i className="bi bi-bicycle fs-5 me-3"></i>
            <span>Deliveries</span>
          </NavLink>
        )}

        {isAdmin && (
          <div>
            <button
              className="nav-link py-3 px-4 d-flex align-items-center text-dark w-100 text-start border-0 bg-transparent"
              onClick={() => toggleGroup("administration")}
            >
              <i className="bi bi-shield-lock fs-5 me-3"></i>
              <span>Administration</span>
              <i className={`ms-auto bi ${openGroup === "administration" ? "bi-chevron-down" : "bi-chevron-right"} small`} />
            </button>

            <Collapse in={openGroup === "administration"}>
              <div className="bg-light">
                <NavLink to="/users" className="nav-link py-2 ps-5 text-muted small">
                  User Accounts
                </NavLink>
                <NavLink to="/employees" className="nav-link py-2 ps-5 text-muted small">
                  Staff Directory
                </NavLink>
                <NavLink to="/reports" className="nav-link py-2 ps-5 text-muted small">
                  System Reports
                </NavLink>
              </div>
            </Collapse>
          </div>
        )}

        <NavLink to="/promotions" className="nav-link py-3 px-4 d-flex align-items-center text-dark">
          <i className="bi bi-megaphone fs-5 me-3"></i>
          <span>Promotions</span>
        </NavLink>

        <NavLink to="/feedback" className="nav-link py-3 px-4 d-flex align-items-center text-dark">
          <i className="bi bi-chat-heart fs-5 me-3"></i>
          <span>Feedback</span>
        </NavLink>

        {isStaff && (
          <NavLink to="/suppliers" className="nav-link py-3 px-4 d-flex align-items-center text-dark">
            <i className="bi bi-building fs-5 me-3"></i>
            <span>Suppliers</span>
          </NavLink>
        )}

        <NavLink to="/profile" className="nav-link py-3 px-4 d-flex align-items-center text-dark">
          <i className="bi bi-person fs-5 me-3"></i>
          <span>Profile</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Nav;
