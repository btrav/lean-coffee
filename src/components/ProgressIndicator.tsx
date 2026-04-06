import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels
}) => {
  const { theme: t } = useTheme();

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        {stepLabels.map((label, index) => (
          <div
            key={index}
            className={index <= currentStep ? t.stepActive : t.stepInactive}
          >
            {index + 1}
          </div>
        ))}
      </div>
      <div className={`${t.progressTrack} h-1`}>
        <div
          className={`${t.progressFill} h-1 ease-out`}
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>
      <div className="text-center mt-2">
        <span className={`text-sm ${t.body}`}>
          {stepLabels[currentStep]} ({currentStep + 1} of {totalSteps})
        </span>
      </div>
    </div>
  );
};
