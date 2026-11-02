import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Gauge,
  Calendar,
  Fuel,
  Cog,
  CheckCircle2,
  MessageCircle,
  Phone,
  ArrowRight,
  Sparkles,
  Calculator,
  CalendarCheck,
  FileCheck,
  MapPin,
} from 'lucide-react';
import { SHOWROOM_CONTACT } from '../services/api';
import CarCard from './CarCard';

export default function VehicleDetailPage({
  car,
  allCars = [],
  onNavigate,
  onInquire,
}) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    setActiveImageIdx(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [car?.id, car?.slug]);

  if (!car) {
    return (
      <div className="py-28 text-center max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#1f2937] mb-3">
          لم يتم العثور على السيارة المطلوبة
        </h2>
        <p className="text-sm text-[#4b5563] mb-6">
          قد تكون السيارة قد تم بيعها أو نقلها من صالة العرض. يمكنك تصفح الأسطول المتاح حالياً.
        </p>
        <a
          href="/inventory"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/inventory');
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c2602b] text-white font-bold text-sm"
        >
          <span>العودة إلى أسطول السيارات</span>
        </a>
      </div>
    );
  }

  const formatPrice = (p) => new Intl.NumberFormat('ar-EG').format(p) + ' ج.م';

  const calcEstimatedInstalment = (price) => {
    const loan = price * 0.7;
    const totalWithInterest = loan * (1 + 0.12 * 3);
    const monthly = Math.round(totalWithInterest / 36);
    return new Intl.NumberFormat('ar-EG').format(monthly);
  };

  const images =
    car.images && car.images.length > 0
      ? car.images
      : [
          {
            url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=85&auto=format&fit=crop',
            alt: `${car.make} ${car.model}`,
          },
        ];

  const currentImage = images[activeImageIdx]?.url || images[0].url;

  const waMessage = encodeURIComponent(
    `مرحباً سوق أوتو محمد نبيل، أود الاستفسار وحجز معاينة لسيارة ${car.make} ${car.model} موديل ${car.year} المعروضة بسعر ${formatPrice(car.price)}`
  );
  const waUrl = `https://wa.me/${SHOWROOM_CONTACT.whatsapp}?text=${waMessage}`;

  const relatedCars = allCars
    .filter((c) => c.id !== car.id && c.slug !== car.slug)
    .slice(0, 3);

  const inspectionPoints = [
    { label: 'حالة الدهان والهيكل الخارجي', value: 'فابريكا بالكامل (100%)' },
    { label: 'سلامة الشاسيه والقوائم', value: 'سليم 100% بدون أي ملاحظات' },
    { label: 'كفاءة المحرك والتيربو', value: 'حالة الزيرو (ممتاز)' },
    { label: 'ناقل الحركة (الفتيس)', value: 'استجابة ناعمة ومثالية 100%' },
    { label: 'منظومة التكييف والكهرباء', value: 'مفحوص بالكمبيوتر بدون أعطال' },
    { label: 'العفشة ونظام التعليق والفرامل', value: 'جاهزية كاملة للسفر والطرق' },
  ];

  return (
    <div className="bg-[#faf8f3] min-h-screen pb-24">
      {/* Breadcrumb Bar (Sharaf Reference Style) */}
      <div className="bg-[#f4f0e6] border-b border-black/[0.07] py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-wrap gap-3 text-xs text-[#4b5563]">
          <div className="flex items-center gap-2">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/');
              }}
              className="hover:text-[#c2602b] transition-colors"
            >
              الرئيسية
            </a>
            <span className="text-[#1f2937]">/</span>
            <a
              href="/inventory"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/inventory');
              }}
              className="hover:text-[#c2602b] transition-colors"
            >
              أسطول المعرض
            </a>
            <span className="text-[#1f2937]">/</span>
            <span className="text-[#1f2937] font-bold">
              {car.variant || `${car.make} ${car.model}`} ({car.year})
            </span>
          </div>

          <a
            href="/inventory"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/inventory');
            }}
            className="inline-flex items-center gap-1.5 text-[#c2602b] hover:text-[#c2602b] font-semibold transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لكل السيارات</span>
          </a>
        </div>
      </div>

      {/* Main Vehicle Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Right / Main Column: Gallery + Dossier (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Main Stage Photo */}
            <div className="luxury-card rounded-2xl overflow-hidden border border-black/[0.07]">
              <div className="relative h-72 sm:h-[420px] bg-[#f4f0e6]">
                <img
                  src={currentImage}
                  alt={car.variant || `${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f3]/80 via-transparent to-black/25" />

                <div className="absolute top-4 right-4 flex flex-wrap gap-2">
                  <span className="badge-orange text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-[#c2602b]" />
                    <span>فابريكا بالكامل • كسر زيرو</span>
                  </span>
                  <span className="badge-gold text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#c2602b]" />
                    <span>فحص معتمد {car.inspection_score || '98%'}</span>
                  </span>
                </div>
              </div>

              {/* Thumbnails Strip */}
              {images.length > 1 && (
                <div className="p-4 bg-[#121513] border-t border-black/[0.07] flex gap-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImageIdx(i)}
                      className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        activeImageIdx === i
                          ? 'border-[#c2602b] scale-105 shadow-md shadow-[#c2602b]/30'
                          : 'border-black/[0.07] opacity-65 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.alt || ''}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Description & Features Dossier */}
            <div className="luxury-card rounded-2xl p-6 sm:p-8 border border-black/[0.07] space-y-6">
              <div>
                <span className="gx-kicker gx-kicker-orange mb-2">
                  ملف السيارة والتجهيزات • Vehicle Dossier
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1f2937] mt-1">
                  نظرة تفصيلية على {car.variant || `${car.make} ${car.model}`}
                </h2>
                <p className="text-sm text-[#4b5563] leading-relaxed mt-3">
                  {car.description ||
                    'سيارة بحالة نادرة كسر زيرو فابريكا بالكامل من الإكصدام للإكصدام، خضعت لفحص فني شامل 100 نقطة في صالة عرض أوتو محمد نبيل وجاهزة للتسليم الفوري.'}
                </p>
              </div>

              {car.features && car.features.length > 0 && (
                <div className="pt-6 border-t border-black/[0.07]">
                  <h3 className="text-base font-bold text-[#1f2937] mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#c2602b]" />
                    <span>أبرز التجهيزات والمواصفات الفاخرة</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {car.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 bg-[#f4f0e6] border border-black/[0.07] p-3.5 rounded-xl text-xs text-[#1f2937]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#c2602b] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 100-Point Certified Inspection Report Card */}
            <div className="luxury-card rounded-2xl p-6 sm:p-8 border border-[#c2602b]/25 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-black/[0.07] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#c2602b]/15 border border-[#c2602b]/30 flex items-center justify-center text-[#c2602b]">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1f2937]">
                      شهادة الفحص الفني المعتمد (100 نقطة)
                    </h3>
                    <p className="text-xs text-[#6b7280]">
                      تقرير فحص موثق من مركز فحص معرض أوتو محمد نبيل
                    </p>
                  </div>
                </div>
                <div className="bg-[#c2602b]/15 border border-[#c2602b]/30 text-[#c2602b] px-4 py-1.5 rounded-xl text-sm font-black">
                  نتيجة الفحص: {car.inspection_score || '98%'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {inspectionPoints.map((pt, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-[#f4f0e6] border border-black/[0.07] flex items-center justify-between text-xs"
                  >
                    <span className="text-[#4b5563]">{pt.label}:</span>
                    <span className="font-bold text-[#c2602b]">{pt.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Left / Sticky Summary Column (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="luxury-card rounded-2xl p-6 sm:p-8 border border-black/[0.07] shadow-2xl space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#c2602b]">
                    {car.make} • {car.body_type || 'سيدان فاخرة'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#c2602b]/15 text-[#c2602b] border border-[#c2602b]/30 text-[0.6875rem] font-bold">
                    متاحة للتسليم الفوري
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#1f2937]">
                  {car.variant || `${car.make} ${car.model}`}
                </h1>
                <p className="text-xs text-[#6b7280] mt-1">
                  موديل {car.year} • اللون: {car.color || 'مميز'}
                </p>
              </div>

              {/* Price & Instalment Box */}
              <div className="p-5 rounded-2xl bg-[#f4f0e6] border border-black/[0.07] space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-[#6b7280]">السعر النقدي (كاش):</span>
                  <span className="text-2xl sm:text-3xl font-black text-[#1f2937]">
                    {formatPrice(car.price)}
                  </span>
                </div>
                <div className="pt-3 border-t border-black/[0.07] flex items-center justify-between text-xs">
                  <span className="text-[#c2602b] font-semibold">
                    القسط الشهري التقديري (بمقدم 30%):
                  </span>
                  <span className="font-bold text-[#c2602b] bg-[#c2602b]/10 px-2.5 py-1 rounded-lg border border-[#c2602b]/25">
                    {calcEstimatedInstalment(car.price)} ج.م / شهرياً
                  </span>
                </div>
              </div>

              {/* 4 Key Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#f4f0e6] border border-black/[0.07] flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#c2602b] shrink-0" />
                  <div>
                    <span className="text-[0.6250rem] text-[#6b7280] block">سنة الصنع</span>
                    <strong className="text-[#1f2937]">{car.year}</strong>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f4f0e6] border border-black/[0.07] flex items-center gap-3">
                  <Gauge className="w-4 h-4 text-[#c2602b] shrink-0" />
                  <div>
                    <span className="text-[0.6250rem] text-[#6b7280] block">المسافة المقطوعة</span>
                    <strong className="text-[#1f2937]">
                      {car.mileage ? `${car.mileage.toLocaleString('ar-EG')} كم` : 'كسر زيرو'}
                    </strong>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f4f0e6] border border-black/[0.07] flex items-center gap-3">
                  <Cog className="w-4 h-4 text-[#c2602b] shrink-0" />
                  <div>
                    <span className="text-[0.6250rem] text-[#6b7280] block">ناقل الحركة</span>
                    <strong className="text-[#1f2937]">
                      {car.transmission === 'automatic' ? 'أوتوماتيك' : 'يدوي'}
                    </strong>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f4f0e6] border border-black/[0.07] flex items-center gap-3">
                  <Fuel className="w-4 h-4 text-[#c2602b] shrink-0" />
                  <div>
                    <span className="text-[0.6250rem] text-[#6b7280] block">المحرك والقوة</span>
                    <strong className="text-[#1f2937]">
                      {car.engine_cc ? `${car.engine_cc}cc` : 'تيربو'}{' '}
                      {car.horsepower ? `• ${car.horsepower} حصان` : ''}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    onInquire({
                      carId: car.id,
                      type: 'test_drive',
                      title: `حجز معاينة خاصة: ${car.make} ${car.model} (${car.year})`,
                    })
                  }
                  className="w-full py-3.5 px-5 rounded-xl bg-[#c2602b] hover:bg-[#a24d1f] text-white font-bold text-sm shadow-xl shadow-[#c2602b]/25 transition-all flex items-center justify-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>حجز موعد معاينة وتجربة قيادة VIP</span>
                </button>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-5 rounded-xl bg-[#c2602b] hover:bg-[#c2602b] text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>تواصل مباشر عبر واتساب حول السيارة</span>
                </a>

                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href="/finance"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('/finance');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-black/5 hover:bg-black/5 border border-black/[0.07] text-xs font-semibold text-[#1f2937] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Calculator className="w-3.5 h-3.5 text-[#c2602b]" />
                    <span>حاسبة التقسيط</span>
                  </a>

                  <a
                    href={`tel:${SHOWROOM_CONTACT.phone}`}
                    className="py-2.5 px-3 rounded-xl bg-black/5 hover:bg-black/5 border border-black/[0.07] text-xs font-semibold text-[#1f2937] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#c2602b]" />
                    <span dir="ltr">{SHOWROOM_CONTACT.phoneFormatted}</span>
                  </a>
                </div>
              </div>

              {/* Showroom Location Note */}
              <div className="pt-4 border-t border-black/[0.07] text-[0.7188rem] text-[#6b7280] flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#c2602b] shrink-0 mt-0.5" />
                <span>
                  السيارة متواجدة حالياً في صالة العرض: {SHOWROOM_CONTACT.address}. متاح الكشف في أي مركز معتمد.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Vehicles */}
        {relatedCars.length > 0 && (
          <div className="mt-20 pt-12 border-t border-black/[0.07]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="gx-kicker gx-kicker-orange mb-2">
                  سيارات مشابهة بالمعرض
                </span>
                <h3 className="text-2xl font-bold text-[#1f2937]">
                  قد يعجبك أيضاً من أسطولنا
                </h3>
              </div>
              <a
                href="/inventory"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/inventory');
                }}
                className="text-xs font-bold text-[#c2602b] hover:underline"
              >
                عرض كل الأسطول ←
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedCars.map((rc) => (
                <CarCard
                  key={rc.id}
                  car={rc}
                  onSelectCar={(c) => onNavigate(`/vehicles/${c.slug || c.id}`)}
                  onInquire={(c) =>
                    onInquire({
                      carId: c.id,
                      title: `استفسار عن ${c.make} ${c.model}`,
                    })
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
