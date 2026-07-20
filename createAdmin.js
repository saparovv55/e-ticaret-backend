const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB bağlantısı başarılı.');

    const adminEmail = 'admin@bekaspor.com';
    const adminPassword = 'admin';

    // Admin var mı kontrol et
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Sistemde zaten admin@bekaspor.com adında bir admin var.');
      process.exit(0);
    }

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Admin kullanıcısını oluştur
    const newAdmin = new User({
      name: 'Yönetici (Admin)',
      email: adminEmail,
      password: hashedPassword,
      phone: '05555555555',
      role: 'admin' // Admin yetkisi veriyoruz
    });

    await newAdmin.save();
    console.log('=============================================');
    console.log('✅ Admin hesabı başarıyla oluşturuldu!');
    console.log('E-posta: admin@bekaspor.com');
    console.log('Şifre: admin');
    console.log('=============================================');
    
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
};

createAdmin();
