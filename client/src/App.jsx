import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Sales from './pages/Sales';
import Prescriptions from './pages/Prescriptions';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Employees from './pages/Employees';
import useAuth from './hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="medicines" element={<Medicines />} />
        <Route path="sales" element={<Sales />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="users" element={<Users />} />
        <Route path="employees" element={<Employees />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default App;
