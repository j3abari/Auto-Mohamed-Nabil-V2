import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin, Clock, ShieldCheck, Menu, X, Car } from 'lucide-react';
import { SHOWROOM_CONTACT } from '../services/api';

export default function Navbar({ onOpenInquiry, onOpenAdmin }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Top info bar */}
      <div className="bg-dark-900 border-b border-white/5 py-2 px-4 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-gray-300">
              <MapPin className="w-3.5 h-3.5 text-brand-orange" />
              <span>ميت غمر، الدقهلية - بجوار بنك قناة السويس</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span>يومياً 11 ص - 11 م</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange font-bold">
              <ShieldCheck className="w-3 h-3" />
              <span>معرض سيارات معتمد منذ 2007</span>
            </div>

            <a
              href={SHOWROOM_CONTACT.phoneHref}
              className="flex items-center gap-1 text-white hover:text-brand-orange transition-colors font-bold"
              dir="ltr"
            >
              <Phone className="w-3.5 h-3.5 text-brand-orange" />
              <span>{SHOWROOM_CONTACT.phoneDisplay}</span>
            </a>

            <a
              href={SHOWROOM_CONTACT.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">واتساب المعرض</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="glass-nav py-3.5 px-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo / Brand Name */}
          <a href="#" className="flex items-center gap-3 group">
            <img
              src="/images/logo.jpg"
              alt="سوق أوتو محمد نبيل"
              className="w-11 h-11 rounded-full object-cover border-2 border-brand-orange shadow-brand group-hover:scale-105 transition-transform duration-300 shrink-0"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-white tracking-tight">سوق أوتو</span>
                <span className="text-xl font-black text-brand-orange">محمد نبيل</span>
              </div>
              <span className="text-[10px] text-gray-400 font-semibold tracking-wider">M. NABIL MOTORS • SINCE 2007</span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8 font-semibold text-sm text-gray-300">
            <a href="#hero" className="hover:text-brand-orange transition-colors">الرئيسية</a>
            <a href="#inventory" className="hover:text-brand-orange transition-colors">أسطول السيارات</a>
            <a href="#calculator" className="hover:text-brand-orange transition-colors">حاسبة التقسيط</a>
            <a href="#inspection" className="hover:text-brand-orange transition-colors">الفحص المعتمد</a>
            <a href="#why-us" className="hover:text-brand-orange transition-colors">لماذا نحن</a>
            <a href="#contact" className="hover:text-brand-orange transition-colors">موقعنا والتواصل</a>
          </div>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => onOpenInquiry({ type: 'appointment', title: 'حجز موعد معاينة' })}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all duration-200"
            >
              حجز موعد معاينة
            </button>
            <a
              href={SHOWROOM_CONTACT.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-orange to-brand-hover shadow-brand hover:brightness-110 transition-all duration-200"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>تواصل فوري</span>
            </a>

            <button
              onClick={onOpenAdmin}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5"
              title="بوابة إدارة المعرض والـ CRM"
            >
              <ShieldCheck className="w-4 h-4 text-brand-orange" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg focus:outline-none"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-white/10 flex flex-col gap-3 pb-2 text-sm font-semibold">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/5 text-gray-200"
            >
              الرئيسية
            </a>
            <a
              href="#inventory"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/5 text-gray-200"
            >
              أسطول السيارات
            </a>
            <a
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/5 text-gray-200"
            >
              حاسبة التقسيط
            </a>
            <a
              href="#inspection"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/5 text-gray-200"
            >
              الفحص المعتمد
            </a>
            <a
              href="#why-us"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/5 text-gray-200"
            >
              لماذا أوتو محمد نبيل
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/5 text-gray-200"
            >
              موقع المعرض
            </a>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenInquiry({ type: 'appointment', title: 'حجز موعد معاينة' });
                }}
                className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/10"
              >
                حجز موعد معاينة
              </button>
              <a
                href={SHOWROOM_CONTACT.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-white bg-brand-orange hover:bg-brand-hover shadow-brand flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>واتساب المعرض المباشر</span>
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
