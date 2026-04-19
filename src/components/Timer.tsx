import React, { useState, useEffect, useRef } from 'react';
import { Clock, Plus, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface TimerProps {
  initialTime: number; // in seconds
  onTimeUp: () => void;
  isRunning: boolean;
  onTimeUpdate: (timeSpent: number) => void;
  warningThreshold?: number; // seconds remaining to trigger warning (default 120)
  onTimeWarning?: () => void;
}

export const Timer: React.FC<TimerProps> = ({
  initialTime,
  onTimeUp,
  isRunning,
  onTimeUpdate,
  warningThreshold = 120,
  onTimeWarning,
}) => {
  const { theme: t } = useTheme();
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const warningFiredRef = useRef(false);

  // Stable refs so the interval closure always sees the latest callbacks
  const onTimeUpRef = useRef(onTimeUp);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onTimeWarningRef = useRef(onTimeWarning);
  useEffect(() => { onTimeUpRef.current = onTimeUp; }, [onTimeUp]);
  useEffect(() => { onTimeUpdateRef.current = onTimeUpdate; }, [onTimeUpdate]);
  useEffect(() => { onTimeWarningRef.current = onTimeWarning; }, [onTimeWarning]);

  useEffect(() => {
    setTimeLeft(initialTime);
    setTimeSpent(0);
    setShowWarning(false);
    warningFiredRef.current = false;
  }, [initialTime]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime === 0) {
          onTimeUpRef.current();
        }
        // Fire warning once when crossing the threshold
        if (!warningFiredRef.current && newTime <= warningThreshold && newTime > 0) {
          warningFiredRef.current = true;
          setShowWarning(true);
          onTimeWarningRef.current?.();
        }
        return newTime;
      });
      setTimeSpent(prev => {
        const newSpent = prev + 1;
        onTimeUpdateRef.current(newSpent);
        return newSpent;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft <= 0, warningThreshold]);

  // Hide warning if time is extended past the threshold
  useEffect(() => {
    if (timeLeft > warningThreshold) {
      setShowWarning(false);
      warningFiredRef.current = false;
    }
  }, [timeLeft, warningThreshold]);

  const handleExtend = () => {
    setTimeLeft(prev => prev + 60);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((initialTime - timeLeft) / initialTime) * 100;
  const isLowTime = timeLeft <= 30 && timeLeft > 0;
  const isTimeUp = timeLeft === 0;

  const timerColor = isTimeUp ? t.dangerText : isLowTime ? t.warningText : t.heading;
  const barColor = isTimeUp ? 'bg-red-500' : isLowTime ? 'bg-orange-500' : t.progressFill.split(' ')[0];

  return (
    <div className={t.timerCard}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className={`w-6 h-6 ${t.accent}`} />
          <span className={`text-lg font-semibold ${t.heading}`}>Discussion Timer</span>
        </div>
        <button onClick={handleExtend} className={t.timerExtendBtn}>
          <Plus className="w-4 h-4" />
          +1 min
        </button>
      </div>

      <div className="text-center mb-4">
        <div className={`text-4xl font-bold transition-colors ${timerColor}`}>
          {formatTime(timeLeft)}
        </div>
        <div className={`text-sm ${t.muted} mt-1`}>
          Time spent: {formatTime(timeSpent)}
        </div>
      </div>

      <div className={`${t.progressTrack} h-3 overflow-hidden`}>
        <div
          className={`h-full transition-all duration-1000 ${barColor}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {showWarning && !isTimeUp && (
        <div className={`mt-4 p-3 ${t.warningBg} border border-orange-200 rounded-lg`} role="alert">
          <p className={`${t.warningText} text-center font-medium flex items-center justify-center gap-2`}>
            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            2 minutes remaining
          </p>
        </div>
      )}

      {isTimeUp && (
        <div className={`mt-4 p-3 ${t.dangerBg} border border-red-200 rounded-lg`}>
          <p className={`${t.dangerText} text-center font-medium`}>Time's up! Ready to move on?</p>
        </div>
      )}
    </div>
  );
};
