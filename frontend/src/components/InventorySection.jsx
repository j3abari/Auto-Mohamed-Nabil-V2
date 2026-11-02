import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, RefreshCw, Car, Sparkles } from 'lucide-react';
import CarCard from './CarCard';

export default function InventorySection({ cars = [], loading = false, onSelectCar, onInquire }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Categories
  const categories = [
    { id: 'all', label: 'جميع الأسطول' },
    { id: 'mercedes', label: 'مرسيدس-بنز' },
    { id: 'bmw', label: 'بي إم دبليو' },
    { id: 'audi', label: 'أودي' },
    { id: 'toyota', label: 'تويوتا' },
    { id: 'hyundai', label: 'هيونداي' },
    { id: 'kia', label: 'كيا' },
  ];

  // Filter and sort logic
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      // Category filter
      if (activeCategory !== 'all') {
        const make = (car.make || '').toLowerCase();
        if (activeCategory === 'mercedes' && !make.includes('mercedes')) return false;
        if (activeCategory === 'bmw' && !make.includes('bmw')) return false;
        if (activeCategory === 'audi' && !make.includes('audi')) return false;
        if (activeCategory === 'toyota' && !make.includes('toyota')) return false;
        if (activeCategory === 'hyundai' && !make.includes('hyundai')) return false;
        if (activeCategory === 'kia' && !make.includes('kia')) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const make = (car.make || '').toLowerCase();
        const model = (car.model || '').toLowerCase();
        const color = (car.color || '').toLowerCase();
        const variant = (car.variant || '').toLowerCase();
        if (!make.includes(term) && !model.includes(term) && !color.includes(term) && !variant.includes(term)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'mileage') return (a.mileage || 0) - (b.mileage || 0);
      return (b.year || 0) - (a.year || 0);
    });
  }, [cars, activeCategory, searchTerm, sortBy]);

  return (
    <section id="inventory" className="py-24 bg-[#0A0C0B] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="gx-kicker gx-kicker-orange mb-3">
              المجموعة المتاحة للتسليم الفوري • The Showroom Collection
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F1EEE6] tracking-tight mt-2">
              أسطول استثنائي <span className="text-[#FF4B16]">منتقى بعناية.</span>
            </h2>
            <p className="text-sm text-[#B7B9B0] mt-2 max-w-xl leading-relaxed">
              جميع السيارات تخضع لفحص فني معتمد 100 نقطة، بحالة الزيرو وفابريكا بالكامل مع إمكانية المعاينة والتجربة الفورية.
            </p>
          </div>

          <div className="text-xs text-[#B7B9B0] bg-[#141715] border border-white/10 px-4 py-2.5 rounded-xl self-start md:self-auto flex items-center gap-2">
            <span>السيارات المتاحة:</span>
            <span className="font-extrabold text-[#FF4B16] font-mono text-sm">{filteredCars.length}</span>
            <span>سيارة</span>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-[#141715] border border-white/8 p-4 sm:p-5 rounded-2xl mb-10 space-y-4 shadow-xl">
          
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  activeCategory === cat.id
                    ? 'bg-[#FF4B16] text-white border-[#FF4B16] shadow-md shadow-[#FF4B16]/25'
                    : 'bg-[#0E1110] text-[#B7B9B0] border-white/5 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search and Sort Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5">
            <div className="relative sm:col-span-2">
              <input
                type="text"
                placeholder="ابحث بالاسم، الماركة، أو الموديل (مثال: C200, BMW 320i, فورتشنر)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0E1110] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#F1EEE6] placeholder-gray-500 focus:outline-none focus:border-[#FF4B16] transition-colors"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3 pointer-events-none" />
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#C9B37E] flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#0E1110] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-[#F1EEE6] focus:outline-none focus:border-[#FF4B16] transition-colors appearance-none cursor-pointer"
              >
                <option value="newest">ترتيب: الأحدث موديل</option>
                <option value="price-desc">ترتيب: السعر من الأعلى للأقل</option>
                <option value="price-asc">ترتيب: السعر من الأقل للأعلى</option>
                <option value="mileage">ترتيب: الأقل كيلومترات</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cars Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="luxury-card rounded-2xl h-96 animate-pulse bg-white/5" />
            ))}
          </div>
        ) : filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                onSelectCar={onSelectCar}
                onInquire={onInquire}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#141715] rounded-2xl border border-white/5">
            <Car className="w-12 h-12 text-[#9EA199] mx-auto mb-3 opacity-40" />
            <h3 className="text-lg font-bold text-[#F1EEE6]">لا توجد سيارات مطابقة لخيارات البحث</h3>
            <p className="text-xs text-[#9EA199] mt-1 mb-4">جرب تغيير معايير البحث أو تصفية الماركات</p>
            <button
              onClick={() => { setActiveCategory('all'); setSearchTerm(''); }}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-semibold transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة ضبط الفلاتر</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
