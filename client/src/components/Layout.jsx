import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="flex bg-slate-50 min-h-screen font-sans">
            <Toaster position="top-right" reverseOrder={false} toastOptions={{
                className: '',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            }} />
            <Sidebar />
            <div className="flex-1 ml-72 p-10 overflow-y-auto h-screen">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
