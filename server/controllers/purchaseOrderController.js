const PurchaseOrder = require('../models/PurchaseOrder');
const Medicine = require('../models/Medicine');

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private/Pharmacist
const getPurchaseOrders = async (req, res) => {
    try {
        const orders = await PurchaseOrder.find()
            .populate('supplier', 'name email phone')
            .populate('items.medicine', 'name')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a purchase order
// @route   POST /api/purchase-orders
// @access  Private/Pharmacist
const createPurchaseOrder = async (req, res) => {
    try {
        const { purchaseOrderNumber, supplier, subject, items, totalAmount, dueDate, notes } = req.body;
        
        const order = await PurchaseOrder.create({
            purchaseOrderNumber,
            supplier,
            subject,
            items,
            totalAmount,
            dueDate,
            notes
        });
        
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update purchase order status (e.g., mark as Received)
// @route   PUT /api/purchase-orders/:id
// @access  Private/Pharmacist
const updatePurchaseOrder = async (req, res) => {
    try {
        const order = await PurchaseOrder.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const { status } = req.body;
        
        // If status is changed to Received, we should ideally update stock
        if (status === 'Received' && order.status !== 'Received') {
            for (const item of order.items) {
                const medicine = await Medicine.findById(item.medicine);
                if (medicine) {
                    medicine.quantity += item.quantity;
                    await medicine.save();
                }
            }
        }

        order.status = status || order.status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder
};
