import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { loginAdmin } from '../../services/adminApi';

export default function AdminLogin({ onLoginSuccess, onBackToSite }) {
  const [username, setUsername] = useState('Performax');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setLoading(true);
    try {
      const user = await loginAdmin(username.trim(), password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'فشل تسجيل الدخول، يرجى التأكد من البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لموقع المعرض الرئيسي</span>
        </button>

        {/* Login Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/10">
          <div className="text-center mb-6">
            <img
              src="/images/logo.jpg"
              alt="M. Nabil"
              className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-brand-orange shadow-brand object-cover"
            />
            <h1 className="text-xl font-black text-white">بوابة إدارة المعرض والـ CRM</h1>
            <p className="text-xs text-gray-400 mt-1">سوق أوتو محمد نبيل للسيارات • منذ 2007</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Username */}
            <div>
              <label className="block text-gray-300 font-semibold mb-1">اسم المستخدم</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="اسم المستخدم"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-dark-950 border border-white/10 rounded-xl pr-10 pl-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-colors"
                />
                <User className="w-4 h-4 text-gray-500 absolute right-3.5 top-3" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 font-semibold mb-1">كلمة المرور المشفرة</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-950 border border-white/10 rounded-xl pr-10 pl-10 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-colors"
                  dir="ltr"
                />
                <Lock className="w-4 h-4 text-gray-500 absolute right-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-brand-orange to-brand-hover text-white font-extrabold text-sm shadow-brand hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <span>دخول لوحة التحكم</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>نظام مشفر ومحمي برمز جلسة JWT مشفر 256-bit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
