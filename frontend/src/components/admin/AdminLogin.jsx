import React, { useState } from 'react';
import { loginAdmin } from '../../services/adminApi';

export default function AdminLogin({ onLoginSuccess, onSuccess, onBackToSite, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBack = (e) => {
    if (e) e.preventDefault();
    if (onBackToSite) onBackToSite();
    else if (onClose) onClose();
    else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await loginAdmin(username.trim(), password);
      if (onLoginSuccess) onLoginSuccess(user);
      else if (onSuccess) onSuccess(user);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'اسم المستخدم أو كلمة المرور غير صحيحة'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      style={{
        fontFamily: "'Alexandria', 'Cairo', sans-serif",
        background: 'linear-gradient(135deg, #141a22 0%, #1e2530 55%, #1e2530 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        color: '#1e293b',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '435px',
          borderRadius: '18px',
          padding: '38px 32px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.38)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            background: '#fdf8f3',
            color: '#1e2530',
            border: '1px solid #f0e1d0',
            padding: '4px 14px',
            borderRadius: '50px',
            fontSize: '13.4px',
            fontWeight: 700,
            marginBottom: '14px',
          }}
        >
          سوق أوتو محمد نبيل للسيارات • منذ 2007
        </div>

        <div>
          <img
            src="/favicon.png"
            alt="Auto Mohamed Nabil"
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              margin: '0 auto 14px',
              display: 'block',
              objectFit: 'cover',
              border: '2px solid #e8935f',
              background: '#0A0C0B',
              padding: '2px',
            }}
          />
        </div>

        <h1
          style={{
            color: '#1e2530',
            fontSize: '23.5px',
            fontWeight: 800,
            marginBottom: '6px',
          }}
        >
          لوحة إدارة معرض أوتو محمد نبيل
        </h1>
        <p
          style={{
            color: '#64748b',
            fontSize: '14.6px',
            marginBottom: '26px',
            lineHeight: 1.6,
          }}
        >
          نظام إدارة أسطول السيارات، حجوزات المعاينة، العملاء (CRM)، ومحركات البحث
        </p>

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '12px',
              borderRadius: '10px',
              fontSize: '14.6px',
              marginBottom: '18px',
              fontWeight: 600,
            }}
          >
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ textAlign: 'right', marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '14.6px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              اسم المستخدم أو البريد الإلكتروني
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              placeholder="أدخل اسم المستخدم"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                fontFamily: 'inherit',
                fontSize: '15.7px',
                color: '#0f172a',
                background: '#ffffff',
                outline: 'none',
                transition: '0.2s',
              }}
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '14.6px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              كلمة المرور
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                fontFamily: 'inherit',
                fontSize: '15.7px',
                color: '#0f172a',
                background: '#ffffff',
                outline: 'none',
                transition: '0.2s',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#1e2530',
              color: '#ffffff',
              border: 'none',
              padding: '13px',
              borderRadius: '10px',
              fontFamily: 'inherit',
              fontSize: '16.8px',
              fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer',
              transition: '0.2s',
              marginTop: '6px',
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading ? 'جاري التحقق من الصلاحيات...' : 'دخول آمن للوحة التحكم '}
          </button>
        </form>

        <div
          style={{
            marginTop: '22px',
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            padding: '12px',
            borderRadius: '10px',
            fontSize: '13.4px',
            color: '#475569',
            textAlign: 'right',
            lineHeight: 1.6,
          }}
        >
           <strong>دخول محمي.</strong> هذه اللوحة مخصصة للمصرح لهم فقط.
        </div>

        <a
          href="/"
          onClick={handleBack}
          style={{
            display: 'inline-block',
            marginTop: '18px',
            color: '#64748b',
            textDecoration: 'none',
            fontSize: '14.6px',
            fontWeight: 600,
          }}
        >
          ← العودة للموقع الرئيسي
        </a>
      </div>
    </div>
  );
}

