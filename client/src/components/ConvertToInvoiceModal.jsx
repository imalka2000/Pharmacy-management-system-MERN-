import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert, Row, Col } from "react-bootstrap";
import apiClient from "../api-request/config";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ConvertToInvoiceModal = ({
    show,
    onHide,
    orderId,
    orderIds,
    onSuccess,
    isLoading = false,
    initialCustomerDetails = null
}) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const emptyForm = {
        invoiceCategory: "Sales",
        locationId: "Main Store",
        documentDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        customerName: "",
        customerEmail: "",
        customerMobile: "",
        customerLane1: "",
        customerLane2: "",
        customerCity: ""
    };

    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => {
        if (!show) return;

        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 30);
        const dueDateStr = defaultDueDate.toISOString().split("T")[0];

        let cd = {
            customerName: "",
            customerEmail: "",
            customerMobile: "",
            customerLane1: "",
            customerLane2: "",
            customerCity: ""
        };

        if (initialCustomerDetails) {
            cd = {
                customerName: initialCustomerDetails.name || initialCustomerDetails.displayName || "",
                customerEmail: initialCustomerDetails.email || "",
                customerMobile: initialCustomerDetails.phone || initialCustomerDetails.mobileNo || "",
                customerLane1: initialCustomerDetails.address || "",
                customerLane2: "",
                customerCity: ""
            };
        }

        setFormData({
            ...emptyForm,
            dueDate: dueDateStr,
            ...cd
        });
    }, [show, initialCustomerDetails]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.customerName) {
            setError("Customer name is required");
            return false;
        }
        if (!formData.customerMobile) {
            setError("Customer mobile is required");
            return false;
        }
        return true;
    };

    const handleConvert = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            const customerDetails = {
                displayName: formData.customerName,
                email: formData.customerEmail,
                mobileNo: formData.customerMobile,
                lane1: formData.customerLane1,
                lane2: formData.customerLane2,
                city: formData.customerCity
            };

            let salesOrderIds = [];
            if (orderIds && Array.isArray(orderIds) && orderIds.length > 0) {
                salesOrderIds = orderIds;
            } else if (orderId) {
                salesOrderIds = [orderId];
            }

            if (salesOrderIds.length === 0) {
                setError("No sales orders selected for conversion");
                return;
            }

            const payload = {
                salesOrderIds,
                customerDetails,
                documentDate: formData.documentDate,
                dueDate: formData.dueDate,
                metadata: {
                    customerDetails,
                    convertedFrom: "salesOrder",
                    conversionDate: new Date().toISOString()
                }
            };

            const response = await apiClient.post('/sales/convert-to-invoice', payload);
            
            toast.success("Sales order converted to invoice successfully!");
            if (onSuccess) onSuccess(response.data);
            if (onHide) onHide();
            
            // Navigate to Invoices (which we will refactor Bills.jsx for)
            navigate('/bills');

        } catch (err) {
            console.error("Conversion failed:", err);
            const msg = err.response?.data?.message || "Failed to convert to invoice";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Convert To Invoice</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {error && (
                    <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-3">
                        {error}
                    </Alert>
                )}

                <Form>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Document Date *</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="documentDate"
                                    value={formData.documentDate}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Due Date *</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <h6 className="mb-3 fw-bold border-bottom pb-2">Customer Information</h6>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Customer Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="customerEmail"
                                    value={formData.customerEmail}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Mobile Number *</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="customerMobile"
                                    value={formData.customerMobile}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Address Line 1</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="customerLane1"
                                    value={formData.customerLane1}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={loading}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleConvert} disabled={loading}>
                    {loading ? "Converting..." : "Convert to Invoice"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConvertToInvoiceModal;
