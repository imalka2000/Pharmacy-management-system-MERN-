import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Form, Dropdown, Alert, Accordion, Badge } from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import CardContainer from '../components/CardContainer';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api-request/config';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import ViewSaleModal from '../components/ViewSaleModal';
import CreateInvoiceModal from '../components/CreateInvoiceModal';
import useAuth from '../hooks/useAuth';

const Bills = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [dateType, setDateType] = useState("documentDate");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [exportLimit, setExportLimit] = useState(10);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [transactions, setTransactions] = useState({});
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const exportOptions = [10, 25, 50, 100];

    const fetchInvoices = useCallback(async (pageNum = 0) => {
        setLoading(true);
        try {
            // Fetch sales with status Completed or Invoiced (These are our "Bills")
            const { data } = await apiClient.get('/sales');
            
            // Filter for Invoices only (not pending orders)
            let filtered = data.filter(s => s.status === 'Completed' || s.status === 'Invoiced');

            if (searchKeyword) {
                const kw = searchKeyword.toLowerCase();
                filtered = filtered.filter(o => 
                    (o.invoiceNumber || '').toLowerCase().includes(kw) ||
                    (o.customerInfo?.name || '').toLowerCase().includes(kw)
                );
            }

            if (fromDate) {
                filtered = filtered.filter(o => new Date(o.createdAt) >= new Date(fromDate));
            }
            if (toDate) {
                filtered = filtered.filter(o => new Date(o.createdAt) <= new Date(toDate).setHours(23, 59, 59, 999));
            }

            const total = filtered.length;
            const pages = Math.ceil(total / exportLimit);
            const start = pageNum * exportLimit;
            const paginated = filtered.slice(start, start + exportLimit);

            setInvoices(paginated);
            setTotalPages(pages || 1);
            setTotalElements(total);
            setPage(pageNum);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch invoices.");
        } finally {
            setLoading(false);
        }
    }, [searchKeyword, fromDate, toDate, exportLimit]);

    useEffect(() => {
        if (user?.token) fetchInvoices(0);
    }, [user, fetchInvoices]);

    const fetchTransactionsForInvoice = async (invoiceId) => {
        if (transactions[invoiceId]) return; // Already loaded
        
        try {
            const { data } = await apiClient.get(`/transactions?referenceId=${invoiceId}`);
            setTransactions(prev => ({ ...prev, [invoiceId]: data }));
        } catch (err) {
            console.error(err);
        }
    };

    const resetFilters = () => {
        setFromDate("");
        setToDate("");
        setSearchKeyword("");
        setExportLimit(10);
        fetchInvoices(0);
    };

    const exportToExcel = () => {
        const data = invoices.map(i => ({
            Code: i.invoiceNumber,
            Date: new Date(i.createdAt).toLocaleDateString(),
            Customer: i.customerInfo?.name || "Guest",
            Amount: i.grandTotal.toFixed(2),
            Status: i.status
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Invoices");
        const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([buf]), "Invoices.xlsx");
    };

    return (
        <CardContainer>
            <div className="row justify-content-between align-items-center mb-3">
                <div className="col-md-6">
                    <h3 className="fw-bold m-0">Invoices & Bills</h3>
                    <p className="text-muted small m-0">View finalized billing records and transaction history</p>
                </div>
                <div className="col-md-6 text-end">
                    <div className="d-flex align-items-center justify-content-end action-bar">
                        <Button 
                            variant="primary" 
                            className="rounded-pill py-2 px-4 shadow-sm fw-bold border-0 d-flex align-items-center me-3"
                            style={{ backgroundColor: 'var(--theme-color)' }}
                            onClick={() => setShowCreateModal(true)}
                        >
                            <i className="bi bi-plus-circle-fill me-2"></i> Direct Invoice
                        </Button>
                        <Button variant="link" onClick={() => fetchInvoices(page)} className="text-dark p-0 me-3 shadow-none border-0">
                            <i className="bi bi-arrow-clockwise fs-5"></i>
                        </Button>
                        <span className="mx-2 text-dark" style={{ cursor: 'pointer', fontWeight: '500' }} onClick={resetFilters}>Reset</span>
                        <span className="mx-3 text-primary" style={{ cursor: 'pointer', fontWeight: '500' }} onClick={() => fetchInvoices(0)}>Filter</span>
                        
                        <Dropdown>
                            <Dropdown.Toggle variant="link" id="dropdown-basic" className="text-dark border-0 shadow-none">
                                <i className="bi bi-three-dots-vertical fs-5"></i>
                            </Dropdown.Toggle>

                            <Dropdown.Menu align="end" className="shadow-sm border-0">
                                <Dropdown.Item onClick={() => navigate('/sales')}>
                                    <i className="bi bi-plus-circle me-2"></i> New Bill (From Order)
                                </Dropdown.Item>
                                <Dropdown.Item onClick={exportToExcel}>
                                    <i className="bi bi-file-earmark-excel me-2"></i> Export Current Page
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </div>

            <Form className="mb-4 p-3 bg-light rounded-3 border">
                <div className="row g-3">
                    <div className="col-md-4">
                        <Form.Group>
                            <Form.Label className="small fw-bold">From Date</Form.Label>
                            <Form.Control size="sm" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        </Form.Group>
                    </div>
                    <div className="col-md-4">
                        <Form.Group>
                            <Form.Label className="small fw-bold">To Date</Form.Label>
                            <Form.Control size="sm" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                        </Form.Group>
                    </div>
                    <div className="col-md-4">
                        <Form.Group>
                            <Form.Label className="small fw-bold">Search</Form.Label>
                            <Form.Control size="sm" type="text" placeholder="Invoice # or Customer..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
                        </Form.Group>
                    </div>
                </div>
            </Form>

            <div className="table-responsive">
                <Table hover className="align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th>Code</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th className="text-end">Amount</th>
                            <th className="text-center">Status</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary" /></td></tr>
                        ) : invoices.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-5 text-muted">No invoices found.</td></tr>
                        ) : (
                            invoices.map((inv) => (
                                <React.Fragment key={inv._id}>
                                    <tr>
                                        <td className="fw-bold text-primary">{inv.invoiceNumber}</td>
                                        <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                                        <td>{inv.customerInfo?.name || 'Guest'}</td>
                                        <td className="text-end fw-bold">${inv.grandTotal.toFixed(2)}</td>
                                        <td className="text-center">
                                            <Badge bg="success" className="rounded-pill px-3 py-2">
                                                {inv.status}
                                            </Badge>
                                        </td>
                                        <td className="text-center">
                                            <Button 
                                                variant="link" 
                                                className="text-primary p-0 mx-2 shadow-none border-0"
                                                onClick={() => setSelectedInvoice(inv)}
                                            >
                                                <i className="bi bi-eye-fill fs-6"></i>
                                            </Button>
                                            <Button 
                                                variant="link" 
                                                className="text-dark p-0 mx-2 shadow-none border-0"
                                                onClick={() => fetchTransactionsForInvoice(inv._id)}
                                            >
                                                <i className="bi bi-chevron-down fs-6"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                    {/* Associated Transactions - Simple inline display */}
                                    {transactions[inv._id] && (
                                        <tr className="bg-light bg-opacity-50">
                                            <td colSpan="6" className="p-0">
                                                <div className="px-5 py-3 border-start border-4 border-primary ms-4 my-2">
                                                    <h6 className="small fw-bold mb-2">Associated Transactions</h6>
                                                    <Table size="sm" className="mb-0 bg-white shadow-sm rounded overflow-hidden">
                                                        <thead className="bg-light">
                                                            <tr style={{ fontSize: '0.75rem' }}>
                                                                <th>Transaction Date</th>
                                                                <th>Type</th>
                                                                <th>Amount</th>
                                                                <th>Description</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {transactions[inv._id].length === 0 ? (
                                                                <tr><td colSpan="4" className="text-center py-2 small italic">No linked transactions.</td></tr>
                                                            ) : (
                                                                transactions[inv._id].map(tx => (
                                                                    <tr key={tx._id} style={{ fontSize: '0.8rem' }}>
                                                                        <td>{new Date(tx.createdAt).toLocaleString()}</td>
                                                                        <td><Badge bg={tx.type === 'Income' ? 'success' : 'danger'} size="sm">{tx.type}</Badge></td>
                                                                        <td className="fw-bold text-primary">${tx.amount.toFixed(2)}</td>
                                                                        <td>{tx.description}</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </Table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            {selectedInvoice && (
                <ViewSaleModal
                    sale={selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}

            {showCreateModal && (
                <CreateInvoiceModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => fetchInvoices(0)}
                />
            )}

            <div className="d-flex justify-content-between align-items-center mt-4">
                <span className="text-muted small">Total: <strong>{totalElements}</strong> invoices</span>
                <ReactPaginate
                    previousLabel="«"
                    nextLabel="»"
                    breakLabel="..."
                    pageCount={totalPages}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={({ selected }) => fetchInvoices(selected)}
                    containerClassName="pagination mb-0"
                    pageClassName="page-item"
                    pageLinkClassName="page-link"
                    previousClassName="page-item"
                    previousLinkClassName="page-link"
                    nextClassName="page-item"
                    nextLinkClassName="page-link"
                    activeClassName="active"
                    disabledClassName="disabled"
                    forcePage={page}
                />
            </div>
        </CardContainer>
    );
};

export default Bills;
