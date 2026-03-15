const Package = require('../models/Package');
const Sale = require('../models/Sale');
const User = require('../models/User');

// @desc    Create a new package
// @route   POST /api/packages
// @access  Private/Pharmacist
const createPackage = async (req, res) => {
    const { orderIds, notes } = req.body;

    if (!orderIds || orderIds.length === 0) {
        return res.status(400).json({ message: 'No orders selected for packaging' });
    }

    try {
        const orders = await Sale.find({ _id: { $in: orderIds } });
        
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Orders not found' });
        }

        // Use the first order's customer info for the package address
        const primaryOrder = orders[0];

        const packageObj = new Package({
            packageId: `PKG-${Date.now()}`,
            orders: orderIds,
            pharmacist: req.user._id,
            customerInfo: primaryOrder.customerInfo,
            notes
        });

        const createdPackage = await packageObj.save();

        // Update sales status to Packaged
        await Sale.updateMany(
            { _id: { $in: orderIds } },
            { $set: { status: 'Packaged' } }
        );

        res.status(201).json(createdPackage);
    } catch (error) {
        res.status(500).json({ message: 'Package creation failed', error: error.message });
    }
};

// @desc    Get all packages
// @route   GET /api/packages
// @access  Private
const getPackages = async (req, res) => {
    try {
        let query = {};
        
        // If driver, only show theirs
        if (req.user.role === 'driver') {
            query.driver = req.user._id;
        }

        const packages = await Package.find(query)
            .populate('orders')
            .populate('pharmacist', 'username')
            .populate('driver', 'username fullName')
            .sort({ createdAt: -1 });
            
        res.json(packages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Assign driver to package
// @route   PUT /api/packages/:id/assign
// @access  Private/Admin/Pharmacist
const assignDriver = async (req, res) => {
    try {
        const { driverId } = req.body;
        const packageObj = await Package.findById(req.params.id);

        if (packageObj) {
            packageObj.driver = driverId;
            packageObj.status = 'Ready for Pickup';
            const updatedPackage = await packageObj.save();
            res.json(updatedPackage);
        } else {
            res.status(404).json({ message: 'Package not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error assigning driver', error: error.message });
    }
};

// @desc    Update package status
// @route   PUT /api/packages/:id/status
// @access  Private
const updatePackageStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const packageObj = await Package.findById(req.params.id);

        if (packageObj) {
            packageObj.status = status;
            const updatedPackage = await packageObj.save();
            
            // If delivered, mark all associated sales as Completed
            if (status === 'Delivered') {
                await Sale.updateMany(
                    { _id: { $in: packageObj.orders } },
                    { $set: { status: 'Completed' } }
                );
            }
            
            res.json(updatedPackage);
        } else {
            res.status(404).json({ message: 'Package not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating status', error: error.message });
    }
};

module.exports = { createPackage, getPackages, assignDriver, updatePackageStatus };
