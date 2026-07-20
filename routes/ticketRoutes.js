const express = require('express');
const router = express.Router();
const { 
  createTicket, 
  getTickets, 
  updateTicket,
  getMyTickets
} = require('../controllers/ticketController');
const { protect, adminCheck } = require('../middleware/authMiddleware');

// İsteğe bağlı protect kullanımı (Kullanıcı giriş yapmışsa req.user atanır, yapmamışsa geçilir)
// Bunun için özel bir optionalAuth middleware'i yazılabilir veya createTicket içinde halledilebilir.
// Şimdilik POST işlemi tamamen Public, Controller içinde req.headers kontrolü ile kullanıcı ayrımı yapacağız
const setOptionalUser = require('jsonwebtoken'); // Geçici çözüm, standart protect tam korur.
const User = require('../models/User');

const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = setOptionalUser.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      console.error(error);
    }
  }
  next();
};

router.route('/')
  .post(optionalAuth, createTicket)
  .get(protect, adminCheck, getTickets); // Sadece admin tüm biletleri görebilir

router.route('/mytickets').get(protect, getMyTickets);

router.route('/:id')
  .put(protect, adminCheck, updateTicket);

module.exports = router;
