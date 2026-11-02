import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, RefreshCw, Car } from 'lucide-react';
import CarCard from './CarCard';

export default function InventorySection({ cars, loading, onSelectCar, onInquire }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Categories
  const categories = [
    { id: 'all', label: 'جميع السيارات' },
    { id: 'german', label: 'سيارات ألمانية (مرسيدس / BMW / أودي)' },
    { id: 'suv', label: 'دفع رباعي وعائلية SUV' },
    { id: 'sedan', label: 'سيدان فارهة' },
    { id: 'under2m', label: 'أقل من 2 مليون ج.م' },
  ];

  // Filter and sort logic
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      // Category filter
      if (activeCategory === 'german') {
        const make = (car.make || '').toLowerCase();
        if (!['mercedes-benz', 'bmw', 'audi', 'mercedes'].includes(make)) return false;
      } else if (activeCategory === 'suv') {
        const body = (car.body_type || '').toLowerCase();
        if (!body.includes('suv') && !body.includes('رباعي')) return false;
      } else if (activeCategory === 'sedan') {
        const body = (car.body_type || '').toLowerCase();
        if (!body.includes('سيدان') && !body.includes('sedan')) return false;
      } else if (activeCategory === 'under2m') {
        if (car.price >= 2000000) return false;
      }

      // Search term filter
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
      return (b.year || 0) - (a.year || 0); // newest default
    });
  }, [cars, activeCategory, searchTerm, sortBy]);

  return (
    <section id="inventory" className="py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold mb-2">
              <Car className="w-3.5 h-3.5" />
              <span>أسطول المعرض المتاح للتسليم الفوري</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              سيارات كسر زيرو فابريكة مختارة بعناية
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              جميع السيارات جاهزة للمعاينة والفحص الفني والتسليم في نفس اليوم
            </p>
          </div>

          <div className="text-xs text-gray-400 bg-dark-900 border border-white/10 px-3.5 py-2 rounded-xl self-start md:self-auto">
            السيارات المتاحة:{' '}
            <span className="font-extrabold text-brand-orange font-mono text-sm">{filteredCars.length}</span>{' '}
            سيارة
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="glass-panel p-4 rounded-2xl mb-8 space-y-4">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  activeCategory === cat.id
                    ? 'bg-brand-orange text-white border-brand-orange shadow-brand'
                    : 'bg-dark-950 text-gray-400 border-white/5 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search input + Sort selector */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-white/5">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ابحث بالماركة، الموديل، أو اللون (مثال: مرسيدس، توسان، أودي...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-950 border border-white/10 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-colors"
              />
              <Search className="w-4 h-4 text-gray-500 absolute right-3.5 top-3" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold shrink-0">الترتيب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-dark-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-orange transition-colors cursor-pointer"
              >
                <option value="newest">الأحدث موديل</option>
                <option value="price-asc">السعر: من الأقل للأعلى</option>
                <option value="price-desc">السعر: من الأعلى للأقل</option>
                <option value="mileage">الأقل كيلومترات</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cars Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-brand-orange animate-spin mx-auto" />
            <p className="text-sm text-gray-400">جاري تحميل تشكيلة سيارات المعرض...</p>
          </div>
        ) : filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <CarCard
                key={car.id || car.slug}
                car={car}
                onSelectCar={onSelectCar}
                onInquire={onInquire}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center glass-panel rounded-3xl p-8 max-w-md mx-auto space-y-3">
            <Car className="w-12 h-12 text-gray-600 mx-auto" />
            <h4 className="text-lg font-bold text-white">لا توجد سيارات تطابق معايير البحث</h4>
            <p className="text-xs text-gray-400">
              يرجى تغيير تصنيف البحث أو إعادة ضبط الفلاتر لاستعراض باقي السيارات
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchTerm('');
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
