import { Outlet } from "react-router-dom";
import Breadcrumb from "./bredcrumb";

function Container() {
    return (
        <main className="p-4 flex-grow-1">
            <Breadcrumb />
            <Outlet />
        </main>
    );
}

export default Container;
