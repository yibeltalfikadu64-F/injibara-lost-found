// mobile/src/hooks/useDebounce.ts

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

// ============================================================
// TYPES
// ============================================================

export interface UseDebounceOptions {
  /**
   * Delay in milliseconds.
   */
  delay?: number;

  /**
   * Update the value immediately on the first change.
   */
  leading?: boolean;

  /**
   * Execute the update after the delay.
   */
  trailing?: boolean;

  /**
   * Whether the debounce is active.
   */
  enabled?: boolean;

  /**
   * Callback after the debounced value changes.
   */
  onDebounce?: () => void;
}

export interface DebounceControls {
  cancel: () => void;

  flush: () => void;

  isPending: boolean;
}

// ============================================================
// DEFAULT CONFIGURATION
// ============================================================

const DEFAULT_DELAY = 500;

// ============================================================
// VALUE DEBOUNCE HOOK
// ============================================================

export function useDebounce<T>(
  value: T,
  delay: number = DEFAULT_DELAY,
): T {
  const [debouncedValue, setDebouncedValue] =
    useState<T>(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, Math.max(0, delay));

    return () => {
      clearTimeout(timeout);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================
// ADVANCED VALUE DEBOUNCE HOOK
// ============================================================

export function useDebounceAdvanced<T>(
  value: T,
  options: UseDebounceOptions = {},
): {
  value: T;
  cancel: () => void;
  flush: () => void;
  isPending: boolean;
} {
  const {
    delay = DEFAULT_DELAY,
    leading = false,
    trailing = true,
    enabled = true,
    onDebounce,
  } = options;

  const [debouncedValue, setDebouncedValue] =
    useState<T>(value);

  const [isPending, setIsPending] =
    useState(false);

  const timeoutRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const latestValueRef = useRef(value);

  const leadingCalledRef = useRef(false);

  const callbackRef = useRef(onDebounce);

  // Keep the latest value available to callbacks.
  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  // Keep callback current without resetting the timer.
  useEffect(() => {
    callbackRef.current = onDebounce;
  }, [onDebounce]);

  // ----------------------------------------------------------
  // CLEAR TIMER
  // ----------------------------------------------------------

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);

      timeoutRef.current = null;
    }
  }, []);

  // ----------------------------------------------------------
  // CANCEL
  // ----------------------------------------------------------

  const cancel = useCallback(() => {
    clearTimer();

    setIsPending(false);

    leadingCalledRef.current = false;
  }, [clearTimer]);

  // ----------------------------------------------------------
  // FLUSH
  // ----------------------------------------------------------

  const flush = useCallback(() => {
    if (timeoutRef.current === null) {
      return;
    }

    clearTimer();

    if (trailing) {
      setDebouncedValue(
        latestValueRef.current,
      );

      callbackRef.current?.();
    }

    setIsPending(false);

    leadingCalledRef.current = false;
  }, [
    clearTimer,
    trailing,
  ]);

  // ----------------------------------------------------------
  // DEBOUNCE EFFECT
  // ----------------------------------------------------------

  useEffect(() => {
    if (!enabled) {
      setDebouncedValue(value);
      setIsPending(false);
      clearTimer();

      return;
    }

    setIsPending(true);

    if (
      leading &&
      !leadingCalledRef.current
    ) {
      setDebouncedValue(value);

      leadingCalledRef.current = true;

      if (!trailing) {
        setIsPending(false);
      }
    }

    clearTimer();

    timeoutRef.current = setTimeout(() => {
      if (trailing) {
        setDebouncedValue(
          latestValueRef.current,
        );

        callbackRef.current?.();
      }

      setIsPending(false);

      leadingCalledRef.current = false;

      timeoutRef.current = null;
    }, Math.max(0, delay));

    return clearTimer;
  }, [
    value,
    delay,
    leading,
    trailing,
    enabled,
    clearTimer,
  ]);

  return {
    value: debouncedValue,
    cancel,
    flush,
    isPending,
  };
}

// ============================================================
// DEBOUNCED CALLBACK HOOK
// ============================================================

export function useDebouncedCallback<
  TArgs extends unknown[],
>(
  callback: (...args: TArgs) => void,
  delay: number = DEFAULT_DELAY,
): {
  debouncedCallback: (...args: TArgs) => void;
  cancel: () => void;
  flush: () => void;
  isPending: boolean;
} {
  const callbackRef = useRef(callback);

  const timerRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const argumentsRef = useRef<TArgs | null>(
    null,
  );

  const [isPending, setIsPending] =
    useState(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // ----------------------------------------------------------
  // CANCEL CALLBACK
  // ----------------------------------------------------------

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);

      timerRef.current = null;
    }

    argumentsRef.current = null;

    setIsPending(false);
  }, []);

  // ----------------------------------------------------------
  // FLUSH CALLBACK
  // ----------------------------------------------------------

  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);

      timerRef.current = null;
    }

    if (argumentsRef.current !== null) {
      callbackRef.current(
        ...argumentsRef.current,
      );

      argumentsRef.current = null;
    }

    setIsPending(false);
  }, []);

  // ----------------------------------------------------------
  // DEBOUNCED CALLBACK
  // ----------------------------------------------------------

  const debouncedCallback = useCallback(
    (...args: TArgs) => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }

      argumentsRef.current = args;

      setIsPending(true);

      timerRef.current = setTimeout(() => {
        const latestArguments =
          argumentsRef.current;

        if (latestArguments !== null) {
          callbackRef.current(
            ...latestArguments,
          );
        }

        argumentsRef.current = null;

        timerRef.current = null;

        setIsPending(false);
      }, Math.max(0, delay));
    },
    [delay],
  );

  // ----------------------------------------------------------
  // CLEANUP
  // ----------------------------------------------------------

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    debouncedCallback,
    cancel,
    flush,
    isPending,
  };
}

// ============================================================
// DEBOUNCED SEARCH HOOK
// ============================================================

export function useDebouncedSearch(
  initialValue = '',
  delay = 400,
) {
  const [search, setSearch] =
    useState(initialValue);

  const debouncedSearch = useDebounce(
    search.trim(),
    delay,
  );

  const clearSearch = useCallback(() => {
    setSearch('');
  }, []);

  const hasSearch = search.trim().length > 0;

  const isSearching =
    search.trim() !== debouncedSearch;

  return {
    search,
    setSearch,

    debouncedSearch,

    clearSearch,

    hasSearch,
    isSearching,
  };
}

// ============================================================
// DEBOUNCED BOOLEAN HOOK
// ============================================================

export function useDebouncedBoolean(
  value: boolean,
  delay = DEFAULT_DELAY,
): boolean {
  return useDebounce(value, delay);
}

// ============================================================
// DEBOUNCED NUMBER HOOK
// ============================================================

export function useDebouncedNumber(
  value: number,
  delay = DEFAULT_DELAY,
): number {
  return useDebounce(value, delay);
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default useDebounce;