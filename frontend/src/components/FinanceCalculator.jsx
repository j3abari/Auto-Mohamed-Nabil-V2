import React, { useState } from 'react';
import { Calculator, Percent, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

export default function FinanceCalculator({ onOpenInquiry }) {
  const [carPrice, setCarPrice] = useState(2500000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(30);
  const [years, setYears] = useState(3);
  const interestRatePerYear = 0.12; // 12% approximate annual rate

  const downPaymentAmount = Math.round((carPrice * downPaymentPercent) / 100);
  const financedAmount = carPrice - downPaymentAmount;
  const totalMonths = years * 12;

  // Simple automotive installment formula
  const totalInterest = financedAmount * interestRatePerYear * years;
  const totalLoanCost = financedAmount + totalInterest;
  const monthlyInstallment = Math.round(totalLoanCost / totalMonths);

  const formatEGP = (val) => new Intl.NumberFormat('ar-EG').format(val) + ' ج.م';

  return (
    <section id="calculator" className="py-16 md:py-24 relative overflow-hidden bg-dark-900 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>حاسبة التمويل والتقسيط الذكية</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            احسب قسط سيارتك الجديد بكل شفافية
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            باقات تقسيط مصرفية ومباشرة مرنة بمقدم يبدأ من 20% وفترات سداد ميسرة تصل إلى 5 سنوات
          </p>
        </div>

        <div className="max-w-4xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Inputs Column */}
            <div className="space-y-6">
              {/* Car Price */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-300">سعر السيارة المقدر</label>
                  <span className="text-sm font-black text-brand-orange">{formatEGP(carPrice)}</span>
                </div>
                <input
                  type="range"
                  min="1000000"
                  max="4000000"
                  step="50000"
                  value={carPrice}
                  onChange={(e) => setCarPrice(Number(e.target.value))}
                  className="w-full accent-brand-orange cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>1,000,000 ج.م</span>
                  <span>4,000,000 ج.م</span>
                </div>
              </div>

              {/* Down Payment % */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-300">نسبة الدفعة المقدمة</label>
                  <span className="text-sm font-black text-brand-orange">{downPaymentPercent}% ({formatEGP(downPaymentAmount)})</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[20, 30, 40, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDownPaymentPercent(pct)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        downPaymentPercent === pct
                          ? 'bg-brand-orange text-white border-brand-orange shadow-brand'
                          : 'bg-dark-950 text-gray-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Tenure Years */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-300">مدة التقسيط</label>
                  <span className="text-sm font-black text-brand-orange">{years} سنوات ({totalMonths} شهر)</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setYears(yr)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        years === yr
                          ? 'bg-brand-orange text-white border-brand-orange shadow-brand'
                          : 'bg-dark-950 text-gray-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {yr} {yr === 1 ? 'سنة' : yr === 2 ? 'سنتان' : 'سنوات'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Result Column */}
            <div className="bg-dark-950 p-6 rounded-2xl border border-brand-orange/30 flex flex-col justify-between">
              <div>
                <span className="text-xs text-gray-400 font-semibold block mb-1">القسط الشهري التقريبي:</span>
                <div className="text-3xl sm:text-4xl font-black text-white mb-2">
                  {formatEGP(monthlyInstallment)}
                  <span className="text-xs font-normal text-gray-400 mr-2">/ شهرياً</span>
                </div>

                <div className="space-y-2 py-4 border-t border-b border-white/10 my-4 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">الدفعة المقدمة:</span>
                    <span className="font-bold text-white">{formatEGP(downPaymentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">المبلغ الممول:</span>
                    <span className="font-bold text-white">{formatEGP(financedAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">إجمالي مدة التمويل:</span>
                    <span className="font-bold text-white">{totalMonths} شهر</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-400 mb-6">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>موافقة ائتمانية سريعة بأقل المستندات وبدون تعقيد</span>
                </div>
              </div>

              <button
                onClick={() => onOpenInquiry({ type: 'finance', title: 'طلب تمويل وتقسيط سيارة' })}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-brand-orange to-brand-hover text-white font-extrabold text-xs sm:text-sm shadow-brand hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <span>طلب دراسة تمويل وتقسيط</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
