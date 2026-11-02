import React from 'react';
import { ShieldCheck, Gauge, Fuel, Cog, ArrowLeft, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { SHOWROOM_CONTACT } from '../services/api';

export default function CarCard({ car, onSelectCar }) {
  const formatPrice = (p) => {
    return new Intl.NumberFormat('ar-EG').format(p) + ' ج.م';
  };

  const calcEstimatedInstalment = (price) => {
    const loan = price * 0.7;
    const totalWithInterest = loan * (1 + 0.12 * 3);
    const monthly = Math.round(totalWithInterest / 36);
    return new Intl.NumberFormat('ar-EG').format(monthly);
  };

  const primaryImage =
    (car.images && car.images[0]?.url) ||
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85&auto=format&fit=crop';

  const waMessage = encodeURIComponent(
    `مرحباً سوق أوتو محمد نبيل، أود الاستفسار عن سيارة ${car.make} ${car.model} موديل ${car.year} المعروضة بسعر ${formatPrice(car.price)}`
  );
  const waUrl = `https://wa.me/${SHOWROOM_CONTACT.whatsapp}?text=${waMessage}`;
  const cleanCarUrl = `/vehicles/${car.slug || car.id}`;

  const handleOpenCar = (e) => {
    if (e) e.preventDefault();
    if (onSelectCar) {
      onSelectCar(car);
    } else {
      window.history.pushState({}, '', cleanCarUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="luxury-card rounded-2xl overflow-hidden flex flex-col group relative border border-white/8 hover:border-[#FF4B16]/40 transition-all duration-300">
      {/* Top Media & Badges */}
      <a
        href={cleanCarUrl}
        onClick={handleOpenCar}
        className="relative h-60 sm:h-64 overflow-hidden bg-[#0E1110] block cursor-pointer"
      >
        <img
          src={primaryImage}
          alt={`${car.make} ${car.model}`}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C0B] via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 right-3 flex flex-wrap gap-2 z-10">
          <span className="badge-orange text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3 text-[#FF4B16]" />
            <span>فابريكا بالكامل</span>
          </span>
          <span className="badge-gold text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3 h-3 text-[#C9B37E]" />
            <span>حالة الزيرو</span>
          </span>
        </div>

        {/* Inspection Score Pill */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-black/80 border border-white/10 px-2.5 py-1 rounded-lg text-xs backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FF4B16]" />
          <span className="text-[#B7B9B0] text-[11px]">فحص معتمد:</span>
          <span className="font-extrabold text-[#FF4B16] text-[11px]">
            {car.inspection_score || '98%'}
          </span>
        </div>

        {/* Year Badge */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-md text-xs font-bold text-white backdrop-blur-md">
          {car.year}
        </div>
      </a>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="mb-2">
            <span className="text-[11px] font-bold text-[#FF4B16] tracking-wider uppercase block">
              {car.make}
            </span>
            <a
              href={cleanCarUrl}
              onClick={handleOpenCar}
              className="text-lg font-bold text-[#F1EEE6] group-hover:text-[#FF4B16] transition-colors cursor-pointer line-clamp-1 block"
            >
              {car.variant || `${car.make} ${car.model}`}
            </a>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 my-3 text-xs text-[#B7B9B0]">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[#C9B37E] shrink-0" />
              <span className="truncate">
                {car.mileage ? `${car.mileage.toLocaleString()} كم` : 'كسر زيرو'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cog className="w-3.5 h-3.5 text-[#C9B37E] shrink-0" />
              <span className="truncate">
                {car.transmission === 'automatic' ? 'أوتوماتيك' : 'يدوي'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-[#C9B37E] shrink-0" />
              <span className="truncate">
                {car.engine_cc ? `${car.engine_cc}cc` : 'تربو'}
              </span>
            </div>
          </div>
        </div>

        {/* Price & Instalment */}
        <div>
          <div className="mb-4">
            <span className="text-[11px] text-[#9EA199] block mb-0.5">
              السعر النقدي (كاش):
            </span>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-black text-[#F1EEE6]">
                {formatPrice(car.price)}
              </div>
              <span className="text-[11px] text-[#C9B37E] bg-[#C9B37E]/10 px-2 py-0.5 rounded border border-[#C9B37E]/20">
                قسط: {calcEstimatedInstalment(car.price)} ج.م/شهر
              </span>
            </div>
          </div>

          {/* Dual CTAs (Clean URL, Zero #) */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={cleanCarUrl}
              onClick={handleOpenCar}
              className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#F1EEE6] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-white/10"
            >
              <span>ملف وتفاصيل الفحص</span>
              <ArrowLeft className="w-3.5 h-3.5 text-[#C9B37E]" />
            </a>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-[#FF4B16] hover:bg-[#E03E0F] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#FF4B16]/20"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>واتساب مباشر</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
