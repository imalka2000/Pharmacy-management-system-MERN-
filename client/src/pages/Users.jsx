import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { Plus, Search, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', role: 'user', fullName: '', email: '', phone: '', address: '' });

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        if (user?.token && users.length === 0) fetchUsers();
    }, [user]);

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/auth/users', config);
            setUsers(data.filter(u => u.role === 'user')); // Filter only customers
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/register', formData, config);
            toast.success('User added successfully');
            setShowModal(false);
            fetchUsers();
            setFormData({ username: '', password: '', role: 'user', fullName: '', email: '', phone: '', address: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding user');
        }
    };

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">User Management</h1>
                    <p className="text-slate-500 mt-1">Manage customers and app users</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                >
                    <Plus size={20} className="mr-2" />
                    Add User
                </button>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 w-full max-w-md">
                <div className="flex items-center px-2">
                    <Search size={20} className="text-slate-400 mr-3" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="outline-none w-full text-slate-600 placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden flex-1">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">User</th>
                            <th className="py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">Email</th>
                            <th className="py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">Phone</th>
                            <th className="py-4 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">Join Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-8 text-slate-400">Loading...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-8 text-slate-400">No users found.</td></tr>
                        ) : (
                            filteredUsers.map(u => (
                                <tr key={u._id} className="hover:bg-slate-50/50 transition">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">
                                                {u.fullName?.charAt(0) || u.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">{u.fullName || 'N/A'}</p>
                                                <p className="text-xs text-slate-500">@{u.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-slate-600">{u.email || '-'}</td>
                                    <td className="py-4 px-6 text-slate-600">{u.phone || '-'}</td>
                                    <td className="py-4 px-6 text-slate-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">Add New User</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Username" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                                <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Password" type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <textarea className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border rounded-xl hover:bg-slate-50 font-medium text-slate-600 transition">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
