import { useState } from 'react';
import apiClient from '../api-request/config';
import { Modal, Button, Form } from 'react-bootstrap';
import toast from 'react-hot-toast';

const AddSupplierModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ name: '', contactNumber: '', address: '', email: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.post('/suppliers', formData);
            toast.success('Supplier added successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error adding supplier');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={true} onHide={onClose} centered size="md" className="border-0">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold">Add New Supplier</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small text-muted fw-bold">Supplier Name</Form.Label>
                        <Form.Control
                            placeholder="Enter business or person name"
                            required
                            className="bg-light border-0 py-2 ms-0 shadow-none"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small text-muted fw-bold">Contact Number</Form.Label>
                        <Form.Control
                            placeholder="e.g. +1 234 567 890"
                            required
                            className="bg-light border-0 py-2 ms-0 shadow-none"
                            value={formData.contactNumber}
                            onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small text-muted fw-bold">Email Address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="supplier@example.com"
                            className="bg-light border-0 py-2 ms-0 shadow-none"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="small text-muted fw-bold">Address</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Full physical address"
                            className="bg-light border-0 py-2 ms-0 shadow-none resize-none"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </Form.Group>

                    <div className="d-flex gap-2">
                        <Button variant="light" className="w-100 py-2 fw-bold" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="w-100 py-2 fw-bold shadow-sm" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Supplier'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddSupplierModal;
