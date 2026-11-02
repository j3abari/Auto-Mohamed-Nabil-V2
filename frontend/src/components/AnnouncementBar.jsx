import React, { useState, useEffect } from 'react';

export default function AnnouncementBar({ settings }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [barHeight, setBarHeight] = useState(44);

  const text = (settings?.announcement_bar || '').trim();
  const startStr = settings?.announcement_start;
  const endStr = settings?.announcement_end;

  useEffect(() => {
    if (!text) {
      setIsVisible(false);
      return;
    }

    const checkVisibilityAndTick = () => {
      const now = Date.now();

      // Check start time
      if (startStr) {
        const startMs = Date.parse(startStr);
        if (!isNaN(startMs) && now < startMs) {
          setIsVisible(false);
          return;
        }
      }

      // Check end time
      if (endStr) {
        const endMs = Date.parse(endStr);
        if (!isNaN(endMs)) {
          const diff = endMs - now;
          if (diff <= 0) {
            setIsVisible(false);
            setTimeLeft(null);
            return;
          }

          const d = Math.floor(diff / (1000 * 60 * 60 * 24));
          const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const m = Math.floor((diff / (1000 * 60)) % 60);
          const s = Math.floor((diff / 1000) % 60);

          setTimeLeft({ d, h, m, s });
          setIsVisible(true);
          return;
        }
      }

      // No end time, plain announcement
      setTimeLeft(null);
      setIsVisible(true);
    };

    checkVisibilityAndTick();
    const interval = setInterval(checkVisibilityAndTick, 1000);
    return () => clearInterval(interval);
  }, [text, startStr, endStr]);

  useEffect(() => {
    if (!isVisible) return;
    const el = document.getElementById('mnabil-announcement-bar');
    if (el) {
      setBarHeight(el.offsetHeight || 44);
    }
  }, [isVisible, text, timeLeft]);

  if (!isVisible || !text) return null;

  const pad = (n) => (n < 10 ? `0${n}` : n);

  return (
    <>
      <div
        id="mnabil-announcement-bar"
        dir="rtl"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          background: 'linear-gradient(90deg, #c2602b 0%, #d97736 50%, #c2602b 100%)',
          color: '#ffffff',
          textAlign: 'center',
          padding: '10px 16px',
          fontFamily: "'Alexandria', 'Cairo', sans-serif",
          fontWeight: 700,
          fontSize: '13.5px',
          zIndex: 99999,
          boxShadow: '0 3px 12px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          boxSizing: 'border-box',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span>📢</span>
          <span>{text}</span>
        </span>

        {timeLeft && (
          <span
            dir="ltr"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#1e2530',
              color: '#f8fafc',
              padding: '3px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 800,
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              marginRight: '8px',
            }}
          >
            <span>⏳</span>
            <span>
              {timeLeft.d > 0 && `${timeLeft.d}d : `}
              {pad(timeLeft.h)}h : {pad(timeLeft.m)}m : {pad(timeLeft.s)}s
            </span>
          </span>
        )}
      </div>
      {/* Spacer to prevent content overlap */}
      <div style={{ height: `${barHeight}px`, width: '100%' }} />
    </>
  );
}
