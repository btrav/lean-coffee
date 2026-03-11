import React from 'react';

interface StepTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  direction?: 'forward' | 'backward';
}

export const StepTransition: React.FC<StepTransitionProps> = ({ 
  children, 
  isActive, 
  direction = 'forward' 
}) => {
  return (
    <div className={`
      transition-all duration-500 ease-in-out
      ${isActive 
        ? 'opacity-100 translate-x-0' 
        : direction === 'forward' 
          ? 'opacity-0 translate-x-8' 
          : 'opacity-0 -translate-x-8'
      }
    `}>
      {children}
    </div>
  );
};