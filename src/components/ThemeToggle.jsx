import React, { useState, useEffect } from 'react';

const ThemeToggle = ({ className = '' }) => {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gity-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gity-theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className={`bg-surface-container-lowest text-on-surface border-2 border-on-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold uppercase py-3 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex flex-col items-center justify-center gap-2 h-24 ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <span className="material-symbols-outlined text-2xl transition-transform duration-300" style={{ transform: isDark ? 'rotate(360deg)' : 'rotate(0deg)' }}>
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
      <span className="text-xs">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
};

export default ThemeToggle;
