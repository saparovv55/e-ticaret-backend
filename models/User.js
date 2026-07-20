const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Aynı e-posta ile tekrar kayıt olunamaz
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['client', 'admin'], 
    default: 'client' // Yeni kayıt olan herkes varsayılan olarak müşteridir [cite: 31]
  },
  phone: { type: String },
  address: {
    shippingAddress: { type: String }, // Teslimat adresi
    billingAddress: { type: String },  // Fatura adresi
    city: { type: String },
    country: { type: String, default: 'Turkey' }
  },
  addresses: [{
    title: { type: String, required: true }, // Örn: Ev, İş
    addressLine: { type: String, required: true },
    city: { type: String, required: true }
  }],
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);