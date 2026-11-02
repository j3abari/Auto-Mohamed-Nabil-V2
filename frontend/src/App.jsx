import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import InventorySection from './components/InventorySection';
import PrivateViewingSection from './components/PrivateViewingSection';
import ShowroomServices from './components/ShowroomServices';
import FinanceCalculator from './components/FinanceCalculator';
import InspectionShowcase from './components/InspectionShowcase';
import WhyChooseUs from './components/WhyChooseUs';
import Footer from './components/Footer';
import VehicleDetailPage from './components/VehicleDetailPage';
import InquiryModal from './components/InquiryModal';
import AnnouncementBar from './components/AnnouncementBar';
import MaintenancePage from './components/MaintenancePage';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import { fetchCars, fetchPublicSettings, SHOWROOM_CONTACT, FALLBACK_CARS } from './services/api';
import { getCurrentAdmin, logoutAdmin } from './services/adminApi';
import { MessageCircle, ArrowUp } from 'lucide-react';

// Convert any legacy #hash URL into a clean path (Zero # in URLs)
function normalizeLocationToCleanPath() {
  const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (hash) {
    const hashToPathMap = {
      admin: '/admin',
      login: '/login',
      crm: '/admin',
      inventory: '/inventory',
      viewing: '/viewing',
      services: '/services',
      calculator: '/finance',
      finance: '/finance',
      inspection: '/inspection',
      about: '/about',
      contact: '/contact',
      hero: '/',
    };
    const cleanTarget = hashToPathMap[hash] || `/${hash}`;
    window.history.replaceState({}, '', cleanTarget);
    return cleanTarget;
  }
  const pathname = window.location.pathname || '/';
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/';
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => normalizeLocationToCleanPath());
  const [adminUser, setAdminUser] = useState(() => getCurrentAdmin());

  const [cars, setCars] = useState(FALLBACK_CARS);
  const [loading, setLoading] = useState(true);
  const [inquiryContext, setInquiryContext] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('mnabil_showroom_settings');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Filter state for hero search
  const [heroFilters, setHeroFilters] = useState({
    make: '',
    body_type: '',
    price_max: '',
  });

  // Clean navigation helper (HTML5 History API, zero #)
  const navigate = useCallback((path) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (window.location.pathname !== cleanPath || window.location.hash) {
      window.history.pushState({}, '', cleanPath);
    }
    setCurrentPath(cleanPath);

    // Map clean paths to section IDs when on the main showroom layout
    const sectionMap = {
      '/inventory': 'inventory',
      '/viewing': 'viewing',
      '/services': 'services',
      '/finance': 'calculator',
      '/inspection': 'inspection',
      '/about': 'about',
      '/contact': 'contact',
    };

    const targetSectionId = sectionMap[cleanPath];
    if (targetSectionId) {
      setTimeout(() => {
        const el = document.getElementById(targetSectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Listen to popstate, legacy hashchange, secret staff shortcut (Ctrl+Shift+A), and auth expiry
  useEffect(() => {
    const handleRouteSync = () => {
      const clean = normalizeLocationToCleanPath();
      setCurrentPath(clean);
    };

    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigate('/admin');
      }
    };

    const handleAuthExpired = () => {
      setAdminUser(null);
      navigate('/');
    };

    window.addEventListener('popstate', handleRouteSync);
    window.addEventListener('hashchange', handleRouteSync);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mnabil_auth_expired', handleAuthExpired);
    return () => {
      window.removeEventListener('popstate', handleRouteSync);
      window.removeEventListener('hashchange', handleRouteSync);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mnabil_auth_expired', handleAuthExpired);
    };
  }, [navigate]);

  // Inject custom head code (Meta Pixel, Google Analytics, etc.)
  useEffect(() => {
    if (settings?.custom_head_code && typeof document !== 'undefined') {
      const existing = document.getElementById('mnabil-custom-head-code');
      if (existing) existing.remove();
      const div = document.createElement('div');
      div.id = 'mnabil-custom-head-code';
      div.innerHTML = settings.custom_head_code;
      document.head.appendChild(div);
    }
  }, [settings?.custom_head_code]);

  // Fetch cars & public showroom settings on mount
  useEffect(() => {
    async function loadInventory() {
      setLoading(true);
      try {
        const res = await fetchCars();
        if (res.data && res.data.length > 0) {
          setCars(res.data);
        }
      } catch (err) {
        console.error('Failed to load cars:', err);
      } finally {
        setLoading(false);
      }
    }

    async function loadSettings() {
      try {
        const data = await fetchPublicSettings();
        if (data) {
          setSettings(data);
          try {
            localStorage.setItem('mnabil_showroom_settings', JSON.stringify(data));
          } catch {}
        }
      } catch (err) {
        console.warn('Failed to fetch settings:', err);
      }
    }

    loadInventory();
    loadSettings();

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to target section if user lands directly on /inventory, /viewing, /finance, etc.
  useEffect(() => {
    const sectionMap = {
      '/inventory': 'inventory',
      '/viewing': 'viewing',
      '/services': 'services',
      '/finance': 'calculator',
      '/inspection': 'inspection',
      '/about': 'about',
      '/contact': 'contact',
    };
    const targetId = sectionMap[currentPath];
    if (targetId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [currentPath]);

  // Filter cars based on hero search inputs
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      if (
        heroFilters.make &&
        (car.make || '').toLowerCase() !== heroFilters.make.toLowerCase()
      ) {
        return false;
      }
      if (
        heroFilters.body_type &&
        !(car.body_type || '')
          .toLowerCase()
          .includes(heroFilters.body_type.toLowerCase())
      ) {
        return false;
      }
      if (heroFilters.price_max && car.price > Number(heroFilters.price_max)) {
        return false;
      }
      return true;
    });
  }, [cars, heroFilters]);

  // Available makes for dropdown
  const availableMakes = useMemo(() => {
    const set = new Set();
    cars.forEach((c) => {
      if (c.make) set.add(c.make);
    });
    return Array.from(set);
  }, [cars]);

  const handleHeroSearch = () => {
    navigate('/inventory');
  };

  const handleLogoutAdmin = () => {
    logoutAdmin();
    setAdminUser(null);
    navigate('/');
  };

  // ----------------------------------------------------
  // 0. MAINTENANCE PREVIEW ROUTE (/maintenance-preview)
  // ----------------------------------------------------
  if (currentPath === '/maintenance-preview') {
    return (
      <MaintenancePage
        isPreview={true}
        onBackToAdmin={() => navigate('/admin')}
        onNavigate={navigate}
      />
    );
  }

  // ----------------------------------------------------
  // 1. ADMIN PORTAL & CRM (Clean URLs: /admin, /login, /crm)
  // ----------------------------------------------------
  const isAdminRoute =
    currentPath === '/admin' ||
    currentPath.startsWith('/admin/') ||
    currentPath === '/login' ||
    currentPath === '/crm';

  if (isAdminRoute) {
    if (!adminUser) {
      return (
        <AdminLogin
          onLoginSuccess={(user) => {
            setAdminUser(user);
            navigate('/admin');
          }}
          onSuccess={(user) => {
            setAdminUser(user);
            navigate('/admin');
          }}
          onBackToSite={() => navigate('/')}
          onClose={() => navigate('/')}
        />
      );
    }
    return (
      <AdminDashboard
        user={adminUser}
        adminUser={adminUser}
        onLogout={handleLogoutAdmin}
        onClose={() => navigate('/')}
        onSwitchToSite={() => navigate('/')}
      />
    );
  }

  // ----------------------------------------------------
  // 1.5 MAINTENANCE MODE (Active for non-admin visitors)
  // ----------------------------------------------------
  if (settings?.maintenance_mode && !adminUser) {
    return <MaintenancePage onNavigate={navigate} />;
  }

  // ----------------------------------------------------
  // 2. DEDICATED VEHICLE DOSSIER PAGE (/vehicles/:slug)
  // ----------------------------------------------------
  const isVehicleDetailRoute = currentPath.startsWith('/vehicles/');
  const activeVehicle = (() => {
    if (!isVehicleDetailRoute) return null;
    const slug = decodeURIComponent(currentPath.replace('/vehicles/', '')).trim();
    return (
      cars.find((c) => c.slug === slug || String(c.id) === slug) ||
      FALLBACK_CARS.find((c) => c.slug === slug || String(c.id) === slug) ||
      null
    );
  })();

  const goto = (p) => (e) => { e.preventDefault(); navigate(p); };
  const selectCar = (car) => navigate(`/vehicles/${car.slug || car.id}`);
  const inquireCar = (car) => setInquiryContext({ carId: car.id, title: `استفسار عن ${car.make} ${car.model}` });
  const crumb = (label) => (
    <div className="bg-[#f4f0e6] border-b border-black/[0.07] py-3.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-[#4b5563]">
        <a href="/" onClick={goto('/')} className="hover:text-[#c2602b]">الرئيسية</a>
        <span>/</span>
        <span className="text-[#1f2937] font-bold">{label}</span>
      </div>
    </div>
  );
  const renderPage = () => {
    switch (currentPath) {
      case '/inventory':
        return (<>{crumb('أسطول المعرض')}<InventorySection cars={filteredCars} loading={loading} onSelectCar={selectCar} onInquire={inquireCar} /></>);
      case '/viewing':
        return (<>{crumb('حجز معاينة')}<PrivateViewingSection cars={cars} /></>);
      case '/services':
        return (<>{crumb('خدمات المعرض')}<ShowroomServices /></>);
      case '/finance':
        return (<>{crumb('حاسبة التمويل')}<FinanceCalculator onOpenInquiry={(ctx) => setInquiryContext(ctx || {})} /></>);
      case '/inspection':
        return (<>{crumb('الفحص المعتمد')}<InspectionShowcase onOpenInquiry={(ctx) => setInquiryContext(ctx || {})} /></>);
      case '/about':
        return (<>{crumb('عن المعرض')}<WhyChooseUs /></>);
      case '/contact':
        return (<>{crumb('موقعنا')}<section className="py-20"><div className="max-w-3xl mx-auto px-4 text-center space-y-4"><h2 className="text-3xl font-bold text-[#1f2937]">تفضل بزيارة صالة العرض</h2><p className="text-[#4b5563]">{SHOWROOM_CONTACT.address}</p><p className="text-[#4b5563]">{SHOWROOM_CONTACT.workingHours}</p><div className="flex justify-center gap-3 pt-4"><a href={SHOWROOM_CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-[#c2602b] text-white font-bold text-sm">الاتجاهات على الخريطة</a><a href={`tel:${SHOWROOM_CONTACT.phone}`} className="px-6 py-3 rounded-xl border border-black/[0.07] text-[#1f2937] font-bold text-sm">اتصال مباشر</a></div></div></section></>);
      default:
        return (<>
          <HeroSection filters={heroFilters} setFilters={setHeroFilters} onSearchSubmit={handleHeroSearch} availableMakes={availableMakes} onNavigate={navigate} />
          <InventorySection cars={filteredCars.slice(0, 6)} loading={loading} onSelectCar={selectCar} onInquire={inquireCar} />
          <div className="text-center pb-16"><a href="/inventory" onClick={goto('/inventory')} className="inline-flex px-8 py-3.5 rounded-xl bg-[#c2602b] hover:bg-[#a24d1f] text-white font-bold text-sm">عرض كل الأسطول</a></div>
          <ShowroomServices />
          <WhyChooseUs />
        </>);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#faf8f3] text-[#1f2937] font-sans selection:bg-[#c2602b] selection:text-white"
      dir="rtl"
    >
      {/* Announcement Bar with Countdown (Exact Dr Mahmoud Feature) */}
      <AnnouncementBar settings={settings} />

      {/* Luxury Sticky Navbar (Clean Paths, Zero #) */}
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenInquiry={(ctx) => setInquiryContext(ctx || {})}
      />

      {isVehicleDetailRoute ? (
        <main>
          <VehicleDetailPage
            car={activeVehicle}
            allCars={cars}
            onNavigate={navigate}
            onInquire={(ctx) => setInquiryContext(ctx)}
          />
        </main>
      ) : (
        <main>{renderPage()}</main>
      )}

      {/* 8. Luxury Footer (Clean Paths, Zero #, Zero Admin Leaks) */}
      <Footer onNavigate={navigate} />

      {/* Inquiry Modal */}
      {inquiryContext && (
        <InquiryModal
          context={inquiryContext}
          cars={cars}
          onClose={() => setInquiryContext(null)}
        />
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col items-center gap-3">
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-11 h-11 rounded-full bg-[#ffffff]/90 border border-black/[0.07] text-[#1f2937] hover:text-[#c2602b] hover:border-[#c2602b]/50 shadow-xl flex items-center justify-center transition-all backdrop-blur-md"
            aria-label="العودة لأعلى الصفحة"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        <a
          href={`https://wa.me/${SHOWROOM_CONTACT.whatsapp}?text=${encodeURIComponent(
            'مرحباً، أود الاستفسار عن سيارات المعرض المتاحة.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="relative group p-3.5 rounded-full bg-[#c2602b] hover:bg-[#c2602b] text-white shadow-2xl shadow-[#c2602b]/50 hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
          title="تواصل مباشرة عبر واتساب"
          aria-label="محادثة واتساب مباشرة"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#faf8f3] animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#faf8f3]" />
        </a>
      </div>

      {/* Floating Admin Maintenance Mode Alert Badge (Exact Dr Mahmoud Behavior) */}
      {settings?.maintenance_mode && adminUser && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#991b1b',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '14px',
            boxShadow: '0 12px 35px rgba(0,0,0,0.45)',
            zIndex: 999999,
            fontFamily: "'Alexandria', sans-serif",
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '2px solid #fca5a5',
          }}
        >
          <span>⚠️ وضع الصيانة مفعل للزوار حالياً! (الموقع يفتح للإدارة فقط)</span>
          <button
            onClick={() => navigate('/maintenance-preview')}
            style={{
              background: '#ffffff',
              color: '#991b1b',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            معاينة كما يراه الزوار ↗
          </button>
        </div>
      )}
    </div>
  );
}
