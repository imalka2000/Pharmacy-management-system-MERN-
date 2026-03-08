const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Routes
const path = require('path'); // Add path module

// ...

const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const salesRoutes = require('./routes/salesRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const supplyRequestRoutes = require('./routes/supplyRequestRoutes'); // Import supply requests
const deliveryRoutes = require('./routes/deliveryRoutes'); // Import delivery routes
const { seedAdmin } = require('./controllers/authController');

app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/supply-requests', supplyRequestRoutes); // Mount supply requests
app.use('/api/deliveries', deliveryRoutes); // Mount deliveries

const dirname = path.resolve();
app.use('/uploads', express.static(path.join(dirname, '/uploads'))); // Make uploads folder static


app.get('/', (req, res) => {
    res.send('Pharmacy Management System API is running...');
});

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pharmacy_db');
        console.log('MongoDB Connected (Primary)');
        await seedAdmin();
        startServer();
    } catch (err) {
        console.error('MongoDB Atlas Connection Error:', err.message);
        console.log('Attempting to connect to Local MongoDB...');
        try {
            await mongoose.connect('mongodb://127.0.0.1:27017/pharmacy_db');
            console.log('MongoDB Connected (Local Fallback)');
            await seedAdmin();
            startServer();
        } catch (localErr) {
            console.error('Local MongoDB Connection Error:', localErr.message);
            process.exit(1);
        }
    }
};

const startServer = () => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

connectDB();
