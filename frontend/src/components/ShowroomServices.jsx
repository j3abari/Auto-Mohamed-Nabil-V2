import React from 'react';
import { ShieldCheck, Banknote, RefreshCw, FileCheck2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ShowroomServices() {
  const services = [
    {
      number: '01',
      title: 'فحص فني معتمد 100 نقطة',
      subtitle: 'شهادة ضمان ومطابقة فنية شاملة',
      desc: 'فحص دقيق وميكانيكي متكامل يغطي الهيكل الخارجي وسماكة الدهان الفابريكا، كفاءة المحرك، ناقل الحركة، العفشة، والمنظومة الإلكترونية بالكمبيوتر قبل العرض.',
      icon: ShieldCheck,
      points: ['فحص الدهان الفابريكا بالأجهزة الرقمية', 'تقرير سلامة الشاسيه والقوائم 100%', 'فحص إلكتروني شامل بأحدث أجهزة التشخيص']
    },
    {
      number: '02',
      title: 'برامج تمويل وتقسيط بنكي مرنة',
      subtitle: 'بأقل فائدة وأطول فترة سداد في مصر',
      desc: 'شراكات معتمدة ومباشرة مع كبرى البنوك المصرية (الأهلي، مصر، CIB، QNB) وشركات التمويل المعتمدة (كونتكت، درايف) بمقدمات تبدأ من 20% وفترات سداد حتى 5 سنوات.',
      icon: Banknote,
      points: ['موافقة بنكية سريعة خلال 24 ساعة', 'إمكانية التقسيط بدون حظر بيع وبدون تأمين إجباري', 'برامج مخصصة لأصحاب المهن الحرة والشركات']
    },
    {
      number: '03',
      title: 'استبدال فوري وترقية للسيارات',
      subtitle: 'تقييم عادل واستلام في نفس اليوم',
      desc: 'خدمة التبادل الفوري لسيارتك القديمة بأي سيارة حديثة من أسطول المعرض مع دفع أو استرداد الفارق بعد فحص وتقييم عادل بأعلى سعر سوقي.',
      icon: RefreshCw,
      points: ['تقييم فني فوري خلال 30 دقيقة', 'تسوية سريعة للفارق نقداً أو بالتقسيط', 'إنهاء فوري لعقود الاستبدال دون وسيط']
    },
    {
      number: '04',
      title: 'تسجيل وترخيص وتأمين شامل VIP',
      subtitle: 'خدمة تسليم مفتاح بدون أي عناء',
      desc: 'فريق مختص بإنهاء كافة إجراءات المرور ونقل الملكية وإصدار كروت البنزين واللوحات، بالإضافة إلى أفضل عروض التأمين الشامل مع كبرى شركات التأمين.',
      icon: FileCheck2,
      points: ['استخراج شهادات البيانات والمخالفات', 'تأمين شامل بخصومات حصرية لعملاء المعرض', 'تسليم السيارة جاهزة للترخيص أو مرخصة فوراً']
    }
  ];

  return (
    <section id="services" className="py-24 bg-[#faf8f3] border-t border-black/[0.07] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <span className="gx-kicker gx-kicker-orange mb-3">
              خدمات المعرض الفاخرة • The Showroom Services
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1f2937] tracking-tight mt-2">
              خدمات متكاملة تليق <span className="text-[#c2602b]">بأصحاب الذوق الرفيع.</span>
            </h2>
          </div>
          <p className="text-sm text-[#4b5563] max-w-md leading-relaxed">
            من فحص السيارة وحتى استلام المفتاح ونقل الملكية، نضمن لك تجربة شراء راقية تتسم بأعلى درجات الراحة والمصداقية.
          </p>
        </div>

        {/* Services Grid (4 Cards like Sharaf) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className="luxury-card rounded-2xl p-8 border border-black/[0.07] hover:border-[#c2602b]/40 transition-all duration-300 relative group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-black/5 border border-black/[0.07] flex items-center justify-center text-[#c2602b] group-hover:scale-110 group-hover:bg-[#c2602b]/10 transition-all">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="font-mono text-3xl font-black text-[#1f2937] group-hover:text-[#c2602b]/30 transition-colors">
                    {srv.number}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#1f2937] mb-1 group-hover:text-[#c2602b] transition-colors">
                  {srv.title}
                </h3>
                <p className="text-xs font-medium text-[#c2602b] mb-3">
                  {srv.subtitle}
                </p>
                <p className="text-xs text-[#6b7280] leading-relaxed mb-6">
                  {srv.desc}
                </p>

                <div className="space-y-2 pt-4 border-t border-black/[0.07]">
                  {srv.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 text-xs text-[#4b5563]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#c2602b] flex-shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
