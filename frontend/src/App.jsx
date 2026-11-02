import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import InventorySection from './components/InventorySection';
import PrivateViewingSection from './components/PrivateViewingSection';
import ShowroomServices from './components/ShowroomServices';
import FinanceCalculator from './components/FinanceCalculator';
import InspectionShowcase from './components/InspectionShowcase';
import WhyChooseUs from './components/WhyChooseUs';
import Footer from './components/Footer';
import CarDetailModal from './components/CarDetailModal';
import InquiryModal from './components/InquiryModal';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import { fetchCars, SHOWROOM_CONTACT } from './services/api';
import { getCurrentAdmin, logoutAdmin } from './services/adminApi';
import { MessageCircle, Phone, ArrowUp } from 'lucide-react';

export default function App() {
  // Admin View state - strictly triggered by direct URL navigation (/admin or #admin) or shortcut
  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
  });
  const [adminUser, setAdminUser] = useState(getCurrentAdmin());

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [inquiryContext, setInquiryContext] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Filter state for hero search
  const [heroFilters, setHeroFilters] = useState({
    make: '',
    body_type: '',
    price_max: ''
  });

  // Listen to hash changes and keyboard shortcut (Ctrl+Shift+A) for authorized staff access
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin' || window.location.pathname.startsWith('/admin')) {
        setIsAdminView(true);
      } else if (window.location.hash !== '#admin' && !window.location.pathname.startsWith('/admin')) {
        setIsAdminView(false);
      }
    };

    const handleKeyDown = (e) => {
      // Secret staff shortcut: Ctrl + Shift + A
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        window.location.hash = '#admin';
        setIsAdminView(true);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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

  // Filter cars based on hero search inputs
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      if (heroFilters.make && (car.make || '').toLowerCase() !== heroFilters.make.toLowerCase()) {
        return false;
      }
      if (heroFilters.body_type && !(car.body_type || '').toLowerCase().includes(heroFilters.body_type.toLowerCase())) {
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
    cars.forEach(c => { if (c.make) set.add(c.make); });
    return Array.from(set);
  }, [cars]);

  const handleHeroSearch = () => {
    const el = document.getElementById('inventory');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCloseAdmin = () => {
    setIsAdminView(false);
    if (window.location.hash === '#admin') {
      window.location.hash = '';
    }
  };

  const handleLogoutAdmin = () => {
    logoutAdmin();
    setAdminUser(null);
  };

  // ----------------------------------------------------
  // ADMIN PORTAL & CRM (Isolated, accessed via /admin or #admin)
  // ----------------------------------------------------
  if (isAdminView) {
    if (!adminUser) {
      return (
        <AdminLogin
          onSuccess={(user) => setAdminUser(user)}
          onClose={handleCloseAdmin}
        />
      );
    }
    return (
      <AdminDashboard
        user={adminUser}
        onLogout={handleLogoutAdmin}
        onClose={handleCloseAdmin}
      />
    );
  }

  // ----------------------------------------------------
  // PUBLIC CLIENT SHOWROOM (100% Focused on Customer Journey)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0A0C0B] text-[#F1EEE6] font-sans selection:bg-[#FF4B16] selection:text-white" dir="rtl">
      
      {/* Luxury Sticky Navbar (NO admin leaks) */}
      <Navbar
        onOpenInquiry={(ctx) => setInquiryContext(ctx || {})}
      />

      {/* Main Content Sections (Sharaf Reference Architecture) */}
      <main>
        {/* 1. Cinematic Luxury Hero */}
        <HeroSection
          filters={heroFilters}
          setFilters={setHeroFilters}
          onSearchSubmit={handleHeroSearch}
          availableMakes={availableMakes}
        />

        {/* 2. Showroom Collection & Inventory */}
        <InventorySection
          cars={filteredCars}
          loading={loading}
          onSelectCar={(car) => setSelectedCar(car)}
          onInquire={(car) => setInquiryContext({ car_id: car.id, title: `استفسار عن ${car.make} ${car.model}` })}
        />

        {/* 3. Private Viewing & VIP Test Drive Booking Form */}
        <PrivateViewingSection
          cars={cars}
        />

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

        {/* 7. Heritage & Showroom Story (18+ Years Trust) */}
        <WhyChooseUs />
      </main>

      {/* 8. Luxury Footer (NO admin links) */}
      <Footer />

      {/* Modals */}
      {selectedCar && (
        <CarDetailModal
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
          onInquire={(car) => {
            setSelectedCar(null);
            setInquiryContext({ car_id: car.id, title: `حجز سيارة ${car.make} ${car.model}` });
          }}
        />
      )}

      {inquiryContext && (
        <InquiryModal
          context={inquiryContext}
          cars={cars}
          onClose={() => setInquiryContext(null)}
        />
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col items-center gap-3">
        {/* Back to top */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-11 h-11 rounded-full bg-[#141715]/90 border border-white/10 text-white hover:text-[#FF4B16] hover:border-[#FF4B16]/50 shadow-xl flex items-center justify-center transition-all backdrop-blur-md"
            aria-label="العودة لأعلى الصفحة"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        {/* Floating WhatsApp CTA */}
        <a
          href={`https://wa.me/${SHOWROOM_CONTACT.whatsapp}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن سيارات المعرض المتاحة.')}`}
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
