import { useState, useEffect } from 'react';
import apiClient from '../api-request/config';
import { Table, Badge, Form, Row, Col, InputGroup, Card } from 'react-bootstrap';
import toast from 'react-hot-toast';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const { data } = await apiClient.get('/transactions');
            setTransactions(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-black text-uppercase letter-spacing-1 mb-0">Transactions</h2>
                    <p className="text-muted small mb-0">Financial ledger of all income and expenses</p>
                </div>
            </div>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Header className="bg-white border-0 py-3">
                    <Row className="align-items-center">
                        <Col md={4}>
                            <InputGroup className="bg-light rounded-3 border-0">
                                <InputGroup.Text className="bg-transparent border-0 pe-0">
                                    <i className="bi bi-search text-muted"></i>
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Search ledger..."
                                    className="bg-transparent border-0 shadow-none ps-2"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                </Card.Header>
                <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 text-uppercase xxs letter-spacing-2 fw-black text-muted">Type</th>
                                <th className="text-uppercase xxs letter-spacing-2 fw-black text-muted">Category</th>
                                <th className="text-uppercase xxs letter-spacing-2 fw-black text-muted">Description</th>
                                <th className="text-uppercase xxs letter-spacing-2 fw-black text-muted">Amount</th>
                                <th className="text-uppercase xxs letter-spacing-2 fw-black text-muted">Method</th>
                                <th className="text-uppercase xxs letter-spacing-2 fw-black text-muted">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        <i className="bi bi-journal-text fs-1 d-block mb-2 opacity-25"></i>
                                        No transactions recorded
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx._id}>
                                        <td className="ps-4">
                                            <Badge bg={
                                                tx.type === 'Income' ? 'success' :
                                                tx.type === 'Expense' ? 'danger' : 'info'
                                            } className="rounded-pill px-3 py-2">
                                                {tx.type}
                                            </Badge>
                                        </td>
                                        <td>{tx.category}</td>
                                        <td className="small">{tx.description || '-'}</td>
                                        <td className={`fw-bold ${tx.type === 'Income' ? 'text-success' : 'text-danger'}`}>
                                            {tx.type === 'Income' ? '+' : '-'}${tx.amount?.toFixed(2)}
                                        </td>
                                        <td>{tx.paymentMethod}</td>
                                        <td className="small text-muted">{new Date(tx.transactionDate).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>
        </div>
    );
};

export default Transactions;
