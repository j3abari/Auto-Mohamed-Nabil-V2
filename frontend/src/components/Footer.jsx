import React from 'react';
import { MapPin, Phone, MessageCircle, Clock, ShieldCheck, Car, Heart, ExternalLink } from 'lucide-react';
import { SHOWROOM_CONTACT } from '../services/api';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#070908] border-t border-white/8 text-[#B7B9B0] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/5">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-[#FF4B16]/40 p-0.5 bg-black">
                <img
                  src="/images/logo.jpg"
                  alt="أوتو محمد نبيل"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/favicon.png';
                  }}
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F1EEE6]">أوتو محمد نبيل</h3>
                <p className="text-xs text-[#C9B37E]">SHARAF & PERFORMANCE AUTOMOTIVE</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-[#9EA199]">
              المعرض الرائد في تجارة واستبدال السيارات الفاخرة والألمانية في مصر. نلتزم بأعلى معايير الشفافية، وفحص شامل معتمد 100 نقطة فنية، وأفضل برامج التقسيط البنكي.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FF4B16]/10 text-[#FF4B16] text-[11px] font-semibold border border-[#FF4B16]/25">
                <ShieldCheck className="w-3.5 h-3.5" />
                معتمد ومضمون 100%
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#C9B37E]/10 text-[#C9B37E] text-[11px] font-semibold border border-[#C9B37E]/25">
                خبرة 18+ عاماً
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#C9B37E] font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-0.5 bg-[#C9B37E]" />
              روابط المعرض
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#inventory" className="hover:text-[#FF4B16] transition-colors flex items-center gap-1.5">
                  <span className="text-[#FF4B16]">•</span> أسطول السيارات المتاحة
                </a>
              </li>
              <li>
                <a href="#viewing" className="hover:text-[#FF4B16] transition-colors flex items-center gap-1.5">
                  <span className="text-[#FF4B16]">•</span> حجز معاينة VIP خاصة
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#FF4B16] transition-colors flex items-center gap-1.5">
                  <span className="text-[#FF4B16]">•</span> خدمات المعرض الفاخرة
                </a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-[#FF4B16] transition-colors flex items-center gap-1.5">
                  <span className="text-[#FF4B16]">•</span> حاسبة التقسيط والتمويل
                </a>
              </li>
              <li>
                <a href="#inspection" className="hover:text-[#FF4B16] transition-colors flex items-center gap-1.5">
                  <span className="text-[#FF4B16]">•</span> معايير الفحص المعتمد
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#FF4B16] transition-colors flex items-center gap-1.5">
                  <span className="text-[#FF4B16]">•</span> قصة أوتو محمد نبيل
                </a>
              </li>
            </ul>
          </div>

          {/* Services & Guarantees */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#C9B37E] font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-0.5 bg-[#C9B37E]" />
              الضمان والخدمات
            </h4>
            <ul className="space-y-2.5 text-xs text-[#9EA199]">
              <li className="flex items-start gap-2">
                <span className="text-[#FF4B16] font-bold">✓</span>
                <span>فحص فني شامل 100 نقطة معتمد مع كل سيارة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF4B16] font-bold">✓</span>
                <span>فابريكا بالكامل وخالية من أي حوادث سابقة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF4B16] font-bold">✓</span>
                <span>تقسيط بنكي مباشر بأقل فائدة وأسهل إجراءات</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF4B16] font-bold">✓</span>
                <span>استبدال فوري لسيارتك بأعلى سعر سوقي عادل</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF4B16] font-bold">✓</span>
                <span>تسليم فوري في نفس اليوم مع إنهاء التراخيص</span>
              </li>
            </ul>
          </div>

          {/* Contact & Showroom Visit */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#C9B37E] font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-0.5 bg-[#C9B37E]" />
              تواصل وزيارة المعرض
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF4B16] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#F1EEE6] font-medium block">{SHOWROOM_CONTACT.address}</span>
                  <a
                    href={SHOWROOM_CONTACT.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FF4B16] hover:underline inline-flex items-center gap-1 mt-0.5 text-[11px]"
                  >
                    <span>فتح الموقع على خرائط Google</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </li>

              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FF4B16] flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-[#9EA199] block">الاتصال المباشر:</span>
                  <a href={`tel:${SHOWROOM_CONTACT.phone}`} dir="ltr" className="text-[#F1EEE6] font-bold hover:text-[#FF4B16]">
                    {SHOWROOM_CONTACT.phoneFormatted}
                  </a>
                </div>
              </li>

              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-[#9EA199] block">خدمة العملاء عبر واتساب:</span>
                  <a
                    href={`https://wa.me/${SHOWROOM_CONTACT.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    dir="ltr"
                    className="text-[#F1EEE6] font-bold hover:text-emerald-400"
                  >
                    +20 11 0710 8185
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#C9B37E] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-[#9EA199] block">أوقات العمل اليومية:</span>
                  <span className="text-[#F1EEE6] font-medium">{SHOWROOM_CONTACT.workingHours}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9EA199]">
          <p>© {currentYear} سوق أوتو محمد نبيل للسيارات. جميع الحقوق محفوظة.</p>

          <div className="flex items-center gap-6">
            <a
              href={`https://wa.me/${SHOWROOM_CONTACT.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF4B16] transition-colors"
            >
              واتساب
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF4B16] transition-colors"
            >
              فيسبوك
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF4B16] transition-colors"
            >
              إنستغرام
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF4B16] transition-colors"
            >
              تيك توك
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
