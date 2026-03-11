import React from 'react';

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
  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        {stepLabels.map((label, index) => (
          <div
            key={index}
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300 ${
              index <= currentStep
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {index + 1}
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1">
        <div
          className="bg-blue-500 h-1 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>
      <div className="text-center mt-2">
        <span className="text-sm text-gray-600">
          {stepLabels[currentStep]} ({currentStep + 1} of {totalSteps})
        </span>
      </div>
    </div>
  );
};