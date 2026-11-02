import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import InventorySection from './components/InventorySection';
import FinanceCalculator from './components/FinanceCalculator';
import InspectionShowcase from './components/InspectionShowcase';
import WhyChooseUs from './components/WhyChooseUs';
import Footer from './components/Footer';
import CarDetailModal from './components/CarDetailModal';
import InquiryModal from './components/InquiryModal';
import { fetchCars, SHOWROOM_CONTACT } from './services/api';
import { MessageCircle, Phone, ArrowUp } from 'lucide-react';

export default function App() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [inquiryContext, setInquiryContext] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Filter state in hero
  const [heroFilters, setHeroFilters] = useState({
    make: '',
    body_type: '',
    price_max: ''
  });

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

    // Scroll listener for back-to-top button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Unique makes for filter dropdown
  const availableMakes = useMemo(() => {
    const set = new Set();
    cars.forEach(c => {
      if (c.make) set.add(c.make);
    });
    return Array.from(set);
  }, [cars]);

  // When clicking search in hero
  const handleHeroSearch = () => {
    const inventoryEl = document.getElementById('inventory');
    if (inventoryEl) {
      inventoryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-gray-100 flex flex-col relative selection:bg-brand-orange selection:text-white">
      {/* Navbar */}
      <Navbar onOpenInquiry={(ctx) => setInquiryContext(ctx)} />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          filters={heroFilters}
          setFilters={setHeroFilters}
          onSearchSubmit={handleHeroSearch}
          availableMakes={availableMakes}
        />

        {/* Cars Inventory Showcase */}
        <InventorySection
          cars={cars}
          loading={loading}
          onSelectCar={(car) => setSelectedCar(car)}
          onInquire={(ctx) => setInquiryContext(ctx)}
        />

        {/* Finance & Installment Calculator */}
        <FinanceCalculator
          onOpenInquiry={(ctx) => setInquiryContext(ctx)}
        />

        {/* 100-Point Inspection & Quality Verification */}
        <InspectionShowcase
          onOpenInquiry={(ctx) => setInquiryContext(ctx)}
        />

        {/* Why Auto Mohamed Nabil & Stats since 2007 */}
        <WhyChooseUs
          onOpenInquiry={(ctx) => setInquiryContext(ctx)}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Action WhatsApp & Phone Button */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3">
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 rounded-full bg-dark-900/90 border border-white/20 text-white flex items-center justify-center hover:bg-dark-800 transition-all shadow-xl backdrop-blur-md"
            aria-label="العودة لأعلى الصفحة"
          >
            <ArrowUp className="w-5 h-5 text-brand-orange" />
          </button>
        )}

        <a
          href={SHOWROOM_CONTACT.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 relative group"
          aria-label="مراسلة المعرض على واتساب"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300"></span>
          </span>
          <MessageCircle className="w-7 h-7 fill-current" />
          <span className="absolute left-16 bg-dark-950 border border-white/10 text-white text-xs font-bold py-1 px-3 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
            تواصل مع المعرض واتساب
          </span>
        </a>
      </div>

      {/* Modals */}
      {selectedCar && (
        <CarDetailModal
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
          onInquire={(ctx) => setInquiryContext(ctx)}
        />
      )}

      {inquiryContext && (
        <InquiryModal
          context={inquiryContext}
          cars={cars}
          onClose={() => setInquiryContext(null)}
        />
      )}
    </div>
  );
}
