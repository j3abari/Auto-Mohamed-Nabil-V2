import React from 'react';
import { ShieldCheck, CheckCircle2, FileCheck, Award, Eye, Wrench } from 'lucide-react';
import { SHOWROOM_CONTACT } from '../services/api';

export default function InspectionShowcase({ onOpenInquiry }) {
  const points = [
    { title: 'سلامة الشاسيه والقوائم 100%', desc: 'تأكيد سلامة الهيكل المعدني، الشاسيه، والقوائم بنسبة 100% وعدم وجود أي لحامات أو خبطات أو حوادث سابقة نهائياً.' },
    { title: 'كفاءة المحرك وناقل الحركة (الفتيس)', desc: 'فحص ميكانيكي شامل بالكمبيوتر لقياس ضغط المحرك وكفاءة التيربو ونعومة نقلات الفتيس وتبريد الزيوت.' },
    { title: 'قياس سماكة الدهان الفابريكا رقمياً', desc: 'استخدام أجهزة الفحص الرقمية المتطورة لقياس سماكة الدهان بالمايكرون للتأكد من حالة الفابريكا الأصلية للسيارة بالكامل.' },
    { title: 'منظومة العفشة ونظام التوجيه والتعليق', desc: 'فحص دقيق للمساعدين، المقصات، بارات التوجيه، ونظام الدفع لضمان أقصى درجات الثبات والاتزان على السرعات العالية.' },
    { title: 'منظومة الفرامل وأنظمة الأمان ABS/ESP', desc: 'اختبار استجابة الفرامل الهيدروليكية، حساسات الاتزان الإلكتروني، وسائد الأمان الهوائية، وأنظمة التثبيت.' },
    { title: 'الأنظمة الكهربائية والكمبيوتر الذكي', desc: 'فحص كمبيوتر الأعطال OBD-II وقراءة سجل الذاكرة لضمان خلو المنظومة الإلكترونية من أي أعطال مخفية.' },
  ];

  return (
    <section id="inspection" className="py-24 bg-[#faf8f3] border-t border-black/[0.07] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="gx-kicker gx-kicker-orange mb-3">
            معايير الجودة والضمان • Inspection Standards
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1f2937] mt-2">
            فحص فني معتمد <span className="text-[#c2602b]">100 نقطة</span> لكل سيارة.
          </h2>
          <p className="text-sm text-[#4b5563] mt-3 leading-relaxed font-light">
            في سوق أوتو محمد نبيل، لا تدخل صالة العرض أي سيارة إلا بعد اجتياز فحص فني صارم يشمل كافة التفاصيل الدقيقة. نضمن لك سيارة بحالة الزيرو وفابريكا بالكامل.
          </p>
        </div>

        {/* 6 Grid points */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {points.map((pt, i) => (
            <div
              key={i}
              className="luxury-card p-6 rounded-2xl border border-black/[0.07] hover:border-[#c2602b]/30 transition-all duration-300"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#c2602b]/10 border border-[#c2602b]/25 flex items-center justify-center shrink-0 text-[#c2602b] mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1f2937] mb-1.5">{pt.title}</h4>
                  <p className="text-xs text-[#6b7280] leading-relaxed">{pt.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Certificate / Verification Banner */}
        <div className="luxury-card p-6 sm:p-8 rounded-3xl border border-[#c2602b]/30 flex flex-wrap items-center justify-between gap-6 bg-gradient-to-r from-[#ffffff] via-[#ffffff] to-[#ffffff]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#c2602b]/15 border border-[#c2602b]/30 flex items-center justify-center text-[#c2602b] shrink-0">
              <FileCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1f2937]">تريد فحص سيارتك في أي مركز فني معتمد من اختيارك؟</h3>
              <p className="text-xs sm:text-sm text-[#4b5563] mt-1">
                نرحب بجميع الفنيين والمراكز المعتمدة التي تختارها للكشف الكامل على السيارة قبل إتمام التعاقد لراحتك التامة.
              </p>
            </div>
          </div>

          <a
            href="/viewing"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/viewing');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="px-6 py-3 rounded-xl bg-[#c2602b] hover:bg-[#a24d1f] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#c2602b]/25 transition-all whitespace-nowrap"
          >
            تحديد موعد فحص ومعاينة
          </a>
        </div>

      </div>
    </section>
  );
}
