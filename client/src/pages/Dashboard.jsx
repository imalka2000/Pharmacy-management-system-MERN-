import { useEffect, useState } from 'react';
import apiClient from '../api-request/config';
import useAuth from '../hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Row, Col, Card, Spinner, Badge } from 'react-bootstrap';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await apiClient.get('/reports/dashboard');
                setStats(data);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            }
        };
        if (user?.token && !stats) fetchStats();
    }, [user, stats]);

    if (!stats) return (
        <div className="d-flex flex-column justify-content-center align-items-center p-5 min-vh-50">
            <Spinner animation="border" variant="primary" />
            <p className="mt-4 text-muted small fw-bold text-uppercase">Loading Dashboard...</p>
        </div>
    );

    const chartData = [
        { name: 'Medicines', count: stats.totalMedicines || 0, color: '#0d6efd' },
        { name: 'Suppliers', count: stats.totalSuppliers || 0, color: '#6c757d' },
        { name: 'Sales', count: stats.totalSales || 0, color: '#198754' },
        { name: 'Promos', count: stats.activePromotions || 0, color: '#ffc107' },
        { name: 'Deliveries', count: stats.pendingDeliveries || 0, color: '#dc3545' }
    ];

    const StatCard = ({ title, value, icon, variant }) => (
        <Col md={6} lg={3} className="mb-4">
            <Card className="h-100">
                <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-3">
                        <div className={`icon-box bg-${variant} bg-opacity-10 text-${variant} me-3`}>
                            <i className={`bi bi-${icon} fs-4`}></i>
                        </div>
                        <h6 className="text-muted extra-small fw-bold text-uppercase mb-0">{title}</h6>
                    </div>
                    <h3 className="fw-bold mb-0">{value}</h3>
                </Card.Body>
            </Card>
        </Col>
    );

    return (
        <div className="container-fluid px-0">
            <Row>
                <StatCard title="Total Revenue" value={`$${(stats.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} icon="currency-dollar" variant="primary" />
                <StatCard title="Total Sales" value={stats.totalSales || 0} icon="cart-check" variant="success" />
                <StatCard title="Low Stock" value={stats.lowStock || 0} icon="exclamation-triangle" variant="warning" />
                <StatCard title="Out of Stock" value={stats.outOfStock || 0} icon="x-circle" variant="danger" />
            </Row>

            <Row className="mt-4">
                <Col lg={12}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0 fw-bold">System Overview</h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <div style={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f5" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                                        <Tooltip cursor={{ fill: '#f8f9fa' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 0.5rem 1rem rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={50}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
