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
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import { fetchCars, SHOWROOM_CONTACT, FALLBACK_CARS } from './services/api';
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

  // Listen to popstate, legacy hashchange, and secret staff shortcut (Ctrl+Shift+A)
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

    window.addEventListener('popstate', handleRouteSync);
    window.addEventListener('hashchange', handleRouteSync);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handleRouteSync);
      window.removeEventListener('hashchange', handleRouteSync);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  // Fetch cars on mount
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
    loadInventory();

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
    navigate('/login');
  };

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
  // 2. DEDICATED VEHICLE DOSSIER PAGE (/vehicles/:slug)
  // ----------------------------------------------------
  const isVehicleDetailRoute = currentPath.startsWith('/vehicles/');
  const activeVehicle = useMemo(() => {
    if (!isVehicleDetailRoute) return null;
    const slug = decodeURIComponent(currentPath.replace('/vehicles/', '')).trim();
    return (
      cars.find((c) => c.slug === slug || String(c.id) === slug) ||
      FALLBACK_CARS.find((c) => c.slug === slug || String(c.id) === slug) ||
      null
    );
  }, [isVehicleDetailRoute, currentPath, cars]);

  return (
    <div
      className="min-h-screen bg-[#0A0C0B] text-[#F1EEE6] font-sans selection:bg-[#FF4B16] selection:text-white"
      dir="rtl"
    >
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
        <main>
          {/* 1. Cinematic Luxury Hero */}
          <HeroSection
            filters={heroFilters}
            setFilters={setHeroFilters}
            onSearchSubmit={handleHeroSearch}
            availableMakes={availableMakes}
            onNavigate={navigate}
          />

          {/* 2. Showroom Collection & Inventory */}
          <InventorySection
            cars={filteredCars}
            loading={loading}
            onSelectCar={(car) => navigate(`/vehicles/${car.slug || car.id}`)}
            onInquire={(car) =>
              setInquiryContext({
                carId: car.id,
                title: `استفسار عن ${car.make} ${car.model}`,
              })
            }
          />

          {/* 3. Private Viewing & VIP Test Drive Booking Form */}
          <PrivateViewingSection cars={cars} />

          {/* 4. Showroom Premium Services */}
          <ShowroomServices />

          {/* 5. Finance & Instalment Calculator */}
          <FinanceCalculator
            onOpenInquiry={(ctx) => setInquiryContext(ctx || {})}
          />

          {/* 6. 100-Point Certified Inspection Showcase */}
          <InspectionShowcase
            onOpenInquiry={(ctx) => setInquiryContext(ctx || {})}
          />

          {/* 7. Heritage & Showroom Story */}
          <WhyChooseUs />
        </main>
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
            className="w-11 h-11 rounded-full bg-[#141715]/90 border border-white/10 text-white hover:text-[#FF4B16] hover:border-[#FF4B16]/50 shadow-xl flex items-center justify-center transition-all backdrop-blur-md"
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
          className="relative group p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl shadow-emerald-900/50 hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
          title="تواصل مباشرة عبر واتساب"
          aria-label="محادثة واتساب مباشرة"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#0A0C0B] animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#0A0C0B]" />
        </a>
      </div>
    </div>
  );
}
