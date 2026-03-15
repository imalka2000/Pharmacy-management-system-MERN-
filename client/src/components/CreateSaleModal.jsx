import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Table,
  InputGroup,
  Dropdown
} from "react-bootstrap";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import apiClient from "../api-request/config";

const selectStyles = {
  menuList: (provided) => ({
    ...provided,
    maxHeight: 200,
    overflowY: "auto",
    padding: 0
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999
  }),
  control: (base) => ({ ...base, minHeight: "34px" })
};

const CreateSaleModal = ({ onClose, onSuccess }) => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  const initialFormState = {
    code: "",
    manualCode: false,
    customerId: "guest",
    customerName: "Guest Customer",
    customerDetails: {
      displayName: "",
      email: "",
      mobileNo: "",
      lane1: "",
      lane2: "",
      city: ""
    },
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    subject: "",
    note: "",
    taxType: "Exclusive",
    items: [
      {
        itemId: null,
        itemName: "",
        unitPrice: 0,
        quantity: 1,
        taxRate: 0,
        amount: 0,
        base: 0,
        taxAmount: 0
      }
    ],
    discountType: "Percentage",
    discount: 0
  };

  const [formData, setFormData] = useState({ ...initialFormState });
  const [validated, setValidated] = useState(false);
  const [isEditable, setIsEditable] = useState(true);

  // Load items
  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const { data } = await apiClient.get("/medicines");
      setMedicines(
        data.map((m) => ({
          ...m,
          value: m._id,
          label: m.name,
          isDisabled: m.quantity <= 0
        }))
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to load inventory items");
    }
  };

  const calculateItemTotals = (item, taxType) => {
    const unitPrice = Number(item.unitPrice) || 0;
    const quantity = Number(item.quantity) || 1;
    const rate = Number(item.taxRate) || 0;

    let base = 0,
      taxAmount = 0,
      amount = 0;

    if (taxType === "Exclusive" || taxType === "Tax Exclusive") {
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
      amount: Number.isFinite(amount) ? Number(amount.toFixed(2)) : 0,
      base: Number.isFinite(base) ? Number(base.toFixed(2)) : 0,
      taxAmount: Number.isFinite(taxAmount) ? Number(taxAmount.toFixed(2)) : 0
    };
  };

  const handleChange = (e) => {
    if (!isEditable || loading) return;
    const { name, value, type, checked } = e.target;

    if (name === "taxType") {
      setFormData((prev) => ({
        ...prev,
        taxType: value,
        items: prev.items.map((item) => ({
          ...item,
          ...calculateItemTotals(item, value)
        }))
      }));
    } else if (name === "manualCode") {
      setFormData((prev) => ({
        ...prev,
        manualCode: checked,
        code: checked ? prev.code : ""
      }));
      if (!checked) setValidated(false);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: ["discount"].includes(name) ? Number(value) || 0 : value
      }));
    }
  };

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      customerDetails: {
        ...prev.customerDetails,
        [name]: value
      }
    }));
  };

  const handleItemChange = (index, field, value) => {
    if (!isEditable || loading) return;
    const updated = [...formData.items];

    const numValue =
      field === "quantity" || field === "unitPrice" || field === "taxRate"
        ? Number(value) || 0
        : value;

    updated[index] = {
      ...updated[index],
      [field]: numValue
    };

    updated[index] = {
      ...updated[index],
      ...calculateItemTotals(updated[index], formData.taxType)
    };

    setFormData((prev) => ({ ...prev, items: updated }));
  };

  const removeItem = (index) => {
    if (!isEditable || loading) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleRefresh = () => {
    setFormData({ ...initialFormState });
    setValidated(false);
    toast.success("Form reset to default.");
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        "Item Name": "",
        "Unit Price": "",
        "Quantity": "",
        "Tax Rate": ""
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Sales_Order_Template.xlsx");
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
        
        const parsed = json
          .map((row) => {
            const name = (row["Item Name"] ?? "").toString().trim();
            const unitPrice = Number(row["Unit Price"]) || 0;
            const quantity = Number(row["Quantity"]) || 1;
            const taxRate = Number(row["Tax Rate"]) || 0;

            if (!name) return null;

            const match = medicines.find(
              (i) => i.name?.toLowerCase() === name.toLowerCase()
            );

            const it = {
              itemId: match?._id || null,
              itemName: match?.name || name,
              unitPrice: unitPrice || match?.price || 0,
              quantity,
              taxRate
            };
            return { ...it, ...calculateItemTotals(it, formData.taxType) };
          })
          .filter(Boolean);

        setFormData((prev) => ({
          ...prev,
          items:
            parsed.length > 0
              ? parsed
              : [
                  ...initialFormState.items
                ]
        }));
        toast.success(`Uploaded ${parsed.length} item(s) successfully!`);
      } catch (err) {
        console.error("Excel read error:", err);
        toast.error("Could not read the Excel file.");
      } finally {
        e.target.value = "";
      }
    };
    reader.onerror = () => toast.error("Failed to read file.");
    reader.readAsArrayBuffer(file);
  };

  const calculateSubtotal = () =>
    formData.items.reduce((acc, it) => acc + (Number(it.base) || 0), 0);
  const calculateTaxTotal = () =>
    formData.items.reduce((acc, it) => acc + (Number(it.taxAmount) || 0), 0);
  const calculateDiscount = () => {
    const sub = calculateSubtotal();
    const disc = Number(formData.discount) || 0;
    return formData.discountType === "Percentage"
      ? (sub * disc) / 100
      : disc;
  };
  const calculateTotal = () =>
    calculateSubtotal() - calculateDiscount() + calculateTaxTotal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (formData.manualCode && !formData.code?.trim()) {
      toast.error("Please enter a Sales Order Code.");
      setValidated(true);
      return;
    }

    setValidated(true);

    const validItems = formData.items.filter(
      (item) => item.itemName && item.quantity > 0
    );
    if (validItems.length === 0) {
      return toast.error("Please add at least one valid item.");
    }

    setLoading(true);
    try {
      const payloadItems = validItems.map((item) => ({
        medicine: item.itemId, // The backend schema references Medicine model
        name: item.itemName,
        price: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.amount 
      }));

      const payload = {
        items: payloadItems,
        customerInfo: {
          name: formData.customerDetails.displayName || formData.customerName,
          phone: formData.customerDetails.mobileNo,
          address: `${formData.customerDetails.lane1} ${formData.customerDetails.lane2} ${formData.customerDetails.city}`.trim()
        },
        subject: formData.subject,
        dueDate: formData.dueDate,
        notes: formData.note,
        tax: calculateTaxTotal(),
        discount: calculateDiscount(),
        status: "Pending", // Direct Sales Orders start as pending
        ...(formData.manualCode && formData.code?.trim() && { code: formData.code.trim() })
      };

      await apiClient.post("/sales", payload);
      toast.success("Sales Order Created Successfully");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create Sales Order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={true}
      onHide={onClose}
      size="xl"
      backdrop="static"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>New Sales Order</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
        <style>
          {`
            .was-validated .form-control:valid,
            .form-control.is-valid,
            .was-validated .form-select:valid,
            .form-select.is-valid {
              background-image: none !important;
              border-color: var(--bs-border-color) !important;
            }
          `}
        </style>
        <div className="container">
          <Form
            ref={formRef}
            noValidate
            validated={validated}
            onSubmit={(e) => e.preventDefault()}
          >
            {/* ---------- MANUAL CODE ---------- */}
            <Row className="mb-3 align-items-center">
              <Col md={3}>
                <Form.Label className="mb-0">Sales Order Code</Form.Label>
              </Col>
              <Col md={6}>
                <InputGroup>
                  <Form.Check
                    type="switch"
                    id="manualCodeSwitch"
                    label="Manual"
                    name="manualCode"
                    checked={formData.manualCode}
                    onChange={handleChange}
                    disabled={!isEditable || loading}
                  />
                  {formData.manualCode && (
                    <Form.Control
                      type="text"
                      placeholder="e.g. SO-01"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      disabled={!isEditable || loading}
                      style={{ marginLeft: "10px" }}
                      required={formData.manualCode}
                      isInvalid={
                        validated &&
                        formData.manualCode &&
                        !formData.code?.trim()
                      }
                    />
                  )}
                  {validated &&
                    formData.manualCode &&
                    !formData.code?.trim() && (
                      <Form.Control.Feedback
                        type="invalid"
                        style={{ display: "block" }}
                      >
                        Code is required.
                      </Form.Control.Feedback>
                    )}
                </InputGroup>
              </Col>
            </Row>

            {/* ---------- Customer Details ---------- */}
            <Row className="mb-3 align-items-center">
              <Col md={3}>
                <Form.Label className="mb-0">Customer Name *</Form.Label>
              </Col>
              <Col md={6}>
                <Form.Control
                  type="text"
                  name="displayName"
                  value={formData.customerDetails.displayName}
                  onChange={handleCustomerChange}
                  disabled={!isEditable || loading}
                  required
                />
              </Col>
            </Row>

            <Row className="mb-3 align-items-center">
              <Col md={3}>
                <Form.Label className="mb-0">Customer Phone</Form.Label>
              </Col>
              <Col md={6}>
                <Form.Control
                  type="text"
                  name="mobileNo"
                  value={formData.customerDetails.mobileNo}
                  onChange={handleCustomerChange}
                  disabled={!isEditable || loading}
                />
              </Col>
            </Row>

            <Row className="mb-3 align-items-center">
              <Col md={3}>
                <Form.Label className="mb-0">Expected Due Date *</Form.Label>
              </Col>
              <Col md={6}>
                <Form.Control
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  disabled={!isEditable || loading}
                  required
                />
              </Col>
            </Row>

            <Row className="mb-3 align-items-center">
              <Col md={3}>
                <Form.Label className="mb-0">Subject / Reference</Form.Label>
              </Col>
              <Col md={6}>
                <Form.Control
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={!isEditable || loading}
                />
              </Col>
            </Row>

            <Row className="mb-3 align-items-center">
              <Col md={3}>
                <Form.Label className="mb-0">Note / Address</Form.Label>
              </Col>
              <Col md={6}>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  disabled={!isEditable || loading}
                />
              </Col>
            </Row>

            {/* ---------- Excel Upload ---------- */}
            <Row className="mb-4 align-items-center">
              <Col md={3}>
                <Form.Label className="mb-0">Upload Items</Form.Label>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-center gap-2 flex-nowrap">
                  <Form.Control
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload}
                    disabled={!isEditable || loading}
                    className="flex-grow-1"
                  />
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={downloadTemplate}
                    disabled={!isEditable || loading}
                    className="d-flex align-items-center flex-shrink-0"
                  >
                    <i className="bi bi-download me-1"></i> Template
                  </Button>
                </div>
              </Col>
            </Row>

            {/* ---------- Tax Type ---------- */}
            <Form.Group className="mb-3">
              <Form.Label>Tax Type</Form.Label>
              <Form.Select
                name="taxType"
                value={formData.taxType}
                onChange={handleChange}
                style={{ width: "200px" }}
                disabled={!isEditable || loading}
              >
                <option value="Exclusive">Tax Exclusive</option>
                <option value="Inclusive">Tax Inclusive</option>
              </Form.Select>
              <Form.Text className="text-muted">
                {formData.taxType === "Inclusive"
                  ? "Unit prices include tax"
                  : "Tax will be added to unit prices"}
              </Form.Text>
            </Form.Group>

            {/* ---------- Items Table ---------- */}
            <Form.Group className="mb-4">
              <Form.Label>Order Items</Form.Label>
              <div
                className="border rounded"
                style={{ backgroundColor: "#f8f9fa", overflowX: 'auto' }}
              >
                <Table bordered className="mb-0" style={{ tableLayout: "fixed", minWidth: '900px' }}>
                  <thead>
                    <tr className="text-muted small">
                      <th style={{ width: "30%" }}>Item Name</th>
                      <th style={{ width: "13%" }} className="text-center">
                        Unit Price
                      </th>
                      <th style={{ width: "14%" }} className="text-center">
                        Quantity
                      </th>
                      <th style={{ width: "18%" }} className="text-center">
                        Tax (%)
                      </th>
                      <th style={{ width: "15%" }} className="text-end">
                        Amount
                      </th>
                      <th style={{ width: "10%" }} className="text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => {
                      const isEmptyRow =
                        !item.itemName && index === formData.items.length - 1;
                      const isFilledRow = !!item.itemName;

                      return (
                        <tr
                          key={index}
                          className={isEmptyRow ? "text-muted" : ""}
                        >
                          {/* Item Name */}
                          <td className="align-top">
                            <CreatableSelect
                              className="react-select-container"
                              classNamePrefix="react-select"
                              value={
                                item.itemId
                                  ? {
                                      value: item.itemId,
                                      label: item.itemName
                                    }
                                  : item.itemName
                                  ? {
                                      value: item.itemName,
                                      label: item.itemName
                                    }
                                  : null
                              }
                              onChange={(selected, actionMeta) => {
                                const updated = [...formData.items];
                                if (actionMeta.action === "create-option") {
                                  updated[index] = {
                                    ...updated[index],
                                    itemId: null,
                                    itemName: selected.label,
                                  };
                                } else if (selected) {
                                  const sel = medicines.find(
                                    (i) => i._id === selected.value
                                  );
                                  updated[index] = {
                                    ...updated[index],
                                    itemId: sel?._id || null,
                                    itemName: sel?.name || "",
                                    unitPrice: sel?.price ?? 0,
                                  };
                                } else {
                                  updated[index] = {
                                    itemId: null,
                                    itemName: "",
                                    unitPrice: 0,
                                    quantity: 1,
                                    taxRate: 0,
                                    amount: 0,
                                    base: 0,
                                    taxAmount: 0
                                  };
                                }

                                updated[index] = {
                                  ...updated[index],
                                  ...calculateItemTotals(
                                    updated[index],
                                    formData.taxType
                                  )
                                };

                                if (
                                  selected &&
                                  index === formData.items.length - 1
                                ) {
                                  updated.push({
                                    itemId: null,
                                    itemName: "",
                                    unitPrice: 0,
                                    quantity: 1,
                                    taxRate: 0,
                                    amount: 0,
                                    base: 0,
                                    taxAmount: 0
                                  });
                                }

                                setFormData((prev) => ({
                                  ...prev,
                                  items: updated
                                }));
                              }}
                              options={medicines.map((i) => ({
                                value: i._id,
                                label: i.name
                              }))}
                              isDisabled={!isEditable || loading}
                              placeholder={
                                isEmptyRow ? "Select or enter an item" : ""
                              }
                              isSearchable
                              isClearable={isFilledRow}
                              createOptionPosition="first"
                              styles={{
                                ...selectStyles,
                                control: (base) => ({
                                  ...base,
                                  minHeight: "34px",
                                  fontSize: "0.875rem",
                                  backgroundColor: isEmptyRow
                                    ? "#f1f3f5"
                                    : "#fff",
                                  borderColor: "#ced4da"
                                })
                              }}
                              menuPortalTarget={document.body}
                            />
                          </td>

                          {/* Unit Price */}
                          <td className="align-top" style={{ padding: "0.35rem 0.5rem" }}>
                            <Form.Control
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice ?? ""}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "unitPrice",
                                  e.target.value
                                )
                              }
                              disabled={!isEditable || loading || !item.itemName}
                              placeholder="0"
                              className="text-end"
                              style={{ height: "34px", fontSize: "0.875rem" }}
                            />
                            {formData.taxType === "Inclusive" && item.taxRate > 0 && (
                              <div className="text-muted small">
                                Base: {item.base?.toFixed(2) || "0.00"}
                              </div>
                            )}
                          </td>

                          {/* Quantity */}
                          <td className="align-top" style={{ padding: "0.35rem 0.5rem" }}>
                            <div className="d-flex align-items-center justify-content-center">
                              <Button
                                variant="light"
                                size="sm"
                                disabled={!isEditable || loading || !item.itemName}
                                onClick={() =>
                                  handleItemChange(
                                    index,
                                    "quantity",
                                    Math.max(1, (item.quantity || 1) - 1)
                                  )
                                }
                                style={{ width: "28px", height: "34px", padding: 0 }}
                              >
                                −
                              </Button>

                              <Form.Control
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "quantity",
                                    Number(e.target.value)
                                  )
                                }
                                disabled={!isEditable || loading || !item.itemName}
                                style={{ width: "80px", height: "34px", textAlign: "center" }}
                              />

                              <Button
                                variant="light"
                                size="sm"
                                disabled={!isEditable || loading || !item.itemName}
                                onClick={() =>
                                  handleItemChange(
                                    index,
                                    "quantity",
                                    (item.quantity || 1) + 1
                                  )
                                }
                                style={{ width: "28px", height: "34px", padding: 0 }}
                              >
                                +
                              </Button>
                            </div>
                          </td>

                          {/* Tax */}
                          <td className="align-top" style={{ padding: "0.35rem 0.5rem" }}>
                             <Form.Control
                              type="number"
                              min="0"
                              step="0.1"
                              value={item.taxRate ?? ""}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "taxRate",
                                  e.target.value
                                )
                              }
                              disabled={!isEditable || loading || !item.itemName}
                              placeholder="0"
                              className="text-end"
                              style={{ height: "34px", fontSize: "0.875rem" }}
                            />
                          </td>

                          {/* Amount */}
                          <td className="text-end fw-bold align-top" style={{ padding: "0.35rem 0.5rem" }}>
                            ${item.amount?.toFixed(2) ?? "0.00"}
                            {item.taxAmount > 0 && (
                              <div className="text-muted small">
                                Tax: {item.taxAmount?.toFixed(2) || "0.00"}
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="text-center align-top" style={{ padding: "0.35rem 0.5rem" }}>
                            {(isFilledRow || (!isFilledRow && index !== formData.items.length - 1)) && (
                              <Button
                                variant="link"
                                className="text-danger p-0"
                                onClick={() => removeItem(index)}
                                disabled={loading}
                              >
                                <i className="bi bi-trash-fill fs-5"></i>
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Form.Group>

            {/* ---------- Summary Table ---------- */}
            <Table
              bordered
              style={{ width: "100%", maxWidth: "400px", marginLeft: "auto" }}
            >
              <tbody>
                <tr>
                  <td style={{ fontWeight: "bold" }}>Sub Total</td>
                  <td style={{ textAlign: "right" }}>
                    ${calculateSubtotal().toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: "bold" }}>
                    Discount
                    <div className="d-flex gap-2 mt-1">
                      <Form.Control
                        type="number"
                        min="0"
                        name="discount"
                        value={formData.discount}
                        onChange={handleChange}
                        style={{ width: "80px" }}
                        disabled={!isEditable || loading}
                      />
                      <Form.Select
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleChange}
                        style={{ width: "90px" }}
                        disabled={!isEditable || loading}
                      >
                        <option value="Percentage">%</option>
                        <option value="Fixed">$</option>
                      </Form.Select>
                    </div>
                  </td>
                  <td style={{ textAlign: "right", color: '#dc3545' }}>
                    -${calculateDiscount().toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: "bold" }}>Total Tax</td>
                  <td style={{ textAlign: "right" }}>
                    ${calculateTaxTotal().toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: "bold", backgroundColor: '#e9ecef' }}>Grand Total</td>
                  <td style={{ textAlign: "right", fontWeight: 'bold', backgroundColor: '#e9ecef', fontSize: '1.2rem' }}>
                    ${calculateTotal().toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Form>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="outline-secondary" onClick={handleRefresh} disabled={loading}>
          Reset
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateSaleModal;

