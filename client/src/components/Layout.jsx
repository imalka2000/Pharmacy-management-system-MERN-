import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="flex bg-light min-h-screen">
            <Toaster position="top-right" reverseOrder={false} />
            <Sidebar />
            <div className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
