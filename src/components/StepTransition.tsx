import React, { useRef, useEffect } from 'react';

interface StepTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  direction?: 'forward' | 'backward';
}

export const StepTransition: React.FC<StepTransitionProps> = ({
  children,
  isActive,
  direction = 'forward',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // `inert` and `aria-hidden` are set imperatively because React doesn't yet
  // support the `inert` attribute as a JSX prop. Together they prevent keyboard
  // focus and screen reader access to off-screen (inactive) step content.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isActive) {
      el.removeAttribute('inert');
      el.removeAttribute('aria-hidden');
    } else {
      el.setAttribute('inert', '');
      el.setAttribute('aria-hidden', 'true');
    }
  }, [isActive]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-in-out ${
        isActive
          ? 'opacity-100 translate-x-0'
          : direction === 'forward'
            ? 'opacity-0 translate-x-8'
            : 'opacity-0 -translate-x-8'
      }`}
    >
      {children}
    </div>
  );
};
