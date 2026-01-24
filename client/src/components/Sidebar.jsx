import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Pill, Users, ShoppingCart, BarChart3, LogOut } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Sidebar = () => {
    const { pathname } = useLocation();
    const { logout, user } = useAuth();

    const links = [
        { title: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { title: 'Medicine', path: '/medicines', icon: <Pill size={20} /> },
        { title: 'Sales', path: '/sales', icon: <ShoppingCart size={20} /> },
        { title: 'Suppliers', path: '/suppliers', icon: <Users size={20} />, role: 'admin' },
        { title: 'Reports', path: '/reports', icon: <BarChart3 size={20} />, role: 'admin' },
    ];

    return (
        <div className="h-screen w-64 bg-dark text-white flex flex-col fixed left-0 top-0">
            <div className="p-4 text-2xl font-bold text-center border-b border-gray-700">
                PharmaSys
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                {links.map((link) => {
                    if (link.role && user?.role !== link.role) return null;

                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center px-6 py-3 hover:bg-gray-700 transition border-l-4 ${pathname === link.path
                                ? 'bg-gray-800 border-green-500 text-green-400'
                                : 'border-transparent text-gray-300'
                                }`}
                        >
                            <span className="mr-3">{link.icon}</span>
                            {link.title}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-800 rounded transition"
                >
                    <LogOut size={18} className="mr-2" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
