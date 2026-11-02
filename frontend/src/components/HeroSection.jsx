import React from 'react';
import { ShieldCheck, Award, Zap, Repeat, Search, CheckCircle2, ChevronDown, Sparkles } from 'lucide-react';

export default function HeroSection({ filters, setFilters, onSearchSubmit, availableMakes }) {
  return (
    <section id="hero" className="relative pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-10 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4">
        {/* Top Announcement Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
            </span>
            <span className="font-bold text-white">سوق أوتو محمد نبيل</span>
            <span className="text-gray-500">•</span>
            <span>المرجع الأول لسيارات كسر الزيرو الفابريكة بالكامل بميت غمر</span>
            <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6">
            اختر سيارة أحلامك بضمان
            <span className="block mt-2 bg-gradient-to-r from-brand-orange via-orange-400 to-amber-300 bg-clip-text text-transparent">
              الفحص الفني المعتمد والأمان الكامل
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            تشكيلة حصرية من أرقى السيارات الألمانية والكورية واليابانية بحالة الوكالة فابريكة بالكامل، مع إمكانية التقسيط بأقل فائدة والاستبدال الفوري.
          </p>
        </div>

        {/* Quick Filter Box in Hero (Distinctive feature) */}
        <div className="max-w-5xl mx-auto glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl mb-12">
          <div className="text-xs font-bold text-gray-400 mb-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-brand-orange" />
            <span>البحث السريع في سيارات المعرض المتاحة فوراً:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Make */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold">الماركة / الصانع</label>
              <div className="relative">
                <select
                  value={filters.make || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, make: e.target.value }))}
                  className="w-full bg-dark-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-orange transition-colors appearance-none cursor-pointer"
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
              <label className="text-xs text-gray-400 font-semibold">نوع الهيكل</label>
              <div className="relative">
                <select
                  value={filters.body_type || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, body_type: e.target.value }))}
                  className="w-full bg-dark-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-orange transition-colors appearance-none cursor-pointer"
                >
                  <option value="">جميع الفئات</option>
                  <option value="SUV">سيارات دفع رباعي وعائلية SUV</option>
                  <option value="سيدان">سيدان فارهة ورياضية</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Max Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold">الحد الأقصى للسعر</label>
              <div className="relative">
                <select
                  value={filters.price_max || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, price_max: e.target.value }))}
                  className="w-full bg-dark-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-orange transition-colors appearance-none cursor-pointer"
                >
                  <option value="">أي سعر</option>
                  <option value="2000000">حتى 2,000,000 ج.م</option>
                  <option value="2500000">حتى 2,500,000 ج.م</option>
                  <option value="3000000">حتى 3,000,000 ج.م</option>
                  <option value="3500000">حتى 3,500,000 ج.م</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Submit button */}
            <div className="flex flex-col justify-end">
              <button
                onClick={onSearchSubmit}
                className="w-full py-2.5 px-6 rounded-xl bg-gradient-to-r from-brand-orange to-brand-hover text-white font-bold text-sm shadow-brand hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 h-[42px]"
              >
                <Search className="w-4 h-4" />
                <span>عرض النتائج</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Pillars Trust Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
          <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center shrink-0 text-brand-orange">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white">خبرة منذ 2007</div>
              <div className="text-xs text-gray-400">أكثر من 18 عاماً بميت غمر</div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white">فحص فني معتمد</div>
              <div className="text-xs text-gray-400">تقرير كشف دقيق 100 نقطة</div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white">تقسيط ميسر فوري</div>
              <div className="text-xs text-gray-400">مقدم يبدأ من 20%</div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-400">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white">استبدال مباشر</div>
              <div className="text-xs text-gray-400">بدل سيارتك في نفس اليوم</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
