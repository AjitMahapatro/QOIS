import React, { useState, useEffect, useRef } from "react";

/* =========================================================
   REUSABLE COUNTUP ANIMATION COMPONENT
========================================================= */
const easing = [0.42, 0, 0.58, 1.0]; // easeInOut custom

const CountUp = ({ end, duration = 1.2, formatter = (n) => n }) => {
  const [count, setCount] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    // Round to end value to ensure we count up to an integer value
    const final = Math.round(end);

    let frameId;
    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = timestamp - startRef.current;
      const timeRatio = Math.min(1, progress / (duration * 1000));
      
      // Use the easing curve for a smoother effect
      const easedTime = easing[0] * Math.pow(timeRatio, 3) +
                       easing[1] * Math.pow(timeRatio, 2) +
                       easing[2] * timeRatio +
                       easing[3] * Math.pow(timeRatio, 4) +
                       (1 - easing[0] - easing[1] - easing[2] - easing[3]) * Math.pow(timeRatio, 5);

      const currentValue = Math.round(easedTime * final);
      setCount(currentValue);

      if (timeRatio < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [end, duration]);

  // Use formatter on the current animated count
  return <>{formatter(count)}</>;
};

export default CountUp;
