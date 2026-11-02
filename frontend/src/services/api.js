import axios from 'axios';

// Live Render backend API (or local if configured)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://auto-mohamed-nabil-v2.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const SHOWROOM_CONTACT = {
  name: 'سوق أوتو محمد نبيل للسيارات',
  established: '2007',
  phone: '01201298587',
  phoneDisplay: '01201298587',
  phoneHref: 'tel:01201298587',
  whatsapp: '201107108185',
  whatsappDisplay: '01107108185',
  whatsappLink: 'https://wa.me/201107108185',
  address: 'طريق ميت غمر الزقازيق - بجوار بنك قناة السويس، ميت غمر، الدقهلية',
  workingHours: 'يومياً من 11:00 صباحاً حتى 11:00 مساءً',
};

// Cars API
export async function fetchCars(params = {}) {
  try {
    const res = await api.get('/cars', { params });
    if (res.data && res.data.success) {
      return res.data;
    }
    return { data: [], pagination: {} };
  } catch (error) {
    console.warn('[API] Failed to fetch cars from backend, using fallback data:', error.message);
    return { data: FALLBACK_CARS, pagination: { totalCount: FALLBACK_CARS.length } };
  }
}

export async function fetchFeaturedCars() {
  try {
    const res = await api.get('/cars/featured');
    if (res.data && res.data.success) {
      return res.data.data;
    }
    return FALLBACK_CARS;
  } catch (error) {
    console.warn('[API] Failed to fetch featured cars:', error.message);
    return FALLBACK_CARS;
  }
}

export async function fetchCarBySlug(slug) {
  try {
    const res = await api.get(`/cars/${slug}`);
    if (res.data && res.data.success) {
      return res.data.data;
    }
    return null;
  } catch (error) {
    console.error(`[API] Failed to fetch car ${slug}:`, error.message);
    return FALLBACK_CARS.find(c => c.slug === slug) || null;
  }
}

// Inquiries API
export async function submitInquiry(inquiryData) {
  try {
    const res = await api.post('/inquiries', inquiryData);
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'حدث خطأ أثناء إرسال الاستفسار، يرجى المحاولة لاحقاً أو التواصل عبر الواتساب مباشرة';
    throw new Error(msg);
  }
}

