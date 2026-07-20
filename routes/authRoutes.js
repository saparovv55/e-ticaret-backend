const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// /api/auth/register
router.post('/register', authController.register);

// /api/auth/login
router.post('/login', authController.login);

// /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// /api/auth/reset-password
router.post('/reset-password', authController.resetPassword);

// Profil ve Adres Yönetimi
router.get('/profile', protect, authController.getProfile);
router.post('/addresses', protect, authController.addAddress);
router.delete('/addresses/:id', protect, authController.deleteAddress);

module.exports = router;