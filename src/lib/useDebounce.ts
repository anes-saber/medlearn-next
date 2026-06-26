import { useCallback, useRef, useEffect } from "react";

export function useDebounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delayMs: number,
): T {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fnRef.current(...args), delayMs);
    },
    [delayMs],
  ) as T;
}

export function useThrottle<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delayMs: number,
): T {
  const lastCallRef = useRef(0);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delayMs) {
        lastCallRef.current = now;
        fnRef.current(...args);
      }
    },
    [delayMs],
  ) as T;
}
