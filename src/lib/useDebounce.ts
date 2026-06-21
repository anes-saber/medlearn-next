import { useCallback, useRef, useEffect } from "react";

/**
 * Debounce a function call. Returns a stable debounced version.
 */
export function useDebounce<T extends (...args: any[]) => void>(
  fn: T,
  delayMs: number,
): T {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return useCallback(
    (...args: any[]) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fnRef.current(...args), delayMs);
    },
    [delayMs],
  ) as T;
}

/**
 * Throttle a function call. Returns a stable throttled version.
 */
export function useThrottle<T extends (...args: any[]) => void>(
  fn: T,
  delayMs: number,
): T {
  const lastCallRef = useRef(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delayMs) {
        lastCallRef.current = now;
        fnRef.current(...args);
      }
    },
    [delayMs],
  ) as T;
}
