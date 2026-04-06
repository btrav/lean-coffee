import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
  onTimeUp,
}) => {
  const { theme: t } = useTheme();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!phaseStartTime || !phaseTimeLimit) return;

    const update = () => {
      const elapsed = Math.floor((Date.now() - phaseStartTime) / 1000);
      const remaining = Math.max(0, phaseTimeLimit - elapsed);
      setTimeLeft(remaining);
      if (remaining === 0 && onTimeUp) onTimeUp();
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [phaseStartTime, phaseTimeLimit, onTimeUp]);

  if (!phaseTimeLimit || timeLeft === null) return null;

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const progress = ((phaseTimeLimit - timeLeft) / phaseTimeLimit) * 100;
  const isLowTime = timeLeft <= 60 && timeLeft > 0;
  const isTimeUp = timeLeft === 0;

  const iconBg = isTimeUp ? t.dangerBg : isLowTime ? t.warningBg : t.accentBg;
  const iconColor = isTimeUp ? t.dangerText : isLowTime ? t.warningText : t.accent;
  const timerColor = isTimeUp ? t.dangerText : isLowTime ? t.warningText : t.heading;
  const barColor = isTimeUp ? 'bg-red-500' : isLowTime ? 'bg-orange-500' : t.progressFill.split(' ')[0];

  return (
    <div className={t.phaseTimer} role="timer" aria-label={`${phaseName} phase: ${formatTime(timeLeft)} remaining`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
          <Clock className={`w-5 h-5 ${iconColor}`} aria-hidden="true" />
        </div>
        <div>
          <div className={`text-sm ${t.body}`}>{phaseName}</div>
          <div className={`text-lg font-bold ${timerColor}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className={`${t.progressTrack} h-1 mt-3`}>
        <div
          className={`h-1 rounded-full transition-all duration-1000 ${barColor}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {isTimeUp && (
        <div className={`mt-2 text-xs ${t.dangerText} font-medium text-center animate-pulse`}>
          Time's up!
        </div>
      )}
    </div>
  );
};
