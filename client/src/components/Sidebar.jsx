import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Pill, Users, ShoppingCart, BarChart3, LogOut, FileText, Truck, Tag, MessageSquare } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Sidebar = () => {
    const { pathname } = useLocation();
    const { logout, user } = useAuth();

    const links = [
        { title: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { title: 'Medicine', path: '/medicines', icon: <Pill size={20} /> },
        { title: 'Sales', path: '/sales', icon: <ShoppingCart size={20} /> },
        { title: 'Prescriptions', path: '/prescriptions', icon: <FileText size={20} /> },
        { title: 'Supply Chain', path: '/supply-chain', icon: <Truck size={20} /> },
        { title: 'Deliveries', path: '/deliveries', icon: <Truck size={20} />, role: 'admin' },
        { title: 'Driver Portal', path: '/driver-portal', icon: <Truck size={20} />, role: 'driver' },
        { title: 'Suppliers', path: '/suppliers', icon: <Users size={20} />, role: 'admin' },
        { title: 'Employees', path: '/employees', icon: <Users size={20} />, role: 'admin' },
        { title: 'Users', path: '/users', icon: <Users size={20} />, role: 'admin' },
        { title: 'Promotions', path: '/promotions', icon: <Tag size={20} /> },
        { title: 'Feedback', path: '/feedback', icon: <MessageSquare size={20} /> },
        { title: 'Reports', path: '/reports', icon: <BarChart3 size={20} />, role: 'admin' },
    ];

    return (
        <aside className="h-screen w-72 bg-slate-900 text-white flex flex-col fixed left-0 top-0 border-r border-slate-800 z-50 shadow-xl">
            <div className="p-6 flex items-center justify-center border-b border-slate-800/50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <span className="font-bold text-white text-lg">P</span>
                    </div>
                    <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">PharmaSys</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Menu</p>
                {links.map((link) => {
                    if (link.role && user?.role !== link.role) return null;
                    const isActive = pathname === link.path;

                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 translate-x-1'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
                                }`}
                        >
                            <span className={`mr-3 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
                                {link.icon}
                            </span>
                            <span className="font-medium">{link.title}</span>
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-slate-800/50 m-4 bg-slate-800/30 rounded-2xl">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                        <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500 hover:text-white rounded-xl transition-all duration-200"
                >
                    <LogOut size={18} className="mr-2" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
