import React from 'react';
import { ShieldCheck, Gauge, Calendar, Fuel, Cog, ArrowLeft, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { SHOWROOM_CONTACT } from '../services/api';

export default function CarCard({ car, onSelectCar, onInquire }) {
  const formatPrice = (p) => {
    return new Intl.NumberFormat('ar-EG').format(p) + ' ج.م';
  };

  const primaryImage = (car.images && car.images[0]?.url) ||
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85&auto=format&fit=crop';

  const waMessage = encodeURIComponent(
    `مرحباً سوق أوتو محمد نبيل، أود الاستفسار عن سيارة ${car.make} ${car.model} موديل ${car.year} المعروضة بسعر ${formatPrice(car.price)}`
  );
  const waUrl = `${SHOWROOM_CONTACT.whatsappLink}?text=${waMessage}`;

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group relative">
      {/* Top Media & Badges */}
      <div className="relative h-56 sm:h-64 overflow-hidden bg-dark-900 cursor-pointer" onClick={() => onSelectCar(car)}>
        <img
          src={primaryImage}
          alt={`${car.make} ${car.model}`}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 right-3 flex flex-wrap gap-2 z-10">
          <span className="badge-orange text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3 text-brand-orange" />
            <span>كسر زيرو فابريكة</span>
          </span>
          {car.condition && (
            <span className="badge-green text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>فحص معتمد</span>
            </span>
          )}
        </div>

        {/* Inspection Score pill on image */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-dark-950/80 border border-white/10 px-2.5 py-1 rounded-lg text-xs backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-orange" />
          <span className="text-gray-300">تقييم الفحص:</span>
          <span className="font-extrabold text-brand-orange">{car.inspection_score || '96%'}</span>
        </div>

        {/* Year Badge bottom left */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/10 border border-white/10 px-2 py-0.5 rounded-md text-xs font-bold text-white backdrop-blur-md">
          {car.year}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Model Title */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-xs font-semibold text-brand-orange tracking-wider uppercase block">
                {car.make}
              </span>
              <h3
                onClick={() => onSelectCar(car)}
                className="text-lg font-bold text-white group-hover:text-brand-orange transition-colors cursor-pointer line-clamp-1"
              >
                {car.variant || `${car.make} ${car.model}`}
              </h3>
            </div>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 my-3 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-brand-orange shrink-0" />
              <span className="truncate">{car.mileage ? `${car.mileage.toLocaleString()} كم` : 'كسر زيرو'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cog className="w-3.5 h-3.5 text-brand-orange shrink-0" />
              <span className="truncate">{car.transmission === 'automatic' ? 'أوتوماتيك' : 'يدوي'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-brand-orange shrink-0" />
              <span className="truncate">{car.engine_cc ? `${car.engine_cc}cc` : 'تيربو'}</span>
            </div>
          </div>
        </div>

        {/* Price & Actions */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <span className="text-[11px] text-gray-400 block">السعر النقدي (كاش):</span>
              <div className="text-xl font-extrabold text-white">
                {formatPrice(car.price)}
              </div>
            </div>
            {car.original_price && car.original_price > car.price && (
              <div className="text-xs text-gray-500 line-through">
                {formatPrice(car.original_price)}
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelectCar(car)}
              className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-white/10"
            >
              <span>تفاصيل السيارة</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>استفسار واتساب</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
