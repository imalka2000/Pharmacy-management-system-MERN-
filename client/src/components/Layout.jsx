import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="d-flex bg-light min-h-screen">
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    duration: 4000,
                    style: {
                        borderRadius: '16px',
                        background: '#1e293b',
                        color: '#fff',
                        padding: '16px 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            <Sidebar />
            <main className="flex-grow-1" style={{ marginLeft: '280px', minHeight: '100vh', overflowX: 'hidden' }}>
                <div className="p-4 p-md-5">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
