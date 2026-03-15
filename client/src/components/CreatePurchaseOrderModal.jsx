import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Table, InputGroup } from 'react-bootstrap';
import apiClient from '../api-request/config';
import toast from 'react-hot-toast';

const CreatePurchaseOrderModal = ({ show, onHide, onSuccess }) => {
    const [suppliers, setSuppliers] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [subject, setSubject] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            fetchSuppliers();
            fetchMedicines();
        }
    }, [show]);

    const fetchSuppliers = async () => {
        try {
            const { data } = await apiClient.get('/suppliers');
            setSuppliers(data);
        } catch (error) {
            toast.error('Failed to load suppliers');
        }
    };

    const fetchMedicines = async () => {
        try {
            const { data } = await apiClient.get('/medicines');
            setMedicines(data);
        } catch (error) {
            toast.error('Failed to load medicines');
        }
    };

    const addToCart = (medicine) => {
        const exists = cart.find(item => item.medicine === medicine._id);
        if (exists) {
            setCart(cart.map(item => item.medicine === medicine._id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { 
                medicine: medicine._id, 
                name: medicine.name, 
                quantity: 1, 
                costPrice: medicine.price * 0.8, // Estimate cost price
                subtotal: medicine.price * 0.8 
            }]);
        }
        setSearchTerm('');
    };

    const updateQuantity = (id, quantity) => {
        setCart(cart.map(item => item.medicine === id ? { ...item, quantity, subtotal: quantity * item.costPrice } : item));
    };

    const updatePrice = (id, costPrice) => {
        setCart(cart.map(item => item.medicine === id ? { ...item, costPrice, subtotal: item.quantity * costPrice } : item));
    };

    const removeItem = (id) => {
        setCart(cart.filter(item => item.medicine !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSupplier || cart.length === 0) return toast.error('Please select a supplier and add items');

        setLoading(true);
        try {
            const totalAmount = cart.reduce((acc, item) => acc + item.subtotal, 0);
            const poData = {
                purchaseOrderNumber: `PO-${Date.now().toString().slice(-6)}`,
                supplier: selectedSupplier,
                subject,
                items: cart,
                totalAmount,
                dueDate,
                notes,
                status: 'Sent'
            };

            await apiClient.post('/purchase-orders', poData);
            toast.success('Purchase Order Created & Sent');
            onSuccess();
            onHide();
            // Reset state
            setCart([]);
            setSelectedSupplier('');
            setSubject('');
            setDueDate('');
            setNotes('');
        } catch (error) {
            toast.error('Failed to create purchase order');
        } finally {
            setLoading(false);
        }
    };

    const filteredMedicines = searchTerm 
        ? medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
        : [];

    return (
        <Modal show={show} onHide={onHide} size="xl" centered scrollable>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-black text-uppercase letter-spacing-1">Create Purchase Order</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                    <Row className="mb-4">
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold small text-uppercase text-muted">Supplier</Form.Label>
                                <Form.Select 
                                    required
                                    value={selectedSupplier}
                                    onChange={(e) => setSelectedSupplier(e.target.value)}
                                    className="rounded-3 border-0 bg-light"
                                >
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold small text-uppercase text-muted">Subject / Reference</Form.Label>
                                <Form.Control 
                                    type="text"
                                    placeholder="e.g. Monthly Stock Replenishment"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="rounded-3 border-0 bg-light"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold small text-uppercase text-muted">Expected Due Date</Form.Label>
                                <Form.Control 
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="rounded-3 border-0 bg-light"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <h6 className="fw-black text-uppercase text-primary small mb-3 border-bottom pb-2">Item Selection</h6>
                    <div className="position-relative mb-4">
                        <InputGroup className="bg-light rounded-3 border-0 overflow-hidden">
                            <InputGroup.Text className="bg-transparent border-0 pe-0">
                                <i className="bi bi-search text-muted"></i>
                            </InputGroup.Text>
                            <Form.Control 
                                placeholder="Search medicine to add..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-0 shadow-none ps-2 py-2"
                            />
                        </InputGroup>
                        {filteredMedicines.length > 0 && (
                            <div className="position-absolute w-100 bg-white shadow-lg rounded-3 mt-1 border border-light overflow-hidden" style={{ zIndex: 1000 }}>
                                {filteredMedicines.map(m => (
                                    <div 
                                        key={m._id} 
                                        className="p-3 border-bottom hover-bg-light cursor-pointer d-flex justify-content-between align-items-center"
                                        onClick={() => addToCart(m)}
                                    >
                                        <div>
                                            <div className="fw-bold text-dark">{m.name}</div>
                                            <small className="text-muted">Stock: {m.stock}</small>
                                        </div>
                                        <i className="bi bi-plus-circle-fill text-primary fs-5"></i>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Table hover responsive className="align-middle mb-4">
                        <thead className="bg-light">
                            <tr>
                                <th className="text-uppercase xxs letter-spacing-2 fw-black text-muted ps-3">Medicine</th>
                                <th className="text-uppercase xxs letter-spacing-2 fw-black text-muted" style={{ width: '120px' }}>Quantity</th>
                                <th className="text-uppercase xxs letter-spacing-2 fw-black text-muted" style={{ width: '150px' }}>Cost Price</th>
                                <th className="text-uppercase xxs letter-spacing-2 fw-black text-muted">Subtotal</th>
                                <th className="text-end pe-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted small">No items added to the order</td>
                                </tr>
                            ) : (
                                cart.map(item => (
                                    <tr key={item.medicine}>
                                        <td className="ps-3 fw-bold">{item.name}</td>
                                        <td>
                                            <Form.Control 
                                                type="number" 
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item.medicine, parseInt(e.target.value))}
                                                className="form-control-sm rounded-2 border-light shadow-none"
                                            />
                                        </td>
                                        <td>
                                            <InputGroup size="sm">
                                                <InputGroup.Text className="bg-transparent border-light">$</InputGroup.Text>
                                                <Form.Control 
                                                    type="number"
                                                    step="0.01"
                                                    value={item.costPrice}
                                                    onChange={(e) => updatePrice(item.medicine, parseFloat(e.target.value))}
                                                    className="border-light shadow-none"
                                                />
                                            </InputGroup>
                                        </td>
                                        <td className="fw-bold font-monospace">${item.subtotal.toFixed(2)}</td>
                                        <td className="text-end pe-3">
                                            <Button variant="link" className="text-danger p-0" onClick={() => removeItem(item.medicine)}>
                                                <i className="bi bi-dash-circle"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {cart.length > 0 && (
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="text-end fw-black text-uppercase small text-muted">Total Amount Estimate:</td>
                                    <td className="fw-black fs-5 text-primary">
                                        ${cart.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2)}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </Table>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold small text-uppercase text-muted">Internal Notes</Form.Label>
                        <Form.Control 
                            as="textarea"
                            rows={3}
                            placeholder="Add any specific requirements or notes for this order..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="rounded-3 border-0 bg-light"
                        />
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="light" className="rounded-4 px-4 py-2" onClick={onHide}>Cancel</Button>
                        <Button variant="primary" type="submit" className="rounded-4 px-4 py-2 fw-black shadow-lg" disabled={loading}>
                            {loading ? 'Processing...' : 'Send Purchase Order'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CreatePurchaseOrderModal;
