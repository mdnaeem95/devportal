"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatFn?: (value: number) => string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 1000,
  formatFn = (v) => v.toString(),
  className,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const current = startValue + (endValue - startValue) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  return <span className={className}>{formatFn(Math.round(displayValue))}</span>;
}

// Preset for currency
interface AnimatedCurrencyProps {
  value: number;
  currency?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCurrency({
  value,
  currency = "USD",
  duration = 1000,
  className,
}: AnimatedCurrencyProps) {
  const formatCurrency = (v: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(v / 100); // Assuming cents
  };

  return (
    <AnimatedNumber
      value={value}
      duration={duration}
      formatFn={formatCurrency}
      className={className}
    />
  );
}