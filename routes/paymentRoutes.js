const express = require('express');
const router = express.Router();
const { 
  createPayment, 
  getOrders, 
  updateOrderStatus,
  getMyOrders
} = require('../controllers/paymentController');
const { protect, adminCheck } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      console.error(error);
    }
  }
  next();
};

// Ödeme ve sipariş oluşturma (Misafir veya Üye)
router.post('/', optionalAuth, createPayment);

// Kullanıcının kendi siparişleri
router.get('/myorders', protect, getMyOrders);

// Admin sipariş yönetimi
router.get('/orders', protect, adminCheck, getOrders);
router.put('/orders/:id/status', protect, adminCheck, updateOrderStatus);

module.exports = router;
