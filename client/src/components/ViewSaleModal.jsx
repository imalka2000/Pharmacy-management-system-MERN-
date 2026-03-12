import { Modal, Button, Table, Badge, Card } from 'react-bootstrap';

const ViewSaleModal = ({ sale, onClose }) => {
    if (!sale) return null;

    return (
        <Modal show={!!sale} onHide={onClose} centered size="lg" className="border-0">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold">Transaction Receipt</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-4 p-3 bg-light rounded-4">
                    <div>
                        <span className="text-muted small fw-bold text-uppercase d-block mb-1">Invoice Number</span>
                        <h4 className="fw-bold text-primary mb-0">{sale.invoiceNumber}</h4>
                    </div>
                    <div className="text-end">
                        <Badge bg="success-subtle" text="success" className="px-3 py-2 rounded-pill fw-bold">
                            Paid & Completed
                        </Badge>
                    </div>
                </div>

                <div className="row g-3 mb-4">
                    <div className="col-md-6">
                        <Card className="border-0 bg-white shadow-sm rounded-4 h-100 p-3">
                            <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-info-subtle text-info d-flex align-items-center justify-content-center me-3" style={{ width: '45px', height: '45px' }}>
                                    <i className="bi bi-calendar-event fs-5"></i>
                                </div>
                                <div>
                                    <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '10px' }}>Date Issued</small>
                                    <span className="fw-bold text-dark">{new Date(sale.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-md-6">
                        <Card className="border-0 bg-white shadow-sm rounded-4 h-100 p-3">
                            <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-content-center me-3" style={{ width: '45px', height: '45px' }}>
                                    <i className="bi bi-person-badge fs-5"></i>
                                </div>
                                <div>
                                    <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '10px' }}>In Charge</small>
                                    <span className="fw-bold text-dark">{sale.pharmacist?.username || 'System Agent'}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                    <Table hover responsive className="mb-0">
                        <thead className="bg-white border-bottom">
                            <tr>
                                <th className="ps-4 py-3 text-muted small fw-bold text-uppercase">Medicine Item</th>
                                <th className="py-3 text-muted small fw-bold text-uppercase text-center">Qty</th>
                                <th className="py-3 text-muted small fw-bold text-uppercase text-end">Price</th>
                                <th className="pe-4 py-3 text-muted small fw-bold text-uppercase text-end">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.items.map((item, index) => (
                                <tr key={index} className="align-middle border-bottom border-light">
                                    <td className="ps-4">
                                        <div className="fw-bold text-dark">{item.medicine?.name || 'Item Removed from Store'}</div>
                                        <small className="text-muted">ID: {item.medicine?._id?.slice(-6).toUpperCase() || 'N/A'}</small>
                                    </td>
                                    <td className="text-center">
                                        <span className="badge bg-light text-dark border px-3 py-1 fw-bold">{item.quantity}</span>
                                    </td>
                                    <td className="text-end text-muted">${item.price.toFixed(2)}</td>
                                    <td className="pe-4 text-end fw-bold text-dark">${item.subtotal.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>

                <div className="bg-primary-subtle p-4 rounded-4 border border-primary-subtle border-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="fw-bold text-primary mb-0">Total Transaction Value</h5>
                        <h2 className="fw-bold text-primary mb-0">${sale.grandTotal.toFixed(2)}</h2>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0 pb-4 pt-0 px-4">
                <Button variant="primary" className="w-100 py-3 rounded-4 fw-bold shadow-sm" onClick={() => window.print()}>
                    <i className="bi bi-printer me-2"></i> Print Thermal Receipt
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ViewSaleModal;
