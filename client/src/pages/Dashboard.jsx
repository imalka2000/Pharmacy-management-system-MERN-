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
                console.error('Intelligence gathering error:', error);
            }
        };
        if (user?.token && !stats) fetchStats();
    }, [user, stats]);

    if (!stats) return (
        <div className="d-flex flex-column justify-content-center align-items-center p-5 min-vh-50">
            <Spinner animation="grow" variant="primary" />
            <p className="mt-4 text-muted fw-bold small uppercase letter-spacing-2">Assembling System Intelligence...</p>
        </div>
    );

    const chartData = [
        { name: 'Medicines', count: stats.totalMedicines || 0, color: '#0d6efd' },
        { name: 'Suppliers', count: stats.totalSuppliers || 0, color: '#6610f2' },
        { name: 'Sales', count: stats.totalSales || 0, color: '#10b981' },
        { name: 'Promos', count: stats.activePromotions || 0, color: '#f59e0b' },
        { name: 'Deliveries', count: stats.pendingDeliveries || 0, color: '#ef4444' }
    ];

    const StatCard = ({ title, value, icon, variant, trend }) => (
        <Col md={6} lg={3} className="mb-4">
            <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden hover-lift transition">
                <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className={`rounded-4 p-3 bg-${variant}-subtle text-${variant} shadow-sm border border-${variant} border-opacity-10 d-flex align-items-center justify-content-center`} style={{ width: '54px', height: '54px' }}>
                            <i className={`bi bi-${icon} fs-3`}></i>
                        </div>
                        {trend && (
                            <Badge bg="success-subtle" text="success" className="rounded-pill px-2 py-1 small fw-bold">
                                <i className="bi bi-graph-up-arrow me-1"></i> {trend}
                            </Badge>
                        )}
                    </div>
                    <div>
                        <h6 className="text-muted xxs fw-bold text-uppercase mb-1 mb-2 letter-spacing-1">{title}</h6>
                        <h2 className="fw-black mb-0 text-dark">{value}</h2>
                    </div>
                </Card.Body>
            </Card>
        </Col>
    );

    const MetricCard = ({ title, value, icon, gradient }) => (
        <Col xs={6} md={3} className="mb-4">
            <Card className="border-0 rounded-4 shadow-lg text-white h-100 overflow-hidden hover-lift transition"
                style={{ background: gradient }}>
                <Card.Body className="p-4 d-flex flex-column justify-content-between position-relative z-1">
                    <div className="text-end mb-2 opacity-25">
                        <i className={`bi bi-${icon} display-4`}></i>
                    </div>
                    <div>
                        <h1 className="fw-black mb-0 display-5">{value}</h1>
                        <p className="xxs fw-bold opacity-75 text-uppercase m-0 letter-spacing-1">{title}</p>
                    </div>
                </Card.Body>
                <div className="position-absolute bottom-0 end-0 p-3 opacity-10">
                    <i className={`bi bi-${icon}`} style={{ fontSize: '120px', marginRight: '-40px', marginBottom: '-40px' }}></i>
                </div>
            </Card>
        </Col>
    );

    return (
        <div className="container-fluid px-0">
            <div className="d-flex flex-wrap justify-content-between align-items-end mb-5 gap-3">
                <div>
                    <h1 className="fw-black text-dark m-0 letter-spacing-n1">Command Center</h1>
                    <p className="text-muted fw-bold small m-0 uppercase opacity-75">Intelligence Engine & Operations Registry</p>
                </div>
                <div className="text-end">
                    <div className="d-flex align-items-center bg-white border rounded-4 px-3 py-2 shadow-sm">
                        <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
                            <i className="bi bi-calendar3 text-primary"></i>
                        </div>
                        <div className="text-start">
                            <small className="text-muted fw-bold xxs d-block letter-spacing-1 uppercase">Operational Date</small>
                            <span className="fw-bold text-dark small">
                                {new Date().toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <Row>
                <StatCard title="Total Market Revenue" value={`$${(stats.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} icon="currency-exchange" variant="primary" trend="+12%" />
                <StatCard title="Processed Transactions" value={stats.totalSales || 0} icon="receipt-cutoff" variant="success" trend="+5%" />
                <StatCard title="Critical Stock Alerts" value={stats.lowStock || 0} icon="shield-exclamation" variant="warning" />
                <StatCard title="Inventory Depletion" value={stats.outOfStock || 0} icon="stop-circle" variant="danger" />
            </Row>

            <div className="my-4">
                <div className="d-flex align-items-center mb-4 ps-1">
                    <div className="bg-dark rounded-circle me-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '8px', height: '8px' }}></div>
                    <h6 className="xxs fw-black text-muted text-uppercase m-0 letter-spacing-2">Logistics & Service Pipeline</h6>
                </div>
                <Row>
                    <MetricCard title="Pending Logistics" value={stats.pendingDeliveries || 0} icon="truck" gradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" />
                    <MetricCard title="Active Campaigns" value={stats.activePromotions || 0} icon="megaphone-fill" gradient="linear-gradient(135deg, #10b981 0%, #047857 100%)" />
                    <MetricCard title="Inbound Feedback" value={stats.pendingFeedback || 0} icon="chat-square-text-fill" gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" />
                    <MetricCard title="Supply Procurement" value={stats.pendingSupplyRequests || 0} icon="terminal-fill" gradient="linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)" />
                </Row>
            </div>

            <Row className="mt-4">
                <Col lg={12}>
                    <Card className="border-0 shadow-sm rounded-4 p-4 mb-5 bg-white overflow-hidden">
                        <div className="d-flex flex-wrap justify-content-between align-items-center mb-5">
                            <div className="d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 p-3 rounded-4 me-4 shadow-sm">
                                    <i className="bi bi-cpu-fill text-primary fs-3"></i>
                                </div>
                                <div>
                                    <h4 className="fw-black text-dark m-0">System Topology</h4>
                                    <p className="text-muted fw-bold small m-0 text-uppercase opacity-50 letter-spacing-1">Resource distribution across functional nodes</p>
                                </div>
                            </div>
                            <div className="mt-3 mt-md-0">
                                <Badge bg="primary" className="px-4 py-2 rounded-pill fw-black letter-spacing-1 shadow-primary">
                                    <i className="bi bi-lightning-charge-fill me-2"></i> SYSTEM OPTIMAL
                                </Badge>
                            </div>
                        </div>
                        <div style={{ width: '100%', height: 400 }}>
                            <ResponsiveContainer>
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: '600' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc', radius: 10 }}
                                        contentStyle={{
                                            borderRadius: '20px',
                                            border: 'none',
                                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                                            padding: '20px',
                                            background: '#fff'
                                        }}
                                        itemStyle={{ fontWeight: '900', color: '#1e293b', fontSize: '14px' }}
                                        labelStyle={{ fontWeight: 'bold', color: '#64748b', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase' }}
                                    />
                                    <Bar dataKey="count" radius={[12, 12, 4, 4]} barSize={60}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
