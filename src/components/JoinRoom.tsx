import React, { useState } from 'react';
import { ArrowRight, Coffee } from 'lucide-react';

interface JoinRoomProps {
  onStart: (userName: string) => void;
}

export const JoinRoom: React.FC<JoinRoomProps> = ({ onStart }) => {
  const [userName, setUserName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = userName.trim();
    if (!name) return;
    onStart(name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-lg">
            <Coffee className="w-10 h-10 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Lean Coffee</h1>
          <p className="text-xl text-gray-600">Structured collaborative discussions</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Who's facilitating?</h2>
            <p className="text-gray-600">Enter your name to start a new session</p>
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
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                autoFocus
                maxLength={50}
              />
            </div>

            <button
              type="submit"
              disabled={!userName.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none flex items-center justify-center gap-2"
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
