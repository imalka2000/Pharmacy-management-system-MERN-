import { useState, useEffect } from 'react';
import apiClient from '../api-request/config';
import { Modal, Button, Form, Table, Row, Col, Card, Badge, InputGroup } from 'react-bootstrap';
import toast from 'react-hot-toast';

const CreateSaleModal = ({ onClose, onSuccess }) => {
    const [medicines, setMedicines] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMed, setSelectedMed] = useState('');
    const [qty, setQty] = useState(1);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            const { data } = await apiClient.get('/medicines');
            setMedicines(data);
        } catch (error) {
            console.error(error);
        }
    };

    const addToCart = () => {
        if (!selectedMed) return;
        const med = medicines.find(m => m._id === selectedMed);

        if (med.quantity < qty) {
            toast.error('Insufficient Stock');
            return;
        }

        const existingItem = cart.find(item => item.medicine === med._id);
        if (existingItem) {
            const newQty = parseInt(existingItem.quantity) + parseInt(qty);
            if (med.quantity < newQty) {
                toast.error('Insufficient Stock for total quantity');
                return;
            }
            setCart(cart.map(item => item.medicine === med._id ? { ...item, quantity: newQty, subtotal: newQty * med.price } : item));
        } else {
            setCart([...cart, {
                medicine: med._id,
                name: med.name,
                price: med.price,
                quantity: parseInt(qty),
                subtotal: med.price * parseInt(qty)
            }]);
        }
        setSelectedMed('');
        setQty(1);
        setSearchTerm('');
        toast.success('Item added to cart');
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.medicine !== id));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        try {
            await apiClient.post('/sales', { items: cart, tax: 0, discount: 0 });
            toast.success('Sale Processed Successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Checkout Failed');
        } finally {
            setLoading(false);
        }
    };

    const grandTotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
    const filteredMedicines = medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <Modal show={true} onHide={onClose} centered size="lg" className="border-0">
            <Modal.Header closeButton className="border-0 pb-0 shadow-sm z-1">
                <Modal.Title className="fw-bold">Create New Batch Sale</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
                <Row className="g-4">
                    <Col lg={7}>
                        {/* Search and Selection */}
                        <Card className="border-0 shadow-sm rounded-4 mb-4">
                            <Card.Body className="p-4">
                                <Form.Group className="mb-4 position-relative">
                                    <Form.Label className="small fw-bold text-muted text-uppercase">Find Medicine</Form.Label>
                                    <InputGroup className="bg-light rounded-3 overflow-hidden border-0">
                                        <InputGroup.Text className="bg-transparent border-0 pe-0">
                                            <i className="bi bi-search text-muted"></i>
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="Type name to find medicine..."
                                            className="bg-transparent border-0 py-2 shadow-none"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>

                                    {searchTerm && filteredMedicines.length > 0 && (
                                        <Card className="position-absolute top-100 start-0 end-0 mt-1 shadow-lg border-0 rounded-3 z-3 overflow-hidden" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            <ListGroup variant="flush">
                                                {filteredMedicines.map(med => (
                                                    <ListGroup.Item
                                                        key={med._id}
                                                        action
                                                        onClick={() => { setSelectedMed(med._id); setSearchTerm(med.name); }}
                                                        className="d-flex justify-content-between align-items-center py-3"
                                                    >
                                                        <div>
                                                            <div className="fw-bold mb-0">{med.name}</div>
                                                            <small className="text-muted">Stock: <span className={med.quantity < 10 ? 'text-danger fw-bold' : ''}>{med.quantity}</span></small>
                                                        </div>
                                                        <Badge bg="primary-subtle" text="primary" className="rounded-pill p-2 px-3 fw-bold">
                                                            ${med.price.toFixed(2)}
                                                        </Badge>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        </Card>
                                    )}
                                </Form.Group>

                                <div className="d-flex gap-3 align-items-end p-3 bg-white border border-dashed rounded-4">
                                    <div className="flex-grow-1">
                                        <Form.Label className="small fw-bold text-muted text-uppercase mb-2">Quantity</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="1"
                                            className="bg-light border-0 py-2 rounded-3 shadow-none"
                                            value={qty}
                                            onChange={e => setQty(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        variant="primary"
                                        className="py-2 px-4 rounded-3 h-100 fw-bold"
                                        disabled={!selectedMed}
                                        onClick={addToCart}
                                    >
                                        Add to List
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Cart Table */}
                        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                            <Table hover responsive className="mb-0">
                                <thead className="bg-white border-bottom">
                                    <tr>
                                        <th className="ps-4 py-3 text-muted small fw-bold text-uppercase border-0">Item</th>
                                        <th className="py-3 text-muted small fw-bold text-uppercase text-center border-0">Qty</th>
                                        <th className="py-3 text-muted small fw-bold text-uppercase text-end border-0">Price</th>
                                        <th className="pe-4 py-3 border-0"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-5 text-muted opacity-50">
                                                <i className="bi bi-cart fs-1 d-block mb-2"></i>
                                                Cart is empty
                                            </td>
                                        </tr>
                                    ) : (
                                        cart.map(item => (
                                            <tr key={item.medicine} className="align-middle">
                                                <td className="ps-4">
                                                    <div className="fw-bold text-dark">{item.name}</div>
                                                    <small className="text-muted">${item.price.toFixed(2)} ea</small>
                                                </td>
                                                <td className="text-center">
                                                    <span className="badge bg-light text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-bold">
                                                        {item.quantity}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <span className="fw-bold text-dark">${item.subtotal.toFixed(2)}</span>
                                                </td>
                                                <td className="pe-4 text-end">
                                                    <Button variant="light" size="sm" className="text-danger rounded-circle p-2" onClick={() => removeFromCart(item.medicine)}>
                                                        <i className="bi bi-x-lg"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </Card>
                    </Col>

                    <Col lg={5}>
                        {/* Summary Sidebar */}
                        <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden sticky-top" style={{ top: '0' }}>
                            <Card.Header className="bg-primary text-white border-0 py-4 px-4">
                                <h4 className="fw-bold m-0">Bill Summary</h4>
                                <small className="opacity-75">Verify items before checkout</small>
                            </Card.Header>
                            <Card.Body className="p-4 d-flex flex-column">
                                <div className="mb-auto">
                                    <div className="d-flex justify-content-between mb-3 text-muted">
                                        <span>Number of Items</span>
                                        <span className="fw-bold">{cart.length}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-3 text-muted">
                                        <span>Subtotal</span>
                                        <span className="fw-bold">${grandTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-4 text-muted">
                                        <span>Tax / Surcharge</span>
                                        <span className="fw-bold text-success">$0.00</span>
                                    </div>
                                    <div className="p-3 bg-primary-subtle rounded-4 border border-primary-subtle border-2">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="h5 fw-bold text-primary mb-0">Total Due</span>
                                            <span className="h3 fw-bold text-primary mb-0">${grandTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-100 py-3 rounded-4 fw-bold shadow-lg d-flex align-items-center justify-content-center"
                                        disabled={cart.length === 0 || loading}
                                        onClick={handleCheckout}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner size="sm" className="me-2" /> Processing...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-printer-fill me-2"></i> Confirm Checkout
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="light"
                                        size="lg"
                                        className="w-100 py-3 rounded-4 fw-bold border mt-2 text-muted"
                                        onClick={onClose}
                                        disabled={loading}
                                    >
                                        Cancel Transaction
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
};

import { ListGroup } from 'react-bootstrap';

export default CreateSaleModal;
