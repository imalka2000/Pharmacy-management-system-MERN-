import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Table, Card, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import toast from 'react-hot-toast';
import apiClient from '../api-request/config';

const CreateInvoiceModal = ({ onClose, onSuccess }) => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const emptyCustomerDetails = {
        displayName: "",
        email: "",
        mobileNo: "",
        lane1: "",
        lane2: "",
        city: ""
    };

    const initialItemState = {
        medicineId: null,
        name: "",
        batchNumber: "",
        expiryDate: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        amount: 0,
        base: 0,
        taxAmount: 0
    };

    const initialFormData = {
        customerId: "guest",
        customerName: "Guest Customer",
        customerDetails: { ...emptyCustomerDetails },
        documentDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subject: "",
        notes: "",
        taxType: "Exclusive",
        discountType: "Percentage",
        discount: 0,
        items: [{ ...initialItemState }]
    };

    const [formData, setFormData] = useState({ ...initialFormData });
    const [validated, setValidated] = useState(false);
    const formRef = useRef(null);

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            const { data } = await apiClient.get('/medicines');
            const formatted = data.map(m => ({
                ...m,
                value: m._id,
                label: m.name,
                isDisabled: m.quantity <= 0
            }));
            setMedicines(formatted);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load inventory items');
        }
    };

    const calculateItemTotals = (item, taxType) => {
        const unitPrice = Number(item.unitPrice) || 0;
        const quantity = Number(item.quantity) || 1;
        const rate = Number(item.taxRate) || 0;
        
        let base = 0, taxAmount = 0, amount = 0;

        if (taxType === "Exclusive") {
            base = unitPrice * quantity;
            taxAmount = base * (rate / 100);
            amount = base + taxAmount;
        } else {
            const netAmount = unitPrice * quantity;
            amount = netAmount;
            if (rate > 0) {
                base = netAmount / (1 + rate / 100);
                taxAmount = netAmount - base;
            } else {
                base = netAmount;
                taxAmount = 0;
            }
        }

        return {
            amount: Number(amount.toFixed(2)),
            base: Number(base.toFixed(2)),
            taxAmount: Number(taxAmount.toFixed(2))
        };
    };

    const calculateSubtotal = () => formData.items.reduce((acc, it) => acc + (Number(it.base) || 0), 0);
    const calculateTaxTotal = () => formData.items.reduce((acc, it) => acc + (Number(it.taxAmount) || 0), 0);
    const calculateDiscount = () => {
        const sub = calculateSubtotal();
        const disc = Number(formData.discount) || 0;
        return formData.discountType === "Percentage" ? (sub * disc) / 100 : disc;
    };
    const calculateTotal = () => calculateSubtotal() - calculateDiscount() + calculateTaxTotal();

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === "taxType") {
            setFormData(prev => ({
                ...prev,
                taxType: value,
                items: prev.items.map(item => ({
                    ...item,
                    ...calculateItemTotals(item, value)
                }))
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: ['discount'].includes(name) ? (Number(value) || 0) : value
            }));
        }
    };

    const handleCustomerChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            customerDetails: {
                ...prev.customerDetails,
                [name]: value
            }
        }));
    };

    const handleMedSelect = (selectedOption, index) => {
        if (!selectedOption) return;
        
        const med = medicines.find(m => m._id === selectedOption.value);
        if (!med) return;

        setFormData(prev => {
            const newItems = [...prev.items];
            newItems[index] = {
                ...newItems[index],
                medicineId: med._id,
                name: med.name,
                batchNumber: med.batchNumber,
                expiryDate: med.expiryDate,
                unitPrice: med.price,
                ...calculateItemTotals({ ...newItems[index], unitPrice: med.price }, prev.taxType)
            };
            return { ...prev, items: newItems };
        });
    };

    const handleItemParamChange = (index, field, value) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            const numValue = ['quantity', 'unitPrice', 'taxRate'].includes(field) ? (Number(value) || 0) : value;
                
            newItems[index] = {
                ...newItems[index],
                [field]: numValue
            };
            
            newItems[index] = {
                ...newItems[index],
                ...calculateItemTotals(newItems[index], prev.taxType)
            };
            
            return { ...prev, items: newItems };
        });
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { ...initialItemState }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const form = formRef.current;
        if (!form.checkValidity()) {
            e.stopPropagation();
            setValidated(true);
            return toast.error("Please fill in required fields correctly.");
        }

        const validItems = formData.items.filter(item => item.medicineId && item.quantity > 0);
        if (validItems.length === 0) {
            return toast.error("Please add at least one valid item.");
        }

        setLoading(true);
        try {
            const payloadItems = validItems.map(item => ({
                medicine: item.medicineId,
                name: item.name,
                batchNumber: item.batchNumber,
                expiryDate: item.expiryDate,
                price: item.unitPrice,
                quantity: item.quantity,
                subtotal: item.amount
            }));

            const finalTotal = calculateTotal();

            const payload = {
                items: payloadItems,
                customerInfo: {
                    name: formData.customerDetails.displayName || formData.customerName,
                    phone: formData.customerDetails.mobileNo,
                    address: `${formData.customerDetails.lane1} ${formData.customerDetails.lane2} ${formData.customerDetails.city}`.trim()
                },
                subject: formData.subject,
                dueDate: formData.dueDate,
                documentDate: formData.documentDate,
                notes: formData.notes,
                tax: calculateTaxTotal(),
                discount: calculateDiscount(),
                grandTotal: finalTotal,
                receivedAmount: finalTotal, // Direct invoice is fully paid
                status: 'Completed' // Invoice default
            };

            const { data } = await apiClient.post('/sales', payload);
            
            // Log direct payment transaction
            await apiClient.post('/transactions', {
                type: 'Income',
                category: 'Sale',
                amount: finalTotal,
                referenceId: data._id,
                onModel: 'Sale',
                description: `Payment received for Direct Invoice #${data.invoiceNumber || data._id}`
            });

            toast.success('Direct Invoice Created & Paid');
            if(onSuccess) onSuccess();
            onClose();
            
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create Invoice');
        } finally {
            setLoading(false);
        }
    };

    const formatOptionLabel = ({ label, batchNumber, quantity, price }) => (
        <div className="d-flex justify-content-between align-items-center">
            <div>
                <strong className="text-dark">{label}</strong>
                {batchNumber && <span className="text-muted ms-2 small">[{batchNumber}]</span>}
            </div>
            <div className="text-end">
                <span className={`badge ${quantity > 10 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} me-2`}>
                    Stock: {quantity}
                </span>
                <strong className="text-primary">${price?.toFixed(2)}</strong>
            </div>
        </div>
    );

    return (
        <Modal show={true} onHide={onClose} size="xl" backdrop="static" centered className="erp-modal">
            <Form noValidate validated={validated} ref={formRef} onSubmit={handleSubmit}>
                <Modal.Header closeButton className="bg-primary text-white border-bottom border-2">
                    <Modal.Title className="fw-bold d-flex align-items-center text-white">
                        <i className="bi bi-receipt-cutoff me-3 fs-3"></i>
                        New Direct Invoice
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="p-4 bg-light bg-opacity-50" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                    <Card className="border-0 shadow-sm rounded-4 mb-4 border border-primary border-opacity-25">
                        <Card.Body className="p-4">
                            <h6 className="fw-black text-uppercase text-primary small mb-4">
                                <i className="bi bi-person-lines-fill me-2"></i>Billing & Customer Details
                            </h6>
                            <Row className="g-4">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold">Customer Name <span className="text-danger">*</span></Form.Label>
                                        <Form.Control 
                                            required
                                            name="displayName"
                                            value={formData.customerDetails.displayName}
                                            onChange={handleCustomerChange}
                                            placeholder="Guest or Specific Name..."
                                            className="bg-white shadow-none"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold">Contact Number</Form.Label>
                                        <Form.Control 
                                            name="mobileNo"
                                            value={formData.customerDetails.mobileNo}
                                            onChange={handleCustomerChange}
                                            placeholder="Phone for receipt"
                                            className="bg-white shadow-none"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold">Invoice Date <span className="text-danger">*</span></Form.Label>
                                        <Form.Control 
                                            required
                                            type="date"
                                            name="documentDate"
                                            value={formData.documentDate}
                                            onChange={handleChange}
                                            className="bg-light shadow-none"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold">Due Date <span className="text-danger">*</span></Form.Label>
                                        <Form.Control 
                                            required
                                            type="date"
                                            name="dueDate"
                                            value={formData.dueDate}
                                            onChange={handleChange}
                                            className="bg-light shadow-none"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-visible">
                        <Card.Header className="bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                            <h6 className="fw-black text-uppercase text-dark small m-0">Line Items</h6>
                            <div className="d-flex align-items-center">
                                <Form.Label className="small fw-bold m-0 me-3">Amounts are</Form.Label>
                                <Form.Select 
                                    size="sm" 
                                    name="taxType" 
                                    value={formData.taxType} 
                                    onChange={handleChange}
                                    style={{ width: '150px' }}
                                    className="fw-bold text-primary shadow-none cursor-pointer"
                                >
                                    <option value="Exclusive">Tax Exclusive</option>
                                    <option value="Inclusive">Tax Inclusive</option>
                                </Form.Select>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="align-middle m-0" style={{ minWidth: '900px' }}>
                                <thead className="bg-light">
                                    <tr>
                                        <th style={{ width: '35%' }} className="ps-4">Item Details</th>
                                        <th style={{ width: '15%' }} className="text-end">Quantity</th>
                                        <th style={{ width: '15%' }} className="text-end">Unit Price</th>
                                        <th style={{ width: '15%' }} className="text-end">Tax (%)</th>
                                        <th style={{ width: '15%' }} className="text-end pe-4">Amount</th>
                                        <th style={{ width: '5%' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="ps-4 py-3">
                                                <Select
                                                    options={medicines}
                                                    formatOptionLabel={formatOptionLabel}
                                                    onChange={(selected) => handleMedSelect(selected, index)}
                                                    placeholder="Select or scan item..."
                                                    className="shadow-sm"
                                                    value={item.medicineId ? { value: item.medicineId, label: item.name } : null}
                                                    menuPortalTarget={document.body}
                                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </td>
                                            <td>
                                                <Form.Control 
                                                    type="number" 
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemParamChange(index, 'quantity', e.target.value)}
                                                    className="text-end shadow-none"
                                                />
                                            </td>
                                            <td>
                                                <Form.Control 
                                                    type="number" 
                                                    step="0.01" 
                                                    min="0"
                                                    value={item.unitPrice}
                                                    onChange={(e) => handleItemParamChange(index, 'unitPrice', e.target.value)}
                                                    className="text-end shadow-none"
                                                />
                                            </td>
                                            <td>
                                                <Form.Control 
                                                    type="number" 
                                                    step="0.1" 
                                                    min="0"
                                                    value={item.taxRate}
                                                    onChange={(e) => handleItemParamChange(index, 'taxRate', e.target.value)}
                                                    className="text-end shadow-none"
                                                />
                                            </td>
                                            <td className="text-end pe-4 fw-bold text-dark">
                                                ${item.amount.toFixed(2)}
                                            </td>
                                            <td className="text-center">
                                                <Button 
                                                    variant="link" 
                                                    className="text-danger p-0 shadow-none border-0"
                                                    disabled={formData.items.length <= 1}
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <i className="bi bi-x-circle-fill fs-5"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td colSpan="6" className="ps-4 py-3 border-0 bg-light">
                                            <Button 
                                                variant="outline-primary" 
                                                className="fw-bold border-2 rounded-3 shadow-sm btn-sm"
                                                onClick={addItem}
                                            >
                                                <i className="bi bi-plus-lg me-2"></i> Add Another Item
                                            </Button>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>

                    <Row className="g-4">
                        <Col lg={7}>
                            <Card className="border-0 shadow-sm rounded-4 h-100">
                                <Card.Body className="p-4">
                                    <Form.Label className="small fw-bold text-muted text-uppercase mb-2">Invoice References & Notes</Form.Label>
                                    <Form.Control 
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="Reference or Subject (e.g. PO#12345)"
                                        className="bg-light shadow-none mb-3"
                                    />
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Any special terms or notes to display..."
                                        className="bg-light shadow-none border-0 rounded-3"
                                    />
                                </Card.Body>
                            </Card>
                        </Col>
                        
                        <Col lg={5}>
                            <Card className="border-0 shadow-sm rounded-4 h-100 bg-white border border-secondary border-opacity-10">
                                <Card.Body className="p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted fw-bold">Subtotal</span>
                                        <span className="fw-black">${calculateSubtotal().toFixed(2)}</span>
                                    </div>
                                    
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted fw-bold">Discount</span>
                                        <div className="d-flex" style={{ width: '150px' }}>
                                            <Form.Control 
                                                type="number" 
                                                min="0"
                                                name="discount"
                                                value={formData.discount}
                                                onChange={handleChange}
                                                className="text-end shadow-none px-2 py-1 rounded-end-0 border-end-0"
                                            />
                                            <Form.Select 
                                                name="discountType"
                                                value={formData.discountType}
                                                onChange={handleChange}
                                                className="shadow-none px-2 py-1 bg-light border-start-0 rounded-start-0 w-auto"
                                            >
                                                <option value="Percentage">%</option>
                                                <option value="Fixed">$</option>
                                            </Form.Select>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-3 text-end">
                                        <span></span>
                                        <span className="text-danger small fw-bold">
                                            - ${calculateDiscount().toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted fw-bold">Tax Amount</span>
                                        <span className="fw-black text-secondary">${calculateTaxTotal().toFixed(2)}</span>
                                    </div>

                                    <hr className="my-4 border-2 opacity-10" />

                                    <div className="d-flex justify-content-between align-items-center p-3 bg-success bg-gradient text-white rounded-3 shadow-sm">
                                        <span className="fw-black text-uppercase letter-spacing-1">Amount Due</span>
                                        <span className="h3 fw-black m-0">${calculateTotal().toFixed(2)}</span>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                </Modal.Body>

                <Modal.Footer className="bg-light border-top border-2 p-3">
                    <Button variant="outline-secondary" className="fw-bold px-4 py-2" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="success" type="submit" className="fw-black px-4 py-2 shadow-sm d-flex align-items-center text-white" disabled={loading}>
                        {loading ? <Spinner size="sm" className="me-2" /> : <i className="bi bi-cash-coin me-2"></i>}
                        Generate Direct Invoice & Mark Paid
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CreateInvoiceModal;
