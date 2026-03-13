import { useState, useEffect, useRef } from 'react';
import apiClient from '../api-request/config';
import { Button, Form, Row, Col, Card, Badge, InputGroup, ListGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Bills = () => {
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMed, setSelectedMed] = useState(null);
    const [qty, setQty] = useState(1);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
    
    const searchInputRef = useRef(null);

    useEffect(() => {
        fetchMedicines();
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);

    const fetchMedicines = async () => {
        setIsFetching(true);
        try {
            const { data } = await apiClient.get('/medicines');
            setMedicines(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load medicines');
        } finally {
            setIsFetching(false);
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
        toast.success('Added to bill');
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
                source: 'pos',
                status: 'Completed'
            };
            await apiClient.post('/sales', payload);
            toast.success('Bill Generated Successfully');
            navigate('/sales');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Billing Failed');
        } finally {
            setLoading(false);
        }
    };

    const grandTotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
    const filteredMedicines = searchTerm && !selectedMed 
        ? medicines.filter(m => 
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            m.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 8)
        : [];

    if (isFetching && medicines.length === 0) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light rounded-4 shadow-sm">
                <Spinner animation="border" variant="primary" size="lg" />
                <p className="mt-3 fw-bold text-muted">Initializing Billing Terminal...</p>
            </div>
        );
    }

    return (
        <div className="orders-page" style={{ margin: '-20px' }}>
            <div className="bg-white border-bottom p-4 mb-4 shadow-sm">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="fw-bold text-dark m-0 d-flex align-items-center">
                            <i className="bi bi-receipt text-primary me-3 fs-1"></i>
                            Generate New Bill
                        </h2>
                        <p className="text-muted small m-0 ms-1">Create and print new pharmacy bills</p>
                    </div>
                    <div className="text-end">
                        <Badge bg="primary-subtle" text="primary" className="rounded-pill px-3 py-2 fw-bold fs-6 border border-primary-subtle">
                            TERMINAL ACTIVE
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="px-4 pb-4">
                <Row className="g-4">
                    {/* Left Panel: Search & Selection */}
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-visible">
                            <Card.Body className="p-4">
                                <h6 className="fw-bold text-uppercase text-muted small mb-4">
                                    <i className="bi bi-search me-2"></i> Medicine Search & Selection
                                </h6>
                                <Form.Group className="mb-4 position-relative">
                                    <InputGroup className="bg-light rounded-4 overflow-hidden border border-2 border-primary-subtle" style={{ height: '60px' }}>
                                        <InputGroup.Text className="bg-transparent border-0 pe-0">
                                            <i className="bi bi-search text-primary fs-4"></i>
                                        </InputGroup.Text>
                                        <Form.Control
                                            ref={searchInputRef}
                                            placeholder="Search medicine or batch..."
                                            className="bg-transparent border-0 py-3 shadow-none fw-bold fs-5 px-4"
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
                                        <Card className="position-absolute top-100 start-0 end-0 mt-3 shadow-lg border-0 rounded-4 z-3 overflow-hidden animate__animated animate__fadeIn animate__faster">
                                            <ListGroup variant="flush">
                                                {filteredMedicines.map(med => (
                                                    <ListGroup.Item
                                                        key={med._id}
                                                        action
                                                        onClick={() => handleSelectMed(med)}
                                                        className="d-flex justify-content-between align-items-center py-3 border-bottom border-light"
                                                    >
                                                        <div className="d-flex align-items-center">
                                                            <div className={`rounded-4 p-3 me-3 ${med.quantity < 10 ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'} border`}>
                                                                <i className="bi bi-capsule fs-4"></i>
                                                            </div>
                                                            <div>
                                                                <div className="fw-bold text-dark fs-5">{med.name}</div>
                                                                <div className="d-flex gap-2 align-items-center mt-1">
                                                                    <Badge bg="white" text="dark" className="border fw-bold">Batch: {med.batchNumber}</Badge>
                                                                    <small className="text-muted fw-bold">Expiry: {new Date(med.expiryDate).toLocaleDateString()}</small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-end me-2">
                                                            <div className="fw-black text-primary fs-4">${med.price.toFixed(2)}</div>
                                                            <small className={`fw-black text-uppercase letter-spacing-1 ${med.quantity < 10 ? 'text-danger' : 'text-success'}`}>
                                                                Stock: {med.quantity}
                                                            </small>
                                                        </div>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        </Card>
                                    )}
                                </Form.Group>

                                <div className="p-4 bg-primary bg-opacity-10 rounded-4 border border-primary border-opacity-10 border-dashed">
                                    <Row className="g-3 align-items-end">
                                        <Col md={3}>
                                            <Form.Label className="small fw-black text-muted text-uppercase mb-2">Quantity</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                className="bg-white border-2 py-3 rounded-3 shadow-none fw-black fs-4 text-center"
                                                value={qty}
                                                onChange={e => setQty(e.target.value)}
                                                disabled={!selectedMed}
                                            />
                                        </Col>
                                        <Col md={9}>
                                            <Button
                                                variant="primary"
                                                className="w-100 py-3 rounded-3 fw-black text-uppercase letter-spacing-2 shadow-lg h-100 fs-5 border-0 hover-lift text-white"
                                                disabled={!selectedMed}
                                                onClick={addToCart}
                                                style={{ height: '62px' }}
                                            >
                                                <i className="bi bi-plus-circle-fill me-2"></i> Add to Bill
                                            </Button>
                                        </Col>
                                    </Row>
                                </div>
                            </Card.Body>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-4 mb-4">
                            <Card.Body className="p-4">
                                <h6 className="fw-bold text-uppercase text-muted small mb-4">
                                    <i className="bi bi-person-fill me-2"></i> Customer Details
                                </h6>
                                <Row className="g-4">
                                    <Col md={6}>
                                        <Form.Label className="small fw-black text-muted text-uppercase mb-2">Customer Name</Form.Label>
                                        <InputGroup className="bg-light rounded-3 overflow-hidden border">
                                            <InputGroup.Text className="bg-transparent border-0 pe-0">
                                                <i className="bi bi-person text-muted"></i>
                                            </InputGroup.Text>
                                            <Form.Control
                                                placeholder="Enter or 'Guest'"
                                                className="bg-transparent border-0 py-3 shadow-none fw-bold"
                                                value={customerInfo.name}
                                                onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                                            />
                                        </InputGroup>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label className="small fw-black text-muted text-uppercase mb-2">Contact Number</Form.Label>
                                        <InputGroup className="bg-light rounded-3 overflow-hidden border">
                                            <InputGroup.Text className="bg-transparent border-0 pe-0">
                                                <i className="bi bi-telephone text-muted"></i>
                                            </InputGroup.Text>
                                            <Form.Control
                                                placeholder="Phone link..."
                                                className="bg-transparent border-0 py-3 shadow-none fw-bold"
                                                value={customerInfo.phone}
                                                onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                                            />
                                        </InputGroup>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Right Panel: Cart & Summary */}
                    <Col lg={4}>
                        <Card className="border-0 shadow-lg rounded-4 overflow-hidden h-100 sticky-top" style={{ top: '80px' }}>
                            <Card.Header className="bg-dark text-white py-4 px-4 border-0">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h4 className="fw-black m-0 text-uppercase letter-spacing-2">Invoice Summary</h4>
                                    <Badge bg="primary" className="rounded-pill px-3 py-2 fw-black">{cart.length} ITEMS</Badge>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-4 d-flex flex-column" style={{ minHeight: '500px' }}>
                                <div className="cart-items flex-grow-1 overflow-auto mb-4 custom-scrollbar" style={{ maxHeight: '400px' }}>
                                    {cart.length === 0 ? (
                                        <div className="text-center py-5 my-5 opacity-25">
                                            <i className="bi bi-receipt-cutoff fs-1 d-block mb-3"></i>
                                            <p className="fw-black text-uppercase letter-spacing-1">Bill Empty</p>
                                        </div>
                                    ) : (
                                        <div className="cart-list">
                                            {cart.map(item => (
                                                <div key={item.medicine} className="p-3 mb-3 rounded-4 border bg-light position-relative animate__animated animate__fadeInRight animate__faster shadow-sm border-2">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div className="pe-3">
                                                            <div className="fw-black text-dark text-truncate" style={{ maxWidth: '180px' }}>{item.name}</div>
                                                            <div className="extra-small text-muted fw-bold">B: {item.batchNumber} | E: {new Date(item.expiryDate).toLocaleDateString()}</div>
                                                        </div>
                                                        <Button 
                                                            variant="white" 
                                                            className="p-1 rounded-circle bg-white text-danger border-0 shadow-sm"
                                                            style={{ height: '30px', width: '30px' }}
                                                            onClick={() => removeFromCart(item.medicine)}
                                                        >
                                                            <i className="bi bi-x-lg small fw-black"></i>
                                                        </Button>
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                                        <div className="d-flex align-items-center bg-white rounded-pill p-1 border shadow-sm">
                                                            <Button 
                                                                variant="transparent" 
                                                                size="sm" 
                                                                className="rounded-circle border-0 p-1 px-2"
                                                                onClick={() => updateCartQty(item.medicine, -1)}
                                                            >
                                                                <i className="bi bi-dash fw-bold"></i>
                                                            </Button>
                                                            <span className="mx-2 fw-black small" style={{ width: '25px', textAlign: 'center' }}>{item.quantity}</span>
                                                            <Button 
                                                                variant="transparent" 
                                                                size="sm" 
                                                                className="rounded-circle border-0 p-1 px-2"
                                                                onClick={() => updateCartQty(item.medicine, 1)}
                                                            >
                                                                <i className="bi bi-plus fw-bold"></i>
                                                            </Button>
                                                        </div>
                                                        <div className="text-end">
                                                            <div className="fw-black text-primary fs-5">${item.subtotal.toFixed(2)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto border-top pt-4">
                                    <div className="p-4 bg-primary bg-gradient rounded-4 text-white shadow-lg mb-4">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="fw-bold text-uppercase letter-spacing-2 op-75">Net Payable</span>
                                            <span className="h1 fw-black mb-0">${grandTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    
                                    <Button
                                        variant="primary"
                                        className="w-100 py-4 rounded-4 fw-black text-uppercase letter-spacing-2 shadow-lg fs-5 border-0 d-flex align-items-center justify-content-center mt-2 text-white"
                                        disabled={cart.length === 0 || loading}
                                        onClick={handleCheckout}
                                        style={{ minHeight: '80px' }}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner size="sm" className="me-3" /> GENERATING...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check2-circle me-3 fs-3"></i> COMPLETE BILLING
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Bills;
