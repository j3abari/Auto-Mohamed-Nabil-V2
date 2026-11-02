import React from 'react';
import { MapPin, Phone, MessageCircle, Clock, ShieldCheck, Car, Heart, ExternalLink } from 'lucide-react';
import { SHOWROOM_CONTACT } from '../services/api';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-dark-950 border-t border-white/10 pt-16 pb-8 text-gray-400 text-xs">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.jpg"
                alt="سوق أوتو محمد نبيل"
                className="w-12 h-12 rounded-full object-cover border-2 border-brand-orange shadow-brand shrink-0"
              />
              <div>
                <div className="text-lg font-black text-white">سوق أوتو محمد نبيل</div>
                <div className="text-[10px] text-gray-500 font-bold">M. NABIL MOTORS • SINCE 2007</div>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed text-xs">
              المعرض الأول لتجارة جميع أنواع السيارات المستعملة والكسر زيرو بميت غمر والدقهلية. فحص فني معتمد، تقسيط مباشر وبنكي، وأفضل أسعار السوق.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>فحص فابريكة معتمد لكل سيارة</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white">روابط سريعة</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#hero" className="hover:text-brand-orange transition-colors">الصفحة الرئيسية</a></li>
              <li><a href="#inventory" className="hover:text-brand-orange transition-colors">أسطول السيارات المتاحة</a></li>
              <li><a href="#calculator" className="hover:text-brand-orange transition-colors">حاسبة التقسيط والأقساط</a></li>
              <li><a href="#inspection" className="hover:text-brand-orange transition-colors">معايير الفحص المعتمد</a></li>
              <li><a href="#why-us" className="hover:text-brand-orange transition-colors">لماذا أوتو محمد نبيل</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white">بيانات الاتصال المباشر</h4>
            <div className="space-y-2.5">
              <a
                href={SHOWROOM_CONTACT.phoneHref}
                className="flex items-center gap-2 text-white hover:text-brand-orange transition-colors font-bold"
                dir="ltr"
              >
                <Phone className="w-4 h-4 text-brand-orange" />
                <span>{SHOWROOM_CONTACT.phoneDisplay}</span>
              </a>

              <a
                href={SHOWROOM_CONTACT.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                dir="ltr"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{SHOWROOM_CONTACT.whatsappDisplay} (واتساب)</span>
              </a>

              <div className="flex items-start gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                <span>{SHOWROOM_CONTACT.address}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                <span>{SHOWROOM_CONTACT.workingHours}</span>
              </div>
            </div>
          </div>

          {/* Map & Directions */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white">زيارة مقر المعرض</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              يسعدنا استقبالكم يومياً في معرضنا بميت غمر لمعاينة السيارات وتجربتها على أرض الواقع.
            </p>
            <a
              href="https://maps.google.com/?q=30.7183,31.2617"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-all"
            >
              <MapPin className="w-4 h-4 text-brand-orange" />
              <span>الاتجاهات على خرائط Google</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            جميع الحقوق محفوظة © {currentYear} سوق أوتو محمد نبيل للسيارات
          </div>
          <div className="flex items-center gap-1">
            <span>مدعوم ومطور بواسطة</span>
            <span className="text-white font-bold">Performax 1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
