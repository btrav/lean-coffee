import React, { useState } from 'react';
import { ArrowRight, Coffee } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface JoinRoomProps {
  onStart: (userName: string) => void;
}

export const JoinRoom: React.FC<JoinRoomProps> = ({ onStart }) => {
  const { theme: t } = useTheme();
  const [userName, setUserName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = userName.trim();
    if (!name) return;
    onStart(name);
  };

  return (
    <div className={`${t.page} flex items-center justify-center`}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-12">
          <div className={t.iconBubble}>
            <Coffee className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h1 className={`text-4xl font-bold ${t.heading} mb-3`}>Lean Coffee</h1>
          <p className={`text-xl ${t.body}`}>Structured collaborative discussions</p>
        </div>

        <div className={t.card}>
          <div className="text-center mb-8">
            <h2 className={`text-2xl font-bold ${t.heading} mb-2`}>Who's facilitating?</h2>
            <p className={t.body}>Enter your name to start a new session</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="facilitator-name" className="sr-only">Your name</label>
              <input
                id="facilitator-name"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name..."
                className={t.input}
                autoFocus
                maxLength={50}
              />
            </div>

            <button
              type="submit"
              disabled={!userName.trim()}
              className={`w-full py-4 px-6 text-lg flex items-center justify-center gap-2 ${
                userName.trim() ? t.btnPrimary : t.btnPrimaryDisabled
              }`}
            >
              Start Session
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
