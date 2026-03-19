import React, { useState, useEffect } from 'react';
import { Clock, Plus } from 'lucide-react';

interface TimerProps {
  initialTime: number; // in seconds
  onTimeUp: () => void;
  isRunning: boolean;
  onExtend: () => void;
  onTimeUpdate: (timeSpent: number) => void;
}

export const Timer: React.FC<TimerProps> = ({ 
  initialTime, 
  onTimeUp, 
  isRunning, 
  onExtend,
  onTimeUpdate 
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    setTimeLeft(initialTime);
    setTimeSpent(0);
  }, [initialTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime === 0) {
            onTimeUp();
          }
          return newTime;
        });
        setTimeSpent(prev => {
          const newSpent = prev + 1;
          onTimeUpdate(newSpent);
          return newSpent;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
    // timeLeft is intentionally included so the effect re-runs (and the interval
    // is cleared) the moment timeLeft hits 0 — prevents ticking past zero
  }, [isRunning, timeLeft, onTimeUp, onTimeUpdate]);

  const handleExtend = () => {
    setTimeLeft(prev => prev + 60); // Add 1 minute
    onExtend();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((initialTime - timeLeft) / initialTime) * 100;
  const isLowTime = timeLeft <= 30 && timeLeft > 0;
  const isTimeUp = timeLeft === 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          <span className="text-lg font-semibold text-gray-700">Discussion Timer</span>
        </div>
        <button
          onClick={handleExtend}
          className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          +1 min
        </button>
      </div>
      
      <div className="text-center mb-4">
        <div className={`text-4xl font-bold transition-colors ${
          isTimeUp ? 'text-red-600' : isLowTime ? 'text-orange-600' : 'text-gray-800'
        }`}>
          {formatTime(timeLeft)}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Time spent: {formatTime(timeSpent)}
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            isTimeUp ? 'bg-red-500' : isLowTime ? 'bg-orange-500' : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      
      {isTimeUp && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-center font-medium">⏰ Time's up! Ready to move on?</p>
        </div>
      )}
    </div>
  );
};