// Fallback Cars Data from old website (6 verified vehicles)
export const FALLBACK_CARS = [
  {
    id: "mercedes-c200-2022",
    slug: "mercedes-c200-2022",
    make: "Mercedes-Benz",
    model: "C200 AMG",
    year: 2022,
    variant: "مرسيدس بنز C200 AMG",
    body_type: "سيدان فارهة",
    price: 2850000,
    original_price: 2990000,
    mileage: 28000,
    fuel_type: "petrol",
    transmission: "automatic",
    engine_cc: 1500,
    horsepower: 204,
    color: "رمادي سيلينيت ميتاليك",
    condition: "certified",
    status: "available",
    is_featured: true,
    inspection_score: "96%",
    description: "مرسيدس بنز C200 الفئة الرياضية AMG موديل 2022 بحالة نادرة كسر زيرو فابريكة بالكامل من الإكصدام للإكصدام. شاشة MBUX العملاقة وباقة AMG الرياضية كاملة.",
    features: [
      "باقة AMG الرياضية الكاملة (إكصدامات وعتب وجنوط 18)",
      "فتحة سقف بانوراما كهربائية بالكامل",
      "شاشة ملاحة MBUX فائقة الدقة بنظام المساعد الصوتي",
      "نظام إضاءة محيطية تفاعلية Ambient Light 64 لون",
      "كاميرا خلفية وحساسات ركن 360 درجة"
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=85&auto=format&fit=crop", alt: "مرسيدس C200 AMG" },
      { url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&q=85&auto=format&fit=crop", alt: "جنوط AMG" },
      { url: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&q=85&auto=format&fit=crop", alt: "الصالون الداخلي" }
    ]
  },
  {
    id: "bmw-320i-2021",
    slug: "bmw-320i-2021",
    make: "BMW",
    model: "320i M-Sport",
    year: 2021,
    variant: "بي إم دابليو 320i M-Sport",
    body_type: "سيدان رياضية",
    price: 2450000,
    original_price: 2550000,
    mileage: 39000,
    fuel_type: "petrol",
    transmission: "automatic",
    engine_cc: 2000,
    horsepower: 184,
    color: "أزرق بورتيماو ميتاليك",
    condition: "certified",
    status: "available",
    is_featured: true,
    inspection_score: "95%",
    description: "بي إم دابليو الفئة الثالثة 320i بباقة M-Sport الرياضية الأصلية موديل 2021. فابريكة بالكامل وصيانات دورية بالتوكيل.",
    features: [
      "باقة M-Sport الكاملة (شاسيه رياضي ومقود M وجنوط 18)",
      "نظام BMW Live Cockpit Professional بشاشة رقمية بالكامل",
      "مقاعد رياضية جلدية أصلية باللون البني الكوجناك",
      "نظام إضاءة LED المتكيف ونظام صوتي Hi-Fi عالي النقاء"
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=85&auto=format&fit=crop", alt: "BMW 320i M-Sport" },
      { url: "https://images.unsplash.com/photo-1600790142055-619df03207e6?w=1200&q=85&auto=format&fit=crop", alt: "مقصورة القيادة" }
    ]
  },
  {
    id: "toyota-fortuner-2023",
    slug: "toyota-fortuner-2023",
    make: "Toyota",
    model: "فورتشنر 4x4",
    year: 2023,
    variant: "تويوتا فورتشنر 4.0L V6",
    body_type: "SUV عائلية 7 ركاب",
    price: 3100000,
    original_price: 3250000,
    mileage: 19000,
    fuel_type: "petrol",
    transmission: "automatic",
    engine_cc: 4000,
    horsepower: 235,
    color: "أبيض لؤلؤي",
    condition: "certified",
    status: "available",
    is_featured: true,
    inspection_score: "98%",
    description: "تويوتا فورتشنر موديل 2023 الفئة الأعلى محرك 4.0 لتر دفع رباعي 4x4. 7 مقاعد مريحة كسر زيرو بحالة الوكالة تماماً.",
    features: [
      "محرك 6 سلندر 4000cc جبار مع دفع رباعي حقيقي ودوفلوك",
      "7 مقاعد جلد طبيعي رحبة للعائلات والسفر",
      "شنطة كهربائية وشاشة لمس تدعم Apple CarPlay و Android Auto",
      "كاميرات 360 درجة وحساسات أمامية وخلفية"
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=85&auto=format&fit=crop", alt: "تويوتا فورتشنر 2023" }
    ]
  },
  {
    id: "hyundai-tucson-2023",
    slug: "hyundai-tucson-2023",
    make: "Hyundai",
    model: "توسان NX4 Turbo",
    year: 2023,
    variant: "هيونداي توسان الجيل الجديد",
    body_type: "SUV كروس أوفر",
    price: 1780000,
    original_price: 1850000,
    mileage: 22000,
    fuel_type: "petrol",
    transmission: "automatic",
    engine_cc: 1600,
    horsepower: 180,
    color: "برونزي داكن ميتاليك",
    condition: "certified",
    status: "available",
    is_featured: true,
    inspection_score: "97%",
    description: "هيونداي توسان الجيل الحديث NX4 بمحرك 1.6 لتر تيربو. أعلى فئة مع إضاءة أمامية خفية في الشبك وتصميم مستقبلي.",
    features: [
      "شاشتان بانوراما 10.25 بوصة للملاحة والعدادات الرقمية",
      "نقل سرعات بأزرار Shift-by-Wire الإلكتروني",
      "فتحة سقف بانوراما واسعة ومقاعد كهربائية مع تبريد",
      "نظام تثبيت سرعة ذكي وحفظ المسار"
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&q=85&auto=format&fit=crop", alt: "هيونداي توسان NX4" }
    ]
  },
  {
    id: "audi-q5-2022",
    slug: "audi-q5-2022",
    make: "Audi",
    model: "Q5 S-Line Quattro",
    year: 2022,
    variant: "أودي Q5 S-Line كواترو",
    body_type: "SUV رياضية فارهة",
    price: 2950000,
    original_price: 3100000,
    mileage: 36000,
    fuel_type: "petrol",
    transmission: "automatic",
    engine_cc: 2000,
    horsepower: 249,
    color: "أزرق نافارا ميتاليك",
    condition: "certified",
    status: "available",
    is_featured: true,
    inspection_score: "96%",
    description: "أودي Q5 بمواصفات S-Line الرياضية ونظام الدفع الكلي كواترو Quattro الأسطوري. فخامة ألمانية استثنائية وثبات مذهل.",
    features: [
      "دفع رباعي دائم Quattro مع نظام تعليق تفاعلي ذكي",
      "عدادات أودي الرقمية Audi Virtual Cockpit Plus",
      "نظام صوتي فاخر Bang & Olufsen 3D Sound",
      "إضاءة Matrix LED ذكية مع إشارات ديناميكية متتابعة"
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200&q=85&auto=format&fit=crop", alt: "أودي Q5 S-Line" }
    ]
  },
  {
    id: "kia-sportage-2022",
    slug: "kia-sportage-2022",
    make: "Kia",
    model: "سبورتاج GT-Line",
    year: 2022,
    variant: "كيا سبورتاج GT-Line",
    body_type: "SUV كروس أوفر",
    price: 1650000,
    original_price: 1720000,
    mileage: 41000,
    fuel_type: "petrol",
    transmission: "automatic",
    engine_cc: 1600,
    horsepower: 177,
    color: "رمادي كروم داكن",
    condition: "certified",
    status: "available",
    is_featured: true,
    inspection_score: "95%",
    description: "كيا سبورتاج الفئة الرياضية الأعلى GT-Line. سقف بانوراما، جنوط رياضية 19، وفرش جلد رياضي بحالة الزيرو.",
    features: [
      "شاحن لاسلكي سريع ومقاعد كهربائية مع تدفئة",
      "شنطة خلفية تفتح كهربائياً بمجرد الاقتراب Smart Tailgate",
      "إضاءة Full LED بنمط Ice Cube الشهير",
      "دخول وتشغيل ذكي ببصمة الإصبع والريموت"
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&q=85&auto=format&fit=crop", alt: "كيا سبورتاج GT-Line" }
    ]
  }
];
