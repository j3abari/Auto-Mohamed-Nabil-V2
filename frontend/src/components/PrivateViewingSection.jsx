import React, { useState } from 'react';
import { CalendarCheck, ShieldCheck, Clock, CheckCircle2, AlertCircle, Sparkles, Send } from 'lucide-react';
import { submitInquiry, SHOWROOM_CONTACT } from '../services/api';

export default function PrivateViewingSection({ cars = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    car_id: '',
    preferred_date: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [successRef, setSuccessRef] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const availableCars = cars.filter(c => c.status === 'available');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Egyptian phone validation
    const cleanPhone = formData.phone.replace(/[\s-]/g, '');
    const egRegex = /^(010|011|012|015)\d{8}$/;
    if (!egRegex.test(cleanPhone)) {
      setErrorMsg('يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)');
      return;
    }

    if (!formData.name.trim()) {
      setErrorMsg('يرجى إدخال الاسم بالكامل');
      return;
    }

    setSubmitting(true);
    try {
      const selectedCarObj = cars.find(c => c.id === formData.car_id);
      const res = await submitInquiry({
        customer_name: formData.name.trim(),
        customer_phone: cleanPhone,
        car_id: formData.car_id || null,
        inquiry_type: 'test_drive',
        source: 'website',
        message: `[طلب معاينة خاصة وتجربة قيادة] - الموعد المفضل: ${formData.preferred_date || 'غير محدد'} - السيارة: ${selectedCarObj ? `${selectedCarObj.make} ${selectedCarObj.model} (${selectedCarObj.year})` : 'معاينة عامة'} - ملاحظات: ${formData.notes || 'لا يوجد'}`
      });

      if (res.success && res.data) {
        setSuccessRef(res.data.inquiry_ref || res.data.ref);
        setFormData({ name: '', phone: '', car_id: '', preferred_date: '', notes: '' });
      } else {
        setErrorMsg(res.message || 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مجدداً');
      }
    } catch (err) {
      setErrorMsg(err.message || 'تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="viewing" className="py-24 bg-gradient-to-b from-[#0E1110] via-[#0A0C0B] to-[#0E1110] border-t border-b border-white/5 relative overflow-hidden">
      {/* Decorative luxury glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#FF4B16]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C9B37E]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="gx-kicker gx-kicker-orange mb-3">
            معاينة خاصة • تجربة قيادة VIP
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F1EEE6] tracking-tight mt-2 mb-4">
            بعض التفاصيل تستحق أن <span className="text-[#FF4B16]">تراها بنفسك.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#B7B9B0] leading-relaxed">
            احجز موعداً خاصاً في صالة العرض. سيقوم مستشار المبيعات بتجهيز السيارة بالكامل، مع إتاحة تقرير الفحص الفني المعتمد وتجربة القيادة برفقتك.
          </p>
        </div>

        {/* Content Box */}
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#161917] to-[#101211] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl relative">
          
          {successRef ? (
            <div className="text-center py-12 space-y-5 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-[#F1EEE6]">تم تأكيد طلب المعاينة بنجاح!</h3>
              <p className="text-sm text-[#B7B9B0] max-w-lg mx-auto">
                رقم طلبك المرجعي هو: <span className="font-mono font-bold text-[#FF4B16] bg-black/40 px-3 py-1 rounded border border-[#FF4B16]/30">{successRef}</span>
              </p>
              <p className="text-xs text-[#9EA199]">
                سيتواصل معك مستشار المعرض هاتفياً خلال أقل من ساعتين لتأكيد ترتيبات الاستقبال وتجهيز السيارة.
              </p>
              <button
                onClick={() => setSuccessRef(null)}
                className="mt-4 px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-[#F1EEE6] text-xs font-semibold transition-colors"
              >
                طلب موعد آخر
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Trust Badges Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-6 border-b border-white/10 text-xs text-[#B7B9B0]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FF4B16]" />
                  <span>تجهيز السيارة والفحص مسبقاً</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C9B37E]" />
                  <span>استقبال VIP واستشارة خاصة</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>مواعيد مرنة طوال الأسبوع</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#F1EEE6] mb-1.5">
                    الاسم بالكامل <span className="text-[#FF4B16]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: أحمد محمد علي"
                    className="w-full px-4 py-3 rounded-lg bg-[#0E1110] border border-white/15 text-sm text-[#F1EEE6] placeholder-gray-500 focus:outline-none focus:border-[#FF4B16] transition-colors"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-[#F1EEE6] mb-1.5">
                    رقم الهاتف المحمول <span className="text-[#FF4B16]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01012345678"
                    className="w-full px-4 py-3 rounded-lg bg-[#0E1110] border border-white/15 text-sm text-[#F1EEE6] placeholder-gray-500 text-right focus:outline-none focus:border-[#FF4B16] transition-colors"
                  />
                </div>

                {/* Select Car */}
                <div>
                  <label className="block text-xs font-semibold text-[#F1EEE6] mb-1.5">
                    السيارة المطلوب معاينتها
                  </label>
                  <select
                    value={formData.car_id}
                    onChange={(e) => setFormData({ ...formData, car_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-[#0E1110] border border-white/15 text-sm text-[#F1EEE6] focus:outline-none focus:border-[#FF4B16] transition-colors"
                  >
                    <option value="">-- معاينة عامة لأسطول المعرض --</option>
                    {availableCars.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.make} {car.model} ({car.year}) - {Number(car.price).toLocaleString('ar-EG')} ج.م
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-[#F1EEE6] mb-1.5">
                    اليوم والموعد المفضل
                  </label>
                  <input
                    type="text"
                    value={formData.preferred_date}
                    onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                    placeholder="مثال: غداً الساعة 5:00 مساءً"
                    className="w-full px-4 py-3 rounded-lg bg-[#0E1110] border border-white/15 text-sm text-[#F1EEE6] placeholder-gray-500 focus:outline-none focus:border-[#FF4B16] transition-colors"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#F1EEE6] mb-1.5">
                  ملاحظات أو استفسارات إضافية (اختياري)
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="هل تود استبدال سيارتك الحالية؟ أو الاستفسار عن تمويل بنكي محدد؟"
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0E1110] border border-white/15 text-sm text-[#F1EEE6] placeholder-gray-500 focus:outline-none focus:border-[#FF4B16] transition-colors"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#9EA199]">
                  أو يمكنك الاتصال مباشرة: <a href={`tel:${SHOWROOM_CONTACT.phone}`} dir="ltr" className="font-bold text-[#F1EEE6] hover:text-[#FF4B16]">{SHOWROOM_CONTACT.phoneFormatted}</a>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FF4B16] hover:bg-[#E03E0F] text-white font-bold text-sm shadow-xl shadow-[#FF4B16]/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'جارٍ حجز الموعد...' : 'تأكيد حجز المعاينة الخاصة'}</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </section>
  );
}
