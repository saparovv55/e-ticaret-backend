const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. ADIM: Kullanıcının giriş yapıp yapmadığını (Token kontrolü) doğrulayan koruyucu
exports.protect = async (req, res, next) => {
  let token;

  // İstek başlığında (Headers) Token var mı diye bakıyoruz
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // "Bearer <token_id>" formatında gelen veriden sadece token kısmını alıyoruz
      token = req.headers.authorization.split(' ')[1];

      // Token'ı gizli anahtarımızla çözüyoruz
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Token içindeki ID bilgisinden kullanıcıyı bulup isteğin (req) içine gömüyoruz
      req.user = await User.findById(decoded.id).select('-password'); // Şifreyi dahil etme

      next(); // Her şey yolundaysa bir sonraki aşamaya geçebilirsin komutu
    } catch (error) {
      return res.status(401).json({ message: 'Yetkisiz erişim, token geçersiz.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Yetkisiz erişim, token bulunamadı.' });
  }
};

// 2. ADIM: Giriş yapan kullanıcının ADMIN olup olmadığını kontrol eden koruyucu
exports.adminCheck = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // Kullanıcı admin ise geçişe izin ver
  } else {
    res.status(403).json({ message: 'Bu işlem için Admin yetkisi gerekiyor.' });
  }
};