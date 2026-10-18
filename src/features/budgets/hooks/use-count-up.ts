import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

const DURATION_MS = 700;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** Animates from the previous target to the new one; shows the target as-is under Reduce Motion. */
export function useCountUp(target: number) {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    if (reduceMotion) {
      current.current = target;
      return;
    }
    const from = current.current;
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / DURATION_MS);
      current.current = from + (target - from) * easeOutCubic(k);
      setValue(current.current);
      if (k < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, reduceMotion]);

  return reduceMotion ? target : value;
}
