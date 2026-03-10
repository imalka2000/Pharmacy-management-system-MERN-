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
import useAuth from './hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
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
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="medicines" element={<Medicines />} />
        <Route path="sales" element={<Sales />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="supply-requests" element={<SupplyChain />} />
        <Route path="deliveries" element={<Deliveries />} />
        <Route path="driver-portal" element={<DriverPortal />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="users" element={<Users />} />
        <Route path="employees" element={<Employees />} />
        <Route path="profile" element={<Profile />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default App;
