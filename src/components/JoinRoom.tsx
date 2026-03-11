import React, { useState } from 'react';
import { Users, Plus, ArrowRight, Coffee } from 'lucide-react';
import { StepTransition } from './StepTransition';

interface JoinRoomProps {
  onCreateRoom: (userName: string) => void;
  onJoinRoom: (userName: string, roomCode: string) => void;
}

export const JoinRoom: React.FC<JoinRoomProps> = ({ onCreateRoom, onJoinRoom }) => {
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'join' | 'create'>('create');

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    setStep(1);
  };

  const handleModeSelect = (selectedMode: 'join' | 'create') => {
    setMode(selectedMode);
    if (selectedMode === 'create') {
      onCreateRoom(userName.trim());
    } else {
      setStep(2);
    }
  };

  const handleRoomCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    onJoinRoom(userName.trim(), roomCode.trim().toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-lg">
            <Coffee className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Lean Coffee</h1>
          <p className="text-xl text-gray-600">Structured collaborative discussions</p>
        </div>

        {/* Step 0: Name Input */}
        <StepTransition isActive={step === 0}>
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">What's your name?</h2>
              <p className="text-gray-600">Let's get started with your name or nickname</p>
            </div>

            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!userName.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </StepTransition>

        {/* Step 1: Mode Selection */}
        <StepTransition isActive={step === 1}>
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Hi {userName}! 👋</h2>
              <p className="text-gray-600">Would you like to create a new session or join an existing one?</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleModeSelect('create')}
                className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Plus className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Create New Session</h3>
                    <p className="text-gray-600">Start a fresh Lean Coffee meeting</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleModeSelect('join')}
                className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Join Existing Session</h3>
                    <p className="text-gray-600">Enter a room code to join</p>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setStep(0)}
              className="w-full mt-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>
          </div>
        </StepTransition>

        {/* Step 2: Room Code Input */}
        <StepTransition isActive={step === 2}>
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Room Code</h2>
              <p className="text-gray-600">Ask your host for the 6-digit room code</p>
            </div>

            <form onSubmit={handleRoomCodeSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="w-full px-6 py-4 text-lg text-center border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 uppercase tracking-widest font-mono"
                  maxLength={6}
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!roomCode.trim() || roomCode.length < 6}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none flex items-center justify-center gap-2"
              >
                Join Session
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <button
              onClick={() => setStep(1)}
              className="w-full mt-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>
          </div>
        </StepTransition>
      </div>
    </div>
  );
};