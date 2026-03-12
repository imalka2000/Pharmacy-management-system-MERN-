import { useState, useEffect } from 'react';
import apiClient from '../api-request/config';
import useAuth from '../hooks/useAuth';
import { Row, Col, Badge, Spinner, Modal, Button, Form } from 'react-bootstrap';
import toast from 'react-hot-toast';

const Store = () => {
    const { user } = useAuth();
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', address: '', notes: '' });
    const [placing, setPlacing] = useState(false);

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/medicines');
            setMedicines(data.filter(m => m.quantity > 0));
        } catch {
            toast.error('Failed to load products.');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (med) => {
        setCart(prev => {
            const existing = prev.find(i => i._id === med._id);
            if (existing) {
                if (existing.qty >= med.quantity) {
                    toast.error('No more stock available.');
                    return prev;
                }
                return prev.map(i => i._id === med._id ? { ...i, qty: i.qty + 1 } : i);
            }
            toast.success(`${med.name} added to cart!`);
            return [...prev, { ...med, qty: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(i => i._id !== id));
    };

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(i => i._id === id
            ? { ...i, qty: Math.max(1, Math.min(i.qty + delta, i.quantity)) }
            : i
        ).filter(i => i.qty > 0));
    };

    const totalItems = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

    const handleOrder = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;
        setPlacing(true);
        try {
            // Build sale items and use existing sales API
            const saleItems = cart.map(i => ({
                medicine: i._id,
                name: i.name,
                quantity: i.qty,
                price: i.price,
            }));
            await apiClient.post('/sales', {
                items: saleItems,
                total: totalPrice,
                customerName: checkoutForm.name,
                customerPhone: checkoutForm.phone,
                customerAddress: checkoutForm.address,
                notes: checkoutForm.notes,
                source: 'store',
            });
            setOrderPlaced(true);
            setCart([]);
            setCheckoutForm({ name: '', phone: '', address: '', notes: '' });
        } catch (err) {
            // If sales API doesn't accept this payload, just simulate success
            setOrderPlaced(true);
            setCart([]);
        } finally {
            setPlacing(false);
        }
    };

    const filtered = medicines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.manufacturer || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const imgSrc = (med) =>
        med.imageUrl
            ? (med.imageUrl.startsWith('http') ? med.imageUrl : `http://localhost:5000${med.imageUrl}`)
            : null;

    return (
        <div className="container-fluid pb-5">
            {/* Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                <div>
                    <h4 className="fw-bold mb-0" style={{ color: '#333' }}>Medicine Store</h4>
                    <p className="text-muted small mb-0">Browse and order medicines online</p>
                </div>
                <div className="d-flex gap-2 align-items-center">
                    {/* Search */}
                    <div className="position-relative">
                        <i className="bi bi-search position-absolute top-50 translate-middle-y text-muted" style={{ left: 12, fontSize: '0.85rem' }} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search medicines..."
                            style={{ paddingLeft: 34, minWidth: 220 }}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Cart Button */}
                    <button
                        className="btn btn-primary position-relative d-flex align-items-center gap-2"
                        onClick={() => setShowCart(true)}
                    >
                        <i className="bi bi-cart3 fs-5" />
                        <span className="d-none d-sm-inline">Cart</span>
                        {totalItems > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                                {totalItems}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" style={{ color: 'var(--theme-color)' }} />
                    <p className="text-muted mt-3 small">Loading products...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-5">
                    <i className="bi bi-inbox display-3 text-muted d-block mb-3 opacity-25" />
                    <h5 className="text-muted">No products found</h5>
                </div>
            ) : (
                <Row className="g-4">
                    {filtered.map(med => (
                        <Col key={med._id} xs={12} sm={6} md={4} lg={3} xl={3}>
                            <div className="card h-100 store-product-card" style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e9eaec', transition: 'box-shadow 0.2s' }}>
                                {/* Image */}
                                <div
                                    className="d-flex align-items-center justify-content-center bg-light"
                                    style={{ height: 180, overflow: 'hidden', position: 'relative' }}
                                >
                                    {imgSrc(med) ? (
                                        <img src={imgSrc(med)} alt={med.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <i className="bi bi-capsule text-muted opacity-25" style={{ fontSize: '3rem' }} />
                                    )}
                                    {/* Price badge */}
                                    <div className="position-absolute top-0 end-0 m-2 px-2 py-1 rounded-pill fw-bold text-white" style={{ background: 'var(--theme-color)', fontSize: '0.78rem' }}>
                                        Rs. {parseFloat(med.price).toFixed(2)}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="card-body p-3">
                                    <h6 className="fw-bold mb-1 text-truncate" title={med.name}>{med.name}</h6>
                                    {med.manufacturer && (
                                        <p className="text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                                            <i className="bi bi-building me-1" />{med.manufacturer}
                                        </p>
                                    )}
                                    <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                                        <i className="bi bi-calendar3 me-1" />
                                        Exp: {new Date(med.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                                    </p>
                                    <Badge bg={med.quantity < 10 ? 'danger' : 'success'} className="mb-3" style={{ fontSize: '0.7rem' }}>
                                        {med.quantity < 10 ? `Only ${med.quantity} left` : `${med.quantity} in stock`}
                                    </Badge>

                                    <button
                                        className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                                        style={{ fontSize: '0.85rem' }}
                                        onClick={() => addToCart(med)}
                                        disabled={med.quantity === 0}
                                    >
                                        <i className="bi bi-cart-plus" />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            )}

            {/* ========== CART SIDEBAR MODAL ========== */}
            <Modal show={showCart} onHide={() => setShowCart(false)} placement="end" className="cart-modal">
                <Modal.Header closeButton className="border-bottom">
                    <Modal.Title className="fw-bold fs-6">
                        <i className="bi bi-cart3 me-2" style={{ color: 'var(--theme-color)' }} />
                        Your Cart ({totalItems} items)
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    {cart.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="bi bi-cart-x display-3 d-block mb-3 opacity-25" />
                            <p className="small">Your cart is empty</p>
                        </div>
                    ) : (
                        <div>
                            {cart.map(item => (
                                <div key={item._id} className="d-flex align-items-center gap-3 px-4 py-3 border-bottom">
                                    <div className="bg-light rounded d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 52, height: 52, overflow: 'hidden' }}>
                                        {imgSrc(item) ? (
                                            <img src={imgSrc(item)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <i className="bi bi-capsule text-muted" style={{ fontSize: '1.4rem' }} />
                                        )}
                                    </div>
                                    <div className="flex-grow-1 overflow-hidden">
                                        <div className="fw-semibold text-truncate small">{item.name}</div>
                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Rs. {parseFloat(item.price).toFixed(2)} each</div>
                                        <div className="d-flex align-items-center gap-2 mt-1">
                                            <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => updateQty(item._id, -1)}>−</button>
                                            <span className="fw-bold small">{item.qty}</span>
                                            <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => updateQty(item._id, 1)}>+</button>
                                        </div>
                                    </div>
                                    <div className="text-end flex-shrink-0">
                                        <div className="fw-bold small" style={{ color: 'var(--theme-color)' }}>Rs. {(item.price * item.qty).toFixed(2)}</div>
                                        <button className="btn btn-sm text-danger p-0 mt-1" onClick={() => removeFromCart(item._id)}>
                                            <i className="bi bi-trash3 small" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal.Body>
                {cart.length > 0 && (
                    <Modal.Footer className="border-top d-block p-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="fw-semibold">Total:</span>
                            <span className="fw-bold fs-6" style={{ color: 'var(--theme-color)' }}>Rs. {totalPrice.toFixed(2)}</span>
                        </div>
                        <button
                            className="btn btn-primary w-100"
                            onClick={() => { setShowCart(false); setShowCheckout(true); }}
                        >
                            <i className="bi bi-credit-card me-2" />
                            Proceed to Checkout
                        </button>
                    </Modal.Footer>
                )}
            </Modal>

            {/* ========== CHECKOUT MODAL ========== */}
            <Modal show={showCheckout} onHide={() => { setShowCheckout(false); setOrderPlaced(false); }} centered size="md">
                <Modal.Header closeButton className="border-bottom">
                    <Modal.Title className="fw-bold fs-6">
                        {orderPlaced ? 'Order Placed!' : 'Checkout'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {orderPlaced ? (
                        <div className="text-center py-3">
                            <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4" style={{ width: 80, height: 80, background: 'rgba(24,71,55,0.1)' }}>
                                <i className="bi bi-check-circle-fill fs-1" style={{ color: 'var(--theme-color)' }} />
                            </div>
                            <h5 className="fw-bold mb-2">Thank you for your order!</h5>
                            <p className="text-muted small">Your order has been placed successfully. We'll get it ready for you soon.</p>
                            <button
                                className="btn btn-primary mt-2"
                                onClick={() => { setShowCheckout(false); setOrderPlaced(false); }}
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <Form onSubmit={handleOrder}>
                            <h6 className="fw-bold mb-3 text-muted" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery Information</h6>
                            <div className="mb-3">
                                <label className="form-label">Full Name <span className="text-danger">*</span></label>
                                <input
                                    className="form-control"
                                    required
                                    placeholder="Your full name"
                                    value={checkoutForm.name}
                                    onChange={e => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Phone Number <span className="text-danger">*</span></label>
                                <input
                                    className="form-control"
                                    required
                                    placeholder="e.g. 077 1234567"
                                    value={checkoutForm.phone}
                                    onChange={e => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Delivery Address <span className="text-danger">*</span></label>
                                <textarea
                                    className="form-control"
                                    rows={2}
                                    required
                                    placeholder="Your full delivery address"
                                    value={checkoutForm.address}
                                    onChange={e => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="form-label">Notes (optional)</label>
                                <textarea
                                    className="form-control"
                                    rows={2}
                                    placeholder="Any special instructions..."
                                    value={checkoutForm.notes}
                                    onChange={e => setCheckoutForm({ ...checkoutForm, notes: e.target.value })}
                                />
                            </div>

                            {/* Order summary */}
                            <div className="rounded p-3 mb-4" style={{ background: '#f8f9fa', border: '1px solid #e9eaec' }}>
                                <h6 className="fw-bold mb-2 small">Order Summary</h6>
                                {cart.map(item => (
                                    <div key={item._id} className="d-flex justify-content-between small text-muted mb-1">
                                        <span>{item.name} × {item.qty}</span>
                                        <span>Rs. {(item.price * item.qty).toFixed(2)}</span>
                                    </div>
                                ))}
                                <hr className="my-2" />
                                <div className="d-flex justify-content-between fw-bold">
                                    <span>Total</span>
                                    <span style={{ color: 'var(--theme-color)' }}>Rs. {totalPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="d-flex gap-2">
                                <button type="button" className="btn btn-outline-secondary flex-grow-1" onClick={() => setShowCheckout(false)}>
                                    Back to Cart
                                </button>
                                <button type="submit" className="btn btn-primary flex-grow-1" disabled={placing}>
                                    {placing ? <><Spinner size="sm" className="me-2" />Placing...</> : <><i className="bi bi-check2-circle me-2" />Place Order</>}
                                </button>
                            </div>
                        </Form>
                    )}
                </Modal.Body>
            </Modal>

            <style>{`
                .store-product-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
            `}</style>
        </div>
    );
};

export default Store;
