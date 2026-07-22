const Ticket = require('../models/Ticket');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// @desc    Yeni destek bileti oluştur
// @route   POST /api/tickets
// @access  Public (Guest) or Private (User)
exports.createTicket = async (req, res) => {
  try {
    const { subject, message, guestEmail } = req.body;
    
    const ticketData = {
      subject,
      message,
    };

    // Eğer giriş yapmış bir kullanıcıysa user ID'yi ekle
    if (req.user) {
      ticketData.user = req.user._id;
    } else {
      // Misafir ise emaili ekle
      if (!guestEmail) {
        return res.status(400).json({ message: 'Misafir kullanıcıların e-posta adresi girmesi zorunludur.' });
      }
      ticketData.guestEmail = guestEmail;
    }

    const ticket = new Ticket(ticketData);
    const createdTicket = await ticket.save();
    
    res.status(201).json(createdTicket);
  } catch (error) {
    res.status(500).json({ message: 'Bilet oluşturulurken hata oluştu.', error: error.message });
  }
};

// @desc    Kullanıcının kendi biletlerini getir
// @route   GET /api/tickets/mytickets
// @access  Private
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Biletler getirilirken hata oluştu.', error: error.message });
  }
};

// @desc    Tüm biletleri getir
// @route   GET /api/tickets
// @access  Private/Admin
exports.getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({}).populate('user', 'name email');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Biletler getirilirken hata oluştu.', error: error.message });
  }
};

// @desc    Bilet durumunu ve admin cevabını güncelle
// @route   PUT /api/tickets/:id
// @access  Private/Admin
exports.updateTicket = async (req, res) => {
  try {
    const { status, adminReply } = req.body;
    
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Bilet bulunamadı' });
    }

    if (status) ticket.status = status;
    
    // Eğer admin cevabı varsa, bunu e-posta ile gönder
    if (adminReply) {
      ticket.adminReply = adminReply;
      ticket.status = 'Closed'; // Cevap verilince bileti kapat

      // Alıcı e-posta adresini belirle
      let recipientEmail = ticket.guestEmail;
      if (!recipientEmail && ticket.user) {
        const userObj = await User.findById(ticket.user);
        if (userObj) recipientEmail = userObj.email;
      }

      if (recipientEmail) {
        // Send email using Brevo HTTP API (Port 443 - HTTPS) instead of raw SMTP ports
        const brevoPayload = {
          sender: {
            name: "Beka Spor Müşteri Hizmetleri",
            email: process.env.EMAIL_USER // Gmail registered as Brevo sender automatically on signup
          },
          to: [
            {
              email: recipientEmail
            }
          ],
          subject: `Destek Talebi Yanıtı: ${ticket.subject}`,
          textContent: `Merhaba,\n\nDestek talebinize yönelik yöneticimiz tarafından verilen yanıt aşağıdadır:\n\n"${adminReply}"\n\nBizi tercih ettiğiniz için teşekkür ederiz.\nBeka Spor Müşteri Hizmetleri`
        };

        fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json'
          },
          body: JSON.stringify(brevoPayload)
        })
        .then(res => {
          if (!res.ok) {
            return res.text().then(text => { throw new Error(text) });
          }
          return res.json();
        })
        .then(data => console.log(`Destek bileti cevap maili Brevo ile gönderildi: ${recipientEmail}`, data))
        .catch(err => console.error(`Destek bileti mail gönderim hatası (Brevo):`, err.message));
      }
    }

    const updatedTicket = await ticket.save();
    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: 'Bilet güncellenirken hata oluştu.', error: error.message });
  }
};
