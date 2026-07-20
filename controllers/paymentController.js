const iyzipay = require('../config/iyzico');
const Iyzipay = require('iyzipay');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Ödeme yap ve sipariş oluştur
// @route   POST /api/payments
// @access  Public (Guest) or Private (User)
exports.createPayment = async (req, res) => {
  try {
    const { items, shippingAddress, cardDetails, buyerDetails, guestEmail } = req.body;

    // 1. Gelen ürün fiyatlarını veritabanından doğrula
    let computedTotal = 0;
    const orderItems = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const dbProduct = await Product.findById(item.product);

      if (!dbProduct) {
        return res.status(404).json({ message: `Ürün bulunamadı: ${item.product}` });
      }
      
      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({ message: `Yetersiz stok: ${dbProduct.name}` });
      }

      // Fiyat hesaplama (İndirim varsa uygula)
      let currentPrice = dbProduct.basePrice;
      if (dbProduct.discount > 0) {
        currentPrice = currentPrice - (currentPrice * (dbProduct.discount / 100));
      }

      computedTotal += currentPrice * item.quantity;

      orderItems.push({
        product: dbProduct._id,
        quantity: item.quantity,
        price: currentPrice,
        customization: item.customization || {}
      });
    }

    // 2. Iyzico Ödeme İsteği Hazırlama
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: Date.now().toString(),
      price: computedTotal.toString(),
      paidPrice: computedTotal.toString(),
      currency: Iyzipay.CURRENCY.TRY,
      installment: '1',
      basketId: `BSK-${Date.now()}`,
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      paymentCard: {
        cardHolderName: cardDetails.cardHolderName,
        cardNumber: cardDetails.cardNumber,
        expireMonth: cardDetails.expireMonth,
        expireYear: cardDetails.expireYear,
        cvc: cardDetails.cvc,
        registerCard: '0'
      },
      buyer: {
        id: req.user ? req.user._id.toString() : 'BY789',
        name: buyerDetails.name,
        surname: buyerDetails.surname,
        gsmNumber: buyerDetails.gsmNumber,
        email: req.user ? req.user.email : guestEmail,
        identityNumber: buyerDetails.identityNumber || '74300864791', // Sandbox için test TC
        lastLoginDate: '2023-10-10 15:12:09',
        registrationDate: '2023-10-10 15:12:09',
        registrationAddress: shippingAddress.address,
        ip: req.ip || '85.34.78.112',
        city: shippingAddress.city,
        country: shippingAddress.country || 'Turkey',
        zipCode: '34732'
      },
      shippingAddress: {
        contactName: shippingAddress.fullName,
        city: shippingAddress.city,
        country: shippingAddress.country || 'Turkey',
        address: shippingAddress.address,
        zipCode: '34742'
      },
      billingAddress: {
        contactName: shippingAddress.fullName,
        city: shippingAddress.city,
        country: shippingAddress.country || 'Turkey',
        address: shippingAddress.address,
        zipCode: '34742'
      },
      basketItems: orderItems.map(item => ({
        id: item.product.toString(),
        name: 'Spor Ürünü', // Gerçek senaryoda dbProduct.name kullanılabilir
        category1: 'Giyim',
        itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        price: item.price.toString()
      }))
    };

    // 3. Iyzico'ya İsteği Gönder
    iyzipay.payment.create(request, async function (err, result) {
      if (err) {
        return res.status(500).json({ message: 'Ödeme sistemi ile iletişim kurulamadı.', error: err });
      }

      if (result.status === 'success') {
        // 4. Ödeme Başarılı: Siparişi Kaydet ve Stokları Düş
        const newOrder = new Order({
          user: req.user ? req.user._id : null,
          guestEmail: !req.user ? guestEmail : null,
          items: orderItems,
          totalPrice: computedTotal,
          shippingAddress,
          paymentResult: {
            iyzicoPaymentId: result.paymentId,
            iyzicoConversationId: result.conversationId,
            status: result.status
          },
          status: 'Processing'
        });

        await newOrder.save();

        // Stok düşme işlemi
        for (let item of orderItems) {
          const dbProduct = await Product.findById(item.product);
          dbProduct.stock -= item.quantity;
          await dbProduct.save();
        }

        res.status(201).json({ message: 'Ödeme başarılı, sipariş oluşturuldu', order: newOrder });
      } else {
        // Ödeme Başarısız
        res.status(400).json({ message: 'Ödeme reddedildi.', error: result.errorMessage });
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Sipariş işlemi sırasında hata oluştu.', error: error.message });
  }
};

// @desc    Kullanıcının kendi siparişlerini getir
// @route   GET /api/payments/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Siparişler getirilirken hata oluştu.', error: error.message });
  }
};

// @desc    Tüm siparişleri getir (Admin)
// @route   GET /api/payments/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Siparişler getirilirken hata oluştu.', error: error.message });
  }
};

// @desc    Sipariş durumunu güncelle (Admin)
// @route   PUT /api/payments/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Sipariş bulunamadı' });

    order.status = req.body.status || order.status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Sipariş durumu güncellenirken hata oluştu.', error: error.message });
  }
};
