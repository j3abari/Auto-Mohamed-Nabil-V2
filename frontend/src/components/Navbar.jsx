import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, MapPin, Menu, X, CalendarCheck, ShieldCheck } from 'lucide-react';
import { SHOWROOM_CONTACT } from '../services/api';

export default function Navbar({ onOpenInquiry }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#0A0C0B]/95 backdrop-blur-xl border-b border-white/8 shadow-2xl shadow-black/60 py-3' 
        : 'bg-[#0A0C0B]/80 backdrop-blur-md border-b border-white/5 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Brand Identity (Right in RTL) */}
          <a href="#" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#FF4B16]/40 p-0.5 bg-black/60 shadow-lg shadow-[#FF4B16]/20 transition-transform duration-300 group-hover:scale-105">
              <img
                src="/images/logo.jpg"
                alt="أوتو محمد نبيل للسيارات"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/favicon.png';
                }}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-[#F1EEE6] group-hover:text-[#FF4B16] transition-colors">
                  أوتو محمد نبيل
                </span>
                <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#FF4B16]/15 text-[#FF4B16] font-semibold border border-[#FF4B16]/30">
                  V2
                </span>
              </div>
              <span className="text-[11px] text-[#B7B9B0] tracking-wider font-light">
                سوق سيارات فاخرة • منذ 2008
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links (Centered) */}
          <nav className="hidden lg:flex items-center gap-8 text-[13.5px] font-medium text-[#B7B9B0]">
            <a href="#inventory" className="hover:text-[#FF4B16] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0.5 after:bg-[#FF4B16] hover:after:w-full after:transition-all">
              أسطول المعرض
            </a>
            <a href="#viewing" className="hover:text-[#FF4B16] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0.5 after:bg-[#FF4B16] hover:after:w-full after:transition-all">
              حجز معاينة VIP
            </a>
            <a href="#services" className="hover:text-[#FF4B16] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0.5 after:bg-[#FF4B16] hover:after:w-full after:transition-all">
              خدمات المعرض
            </a>
            <a href="#calculator" className="hover:text-[#FF4B16] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0.5 after:bg-[#FF4B16] hover:after:w-full after:transition-all">
              حاسبة التمويل
            </a>
            <a href="#inspection" className="hover:text-[#FF4B16] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0.5 after:bg-[#FF4B16] hover:after:w-full after:transition-all">
              فحص 100 نقطة
            </a>
            <a href="#about" className="hover:text-[#FF4B16] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0.5 after:bg-[#FF4B16] hover:after:w-full after:transition-all">
              عن المعرض
            </a>
            <a href="#contact" className="hover:text-[#FF4B16] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0.5 after:bg-[#FF4B16] hover:after:w-full after:transition-all">
              موقعنا
            </a>
          </nav>

          {/* Action CTAs (Left in RTL) */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Phone */}
            <a
              href={`tel:${SHOWROOM_CONTACT.phone}`}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/90 hover:text-white transition-all border border-white/5 text-xs font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-[#FF4B16]" />
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-[#B7B9B0] leading-none">الخط الساخن</span>
                <span dir="ltr" className="font-bold text-[#F1EEE6] leading-tight">{SHOWROOM_CONTACT.phoneFormatted}</span>
              </div>
            </a>

            {/* Direct WhatsApp CTA */}
            <a
              href={`https://wa.me/${SHOWROOM_CONTACT.whatsapp}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن سيارات المعرض المتاحة.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF4B16] hover:bg-[#E03E0F] text-white font-semibold text-xs transition-all shadow-md shadow-[#FF4B16]/25 hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>محادثة واتساب</span>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </a>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href={`https://wa.me/${SHOWROOM_CONTACT.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-[#FF4B16] text-white"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 text-[#B7B9B0] hover:text-white"
              aria-label="القائمة الرئيسية"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0E1110] border-b border-white/10 px-5 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-3 text-sm font-medium text-[#B7B9B0]">
            <a
              href="#inventory"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/5 hover:text-[#FF4B16]"
            >
              أسطول المعرض
            </a>
            <a
              href="#viewing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/5 hover:text-[#FF4B16]"
            >
              حجز معاينة VIP
            </a>
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/5 hover:text-[#FF4B16]"
            >
              خدمات المعرض
            </a>
            <a
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/5 hover:text-[#FF4B16]"
            >
              حاسبة التمويل
            </a>
            <a
              href="#inspection"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/5 hover:text-[#FF4B16]"
            >
              فحص 100 نقطة
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/5 hover:text-[#FF4B16]"
            >
              عن أوتو محمد نبيل
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/5 hover:text-[#FF4B16]"
            >
              موقعنا وساعات العمل
            </a>
          </nav>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            <a
              href={`tel:${SHOWROOM_CONTACT.phone}`}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 text-white font-medium text-xs"
            >
              <Phone className="w-3.5 h-3.5 text-[#FF4B16]" />
              <span dir="ltr">{SHOWROOM_CONTACT.phoneFormatted}</span>
            </a>
            <a
              href={`https://wa.me/${SHOWROOM_CONTACT.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#FF4B16] text-white font-bold text-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>محادثة واتساب مباشرة</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
