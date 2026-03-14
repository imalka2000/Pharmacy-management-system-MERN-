const Medicine = require('../models/Medicine');
const Transaction = require('../models/Transaction');

// @desc    Create a new sale
// @route   POST /api/sales
// @access  Private/Pharmacist
const createSale = async (req, res) => {
    const { items, discount, tax } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items in sale' });
    }

    try {
        let totalAmount = 0;
        const saleItems = [];

        for (const item of items) {
            const medicine = await Medicine.findById(item.medicine);
            if (!medicine) {
                return res.status(404).json({ message: `Medicine not found for ID: ${item.medicine}` });
            }

            if (medicine.quantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${medicine.name}` });
            }

            // Reduce stock
            medicine.quantity -= item.quantity;
            await medicine.save();

            const subtotal = medicine.price * item.quantity;
            totalAmount += subtotal;

            saleItems.push({
                medicine: medicine._id,
                quantity: item.quantity,
                price: medicine.price,
                subtotal
            });
        }

        const grandTotal = totalAmount + (tax || 0) - (discount || 0);

        const sale = new Sale({
            invoiceNumber: `INV-${Date.now()}`,
            pharmacist: req.user.role === 'user' ? null : req.user._id,
            customer: req.user.role === 'user' ? req.user._id : req.body.customerId,
            customerInfo: {
                name: req.body.customerName,
                phone: req.body.customerPhone,
                address: req.body.customerAddress
            },
            source: req.body.source || 'pos',
            items: saleItems,
            totalAmount,
            tax: tax || 0,
            discount: discount || 0,
            grandTotal: req.body.grandTotal || grandTotal,
            receivedAmount: req.body.receivedAmount || 0,
            subject: req.body.subject,
            documentDate: req.body.documentDate,
            dueDate: req.body.dueDate,
            notes: req.body.notes,
            status: req.body.status || 'Pending'
        });

        const createdSale = await sale.save();
        res.status(201).json(createdSale);

    } catch (error) {
        res.status(500).json({ message: 'Sale failed', error: error.message });
    }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private/Admin
const getSales = async (req, res) => {
    try {
        let query = {};
        // If not admin/pharmacist, only show their own sales
        if (req.user.role !== 'admin' && req.user.role !== 'pharmacist') {
            query = { customer: req.user._id };
        }
        const sales = await Sale.find(query).populate('pharmacist', 'username').populate('items.medicine', 'name');
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a sale
// @route   PUT /api/sales/:id
// @access  Private/Pharmacist
const updateSale = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (!sale) return res.status(404).json({ message: 'Sale not found' });

        const { items, customerInfo, status, subject, dueDate, notes } = req.body;

        if (items) {
            let totalAmount = 0;
            const saleItems = [];
            // Note: In a real app we might want to handle stock reversal for deleted items
            for (const item of items) {
                const subtotal = (item.price || item.medicine.price) * item.quantity;
                totalAmount += subtotal;
                saleItems.push({
                    medicine: item.medicine._id || item.medicine,
                    quantity: item.quantity,
                    price: item.price || item.medicine.price,
                    subtotal
                });
            }
            sale.items = saleItems;
            sale.totalAmount = totalAmount;
            sale.grandTotal = totalAmount + (sale.tax || 0) - (sale.discount || 0);
        }

        if (customerInfo) sale.customerInfo = customerInfo;
        if (status) sale.status = status;
        if (subject) sale.subject = subject;
        if (dueDate) sale.dueDate = dueDate;
        if (notes) sale.notes = notes;

        const updatedSale = await sale.save();
        res.json(updatedSale);
    } catch (error) {
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
};

const convertToInvoice = async (req, res) => {
    const { salesOrderIds, customerDetails, metadata, dueDate, documentDate } = req.body;

    if (!salesOrderIds || salesOrderIds.length === 0) {
        return res.status(400).json({ message: 'No sales orders selected' });
    }

    try {
        const orders = await Sale.find({ _id: { $in: salesOrderIds } });
        
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Sales orders not found' });
        }

        let combinedItems = [];
        let totalAmount = 0;
        let tax = 0;
        let discount = 0;

        for (const order of orders) {
            combinedItems = [...combinedItems, ...order.items];
            totalAmount += order.totalAmount;
            tax += (order.tax || 0);
            discount += (order.discount || 0);

            // Mark individual orders as Closed/Invoiced
            order.status = 'Invoiced';
            await order.save();
        }

        const grandTotal = totalAmount + tax - discount;

        const invoice = new Sale({
            invoiceNumber: `INV-${Date.now()}`,
            pharmacist: req.user._id,
            customer: orders[0].customer, // Assuming same customer as validated on frontend
            customerInfo: {
                name: customerDetails.displayName || customerDetails.name,
                phone: customerDetails.mobileNo || customerDetails.phone,
                address: `${customerDetails.lane1 || ''} ${customerDetails.lane2 || ''} ${customerDetails.city || ''}`.trim()
            },
            status: 'Completed',
            items: combinedItems,
            totalAmount,
            tax,
            discount,
            grandTotal,
            dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            documentDate: documentDate || new Date(),
            notes: `Converted from Sales Orders: ${orders.map(o => o.invoiceNumber).join(', ')}`
        });

        const createdInvoice = await invoice.save();

        // Automatically log income if Completed (assuming full payment for now or tracking as income)
        const transaction = new Transaction({
            type: 'Income',
            category: 'Sale',
            amount: grandTotal,
            referenceId: createdInvoice._id,
            onModel: 'Sale',
            description: `Invoice #${createdInvoice.invoiceNumber} generated from orders`
        });
        await transaction.save();

        res.status(201).json(createdInvoice);

    } catch (error) {
        res.status(500).json({ message: 'Conversion failed', error: error.message });
    }
};

module.exports = { createSale, getSales, updateSale, convertToInvoice };
