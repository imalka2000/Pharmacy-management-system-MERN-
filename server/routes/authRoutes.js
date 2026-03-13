const express = require('express');
const { loginUser, registerUser, getUsers, updateUserProfile } = require('../controllers/authController');
const { protect, admin, pharmacist } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/login', loginUser);
router.post('/signup', registerUser); // Public registration
router.post('/register', protect, admin, registerUser); // Admin creation of users
router.get('/users', protect, pharmacist, getUsers);
router.route('/profile').put(protect, updateUserProfile);

module.exports = router;
