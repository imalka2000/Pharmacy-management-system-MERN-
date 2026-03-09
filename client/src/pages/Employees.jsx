import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { Plus, Search, UserCheck, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const Employees = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', role: 'pharmacist', fullName: '', email: '', phone: '', salary: '' });

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        if (user?.token && employees.length === 0) fetchEmployees();
    }, [user]);

    const fetchEmployees = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/api/auth/users', config);
            setEmployees(data.filter(u => u.role !== 'user')); // Filter staff only
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/api/auth/register', formData, config);
            toast.success('Employee added successfully');
            setShowModal(false);
            fetchEmployees();
            setFormData({ username: '', password: '', role: 'pharmacist', fullName: '', email: '', phone: '', salary: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding employee');
        }
    };

    const filteredEmployees = employees.filter(u =>
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Employee Management</h1>
                    <p className="text-slate-500 mt-1">Manage staff, roles, and payroll info</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                    <Plus size={20} className="mr-2" />
                    Add Employee
                </button>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 w-full max-w-md">
                <div className="flex items-center px-2">
                    <Search size={20} className="text-slate-400 mr-3" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className="outline-none w-full text-slate-600 placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 text-center py-10 text-slate-400">Loading staff...</div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="col-span-3 text-center py-10 text-slate-400">No employees found.</div>
                ) : (
                    filteredEmployees.map(emp => (
                        <div key={emp._id} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 flex flex-col group hover:shadow-xl transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg mr-4 ${emp.role === 'admin' ? 'bg-rose-100 text-rose-600' :
                                            emp.role === 'driver' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'
                                        }`}>
                                        {emp.fullName?.charAt(0) || emp.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{emp.fullName || emp.username}</h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${emp.role === 'admin' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                emp.role === 'driver' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            }`}>{emp.role}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-sm text-slate-500">
                                    <Briefcase size={16} className="mr-2" />
                                    <span>Salary: ${emp.salary || '0'}</span>
                                </div>
                                <div className="flex items-center text-sm text-slate-500">
                                    <UserCheck size={16} className="mr-2" />
                                    <span>Joined: {new Date(emp.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <button className="mt-auto w-full py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium text-sm transition-colors">
                                View Profile
                            </button>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">Add New Employee</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Username" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                                <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Password" type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="pharmacist">Pharmacist</option>
                                    <option value="driver">Driver</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Salary" type="number" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} />
                            </div>
                            <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border rounded-xl hover:bg-slate-50 font-medium text-slate-600 transition">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition">Create Employee</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
