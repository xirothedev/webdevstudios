import { onScopeDispose, ref, watch, type MaybeRefOrGetter } from 'vue';
import { toValue } from 'vue';

export const DEFAULT_DELAY = 500;

/**
 * Debounce a value - returns a ref with the value after delay milliseconds of no changes
 */
export function useDebounce<T>(value: MaybeRefOrGetter<T>, delay: number = DEFAULT_DELAY) {
  const debouncedValue = ref(toValue(value)) as ReturnType<typeof ref<T>>;
  const timer = { id: null as ReturnType<typeof setTimeout> | null };
  const stop = watch(
    () => toValue(value),
    (v) => {
      if (timer.id) clearTimeout(timer.id);
      timer.id = setTimeout(() => {
        debouncedValue.value = v;
      }, delay);
    },
  );
  onScopeDispose(() => {
    if (timer.id) clearTimeout(timer.id);
    stop();
  });
  return debouncedValue;
}

/**
 * Debounce a callback - returned function only executes after delay ms of no calls
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = DEFAULT_DELAY,
): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const debouncedCallback = ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  }) as T;
  onScopeDispose(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
  return debouncedCallback;
}
