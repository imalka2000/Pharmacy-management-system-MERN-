import { Outlet } from "react-router-dom";
import Breadcrumb from "./bredcrumb";

function Container() {
    return (
        <div className="page-container">
            <div className="main-content p-3 p-lg-4">
                <Breadcrumb />
                <div className="content-inner">
                    <Outlet />
                </div>
            </div>
            <footer className="bg-white text-center text-muted py-3 mt-auto border-top">
                <small>
                    © 2026 <b className="text-dark">Pharmacy Management System</b>. All Rights Reserved.
                </small>
            </footer>
        </div>
    );
}

export default Container;
