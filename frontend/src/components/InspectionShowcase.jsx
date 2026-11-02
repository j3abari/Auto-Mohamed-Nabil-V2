import React from 'react';
import { ShieldCheck, CheckCircle2, FileCheck, Award, AlertTriangle, Eye } from 'lucide-react';
import { SHOWROOM_CONTACT } from '../services/api';

export default function InspectionShowcase({ onOpenInquiry }) {
  const points = [
    { title: 'فحص الشاسيه والقوايم', desc: 'تأكيد سلامة الهيكل المعدني 100% وعدم وجود أي لحامات أو خبطات سابقة' },
    { title: 'فحص المحرك وناقل الحركة', desc: 'كشف كمبيوتر شامل وضغط المحرك وكفاءة الفتيس وصوت التوربينات' },
    { title: 'كشف طبقات الدهان الإلكتروني', desc: 'قياس ميكرون الدهان بجهاز الديجيتال للتأكد من فابريكة المصنع بالكامل' },
    { title: 'نظام العفشة والتعليق', desc: 'فحص المساعدين، المقصات، وضبط الزوايا وتماسك السيارة على السرعات' },
    { title: 'الفرامل وأنظمة الأمان ABS/ESP', desc: 'اختبار استجابة الفرامل الهيدروليكية وحساسات الرادار وتماسك المكابح' },
    { title: 'الأنظمة الكهربائية والوسائد الهوائية', desc: 'فحص كمبيوتر الأعطال OBD للتأكد من خلو منظومة الإيرباج من أي أخطاء' },
  ];

  return (
    <section id="inspection" className="py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>معيار الأمان الأقصى</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            فحص فني معتمد 100 نقطة لكل سيارة
          </h2>
          <p className="text-sm text-gray-400 mt-3 leading-relaxed">
            في سوق أوتو محمد نبيل، لا يدخل معرضنا أي سيارة بها رش دواخل أو شاسيه أو عيوب جوهرية. نفحص كل سيارة وكأننا نشتريها لأنفسنا.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {points.map((pt, i) => (
            <div key={i} className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">{pt.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{pt.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Certificate banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-orange/30 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange shrink-0">
              <FileCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">تريد فحص سيارتك بنفسك أو في أي مركز معتمد؟</h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                نرحب بجميع الفنيين والمراكز المعتمدة التي تختارها للكشف الكامل على سيارتك قبل إتمام التعاقد.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenInquiry({ type: 'test_drive', title: 'حجز موعد فحص ومعاينة' })}
            className="px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-hover text-white font-bold text-xs sm:text-sm shadow-brand transition-all whitespace-nowrap"
          >
            تحديد موعد كشف وفحص
          </button>
        </div>
      </div>
    </section>
  );
}
