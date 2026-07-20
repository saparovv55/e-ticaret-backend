const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const products = [
  {
    name: 'Real Madrid 2023/24 İç Saha Forması',
    description: 'Real Madrid yeni sezon iç saha maç forması. Teri dışarı atan AEROREADY teknolojisi.',
    category: 'Forma',
    basePrice: 1500,
    discount: 10,
    stock: 50,
    isFeatured: true,
    images: ['https://9b6e8d-barcin.akinoncloudcdn.com/products/2023/08/15/1138888/65bde273-1035-4645-8f61-92b40656b8f4_size3840x3840_cropCenter.jpg'],
    customizationOptions: { hasSize: true, sizes: ['S', 'M', 'L', 'XL'], canAddNameNumber: true }
  },
  {
    name: 'Samsunspor İç Saha Forması',
    description: 'Samsunsporun yeni sezon iç saha maç forması. %100 geri dönüştürülmüş malzemelerden üretilmiştir.',
    category: 'Forma',
    basePrice: 1500,
    discount: 0,
    stock: 45,
    isFeatured: true,
    images: ['https://www.store55.com.tr/idea/ks/18/myassets/products/182/store-jersey-blue-002.jpg?revision=1782729431'],
    customizationOptions: { hasSize: true, sizes: ['S', 'M', 'L', 'XL'], canAddNameNumber: true }
  },
  {
    name: 'Arsenal 2023/24 Deplasman Forması',
    description: 'Arsenal sarı deplasman forması. Dar kesim, hafif ve nefes alabilen kumaş.',
    category: 'Forma',
    basePrice: 1400,
    discount: 15,
    stock: 30,
    isFeatured: false,
    images: ['https://pbs.twimg.com/media/FOXERc1XwAcv2lr.jpg'],
    customizationOptions: { hasSize: true, sizes: ['S', 'M', 'L', 'XL'], canAddNameNumber: true }
  },
  {
    name: 'Manchester City 2023/24 İç Saha Forması',
    description: 'Şampiyonların tercihi. Manchester City mavi iç saha forması.',
    category: 'Forma',
    basePrice: 1600,
    discount: 0,
    stock: 60,
    isFeatured: true,
    images: ['https://static.ticimax.cloud/60559/uploads/urunresimleri/buyuk/yeni-sezon-manchester-city-2025-ic-sah-34-40b.jpg'],
    customizationOptions: { hasSize: true, sizes: ['S', 'M', 'L', 'XL'], canAddNameNumber: true }
  },
  {
    name: 'Bayern Münih 2023/24 İç Saha Forması',
    description: 'Alman devi Bayern Münih kırmızı iç saha forması.',
    category: 'Forma',
    basePrice: 1450,
    discount: 5,
    stock: 25,
    isFeatured: false,
    images: ['https://static.wixstatic.com/media/abc862_0b5a58edb2894bca9868d5ae04148076~mv2.jpg/v1/fill/w_520,h_520,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/abc862_0b5a58edb2894bca9868d5ae04148076~mv2.jpg'],
    customizationOptions: { hasSize: true, sizes: ['S', 'M', 'L', 'XL'], canAddNameNumber: true }
  },

  {
    name: 'Arjantin milli takım forması',
    description: '2026 dünya kupa forması.',
    category: 'Forma',
    basePrice: 2000,
    discount: 10,
    stock: 50,
    isFeatured: true,
    images: ['https://joseforma.com/wp-content/uploads/2026/06/arj-fan-dep-on.jpg'],
    customizationOptions: { hasSize: true, sizes: ['S', 'M', 'L', 'XL'], canAddNameNumber: true }
  },
  {
    name: 'Galatasaray forması',
    description: 'kalite.',
    category: 'Forma',
    basePrice: 1500,
    discount: 15,
    stock: 50,
    isFeatured: true,
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdfBvTl7YFiadeAQ_sCFQ57OivCvO0o1ClHd3wJ3UwIzjLf6gF7pbFDOil&s=10'],
    customizationOptions: { hasSize: true, sizes: ['S', 'M', 'L', 'XL'], canAddNameNumber: true }
  },
 {
    name: 'Kaleci forması',
    description: '.',
    category: 'Forma',
    basePrice: 1000,
    discount: 0,
    stock: 50,
    isFeatured: true,
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZjzwzIgW8Z2K3ZUy7DjkIp17T0i9cDcr_OdS6ue8nD-S5xI3PVd1PoqCq&s=10'],
    customizationOptions: { hasSize: true, sizes: ['S', 'M', 'L', 'XL'], canAddNameNumber: true }
  },
   {
    name: 'Beşiktaş',
    description: 'en güzel forması.',
    category: 'Forma',
    basePrice: 1200,
    discount: 0,
    stock: 50,
    isFeatured: true,
    images: ['https://foto.sondakika.com/haber/2026/06/29/besiktas-tan-yeni-sezon-formalarina-gorkemli-3-20001760_amp.jpg'],
    customizationOptions: { hasSize: true, sizes: ['S', 'M', 'L', 'XL'], canAddNameNumber: true }
  },
   {
    name: 'Türkiye milli takım forması',
    description: '2026 yeni ',
    category: 'Forma',
    basePrice: 1400,
    discount: 0,
    stock: 50,
    isFeatured: true,
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJ2_4zFdKEDAighVhQMg6wmAq1f447NuUB-t4FK2CJz1tMVOQW_u6VRMk&s=10'],
    customizationOptions: { hasSize: true, sizes: ['S', 'M', 'L', 'XL'], canAddNameNumber: true }
  },
  {
    name: 'Nike Mercurial Superfly 9 Krampon',
    description: 'Yüksek hızlı oyunlar için tasarlandı. Zoom Air birimi sayesinde ekstra esneklik.',
    category: 'Krampon',
    basePrice: 3200,
    discount: 0,
    stock: 20,
    isFeatured: true,
    images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop'],
    customizationOptions: { hasSize: true, sizes: ['41', '42', '43', '44'], canAddNameNumber: false }
  },
  {
    name: 'Adidas X Crazyfast.1 Krampon',
    description: 'Hafifliğiyle öne çıkan Adidas X serisi krampon. Patlayıcı hızlar için ideal.',
    category: 'Krampon',
    basePrice: 3100,
    discount: 20,
    stock: 15,
    isFeatured: true,
    images: ['https://assets.adidas.com/images/w_500,f_auto,q_auto/7399e0b28a02404983c8965d91e9245b_9366/X_Crazyfast_Injection.1_Cim_Saha_Kramponu_Siyah_IG0670_HM1.jpg'],
    customizationOptions: { hasSize: true, sizes: ['41', '42', '43', '44'], canAddNameNumber: false }
  },
  {
    name: 'Puma Future Ultimate Krampon',
    description: 'Oyun kurucular için tasarlandı. FUZIONFIT360 üst yüzey mükemmel uyum sağlar.',
    category: 'Krampon',
    basePrice: 2800,
    discount: 0,
    stock: 25,
    isFeatured: false,
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6FiWCzQIAO4OR7Nu5mj_2IkeIZhsrkJyGUBE5F1KXY352MqpQuGle2b2J&s=10'],
    customizationOptions: { hasSize: true, sizes: ['41', '42', '43', '44'], canAddNameNumber: false }
  },
  {
    name: 'Nike Phantom GX Elite Krampon',
    description: 'Hassas temas ve isabetli şutlar. Gripknit teknolojisi.',
    category: 'Krampon',
    basePrice: 3300,
    discount: 10,
    stock: 10,
    isFeatured: true,
    images: ['https://productimages.hepsiburada.net/s/418/375-375/110000447884301.jpg'],
    customizationOptions: { hasSize: true, sizes: ['41', '42', '43', '44'], canAddNameNumber: false }
  },
  {
    name: 'Mizuno Morelia Neo III Krampon',
    description: 'Gerçek deri, el yapımı Japon kalitesi. Mükemmel konfor ve hafiflik.',
    category: 'Krampon',
    basePrice: 3500,
    discount: 0,
    stock: 8,
    isFeatured: false,
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8AoJd1rP5cAqYyPJLFnUKufOJvUB7T4SiY8lfZtDeGaZDDRsOA0B-sW2J&s=10'],
    customizationOptions: { hasSize: true, sizes: ['41', '42', '43', '44'], canAddNameNumber: false }
  },
  {
    name: 'Profesyonel Antrenman Topu',
    description: 'FIFA Onaylı dikişsiz futbol topu. Tüm hava koşullarına dayanıklı.',
    category: 'Ekipman',
    basePrice: 850,
    discount: 5,
    stock: 100,
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1614632537190-23e4146777db?q=80&w=600&auto=format&fit=crop'],
    customizationOptions: { hasSize: false, sizes: [], canAddNameNumber: false }
  },
  {
    name: 'Kaleci Eldiveni Predator Pro',
    description: 'Mükemmel tutuş sağlayan URG 2.0 lateks avuç içi.',
    category: 'Ekipman',
    basePrice: 1200,
    discount: 0,
    stock: 30,
    isFeatured: false,
    images: ['https://productimages.hepsiburada.net/s/777/375-375/110001153303702.jpg'],
    customizationOptions: { hasSize: true, sizes: ['8', '9', '10', '11'], canAddNameNumber: false }
  },
  {
    name: 'Karbon Fiber Tekmelik',
    description: 'Ultra hafif, maksimum koruma sağlayan karbon fiber tekmelik.',
    category: 'Ekipman',
    basePrice: 450,
    discount: 0,
    stock: 80,
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=600&auto=format&fit=crop'],
    customizationOptions: { hasSize: false, sizes: [], canAddNameNumber: false }
  },
  {
    name: 'Antrenman Konisi Seti (20\'li)',
    description: 'Dayanıklı ve esnek plastikten üretilmiş, farklı renklerde koni seti.',
    category: 'Ekipman',
    basePrice: 200,
    discount: 0,
    stock: 150,
    isFeatured: false,
    images: ['https://m.media-amazon.com/images/I/61hNQvHxnQL.jpg'],
    customizationOptions: { hasSize: false, sizes: [], canAddNameNumber: false }
  },
  {
    name: 'Sporcu Su Matarası 1L',
    description: 'BPA içermeyen, sızdırmaz sporcu suluğu.',
    category: 'Ekipman',
    basePrice: 150,
    discount: 0,
    stock: 200,
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=600&auto=format&fit=crop'],
    customizationOptions: { hasSize: false, sizes: [], canAddNameNumber: false }
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB bağlantısı başarılı. Ürünler temizleniyor...');
    await Product.deleteMany({});
    
    console.log('Yeni ürünler ekleniyor...');
    await Product.insertMany(products);
    
    console.log('Örnek veri başarıyla eklendi!');
    process.exit();
  })
  .catch((err) => {
    console.error('Hata:', err);
    process.exit(1);
  });
