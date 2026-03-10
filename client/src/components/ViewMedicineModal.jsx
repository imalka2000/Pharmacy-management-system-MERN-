import { Modal, Button, ListGroup } from 'react-bootstrap';

const ViewMedicineModal = ({ medicine, onClose }) => {
    if (!medicine) return null;

    return (
        <Modal show={!!medicine} onHide={onClose} centered size="md" className="border-0">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold text-dark">{medicine.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {medicine.imageUrl && (
                    <div className="rounded-4 bg-light overflow-hidden border mb-4 text-center p-3" style={{ height: '220px' }}>
                        <img
                            src={medicine.imageUrl.startsWith('http') ? medicine.imageUrl : `http://localhost:5005${medicine.imageUrl}`}
                            alt={medicine.name}
                            className="h-100 w-auto object-contain"
                        />
                    </div>
                )}

                <ListGroup variant="flush" className="rounded-4 border shadow-sm">
                    <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                        <span className="text-muted small fw-bold text-uppercase">Batch Number</span>
                        <span className="fw-bold text-dark">{medicine.batchNumber}</span>
                    </ListGroup.Item>

                    <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                        <span className="text-muted small fw-bold text-uppercase">
                            <i className="bi bi-calendar-event me-2"></i> Expiry Date
                        </span>
                        <span className={`fw-bold ${new Date(medicine.expiryDate) < new Date() ? 'text-danger' : 'text-dark'}`}>
                            {new Date(medicine.expiryDate).toLocaleDateString()}
                        </span>
                    </ListGroup.Item>

                    <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                        <span className="text-muted small fw-bold text-uppercase">
                            <i className="bi bi-tag me-2"></i> Price
                        </span>
                        <span className="fw-bold text-primary fs-5">${medicine.price.toFixed(2)}</span>
                    </ListGroup.Item>

                    <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                        <span className="text-muted small fw-bold text-uppercase">
                            <i className="bi bi-box me-2"></i> Stock Quantity
                        </span>
                        <span className={`badge rounded-pill ${medicine.quantity < 10 ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} py-2 px-3 fw-bold`}>
                            {medicine.quantity} units
                        </span>
                    </ListGroup.Item>
                </ListGroup>

                <div className="mt-4">
                    <span className="text-muted small fw-bold text-uppercase d-block mb-2">
                        <i className="bi bi-building me-2"></i> Manufacturer
                    </span>
                    <div className="bg-light p-3 rounded-3 text-dark border">
                        {medicine.manufacturer || 'Information not provided'}
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0 pf-4 pb-4">
                <Button variant="light" className="w-100 py-2 fw-bold" onClick={onClose}>
                    Close Details
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ViewMedicineModal;
