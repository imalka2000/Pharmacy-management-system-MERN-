import { Routes, Route, Navigate } from 'react-router-dom';
import DefaultLayout from './layout/default-layout';
import PublicLayout from './layout/public-layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Sales from './pages/Sales';
import Prescriptions from './pages/Prescriptions';
import SupplyChain from './pages/SupplyChain';
import Deliveries from './pages/Deliveries';
import DriverPortal from './pages/DriverPortal';
import Promotions from './pages/Promotions';
import Feedback from './pages/Feedback';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Employees from './pages/Employees';
import Profile from './pages/Profile';
import Store from './pages/Store';
import useAuth from './hooks/useAuth';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'user' ? '/store' : '/dashboard'} />;
  }
  return children;
};

// Smart redirect based on role
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <Navigate to={user.role === 'user' ? '/store' : '/dashboard'} />;
};

function App() {
  const ROLES = {
    ADMIN: 'admin',
    PHARMACIST: 'pharmacist',
    USER: 'user'
  };

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route path="/" element={
        <PrivateRoute>
          <DefaultLayout />
        </PrivateRoute>
      }>
        <Route index element={<HomeRedirect />} />

        {/* Dashboard - staff only */}
        <Route path="dashboard" element={
          <PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.PHARMACIST]}>
            <Dashboard />
          </PrivateRoute>
        } />

        {/* Store - all users */}
        <Route path="store" element={<Store />} />

        {/* Staff routes */}
        <Route path="medicines" element={<PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.PHARMACIST]}><Medicines /></PrivateRoute>} />
        <Route path="sales" element={<PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.PHARMACIST]}><Sales /></PrivateRoute>} />
        <Route path="prescriptions" element={<PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.PHARMACIST, ROLES.USER]}><Prescriptions /></PrivateRoute>} />
        <Route path="supply-requests" element={<PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.PHARMACIST]}><SupplyChain /></PrivateRoute>} />
        <Route path="deliveries" element={<PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.PHARMACIST]}><Deliveries /></PrivateRoute>} />
        <Route path="driver-portal" element={<PrivateRoute allowedRoles={[ROLES.ADMIN, 'driver']}><DriverPortal /></PrivateRoute>} />
        <Route path="promotions" element={<PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.PHARMACIST, ROLES.USER]}><Promotions /></PrivateRoute>} />
        <Route path="feedback" element={<PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.PHARMACIST, ROLES.USER]}><Feedback /></PrivateRoute>} />
        <Route path="suppliers" element={<PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.PHARMACIST]}><Suppliers /></PrivateRoute>} />
        <Route path="users" element={<PrivateRoute allowedRoles={[ROLES.ADMIN]}><Users /></PrivateRoute>} />
        <Route path="employees" element={<PrivateRoute allowedRoles={[ROLES.ADMIN]}><Employees /></PrivateRoute>} />
        <Route path="profile" element={<Profile />} />
        <Route path="reports" element={<PrivateRoute allowedRoles={[ROLES.ADMIN]}><Reports /></PrivateRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
