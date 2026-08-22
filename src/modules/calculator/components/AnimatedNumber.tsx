import { useState, useEffect } from 'react';

// Helper component for animating numbers
export const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;

    const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easedProgress = easeOutQuart(progress);
      setDisplayValue(value * easedProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(displayValue)}
    </span>
  );
};
