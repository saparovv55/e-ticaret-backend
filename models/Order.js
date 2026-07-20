const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Opsiyonel (Misafir alışverişi olabilir)
  guestEmail: { type: String }, // Misafir alışverişi için
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      // Forma özelleştirmeleri
      customization: {
        size: { type: String },
        name: { type: String },
        number: { type: String }
      }
    }
  ],
  totalPrice: { type: Number, required: true },
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, default: 'Turkey' },
    phone: { type: String, required: true }
  },
  paymentResult: {
    iyzicoPaymentId: { type: String },
    iyzicoConversationId: { type: String },
    status: { type: String }
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
