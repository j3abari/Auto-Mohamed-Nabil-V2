import React from 'react';
import { ShieldCheck, Award, Zap, Repeat, Search, ChevronDown, Sparkles, CalendarCheck, ChevronLeft } from 'lucide-react';

export default function HeroSection({ filters, setFilters, onSearchSubmit, availableMakes = [], onNavigate }) {
  const handleNav = (e, path) => {
    e.preventDefault();
    if (onNavigate) onNavigate(path);
    else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <section id="hero" className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-[#faf8f3]">
      
      {/* Background cinematic luxury gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(194, 96, 43,0.18),transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#c2602b]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#c2602b]/8 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Kicker Announcement */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 border border-black/[0.07] text-xs text-[#4b5563] shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c2602b] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c2602b]"></span>
            </span>
            <span className="font-bold text-[#1f2937]">أوتو محمد نبيل</span>
            <span className="text-gray-600">•</span>
            <span className="text-[#c2602b]">سوق السيارات الفاخرة • كسر زيرو فابريكا بالكامل</span>
            <Sparkles className="w-3.5 h-3.5 text-[#c2602b]" />
          </div>
        </div>

        {/* Grand Headline (Sharaf Reference Style) */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-[2.4rem] font-black text-[#1f2937] leading-[1.45] mb-5">
            السيارات الفاخرة،
            <span className="block mt-2 bg-gradient-to-r from-[#c2602b] via-[#c2602b] to-[#c2602b] bg-clip-text text-transparent">
              كما ينبغي أن تكون.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#4b5563] max-w-2xl mx-auto leading-relaxed font-light">
            مجموعة حصرية من نخبة السيارات الألمانية والعالمية بحالة الزيرو وفحص فني معتمد 100 نقطة. تسليم فوري في نفس اليوم مع تسهيلات بنكية واستبدال مباشر.
          </p>

          {/* Dual Action CTAs (Clean URLs, Zero #) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <a
              href="/inventory"
              onClick={(e) => handleNav(e, '/inventory')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#c2602b] hover:bg-[#a24d1f] text-white font-bold text-sm shadow-xl shadow-[#c2602b]/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <span>استكشف أسطول السيارات المتاح</span>
              <ChevronLeft className="w-4 h-4" />
            </a>

            <a
              href="/viewing"
              onClick={(e) => handleNav(e, '/viewing')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-black/5 hover:bg-black/5 text-[#1f2937] border border-black/[0.07] font-semibold text-sm transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <CalendarCheck className="w-4 h-4 text-[#c2602b]" />
              <span>طلب معاينة خاصة وتجربة قيادة</span>
            </a>
          </div>
        </div>

        {/* Quick Filter Box */}
        <div className="max-w-5xl mx-auto bg-[#ffffff]/90 border border-black/[0.07] p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-xl mb-14">
          <div className="text-xs font-bold text-[#c2602b] mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Search className="w-4 h-4 text-[#c2602b]" />
            <span>البحث الفوري في أسطول المعرض:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Make */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#4b5563] font-semibold">الماركة / الصانع</label>
              <div className="relative">
                <select
                  value={filters.make || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, make: e.target.value }))}
                  className="w-full bg-[#f4f0e6] border border-black/[0.07] rounded-xl px-4 py-2.5 text-sm text-[#1f2937] focus:outline-none focus:border-[#c2602b] transition-colors appearance-none cursor-pointer"
                >
                  <option value="">جميع الماركات</option>
                  {availableMakes.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Body Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#4b5563] font-semibold">نوع الهيكل</label>
              <div className="relative">
                <select
                  value={filters.body_type || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, body_type: e.target.value }))}
                  className="w-full bg-[#f4f0e6] border border-black/[0.07] rounded-xl px-4 py-2.5 text-sm text-[#1f2937] focus:outline-none focus:border-[#c2602b] transition-colors appearance-none cursor-pointer"
                >
                  <option value="">جميع الفئات</option>
                  <option value="SUV">دفع رباعي وعائلية SUV</option>
                  <option value="سيدان">سيدان فاخرة ورياضية</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Max Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#4b5563] font-semibold">الحد الأقصى للسعر</label>
              <div className="relative">
                <select
                  value={filters.price_max || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, price_max: e.target.value }))}
                  className="w-full bg-[#f4f0e6] border border-black/[0.07] rounded-xl px-4 py-2.5 text-sm text-[#1f2937] focus:outline-none focus:border-[#c2602b] transition-colors appearance-none cursor-pointer"
                >
                  <option value="">أي ميزانية</option>
                  <option value="2000000">حتى 2,000,000 ج.م</option>
                  <option value="2500000">حتى 2,500,000 ج.م</option>
                  <option value="3000000">حتى 3,000,000 ج.م</option>
                  <option value="4000000">حتى 4,000,000 ج.م</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Submit button */}
            <div className="flex flex-col justify-end">
              <button
                onClick={onSearchSubmit}
                className="w-full py-2.5 px-6 rounded-xl bg-[#c2602b] hover:bg-[#a24d1f] text-white font-bold text-sm shadow-md shadow-[#c2602b]/25 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 h-[42px]"
              >
                <Search className="w-4 h-4" />
                <span>عرض النتائج</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Pillars Trust Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="bg-[#ffffff]/80 border border-black/[0.07] p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#c2602b]/15 border border-[#c2602b]/30 flex items-center justify-center shrink-0 text-[#c2602b]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1f2937]">خبرة 18+ عاماً</h4>
              <p className="text-[0.6875rem] text-[#6b7280]">ثقة وسمعة ذهبية بالسوق</p>
            </div>
          </div>

          <div className="bg-[#ffffff]/80 border border-black/[0.07] p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#c2602b]/15 border border-[#c2602b]/30 flex items-center justify-center shrink-0 text-[#c2602b]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1f2937]">فحص 100 نقطة معتمد</h4>
              <p className="text-[0.6875rem] text-[#6b7280]">فابريكا بالكامل وتقارير موثقة</p>
            </div>
          </div>

          <div className="bg-[#ffffff]/80 border border-black/[0.07] p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#c2602b]/15 border border-[#c2602b]/30 flex items-center justify-center shrink-0 text-[#c2602b]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1f2937]">تسليم فوري</h4>
              <p className="text-[0.6875rem] text-[#6b7280]">استلام وترخيص في نفس اليوم</p>
            </div>
          </div>

          <div className="bg-[#ffffff]/80 border border-black/[0.07] p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#c2602b]/15 border border-[#c2602b]/30 flex items-center justify-center shrink-0 text-[#c2602b]">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1f2937]">استبدال وتمويل مرن</h4>
              <p className="text-[0.6875rem] text-[#6b7280]">بأقل مقدم وأطول فترة سداد</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
