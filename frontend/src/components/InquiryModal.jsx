import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Loader2, MessageCircle, Phone, Sparkles } from 'lucide-react';
import { submitInquiry, SHOWROOM_CONTACT } from '../services/api';

export default function InquiryModal({ context, onClose, cars = [] }) {
  if (!context) return null;

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_city: 'ميت غمر',
    inquiry_type: context.type || 'general',
    car_id: context.carId || '',
    message: '',
    preferred_contact: 'whatsapp'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  // Validate Egyptian phone number (010, 011, 012, 015 + 8 digits)
  const validatePhone = (p) => {
    return /^01[0125][0-9]{8}$/.test(p.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customer_name.trim()) {
      setError('يرجى كتابة الاسم الكريم');
      return;
    }

    if (!validatePhone(formData.customer_phone)) {
      setError('يرجى إدخال رقم هاتف مصري صحيح يبدأ بـ 01 ومكون من 11 رقم');
      return;
    }

    setLoading(true);
    try {
      const res = await submitInquiry(formData);
      setSuccessResult(res);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء الإرسال، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-dark-900 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-dark-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {context.title || 'طلب استفسار / حجز موعد'}
              </h3>
              <span className="text-[11px] text-gray-400">سوق أوتو محمد نبيل - ميت غمر</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {successResult ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h4 className="text-xl font-black text-white">تم استلام طلبك بنجاح!</h4>
              <p className="text-xs sm:text-sm text-gray-300 max-w-sm mx-auto leading-relaxed">
                شكراً لتواصلك مع سوق أوتو محمد نبيل. رقم مرجع طلبك هو:{' '}
                <span className="font-mono font-bold text-brand-orange">{successResult.data?.ref}</span>.
                سيقوم فريق المبيعات بالتواصل معك فوراً.
              </p>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={`${SHOWROOM_CONTACT.whatsappLink}?text=${encodeURIComponent(`مرحباً أوتو محمد نبيل، قمت بإرسال طلب استفسار برقم مرجعي: ${successResult.data?.ref}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>تأكيد الطلب مباشرة عبر الواتساب</span>
                </a>
                <button
                  onClick={onClose}
                  className="w-full py-2 text-xs text-gray-400 hover:text-white"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد محمود"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full bg-dark-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">رقم الهاتف (موبايل مصري) *</label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  placeholder="01012345678"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full bg-dark-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 text-right focus:outline-none focus:border-brand-orange transition-colors"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">رقم للتواصل عليه عبر الاتصال أو الواتساب</span>
              </div>

              {/* Car Selection */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">السيارة المهتم بها (اختياري)</label>
                <select
                  value={formData.car_id}
                  onChange={(e) => setFormData({ ...formData, car_id: e.target.value })}
                  className="w-full bg-dark-950 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-brand-orange transition-colors"
                >
                  <option value="">استفسار عام / تشكيلة المعرض كاملة</option>
                  {cars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.make} {c.model} ({c.year})
                    </option>
                  ))}
                </select>
              </div>

              {/* Inquiry Type */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">طريقة الدفع المطلوبة</label>
                  <select
                    value={formData.inquiry_type}
                    onChange={(e) => setFormData({ ...formData, inquiry_type: e.target.value })}
                    className="w-full bg-dark-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-orange transition-colors"
                  >
                    <option value="general">استفسار عام</option>
                    <option value="price">شراء كاش</option>
                    <option value="finance">طلب تقسيط ميسر</option>
                    <option value="trade_in">استبدال سيارة قديمة</option>
                    <option value="test_drive">حجز موعد فحص ومعاينة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">المدينة / المحافظة</label>
                  <input
                    type="text"
                    value={formData.customer_city}
                    onChange={(e) => setFormData({ ...formData, customer_city: e.target.value })}
                    className="w-full bg-dark-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-orange transition-colors"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">أي تفاصيل إضافية أو وقت مناسب للتواصل</label>
                <textarea
                  rows="2"
                  placeholder="اكتب استفسارك هنا..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-dark-950 border border-white/10 rounded-xl p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-colors"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-brand-orange to-brand-hover text-white font-extrabold text-sm shadow-brand hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <span>إرسال الطلب الآن</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
