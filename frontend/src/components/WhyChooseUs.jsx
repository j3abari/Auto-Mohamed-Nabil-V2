import React from 'react';
import { ShieldCheck, Award, Users, CheckCircle2, Star, Sparkles, Building2 } from 'lucide-react';

export default function WhyChooseUs() {
  const stats = [
    { value: '18+', label: 'عاماً من الخبرة', desc: 'ريادة موثوقة في سوق السيارات الفاخرة بمصر منذ 2008' },
    { value: '100%', label: 'فابريكا معتمدة', desc: 'كل سيارة مفحوصة بدقة 100 نقطة ومطابقة للمواصفات' },
    { value: '3,800+', label: 'عميل سعيد', desc: 'علاقات ثقة ممتدة مع عملائنا في القاهرة والمحافظات' },
    { value: '24 ساعة', label: 'تسليم فوري', desc: 'إنهاء فوري لإجراءات الترخيص والتمويل والاستبدال' }
  ];

  return (
    <section id="about" className="py-24 bg-gradient-to-b from-[#faf8f3] via-[#f4f0e6] to-[#faf8f3] border-t border-black/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Story Text */}
          <div>
            <span className="gx-kicker gx-kicker-orange mb-3">
              منذ 2008 • الريادة والمصداقية
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1f2937] tracking-tight mt-2 mb-6">
              سوق أوتو محمد نبيل.<br />
              <span className="text-[#9a7226]">حيث تلتقي الفخامة بالثقة.</span>
            </h2>

            <div className="space-y-4 text-sm text-[#4b5563] leading-relaxed font-light">
              <p>
                على مدار أكثر من ثمانية عشر عاماً، بنى معرض <strong className="text-[#1f2937]">أوتو محمد نبيل</strong> اسماً راسخاً في سوق السيارات المصري كوجهة أولى للباحثين عن السيارات الفاخرة وكسر الزيرو المضمونة بالكامل.
              </p>
              <p>
                نحن لا نبيع مجرد سيارات، بل نختار كل قطعة بعناية استثنائية ونخضعها لفحص ميكانيكي وكهربائي وهيكلي معتمد، لنمنح عملاءنا راحة البال التامة وتجربة قيادة تليق بتطلعاتهم.
              </p>
            </div>

            {/* Checkpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8 pt-6 border-t border-black/10 text-xs">
              <div className="flex items-center gap-2 text-[#1f2937]">
                <CheckCircle2 className="w-4 h-4 text-[#9a7226] flex-shrink-0" />
                <span>تقارير فحص فنية معتمدة وموثقة</span>
              </div>
              <div className="flex items-center gap-2 text-[#1f2937]">
                <CheckCircle2 className="w-4 h-4 text-[#9a7226] flex-shrink-0" />
                <span>استبدال فوري بأعلى تقييم سوقي</span>
              </div>
              <div className="flex items-center gap-2 text-[#1f2937]">
                <CheckCircle2 className="w-4 h-4 text-[#9a7226] flex-shrink-0" />
                <span>تعاقد مباشر مع أكبر البنوك المصرية</span>
              </div>
              <div className="flex items-center gap-2 text-[#1f2937]">
                <CheckCircle2 className="w-4 h-4 text-[#9a7226] flex-shrink-0" />
                <span>ضمان سلامة الهيكل والمحرك والفتيس</span>
              </div>
            </div>
          </div>

          {/* Stats Box */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="luxury-card rounded-2xl p-6 sm:p-8 border border-black/10 text-center flex flex-col justify-center items-center hover:border-[#9a7226]/30 transition-colors"
              >
                <span className="font-mono text-3xl sm:text-4xl font-black text-[#9a7226] mb-1">
                  {s.value}
                </span>
                <h4 className="text-sm font-bold text-[#1f2937] mb-1">
                  {s.label}
                </h4>
                <p className="text-[0.6875rem] text-[#6b7280] leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
