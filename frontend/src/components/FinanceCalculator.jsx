import React, { useState } from 'react';
import { Calculator, Percent, Calendar, CheckCircle2, ArrowRight, Banknote } from 'lucide-react';

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
    <section id="calculator" className="py-24 bg-[#0E1110] border-t border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="gx-kicker gx-kicker-orange mb-3">
            حاسبة التمويل والأقساط • Instalment Calculator
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F1EEE6] tracking-tight mt-2">
            احسب قسط سيارتك <span className="text-[#FF4B16]">بكل شفافية.</span>
          </h2>
          <p className="text-sm text-[#B7B9B0] mt-2 font-light">
            باقات تقسيط بنكية مباشرة مع كبرى البنوك المصرية بمقدم يبدأ من 20% وفترات سداد ميسرة تصل إلى 5 سنوات.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-[#141715] border border-white/10 p-6 sm:p-10 rounded-3xl shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Inputs Column */}
            <div className="space-y-6">
              
              {/* Car Price */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-[#F1EEE6]">سعر السيارة المقدر</label>
                  <span className="text-sm font-black text-[#FF4B16]">{formatEGP(carPrice)}</span>
                </div>
                <input
                  type="range"
                  min="1000000"
                  max="4500000"
                  step="50000"
                  value={carPrice}
                  onChange={(e) => setCarPrice(Number(e.target.value))}
                  className="w-full accent-[#FF4B16] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#9EA199] mt-1 font-mono">
                  <span>1,000,000 ج.م</span>
                  <span>4,500,000 ج.م</span>
                </div>
              </div>

              {/* Down Payment % */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-[#F1EEE6]">نسبة الدفعة المقدمة</label>
                  <span className="text-sm font-black text-[#FF4B16]">{downPaymentPercent}% ({formatEGP(downPaymentAmount)})</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[20, 30, 40, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDownPaymentPercent(pct)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        downPaymentPercent === pct
                          ? 'bg-[#FF4B16] text-white border-[#FF4B16] shadow-md shadow-[#FF4B16]/20'
                          : 'bg-[#0E1110] text-[#B7B9B0] border-white/10 hover:text-white'
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
                  <label className="text-xs font-bold text-[#F1EEE6]">مدة التقسيط</label>
                  <span className="text-sm font-black text-[#FF4B16]">{years} سنوات ({totalMonths} شهر)</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setYears(yr)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        years === yr
                          ? 'bg-[#FF4B16] text-white border-[#FF4B16] shadow-md shadow-[#FF4B16]/20'
                          : 'bg-[#0E1110] text-[#B7B9B0] border-white/10 hover:text-white'
                      }`}
                    >
                      {yr} {yr === 1 ? 'سنة' : yr === 2 ? 'سنتين' : 'سنوات'}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Output Calculation Box */}
            <div className="bg-[#0A0C0B] border border-white/10 p-6 sm:p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#C9B37E] uppercase tracking-wider block mb-1">
                  القسط الشهري التقديري
                </span>
                <div className="text-3xl sm:text-4xl font-black text-[#F1EEE6] mb-6">
                  {formatEGP(monthlyInstallment)}
                  <span className="text-xs font-normal text-[#9EA199] block mt-1">شهرياً على مدار {years} سنوات</span>
                </div>

                <div className="space-y-3 py-4 border-y border-white/10 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#9EA199]">المقدم المطلوب:</span>
                    <span className="font-bold text-[#F1EEE6]">{formatEGP(downPaymentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9EA199]">قيمة التمويل المتبقية:</span>
                    <span className="font-bold text-[#F1EEE6]">{formatEGP(financedAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9EA199]">شروط التقسيط:</span>
                    <span className="font-bold text-emerald-400">بصورة البطاقة فقط</span>
                  </div>
                </div>
              </div>

              <a
                href="/viewing"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', '/viewing');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="mt-6 w-full py-3.5 px-4 rounded-xl bg-[#FF4B16] hover:bg-[#E03E0F] text-white font-bold text-xs sm:text-sm text-center shadow-lg shadow-[#FF4B16]/20 transition-all flex items-center justify-center gap-2"
              >
                <span>طلب تمويل أو استبدال للسيارة</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
