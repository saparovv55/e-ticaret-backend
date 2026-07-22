const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// 1. KAYIT OLMA (REGISTER)
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // E-posta adresi sistemde zaten var mı kontrol et
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda.' });
    }

    // Şifreyi hashle (Güvenli hale getir)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Yeni kullanıcıyı oluştur
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone
    });

    await newUser.save();
    res.status(201).json({ message: 'Kullanıcı başarıyla kaydedildi.' });

  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};

// 2. GİRİŞ YAPMA (LOGIN)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı e-posta ile bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Geçersiz e-posta veya şifre.' });
    }

    // Girdiği şifre ile veritabanındaki hashlenmiş şifreyi karşılaştır
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz e-posta veya şifre.' });
    }

    // Şifreler eşleştiyse, koluna takacağımız bilekliği (JWT Token) üretelim
    const token = jwt.sign(
      { id: user._id, role: user.role }, // Token içine saklamak istediğimiz veriler
      process.env.JWT_SECRET,            // .env dosyasındaki gizli anahtarımız
      { expiresIn: '1d' }                // Token'ın ömrü (1 gün)
    );

    // Başarılı yanıtı ve token'ı döndür
    res.status(200).json({
      message: 'Giriş başarılı.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};

// 3. ŞİFREMİ UNUTTUM (FORGOT PASSWORD)
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.' });
    }

    // Token oluştur
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 dakika geçerli
    await user.save();

    // Reset URL
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    
    // E-posta gönderimi (Gerçek SMTP - Gmail)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // port 587 için secure: false olmalıdır
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      },
      family: 4 // Render'daki IPv6 (ENETUNREACH) hatasını çözmek için IPv4 zorla
    });

    const message = {
      from: `"Beka Spor" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Beka Spor Şifre Sıfırlama Talebi",
      text: `Şifrenizi sıfırlamak için şu bağlantıya gidin: \n\n ${resetUrl}`
    };

    await transporter.sendMail(message);
    console.log("Mail gönderildi:", user.email);

    res.status(200).json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' });

  } catch (error) {
    res.status(500).json({ message: 'E-posta gönderilemedi.', error: error.message });
  }
};

// 4. ŞİFREYİ SIFIRLAMA (RESET PASSWORD)
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.body.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş token.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz.' });
  } catch (error) {
    res.status(500).json({ message: 'Şifre güncellenemedi.', error: error.message });
  }
};

// 5. PROFIL GETİR (GET PROFILE)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Profil bilgileri getirilemedi.', error: error.message });
  }
};

// 6. ADRES EKLE (ADD ADDRESS)
exports.addAddress = async (req, res) => {
  try {
    const { title, addressLine, city } = req.body;
    if (!title || !addressLine || !city) {
      return res.status(400).json({ message: 'Lütfen tüm alanları doldurun.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    user.addresses.push({ title, addressLine, city });
    await user.save();

    res.status(201).json({ message: 'Adres başarıyla eklendi.', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Adres eklenemedi.', error: error.message });
  }
};

// 7. ADRES SİL (DELETE ADDRESS)
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
    await user.save();

    res.status(200).json({ message: 'Adres başarıyla silindi.', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Adres silinemedi.', error: error.message });
  }
};