const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// .env dosyasındaki değişkenleri yükle
dotenv.config();

const app = express();

// Middleware'ler
app.use(cors());
app.use(express.json()); // Gelen JSON isteklerini okuyabilmek için
// Rotaları Dahil Et
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Rotaları Kullan
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payments', paymentRoutes);

// Veritabanı Bağlantısı (MongoDB)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🚀 MongoDB bağlantısı başarıyla kuruldu.'))
  .catch((err) => console.error('❌ MongoDB bağlantı hatası:', err));

// Test Rotası
app.get('/', (req, res) => {
  res.send('Full-Stack E-Ticaret Backend Sunucusu Çalışıyor!');
});

// Sunucuyu Dinle
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`📡 Sunucu ${PORT} portunda yayında.`);
});