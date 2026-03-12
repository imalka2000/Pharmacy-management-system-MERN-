import { Modal, Button, ListGroup } from 'react-bootstrap';

const ViewSupplierModal = ({ supplier, onClose }) => {
    if (!supplier) return null;

    return (
        <Modal show={!!supplier} onHide={onClose} centered size="md" className="border-0">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold text-dark">Supplier Details</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <div className="text-center mb-4">
                    <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-3 shadow-sm border border-primary-subtle" style={{ width: '80px', height: '80px' }}>
                        <i className="bi bi-building fs-1"></i>
                    </div>
                    <h3 className="fw-bold text-dark mb-1">{supplier.name}</h3>
                    <p className="text-muted small">Registered Supply Partner</p>
                </div>

                <ListGroup variant="flush" className="rounded-4 border shadow-sm overflow-hidden">
                    <ListGroup.Item className="py-3 px-4">
                        <div className="d-flex align-items-center">
                            <div className="rounded-3 bg-info-subtle text-info d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                <i className="bi bi-telephone-fill"></i>
                            </div>
                            <div>
                                <span className="text-muted small fw-bold text-uppercase d-block">Contact Number</span>
                                <span className="fw-bold text-dark">{supplier.contactNumber}</span>
                            </div>
                        </div>
                    </ListGroup.Item>

                    <ListGroup.Item className="py-3 px-4">
                        <div className="d-flex align-items-center">
                            <div className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                <i className="bi bi-envelope-at-fill"></i>
                            </div>
                            <div>
                                <span className="text-muted small fw-bold text-uppercase d-block">Email Address</span>
                                <span className="fw-bold text-dark">{supplier.email || <span className="text-muted opacity-50">Not Provided</span>}</span>
                            </div>
                        </div>
                    </ListGroup.Item>

                    <ListGroup.Item className="py-3 px-4 border-0">
                        <div className="d-flex align-items-start">
                            <div className="rounded-3 bg-warning-subtle text-warning d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                <i className="bi bi-geo-alt-fill"></i>
                            </div>
                            <div>
                                <span className="text-muted small fw-bold text-uppercase d-block">Office Address</span>
                                <span className="text-dark d-block" style={{ lineHeight: '1.4' }}>
                                    {supplier.address || <span className="text-muted opacity-50">No address record</span>}
                                </span>
                            </div>
                        </div>
                    </ListGroup.Item>
                </ListGroup>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0 pb-4 px-4">
                <Button variant="light" className="w-100 py-2 fw-bold" onClick={onClose}>
                    Close Profile
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ViewSupplierModal;
