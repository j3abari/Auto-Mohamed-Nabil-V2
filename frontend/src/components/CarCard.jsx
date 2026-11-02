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
    <div className="luxury-card rounded-2xl overflow-hidden flex flex-col group relative border border-black/[0.07] hover:border-[#c2602b]/40 transition-all duration-300">
      {/* Top Media & Badges */}
      <a
        href={cleanCarUrl}
        onClick={handleOpenCar}
        className="relative h-60 sm:h-64 overflow-hidden bg-[#f4f0e6] block cursor-pointer"
      >
        <img
          src={primaryImage}
          alt={`${car.make} ${car.model}`}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f3] via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 right-3 flex flex-wrap gap-2 z-10">
          <span className="badge-orange text-[0.6875rem] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3 text-[#c2602b]" />
            <span>فابريكا بالكامل</span>
          </span>
          <span className="badge-gold text-[0.6875rem] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3 h-3 text-[#c2602b]" />
            <span>حالة الزيرو</span>
          </span>
        </div>

        {/* Inspection Score Pill */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-white/90 border border-black/[0.07] px-2.5 py-1 rounded-lg text-xs backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-[#c2602b]" />
          <span className="text-[#4b5563] text-[0.6875rem]">فحص معتمد:</span>
          <span className="font-extrabold text-[#c2602b] text-[0.6875rem]">
            {car.inspection_score || '98%'}
          </span>
        </div>

        {/* Year Badge */}
        <div className="absolute bottom-3 left-3 z-10 bg-black/60 border border-black/[0.07] px-2.5 py-0.5 rounded-md text-xs font-bold text-white backdrop-blur-md">
          {car.year}
        </div>
      </a>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="mb-2">
            <span className="text-[0.6875rem] font-bold text-[#c2602b] tracking-wider uppercase block">
              {car.make}
            </span>
            <a
              href={cleanCarUrl}
              onClick={handleOpenCar}
              className="text-lg font-bold text-[#1f2937] group-hover:text-[#c2602b] transition-colors cursor-pointer line-clamp-1 block"
            >
              {car.variant || `${car.make} ${car.model}`}
            </a>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-black/[0.07] my-3 text-xs text-[#4b5563]">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[#c2602b] shrink-0" />
              <span className="truncate">
                {car.mileage ? `${car.mileage.toLocaleString()} كم` : 'كسر زيرو'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cog className="w-3.5 h-3.5 text-[#c2602b] shrink-0" />
              <span className="truncate">
                {car.transmission === 'automatic' ? 'أوتوماتيك' : 'يدوي'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-[#c2602b] shrink-0" />
              <span className="truncate">
                {car.engine_cc ? `${car.engine_cc}cc` : 'تربو'}
              </span>
            </div>
          </div>
        </div>

        {/* Price & Instalment */}
        <div>
          <div className="mb-4">
            <span className="text-[0.6875rem] text-[#6b7280] block mb-0.5">
              السعر النقدي (كاش):
            </span>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-black text-[#1f2937]">
                {formatPrice(car.price)}
              </div>
              <span className="text-[0.6875rem] text-[#c2602b] bg-[#c2602b]/10 px-2 py-0.5 rounded border border-[#c2602b]/20">
                قسط: {calcEstimatedInstalment(car.price)} ج.م/شهر
              </span>
            </div>
          </div>

          {/* Dual CTAs (Clean URL, Zero #) */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={cleanCarUrl}
              onClick={handleOpenCar}
              className="w-full py-2.5 px-3 rounded-xl bg-black/5 hover:bg-black/5 text-[#1f2937] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-black/[0.07]"
            >
              <span>ملف وتفاصيل الفحص</span>
              <ArrowLeft className="w-3.5 h-3.5 text-[#c2602b]" />
            </a>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-[#c2602b] hover:bg-[#a24d1f] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#c2602b]/20"
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
