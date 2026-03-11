import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause } from 'lucide-react';

interface PhaseTimerProps {
  phaseStartTime?: number;
  phaseTimeLimit?: number;
  phaseName: string;
  onTimeUp?: () => void;
}

export const PhaseTimer: React.FC<PhaseTimerProps> = ({
  phaseStartTime,
  phaseTimeLimit,
  phaseName,
  onTimeUp
}) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!phaseStartTime || !phaseTimeLimit) return;

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - phaseStartTime) / 1000);
      const remaining = Math.max(0, phaseTimeLimit - elapsed);
      
      setTimeLeft(remaining);
      
      if (remaining === 0 && onTimeUp) {
        onTimeUp();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [phaseStartTime, phaseTimeLimit, onTimeUp]);

  if (!phaseTimeLimit || timeLeft === null) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = phaseTimeLimit > 0 ? ((phaseTimeLimit - timeLeft) / phaseTimeLimit) * 100 : 0;
  const isLowTime = timeLeft <= 60 && timeLeft > 0;
  const isTimeUp = timeLeft === 0;

  return (
    <div className="fixed top-4 right-4 bg-white rounded-2xl shadow-lg p-4 border border-gray-100 z-50">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isTimeUp ? 'bg-red-100' : isLowTime ? 'bg-orange-100' : 'bg-blue-100'
        }`}>
          <Clock className={`w-5 h-5 ${
            isTimeUp ? 'text-red-600' : isLowTime ? 'text-orange-600' : 'text-blue-600'
          }`} />
        </div>
        <div>
          <div className="text-sm text-gray-600">{phaseName}</div>
          <div className={`text-lg font-bold ${
            isTimeUp ? 'text-red-600' : isLowTime ? 'text-orange-600' : 'text-gray-800'
          }`}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-1 mt-3">
        <div
          className={`h-1 rounded-full transition-all duration-1000 ${
            isTimeUp ? 'bg-red-500' : isLowTime ? 'bg-orange-500' : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      
      {isTimeUp && (
        <div className="mt-2 text-xs text-red-600 font-medium text-center animate-pulse">
          Time's up!
        </div>
      )}
    </div>
  );
};