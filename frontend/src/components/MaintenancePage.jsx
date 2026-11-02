import React from 'react';
import { SHOWROOM_CONTACT } from '../services/api';
import { MessageCircle, Phone, MapPin, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function MaintenancePage({ isPreview = false, onBackToAdmin = null, onNavigate = null }) {
  const whatsappUrl = `https://wa.me/${SHOWROOM_CONTACT.whatsapp}?text=${encodeURIComponent(
    'مرحباً، أود الاستفسار عن سيارات معرض أوتو محمد نبيل المتاحة.'
  )}`;

  return (
    <div
      dir="rtl"
      style={{
        fontFamily: "'Alexandria', 'Cairo', sans-serif",
        background: 'radial-gradient(circle at center, #1e2530 0%, #141a22 100%)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        margin: 0,
        textAlign: 'center',
        padding: '24px 16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: '580px',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '36px 28px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Preview Banner if in preview mode */}
        {isPreview && (
          <div
            style={{
              background: '#991b1b',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>👁️ وضع المعاينة التوضيحية (صفحة الصيانة كما يراها الزوار)</span>
            {onBackToAdmin && (
              <button
                onClick={onBackToAdmin}
                style={{
                  background: '#ffffff',
                  color: '#991b1b',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontFamily: 'inherit',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ← العودة للإدارة
              </button>
            )}
          </div>
        )}

        {/* Brand Logo & Icon */}
        <div style={{ marginBottom: '18px' }}>
          <img
            src="/favicon.png"
            alt="Auto Mohamed Nabil"
            style={{
              width: '82px',
              height: '82px',
              borderRadius: '50%',
              margin: '0 auto 14px',
              display: 'block',
              objectFit: 'cover',
              border: '2px solid #e8935f',
              background: '#0A0C0B',
              padding: '3px',
              boxShadow: '0 0 25px rgba(232, 147, 95, 0.35)',
            }}
          />
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(232, 147, 95, 0.15)',
              color: '#e8935f',
              border: '1px solid rgba(232, 147, 95, 0.3)',
              padding: '4px 14px',
              borderRadius: '50px',
              fontSize: '12.5px',
              fontWeight: 700,
              marginBottom: '10px',
            }}
          >
            سوق أوتو محمد نبيل للسيارات • منذ 2007
          </div>
        </div>

        <h1
          style={{
            fontSize: '24px',
            fontWeight: 800,
            margin: '0 0 10px 0',
            color: '#ffffff',
            lineHeight: 1.4,
          }}
        >
          صيانة دورية وتحديثات مجدولة
        </h1>

        <p
          style={{
            fontSize: '14.5px',
            color: '#cbd5e1',
            lineHeight: 1.8,
            marginBottom: '26px',
          }}
        >
          نقوم حالياً بإجراء تحديثات مجدولة لقواعد بيانات أسطول السيارات وقوائم الأسعار وأنظمة الحجز لتحسين تجربتكم وخدمتكم بأعلى معايير الجودة والأمان.
        </p>

        {/* Contact CTA Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: '#22c55e',
              color: '#ffffff',
              padding: '13px 20px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '15px',
              boxShadow: '0 8px 20px rgba(34, 197, 94, 0.3)',
              transition: 'transform 0.2s',
            }}
          >
            <MessageCircle className="w-5 h-5" />
            <span>تواصل فوري عبر الواتساب ({SHOWROOM_CONTACT.whatsappDisplay})</span>
          </a>

          <a
            href={SHOWROOM_CONTACT.phoneHref}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              border: '1.5px solid rgba(255, 255, 255, 0.2)',
              padding: '13px 20px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '15px',
              transition: 'all 0.2s',
            }}
          >
            <Phone className="w-5 h-5 text-[#e8935f]" />
            <span>اتصال هاتفي مباشر ({SHOWROOM_CONTACT.phoneDisplay})</span>
          </a>
        </div>

        {/* Showroom Details Box */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            borderRadius: '14px',
            padding: '16px',
            textAlign: 'right',
            fontSize: '13px',
            color: '#94a3b8',
            lineHeight: 1.7,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin className="w-4 h-4 text-[#e8935f] shrink-0" />
            <span>{SHOWROOM_CONTACT.address}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock className="w-4 h-4 text-[#e8935f] shrink-0" />
            <span>{SHOWROOM_CONTACT.workingHours}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>جميع السيارات تخضع لبروتوكول الفحص المعتمد 100 نقطة</span>
          </div>
        </div>

        {/* Staff Login Link */}
        <div style={{ marginTop: '24px' }}>
          <a
            href="/login"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('/login');
              }
            }}
            style={{
              color: 'rgba(255, 255, 255, 0.45)',
              fontSize: '12.5px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s',
            }}
          >
            <span>🔐</span>
            <span>دخول موظفي المعرض والإدارة العليا</span>
          </a>
        </div>
      </div>
    </div>
  );
}
