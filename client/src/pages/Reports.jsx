import { useState, useEffect } from 'react';
import apiClient from '../api-request/config';
import useAuth from '../hooks/useAuth';
import { Card, Row, Col, Table, Badge, Spinner, Button, InputGroup, Form } from 'react-bootstrap';

const Reports = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSales();
    }, [user]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/sales');
            setSales(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.grandTotal || 0), 0);
    const todaySales = sales.filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString());
    const todayRevenue = todaySales.reduce((sum, sale) => sum + parseFloat(sale.grandTotal || 0), 0);

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark m-0">Financial Analytics</h2>
                    <p className="text-muted small m-0">Review sales performance and transaction history</p>
                </div>
                <Button variant="outline-primary" className="rounded-3 shadow-sm" onClick={fetchSales}>
                    <i className="bi bi-arrow-clockwise me-2"></i> Refresh Data
                </Button>
            </div>

            <Row className="g-4 mb-4">
                <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 bg-primary text-white overflow-hidden h-100">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="bg-white bg-opacity-25 rounded-3 p-2">
                                    <i className="bi bi-cash-stack fs-4"></i>
                                </div>
                                <Badge bg="white" text="primary" className="rounded-pill">Overall</Badge>
                            </div>
                            <h6 className="text-white-50 small fw-bold mb-1 letter-spacing-1">TOTAL REVENUE</h6>
                            <h2 className="fw-bold m-0">${totalRevenue.toFixed(2)}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 bg-success text-white overflow-hidden h-100">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="bg-white bg-opacity-25 rounded-3 p-2">
                                    <i className="bi bi-graph-up-arrow fs-4"></i>
                                </div>
                                <Badge bg="white" text="success" className="rounded-pill">Live</Badge>
                            </div>
                            <h6 className="text-white-50 small fw-bold mb-1 letter-spacing-1">TODAY'S SALES</h6>
                            <h2 className="fw-bold m-0">${todayRevenue.toFixed(2)}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 bg-dark text-white overflow-hidden h-100">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="bg-white bg-opacity-25 rounded-3 p-2">
                                    <i className="bi bi-receipt fs-4"></i>
                                </div>
                                <Badge bg="white" text="dark" className="rounded-pill">Count</Badge>
                            </div>
                            <h6 className="text-white-50 small fw-bold mb-1 letter-spacing-1">TRANSACTIONS</h6>
                            <h2 className="fw-bold m-0">{sales.length}</h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold m-0 ps-2">Recent Transactions</h5>
                </Card.Header>
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light border-bottom">
                        <tr>
                            <th className="ps-4 py-3 text-muted small fw-bold text-uppercase">Invoice</th>
                            <th className="py-3 text-muted small fw-bold text-uppercase">Date & Time</th>
                            <th className="py-3 text-muted small fw-bold text-uppercase text-center">Items</th>
                            <th className="py-3 text-muted small fw-bold text-uppercase">Processed By</th>
                            <th className="pe-4 py-3 text-muted small fw-bold text-uppercase text-end">Grand Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-5">
                                    <Spinner animation="border" variant="primary" size="sm" />
                                    <span className="ms-3 text-muted">Generating report...</span>
                                </td>
                            </tr>
                        ) : sales.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-5 text-muted">
                                    No sales data recorded yet.
                                </td>
                            </tr>
                        ) : (
                            sales.map(sale => (
                                <tr key={sale._id}>
                                    <td className="ps-4 py-3">
                                        <Badge bg="light" text="dark" className="border px-3 py-2 font-mono fw-medium shadow-sm">
                                            {sale.invoiceNumber}
                                        </Badge>
                                    </td>
                                    <td className="py-3">
                                        <div className="fw-bold text-dark small">{new Date(sale.createdAt).toLocaleDateString()}</div>
                                        <small className="text-muted">{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                                    </td>
                                    <td className="py-3 text-center">
                                        <Badge pill bg="info-subtle" text="info" className="px-3 border border-info border-opacity-25">
                                            {sale.items.length} Units
                                        </Badge>
                                    </td>
                                    <td className="py-3">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '28px', height: '28px' }}>
                                                <i className="bi bi-person text-secondary small"></i>
                                            </div>
                                            <span className="fw-medium text-dark small">{sale.pharmacist?.username || 'System'}</span>
                                        </div>
                                    </td>
                                    <td className="pe-4 py-3 text-end">
                                        <div className="fw-bold text-success fs-5">
                                            ${parseFloat(sale.grandTotal || 0).toFixed(2)}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
};

export default Reports;
