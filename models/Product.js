const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // Forma, Krampon, Ekipman vs.
  basePrice: { type: Number, required: true },
  discount: { type: Number, default: 0 }, // Yüzdelik indirim (örn: 15)
  stock: { type: Number, required: true },
  isFeatured: { type: Boolean, default: false },
  images: [{ type: String }], // Görsel URL'leri
  
  // Forma için kişiselleştirme ve seçenekler alanı
  customizationOptions: {
    hasSize: { type: Boolean, default: false },
    sizes: [{ type: String }], // ['S', 'M', 'L', 'XL', '42', '43']
    canAddNameNumber: { type: Boolean, default: false } // Sırta isim ve numara (Bekzat 10) yazdırma durumu
  }
}, { timestamps: true }); // Oluşturulma ve güncellenme tarihlerini otomatik tutar

module.exports = mongoose.model('Product', productSchema);