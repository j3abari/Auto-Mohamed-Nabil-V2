import React, { useState } from 'react';
import { X, ShieldCheck, Gauge, Calendar, Fuel, Cog, CheckCircle2, MessageCircle, Phone, Sparkles, MapPin, Share2 } from 'lucide-react';
import { SHOWROOM_CONTACT } from '../services/api';

export default function CarDetailModal({ car, onClose, onInquire }) {
  if (!car) return null;

  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const images = (car.images && car.images.length > 0)
    ? car.images.map(img => typeof img === 'string' ? { url: img } : img)
    : [{ url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85&auto=format&fit=crop' }];

  const formatPrice = (p) => {
    return new Intl.NumberFormat('ar-EG').format(p) + ' ج.م';
  };

  const waMessage = encodeURIComponent(
    `مرحباً سوق أوتو محمد نبيل، أود الاستفسار وحجز موعد معاينة لسيارة ${car.make} ${car.model} موديل ${car.year} (السعر: ${formatPrice(car.price)})`
  );
  const waUrl = `${SHOWROOM_CONTACT.whatsappLink}?text=${waMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-dark-900 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-dark-950">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-orange uppercase">{car.make}</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-400">موديل {car.year}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white">{car.variant || `${car.make} ${car.model}`}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Main Image Gallery */}
          <div className="space-y-3">
            <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden bg-dark-950 border border-white/5">
              <img
                src={images[activeImageIdx]?.url}
                alt={car.model}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-3 right-3 bg-dark-950/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>فحص معتمد فابريكة بالكامل</span>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIdx === idx ? 'border-brand-orange scale-105' : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Key Summary Box */}
          <div className="glass-panel p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-brand-orange/30">
            <div>
              <span className="text-xs text-gray-400 font-semibold block">السعر النقدي (كاش):</span>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {formatPrice(car.price)}
              </div>
              <span className="text-xs text-emerald-400 font-medium mt-1 inline-block">
                متاح أنظمة تقسيط بنكي ومباشر بمقدم يبدأ من 20%
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>استفسر عبر واتساب</span>
              </a>
              <button
                onClick={() => {
                  onClose();
                  onInquire({ type: 'price', carId: car.id, title: `طلب شراء / حجز: ${car.make} ${car.model}` });
                }}
                className="px-5 py-3 rounded-xl bg-brand-orange hover:bg-brand-hover text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-brand transition-all"
              >
                <span>طلب حجز السيارة</span>
              </button>
            </div>
          </div>

          {/* Technical Specifications Grid */}
          <div>
            <h3 className="text-base font-extrabold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-orange" />
              <span>المواصفات الفنية للسيارة</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
              <div className="bg-dark-950 p-3 rounded-xl border border-white/5">
                <span className="text-gray-400 block mb-1">سنة الصنع:</span>
                <span className="font-bold text-white text-sm">{car.year}</span>
              </div>
              <div className="bg-dark-950 p-3 rounded-xl border border-white/5">
                <span className="text-gray-400 block mb-1">الكيلومترات:</span>
                <span className="font-bold text-white text-sm">{car.mileage ? `${car.mileage.toLocaleString()} كم` : 'كسر زيرو'}</span>
              </div>
              <div className="bg-dark-950 p-3 rounded-xl border border-white/5">
                <span className="text-gray-400 block mb-1">سعة المحرك:</span>
                <span className="font-bold text-white text-sm">{car.engine_cc ? `${car.engine_cc} CC` : 'تيربو'}</span>
              </div>
              <div className="bg-dark-950 p-3 rounded-xl border border-white/5">
                <span className="text-gray-400 block mb-1">القوة الحصانية:</span>
                <span className="font-bold text-white text-sm">{car.horsepower ? `${car.horsepower} حصان` : '—'}</span>
              </div>
              <div className="bg-dark-950 p-3 rounded-xl border border-white/5">
                <span className="text-gray-400 block mb-1">ناقل الحركة:</span>
                <span className="font-bold text-white text-sm">{car.transmission === 'automatic' ? 'أوتوماتيك' : 'يدوي'}</span>
              </div>
              <div className="bg-dark-950 p-3 rounded-xl border border-white/5">
                <span className="text-gray-400 block mb-1">نوع الوقود:</span>
                <span className="font-bold text-white text-sm">{car.fuel_type === 'petrol' ? 'بنزين 95' : car.fuel_type}</span>
              </div>
              <div className="bg-dark-950 p-3 rounded-xl border border-white/5">
                <span className="text-gray-400 block mb-1">اللون الخارجي:</span>
                <span className="font-bold text-white text-sm">{car.color || 'مميز'}</span>
              </div>
              <div className="bg-dark-950 p-3 rounded-xl border border-white/5">
                <span className="text-gray-400 block mb-1">حالة الفحص:</span>
                <span className="font-bold text-emerald-400 text-sm">فابريكة 100%</span>
              </div>
            </div>
          </div>

          {/* Highlights & Features */}
          {car.features && car.features.length > 0 && (
            <div>
              <h3 className="text-base font-extrabold text-white mb-3">أبرز تجهيزات السيارة</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {car.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-dark-950 border border-white/5 text-xs text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {car.description && (
            <div>
              <h3 className="text-base font-extrabold text-white mb-2">وصف المعرض</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed bg-dark-950 p-4 rounded-xl border border-white/5">
                {car.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
