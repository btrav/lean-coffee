import React, { useState, useRef, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { themes, ThemeName } from '../themes';

const themeOrder: ThemeName[] = ['notion', 'warm', 'ink'];

export const ThemePicker: React.FC = () => {
  const { theme: t, themeName, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="fixed bottom-10 right-4 z-50">
      {open && (
        <div className={`${t.card} mb-2 min-w-[140px] !p-1`}>
          {themeOrder.map((name) => (
            <button
              key={name}
              onClick={() => {
                setTheme(name);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded transition-colors ${
                name === themeName
                  ? `${t.accentBg} ${t.accent}`
                  : `${t.heading} hover:bg-gray-100`
              }`}
            >
              {themes[name].label}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${t.heading} bg-white border-gray-200 hover:border-gray-400`}
        aria-label="Change theme"
      >
        <Palette className="w-3.5 h-3.5" aria-hidden="true" />
        {themes[themeName].label}
      </button>
    </div>
  );
};
