import { useState, useEffect, useRef } from 'react';
import apiClient from '../api-request/config';
import { Modal, Button, Form, Table, Row, Col, Card, Badge, InputGroup, ListGroup, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';

const CreateSaleModal = ({ onClose, onSuccess }) => {
    const [medicines, setMedicines] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMed, setSelectedMed] = useState(null);
    const [qty, setQty] = useState(1);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
    
    const searchInputRef = useRef(null);

    useEffect(() => {
        fetchMedicines();
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);

    const fetchMedicines = async () => {
        try {
            const { data } = await apiClient.get('/medicines');
            setMedicines(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load medicines');
        }
    };

    const handleSelectMed = (med) => {
        setSelectedMed(med);
        setSearchTerm(med.name);
    };

    const addToCart = () => {
        if (!selectedMed) return;
        
        const existingItem = cart.find(item => item.medicine === selectedMed._id);
        const currentQtyInCart = existingItem ? existingItem.quantity : 0;
        const totalRequested = currentQtyInCart + parseInt(qty);

        if (selectedMed.quantity < totalRequested) {
            toast.error(`Insufficient Stock. Available: ${selectedMed.quantity}`);
            return;
        }

        if (existingItem) {
            setCart(cart.map(item => 
                item.medicine === selectedMed._id 
                ? { ...item, quantity: totalRequested, subtotal: totalRequested * item.price } 
                : item
            ));
        } else {
            setCart([...cart, {
                medicine: selectedMed._id,
                name: selectedMed.name,
                batchNumber: selectedMed.batchNumber,
                expiryDate: selectedMed.expiryDate,
                price: selectedMed.price,
                quantity: parseInt(qty),
                subtotal: selectedMed.price * parseInt(qty)
            }]);
        }
        
        resetSelection();
        toast.success('Added to list');
    };

    const resetSelection = () => {
        setSelectedMed(null);
        setQty(1);
        setSearchTerm('');
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    const updateCartQty = (id, delta) => {
        setCart(cart.map(item => {
            if (item.medicine === id) {
                const med = medicines.find(m => m._id === id);
                const newQty = Math.max(1, item.quantity + delta);
                
                if (delta > 0 && med && med.quantity < newQty) {
                    toast.error('Cannot exceed available stock');
                    return item;
                }
                
                return { ...item, quantity: newQty, subtotal: newQty * item.price };
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.medicine !== id));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        try {
            const payload = {
                items: cart,
                customerName: customerInfo.name,
                customerPhone: customerInfo.phone,
                customerAddress: customerInfo.address,
                tax: 0,
                discount: 0,
                source: 'pos'
            };
            await apiClient.post('/sales', payload);
            toast.success('Sale Processed Successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Checkout Failed');
        } finally {
            setLoading(false);
        }
    };

    const grandTotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
    const filteredMedicines = searchTerm && !selectedMed 
        ? medicines.filter(m => 
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            m.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5)
        : [];

    return (
        <Modal show={true} onHide={onClose} centered size="xl" className="border-0">
            <Modal.Header closeButton className="border-0 pb-0 shadow-sm z-3 bg-white">
                <Modal.Title className="fw-bold d-flex align-items-center">
                    <div className="bg-primary text-white rounded-3 p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                        <i className="bi bi-cart-check-fill"></i>
                    </div>
                    Create New Batch Sale
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0 bg-light" style={{ minHeight: '80vh' }}>
                <Row className="g-0 h-100">
                    {/* Left Panel: Search & Selection */}
                    <Col lg={7} className="p-4 border-end">
                        <div className="mb-4">
                            <h6 className="fw-bold text-uppercase text-muted small mb-3">Item Selection</h6>
                            <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-visible">
                                <Card.Body className="p-4">
                                    <Form.Group className="mb-4 position-relative">
                                        <Form.Label className="small fw-bold text-muted text-uppercase">Find Medicine / Batch</Form.Label>
                                        <InputGroup className="bg-light rounded-3 overflow-hidden border">
                                            <InputGroup.Text className="bg-transparent border-0 pe-0">
                                                <i className="bi bi-search text-muted"></i>
                                            </InputGroup.Text>
                                            <Form.Control
                                                ref={searchInputRef}
                                                placeholder="Type name or batch number..."
                                                className="bg-transparent border-0 py-3 shadow-none fw-medium"
                                                value={searchTerm}
                                                onChange={e => {
                                                    setSearchTerm(e.target.value);
                                                    if (selectedMed) setSelectedMed(null);
                                                }}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter' && selectedMed) addToCart();
                                                }}
                                            />
                                        </InputGroup>

                                        {filteredMedicines.length > 0 && (
                                            <Card className="position-absolute top-100 start-0 end-0 mt-2 shadow-lg border-0 rounded-4 z-3 overflow-hidden animate__animated animate__fadeIn animate__faster">
                                                <ListGroup variant="flush">
                                                    {filteredMedicines.map(med => (
                                                        <ListGroup.Item
                                                            key={med._id}
                                                            action
                                                            onClick={() => handleSelectMed(med)}
                                                            className="d-flex justify-content-between align-items-center py-3 border-bottom-0"
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <div className={`rounded-3 p-2 me-3 ${med.quantity < 10 ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'}`}>
                                                                    <i className="bi bi-capsule"></i>
                                                                </div>
                                                                <div>
                                                                    <div className="fw-bold text-dark">{med.name}</div>
                                                                    <div className="d-flex gap-2 align-items-center">
                                                                        <Badge bg="light" text="dark" className="border fw-normal">Batch: {med.batchNumber}</Badge>
                                                                        <small className="text-muted">Exp: {new Date(med.expiryDate).toLocaleDateString()}</small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-end">
                                                                <div className="fw-bold text-primary">${med.price.toFixed(2)}</div>
                                                                <small className={`fw-medium ${med.quantity < 10 ? 'text-danger' : 'text-success'}`}>
                                                                    Stock: {med.quantity}
                                                                </small>
                                                            </div>
                                                        </ListGroup.Item>
                                                    ))}
                                                </ListGroup>
                                            </Card>
                                        )}
                                    </Form.Group>

                                    <Row className="g-3 align-items-end">
                                        <Col sm={4}>
                                            <Form.Label className="small fw-bold text-muted text-uppercase mb-2">Quantity</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                className="bg-light border py-2 rounded-3 shadow-none fw-bold"
                                                value={qty}
                                                onChange={e => setQty(e.target.value)}
                                                disabled={!selectedMed}
                                            />
                                        </Col>
                                        <Col sm={8}>
                                            <Button
                                                variant="primary"
                                                className="w-100 py-2 rounded-3 fw-bold shadow-sm"
                                                disabled={!selectedMed}
                                                onClick={addToCart}
                                                style={{ height: '43px' }}
                                            >
                                                <i className="bi bi-plus-lg me-2"></i> Add to List
                                            </Button>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </div>

                        <div>
                            <h6 className="fw-bold text-uppercase text-muted small mb-3">Customer Information</h6>
                            <Card className="border-0 shadow-sm rounded-4 p-4">
                                <Row className="g-3">
                                    <Col sm={6}>
                                        <Form.Label className="small fw-bold text-muted text-uppercase mb-2">Customer Name</Form.Label>
                                        <Form.Control
                                            placeholder="Guest Customer"
                                            className="bg-light border-0 py-2 rounded-3 shadow-none"
                                            value={customerInfo.name}
                                            onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                                        />
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Label className="small fw-bold text-muted text-uppercase mb-2">Phone Number</Form.Label>
                                        <Form.Control
                                            placeholder="+94 XXX XXX XXX"
                                            className="bg-light border-0 py-2 rounded-3 shadow-none"
                                            value={customerInfo.phone}
                                            onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                                        />
                                    </Col>
                                </Row>
                            </Card>
                        </div>
                    </Col>

                    {/* Right Panel: Cart & Summary */}
                    <Col lg={5} className="bg-white d-flex flex-column h-100">
                        <div className="p-4 flex-grow-1 overflow-auto" style={{ maxHeight: 'calc(80vh - 180px)' }}>
                            <div className="d-flex justify-content-between align-items-end mb-3">
                                <h6 className="fw-bold text-uppercase text-muted small m-0">Bill Items</h6>
                                <Badge bg="primary-subtle" text="primary" className="rounded-pill px-3 py-2 fw-bold">
                                    {cart.length} Items Selected
                                </Badge>
                            </div>

                            {cart.length === 0 ? (
                                <div className="text-center py-5 my-5 opacity-25">
                                    <i className="bi bi-cart-x fs-1 d-block mb-3"></i>
                                    <p className="fw-medium">No items in the list</p>
                                </div>
                            ) : (
                                <div className="cart-list">
                                    {cart.map(item => (
                                        <div key={item.medicine} className="p-3 mb-3 rounded-4 border bg-white shadow-sm position-relative animate__animated animate__fadeInRight animate__faster">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <div className="fw-bold text-dark">{item.name}</div>
                                                    <div className="extra-small text-muted">Batch: {item.batchNumber} | Exp: {new Date(item.expiryDate).toLocaleDateString()}</div>
                                                </div>
                                                <Button 
                                                    variant="link" 
                                                    className="p-0 text-danger text-decoration-none"
                                                    onClick={() => removeFromCart(item.medicine)}
                                                >
                                                    <i className="bi bi-trash3-fill"></i>
                                                </Button>
                                            </div>
                                            <hr className="my-2 opacity-10" />
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center bg-light rounded-pill p-1 border">
                                                    <Button 
                                                        variant="white" 
                                                        size="sm" 
                                                        className="rounded-circle shadow-none border-0 p-1 px-2"
                                                        onClick={() => updateCartQty(item.medicine, -1)}
                                                    >
                                                        <i className="bi bi-dash fw-bold"></i>
                                                    </Button>
                                                    <span className="mx-3 fw-bold small" style={{ width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                                    <Button 
                                                        variant="white" 
                                                        size="sm" 
                                                        className="rounded-circle shadow-none border-0 p-1 px-2"
                                                        onClick={() => updateCartQty(item.medicine, 1)}
                                                    >
                                                        <i className="bi bi-plus fw-bold"></i>
                                                    </Button>
                                                </div>
                                                <div className="text-end">
                                                    <div className="extra-small text-muted line-through">${item.price.toFixed(2)} x {item.quantity}</div>
                                                    <div className="fw-bold text-primary">${item.subtotal.toFixed(2)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sticky Bottom Summary */}
                        <div className="mt-auto border-top p-4 bg-light shadow-lg z-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="text-muted fw-bold small text-uppercase">Grand Total</span>
                                <span className="h2 fw-bold text-primary mb-0">${grandTotal.toFixed(2)}</span>
                            </div>
                            <Row className="g-2">
                                <Col xs={4}>
                                    <Button
                                        variant="outline-secondary"
                                        className="w-100 py-3 rounded-3 fw-bold border-2"
                                        onClick={onClose}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                </Col>
                                <Col xs={8}>
                                    <Button
                                        variant="primary"
                                        className="w-100 py-3 rounded-3 fw-bold shadow-lg d-flex align-items-center justify-content-center border-0"
                                        disabled={cart.length === 0 || loading}
                                        onClick={handleCheckout}
                                        style={{ backgroundColor: 'var(--theme-color)' }}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner size="sm" className="me-2" /> Processing...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-circle-fill me-2"></i> Process Sale
                                            </>
                                        )}
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
};

export default CreateSaleModal;
