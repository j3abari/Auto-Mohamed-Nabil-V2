import React from 'react';
import { MapPin, Phone, MessageCircle, Clock, ShieldCheck, ExternalLink } from 'lucide-react';
import { SHOWROOM_CONTACT } from '../services/api';

export default function Footer({ onNavigate }) {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e, path) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <footer id="contact" className="bg-[#efe9db] border-t border-black/[0.07] text-[#4b5563] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-black/[0.07]">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-[#c2602b]/40 p-0.5 bg-black">
                <img
                  src="/favicon.png"
                  alt="أوتو محمد نبيل"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1f2937]">أوتو محمد نبيل</h3>
                <p className="text-xs text-[#c2602b]">LUXURY & CERTIFIED AUTOMOTIVE</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-[#6b7280]">
              المعرض الرائد في تجارة واستبدال السيارات الفاخرة والألمانية في مصر منذ عام 2007. نلتزم بأعلى معايير الشفافية، وفحص شامل معتمد 100 نقطة فنية، وأفضل برامج التقسيط البنكي.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#c2602b]/10 text-[#c2602b] text-[0.6875rem] font-semibold border border-[#c2602b]/25">
                <ShieldCheck className="w-3.5 h-3.5" />
                معتمد ومضمون 100%
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#c2602b]/10 text-[#c2602b] text-[0.6875rem] font-semibold border border-[#c2602b]/25">
                خبرة 18+ عاماً
              </span>
            </div>
          </div>

          {/* Quick Links (Clean Paths, Zero #) */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#c2602b] font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-0.5 bg-[#c2602b]" />
              روابط المعرض
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="/inventory"
                  onClick={(e) => handleLinkClick(e, '/inventory')}
                  className="hover:text-[#c2602b] transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[#c2602b]">•</span> أسطول السيارات المتاحة
                </a>
              </li>
              <li>
                <a
                  href="/viewing"
                  onClick={(e) => handleLinkClick(e, '/viewing')}
                  className="hover:text-[#c2602b] transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[#c2602b]">•</span> حجز معاينة VIP خاصة
                </a>
              </li>
              <li>
                <a
                  href="/services"
                  onClick={(e) => handleLinkClick(e, '/services')}
                  className="hover:text-[#c2602b] transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[#c2602b]">•</span> خدمات المعرض الفاخرة
                </a>
              </li>
              <li>
                <a
                  href="/finance"
                  onClick={(e) => handleLinkClick(e, '/finance')}
                  className="hover:text-[#c2602b] transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[#c2602b]">•</span> حاسبة التقسيط والتمويل
                </a>
              </li>
              <li>
                <a
                  href="/inspection"
                  onClick={(e) => handleLinkClick(e, '/inspection')}
                  className="hover:text-[#c2602b] transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[#c2602b]">•</span> معايير الفحص المعتمد
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  onClick={(e) => handleLinkClick(e, '/about')}
                  className="hover:text-[#c2602b] transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[#c2602b]">•</span> قصة أوتو محمد نبيل
                </a>
              </li>
            </ul>
          </div>

          {/* Services & Guarantees */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#c2602b] font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-0.5 bg-[#c2602b]" />
              الضمان والخدمات
            </h4>
            <ul className="space-y-2.5 text-xs text-[#6b7280]">
              <li className="flex items-start gap-2">
                <span className="text-[#c2602b] font-bold">•</span>
                <span>فحص فني شامل 100 نقطة معتمد مع كل سيارة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c2602b] font-bold">•</span>
                <span>فابريكا بالكامل وخالية من أي حوادث سابقة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c2602b] font-bold">•</span>
                <span>تقسيط بنكي مباشر بأقل فائدة وأسهل إجراءات</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c2602b] font-bold">•</span>
                <span>استبدال فوري لسيارتك بأعلى سعر سوقي عادل</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c2602b] font-bold">•</span>
                <span>تسليم فوري في نفس اليوم مع إنهاء التراخيص</span>
              </li>
            </ul>
          </div>

          {/* Contact & Showroom Visit */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#c2602b] font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-0.5 bg-[#c2602b]" />
              تواصل وزيارة المعرض
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#c2602b] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#1f2937] font-medium block">
                    {SHOWROOM_CONTACT.address}
                  </span>
                  <a
                    href={SHOWROOM_CONTACT.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#c2602b] hover:underline inline-flex items-center gap-1 mt-0.5 text-[0.6875rem]"
                  >
                    <span>فتح الموقع على خرائط Google</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </li>

              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#c2602b] flex-shrink-0" />
                <div>
                  <span className="text-[0.6250rem] text-[#6b7280] block">الاتصال المباشر:</span>
                  <a
                    href={`tel:${SHOWROOM_CONTACT.phone}`}
                    dir="ltr"
                    className="text-[#1f2937] font-bold hover:text-[#c2602b]"
                  >
                    {SHOWROOM_CONTACT.phoneFormatted}
                  </a>
                </div>
              </li>

              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#c2602b] flex-shrink-0" />
                <div>
                  <span className="text-[0.6250rem] text-[#6b7280] block">
                    خدمة العملاء عبر واتساب:
                  </span>
                  <a
                    href={`https://wa.me/${SHOWROOM_CONTACT.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    dir="ltr"
                    className="text-[#1f2937] font-bold hover:text-[#c2602b]"
                  >
                    +20 11 0710 8185
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#c2602b] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[0.6250rem] text-[#6b7280] block">أوقات العمل اليومية:</span>
                  <span className="text-[#1f2937] font-medium">
                    {SHOWROOM_CONTACT.workingHours}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6b7280]">
          <p>© {currentYear} سوق أوتو محمد نبيل للسيارات. جميع الحقوق محفوظة.</p>

          <div className="flex items-center gap-6">
            <a
              href={`https://wa.me/${SHOWROOM_CONTACT.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#c2602b] transition-colors"
            >
              واتساب
            </a>
            <a
              href="/inventory"
              onClick={(e) => handleLinkClick(e, '/inventory')}
              className="hover:text-[#c2602b] transition-colors"
            >
              أسطول السيارات
            </a>
            <a
              href="/viewing"
              onClick={(e) => handleLinkClick(e, '/viewing')}
              className="hover:text-[#c2602b] transition-colors"
            >
              حجز معاينة
            </a>
            <a
              href="/contact"
              onClick={(e) => handleLinkClick(e, '/contact')}
              className="hover:text-[#c2602b] transition-colors"
            >
              تواصل معنا
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
