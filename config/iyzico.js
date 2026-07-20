const Iyzipay = require('iyzipay');
const dotenv = require('dotenv');

dotenv.config();

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || 'sandbox-api-key', // Çevresel değişkenden gelmiyorsa yedek (gerçek ortamda silinmeli)
  secretKey: process.env.IYZICO_SECRET_KEY || 'sandbox-secret-key',
  uri: 'https://sandbox-api.iyzipay.com'
});

module.exports = iyzipay;
