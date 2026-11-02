import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Menu, X } from 'lucide-react';
import { SHOWROOM_CONTACT } from '../services/api';

export default function Navbar({ currentPath = '/', onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e, path) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const navItems = [
    { path: '/', label: 'الرئيسية' },
    { path: '/inventory', label: 'أسطول المعرض' },
    { path: '/viewing', label: 'حجز معاينة VIP' },
    { path: '/services', label: 'خدمات المعرض' },
    { path: '/finance', label: 'حاسبة التمويل' },
    { path: '/inspection', label: 'فحص 100 نقطة' },
    { path: '/about', label: 'عن المعرض' },
    { path: '/contact', label: 'موقعنا' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#faf8f3]/95 backdrop-blur-xl border-b border-black/[0.07] shadow-2xl shadow-black/60 py-3'
          : 'bg-[#faf8f3]/85 backdrop-blur-md border-b border-black/[0.07] py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="flex items-center gap-3 group flex-shrink-0"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#c2602b]/40 p-0.5 bg-black/60 shadow-lg shadow-[#c2602b]/20 transition-transform duration-300 group-hover:scale-105">
              <img
                src="/favicon.png"
                alt="أوتو محمد نبيل للسيارات"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-[#1f2937] group-hover:text-[#c2602b] transition-colors">
                  أوتو محمد نبيل
                </span>
                <span className="text-[0.6250rem] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#c2602b]/15 text-[#c2602b] font-semibold border border-[#c2602b]/30">
                  AUTO
                </span>
              </div>
              <span className="text-[0.6875rem] text-[#4b5563] tracking-wider font-light">
                سوق سيارات فاخرة • منذ 2007
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links (Clean URLs, Zero #) */}
          <nav className="hidden lg:flex items-center gap-6 text-[0.8438rem] font-medium text-[#4b5563]">
            {navItems.map((item) => {
              const isActive =
                item.path === '/'
                  ? currentPath === '/'
                  : currentPath.startsWith(item.path);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleLinkClick(e, item.path)}
                  className={`transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:right-0 after:h-0.5 after:bg-[#c2602b] after:transition-all ${
                    isActive
                      ? 'text-[#c2602b] font-bold after:w-full'
                      : 'hover:text-[#c2602b] after:w-0 hover:after:w-full'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`tel:${SHOWROOM_CONTACT.phone}`}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-black/5 hover:bg-black/5 text-[#1f2937] hover:text-[#1f2937] transition-all border border-black/[0.07] text-xs font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-[#c2602b]" />
              <div className="flex flex-col text-right">
                <span className="text-[0.6250rem] text-[#4b5563] leading-none">الخط الساخن</span>
                <span dir="ltr" className="font-bold text-[#1f2937] leading-tight">
                  {SHOWROOM_CONTACT.phoneFormatted}
                </span>
              </div>
            </a>

            <a
              href={`https://wa.me/${SHOWROOM_CONTACT.whatsapp}?text=${encodeURIComponent(
                'مرحباً، أود الاستفسار عن سيارات المعرض المتاحة.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c2602b] hover:bg-[#a24d1f] text-white font-semibold text-xs transition-all shadow-md shadow-[#c2602b]/25 hover:scale-[1.02]"
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
              className="p-2 rounded-lg bg-[#c2602b] text-white"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-black/5 text-[#4b5563] hover:text-[#1f2937]"
              aria-label="القائمة الرئيسية"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#f4f0e6] border-b border-black/[0.07] px-5 py-6 space-y-4">
          <nav className="flex flex-col gap-2.5 text-sm font-medium text-[#4b5563]">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleLinkClick(e, item.path)}
                className={`py-2 px-3 rounded-lg transition-colors ${
                  currentPath === item.path
                    ? 'bg-[#c2602b]/15 text-[#c2602b] font-bold'
                    : 'hover:bg-black/5 hover:text-[#c2602b]'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-black/[0.07] flex flex-col gap-2.5">
            <a
              href={`tel:${SHOWROOM_CONTACT.phone}`}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-black/5 text-white font-medium text-xs"
            >
              <Phone className="w-3.5 h-3.5 text-[#c2602b]" />
              <span dir="ltr">{SHOWROOM_CONTACT.phoneFormatted}</span>
            </a>
            <a
              href={`https://wa.me/${SHOWROOM_CONTACT.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#c2602b] text-white font-bold text-xs"
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
