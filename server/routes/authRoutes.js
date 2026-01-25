const express = require('express');
const { loginUser, registerUser, getUsers, updateUserProfile } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/login', loginUser);
router.post('/register', protect, admin, registerUser); // Only admin can register new users (or make public for customers if needed)
router.get('/users', protect, admin, getUsers);
router.route('/profile').put(protect, updateUserProfile);

module.exports = router;
