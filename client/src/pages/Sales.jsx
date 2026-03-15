import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Button, Form, Dropdown, Alert } from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import CardContainer from '../components/CardContainer';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import apiClient from '../api-request/config';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import ConvertToInvoiceModal from '../components/ConvertToInvoiceModal';
import CreateSaleModal from '../components/CreateSaleModal';
import ViewSaleModal from '../components/ViewSaleModal';
import useAuth from '../hooks/useAuth';

const Sales = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [dateType, setDateType] = useState("createdAt");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [exportLimit, setExportLimit] = useState(10);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [selectedOrders, setSelectedOrders] = useState([]);
    const [selectedSale, setSelectedSale] = useState(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);

    const exportOptions = [10, 25, 50, 100];
    const navigate = useNavigate();
    const location = useLocation();

    const fetchAllData = useCallback(async (pageNum = 0) => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/sales');
            
            let filtered = data;

            if (searchKeyword) {
                const kw = searchKeyword.toLowerCase();
                filtered = filtered.filter(o => 
                    (o.invoiceNumber || '').toLowerCase().includes(kw) ||
                    (o.customerInfo?.name || '').toLowerCase().includes(kw) ||
                    (o.customerInfo?.phone || '').includes(kw)
                );
            }

            if (fromDate) {
                filtered = filtered.filter(o => new Date(o[dateType]) >= new Date(fromDate));
            }
            if (toDate) {
                filtered = filtered.filter(o => new Date(o[dateType]) <= new Date(toDate).setHours(23, 59, 59, 999));
            }
            
            const total = filtered.length;
            const pages = Math.ceil(total / exportLimit);
            const start = pageNum * exportLimit;
            const paginated = filtered.slice(start, start + exportLimit);

            setOrders(paginated);
            setTotalPages(pages || 1);
            setTotalElements(total);
            setPage(pageNum);
            setSelectedOrders([]);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch sales orders.");
        } finally {
            setLoading(false);
        }
    }, [dateType, searchKeyword, fromDate, toDate, exportLimit]);

    useEffect(() => {
        if (user?.token) fetchAllData(0);
    }, [user, fetchAllData]);

    const handleSelectOrder = (orderId) => {
        setSelectedOrders((prev) =>
            prev.includes(orderId)
                ? prev.filter((id) => id !== orderId)
                : [...prev, orderId]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedOrders(orders.map((order) => order._id));
        } else {
            setSelectedOrders([]);
        }
    };

    const checkValidity = () => {
        if (selectedOrders.length === 0) {
            toast.error("Please select at least one sales order.");
            return false;
        }

        const selected = orders.filter((o) => selectedOrders.includes(o._id));
        
        const firstCustomer = selected[0]?.customerInfo?.name;
        const hasDifferentCustomer = selected.some(o => o.customerInfo?.name !== firstCustomer);
        
        if (hasDifferentCustomer) {
            toast.error("Selected orders must belong to the same customer.");
            return false;
        }

        const hasClosedOrder = selected.some(o => o.status === 'Completed' || o.status === 'Invoiced');
        if (hasClosedOrder) {
            toast.error("Some selected orders are already finalized or invoiced.");
            return false;
        }

        return true;
    };

    const openConvertModal = () => {
        if (!checkValidity()) return;
        
        const selected = orders.filter((o) => selectedOrders.includes(o._id));
        const firstOrder = selected[0];
        
        setSelectedCustomerDetails({
            name: firstOrder.customerInfo?.name || "",
            phone: firstOrder.customerInfo?.phone || "",
            address: firstOrder.customerInfo?.address || ""
        });

        setShowInvoiceModal(true);
    };

    const resetFilters = () => {
        setDateType("createdAt");
        setFromDate("");
        setToDate("");
        setSearchKeyword("");
        setExportLimit(10);
        fetchAllData(0);
    };

    const exportAllToExcel = () => {
        const data = orders.map(o => ({
            Code: o.invoiceNumber,
            Date: new Date(o.createdAt).toLocaleDateString(),
            Customer: o.customerInfo?.name || "Guest",
            Amount: o.grandTotal.toFixed(2),
            Status: o.status
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SalesOrders");
        const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([buf]), "SalesOrders.xlsx");
    };

    return (
        <CardContainer>
            {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

            <div className="row justify-content-between align-items-center mb-3">
                <div className="col-md-6">
                    <h3 className="fw-bold m-0" style={{ color: '#1a1a1a' }}>Sales Orders</h3>
                    <p className="text-muted small m-0">Manage pending orders and convert them to invoices</p>
                </div>
                <div className="col-md-4 text-end">
                    <div className="d-flex align-items-center justify-content-end action-bar">
                        <Button variant="link" onClick={() => fetchAllData(page)} className="text-dark p-0 me-3 shadow-none border-0">
                            <i className="bi bi-arrow-clockwise fs-5"></i>
                        </Button>
                        <span className="mx-2 text-dark" style={{ cursor: 'pointer', fontWeight: '500' }} onClick={resetFilters}>Reset</span>
                        <span className="mx-3 text-primary" style={{ cursor: 'pointer', fontWeight: '500' }} onClick={() => fetchAllData(0)}>Filter</span>
                        
                        <Dropdown show={isDropdownOpen} onToggle={(isOpen) => setIsDropdownOpen(isOpen)}>
                            <Dropdown.Toggle variant="link" id="dropdown-basic" className="text-dark border-0 shadow-none">
                                <i className="bi bi-three-dots-vertical fs-5"></i>
                            </Dropdown.Toggle>

                            <Dropdown.Menu align="end" className="shadow-sm border-0">
                                <Dropdown.Item onClick={() => setShowCreateModal(true)}>
                                    <i className="bi bi-plus-circle me-2"></i> Create New Order
                                </Dropdown.Item>
                                <Dropdown.Item onClick={exportAllToExcel}>
                                    <i className="bi bi-file-earmark-excel me-2"></i> Export Current Page
                                </Dropdown.Item>
                                {selectedOrders.length > 0 && (
                                    <Dropdown.Item onClick={openConvertModal} className="text-primary fw-bold">
                                        <i className="bi bi-file-earmark-text me-2"></i> Convert To Invoice
                                    </Dropdown.Item>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </div>

            <Form className="mb-4 p-3 bg-light rounded-3 border" onSubmit={(e) => { e.preventDefault(); fetchAllData(0); }}>
                <div className="row g-3">
                    <div className="col-md-4">
                        <Form.Group>
                            <Form.Label className="small fw-bold">Filter by</Form.Label>
                            <Form.Select size="sm" value={dateType} onChange={(e) => setDateType(e.target.value)}>
                                <option value="createdAt">Created Date</option>
                                <option value="dueDate">Due Date</option>
                            </Form.Select>
                        </Form.Group>
                    </div>
                    <div className="col-md-4">
                        <Form.Group>
                            <Form.Label className="small fw-bold">From</Form.Label>
                            <Form.Control size="sm" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        </Form.Group>
                    </div>
                    <div className="col-md-4">
                        <Form.Group>
                            <Form.Label className="small fw-bold">To</Form.Label>
                            <Form.Control size="sm" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                        </Form.Group>
                    </div>
                </div>
            </Form>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="position-relative" style={{ width: '300px' }}>
                    <Form.Control
                        type="text"
                        placeholder="Search orders..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="ps-4"
                        style={{ borderRadius: '20px' }}
                    />
                    <i className="bi bi-search position-absolute start-0 top-50 translate-middle-y ms-2 text-muted"></i>
                </div>

                <Form.Select
                    size="sm"
                    className="w-auto"
                    value={exportLimit}
                    onChange={(e) => setExportLimit(Number(e.target.value))}
                >
                    {exportOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt} per page</option>
                    ))}
                </Form.Select>
            </div>

            <div className="table-responsive">
                <Table hover className="align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th style={{ width: '50px' }}>
                                <Form.Check
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={selectedOrders.length === orders.length && orders.length > 0}
                                />
                            </th>
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
                            <tr><td colSpan="7" className="text-center py-5"><div className="spinner-border text-primary" /></td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan="7" className="text-center py-5 text-muted">No sales orders found.</td></tr>
                        ) : (
                            orders.map((o) => (
                                <tr key={o._id}>
                                    <td>
                                        <Form.Check
                                            type="checkbox"
                                            checked={selectedOrders.includes(o._id)}
                                            onChange={() => handleSelectOrder(o._id)}
                                        />
                                    </td>
                                    <td className="fw-bold text-primary">{o.invoiceNumber}</td>
                                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="fw-bold">{o.customerInfo?.name || 'Guest'}</div>
                                        <div className="small text-muted">{o.customerInfo?.phone || 'No Phone'}</div>
                                    </td>
                                    <td className="text-end fw-bold">${o.grandTotal.toFixed(2)}</td>
                                    <td className="text-center">
                                        <span className={`badge rounded-pill px-3 py-2 ${
                                            o.status === 'Completed' ? 'bg-success' : 
                                            o.status === 'Invoiced' ? 'bg-info' : 'bg-warning'
                                        }`} style={{ minWidth: '85px' }}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <Button variant="link" className="text-primary p-0 mx-2 shadow-none border-0" onClick={() => setSelectedSale(o)}>
                                            <i className="bi bi-eye-fill fs-5"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4">
                <span className="text-muted small">Total: <strong>{totalElements}</strong> items</span>
                <ReactPaginate
                    previousLabel="«"
                    nextLabel="»"
                    breakLabel="..."
                    pageCount={totalPages}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={({ selected }) => fetchAllData(selected)}
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

            <ConvertToInvoiceModal
                show={showInvoiceModal}
                onHide={() => setShowInvoiceModal(false)}
                orderIds={selectedOrders}
                initialCustomerDetails={selectedCustomerDetails}
                onSuccess={() => {
                    setShowInvoiceModal(false);
                    fetchAllData(page);
                }}
            />

            {selectedSale && (
                <ViewSaleModal
                    sale={selectedSale}
                    onClose={() => setSelectedSale(null)}
                />
            )}

            {showCreateModal && (
                <CreateSaleModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchAllData(0);
                    }}
                />
            )}
        </CardContainer>
    );
};

export default Sales;
