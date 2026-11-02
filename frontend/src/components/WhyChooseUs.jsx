import React from 'react';
import { Award, ShieldCheck, Repeat, Clock, Users, ThumbsUp, Sparkles, MapPin } from 'lucide-react';
import { SHOWROOM_CONTACT } from '../services/api';

export default function WhyChooseUs({ onOpenInquiry }) {
  const stats = [
    { number: '+18', label: 'عاماً من الخبرة والريادة', sub: 'تأسس عام 2007' },
    { number: '+1,800', label: 'سيارة تم تسليمها بنجاح', sub: 'للعملاء في أنحاء مصر' },
    { number: '100%', label: 'ضمان الفحص والشفافية', sub: 'فابريكة بالكامل معتمدة' },
    { number: '24', label: 'ساعة إنهاء إجراءات التقسيط', sub: 'بأسرع موافقة بنكية' },
  ];

  return (
    <section id="why-us" className="py-16 md:py-24 bg-dark-900 border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold mb-3">
            <Award className="w-4 h-4" />
            <span>ثقة وبناء سمعة امتدت لسنوات</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            لماذا يختار العملاء سوق أوتو محمد نبيل؟
          </h2>
          <p className="text-sm text-gray-400 mt-3 leading-relaxed">
            منذ انطلاقنا عام 2007 في ميت غمر، وضعنا مبدأ الأمانة والشفافية معياراً أساسياً لكل صفقة، لنكون الوجهة الأولى لكل باحث عن سيارة مميزة ومضمونة.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {stats.map((s, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl text-center border border-white/5">
              <div className="text-3xl sm:text-5xl font-black text-brand-orange mb-2 font-mono">
                {s.number}
              </div>
              <div className="text-sm font-bold text-white mb-1">{s.label}</div>
              <div className="text-xs text-gray-500">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 hover:border-brand-orange/30 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">انتقاء صارم لكل سيارة</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                لا نقبل عرض أي سيارة تعرضت لحوادث جسيمة أو بها تلاعب بعداد الكيلومترات. سياراتنا جميعها بحالة كسر الزيرو مع سجل صيانة منتظم.
              </p>
            </div>
          </div>

          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 hover:border-brand-orange/30 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5">
                <Repeat className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">استبدال سيارتك القديمة بأعلى تثمين</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                وفر وقتك وجهدك في بيع سيارتك القديمة. نقوم بتثمين سيارتك بقيمة عادلة وفق أسعار السوق الحالية، وتستلم سيارتك الجديدة في نفس اليوم.
              </p>
            </div>
          </div>

          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 hover:border-brand-orange/30 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">إجراءات ترخيص وتسجيل فورية</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                فريقنا القانوني والإداري يتولى كافة أوراق نقل الملكية وشهادات البيانات والمخالفات، لتستلم رخصتك وسيارتك جاهزة تماماً بدون أي عناء.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
