import { useCallback } from 'react';

/**
 * useHaptics — Simple wrapper for navigator.vibrate()
 * Provides physical feedback on job sites for silent recording.
 */
export function useHaptics() {
  const vibrateStart = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50); // Short tap on start
    }
  }, []);

  const vibrateEnd = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 30, 30]); // Triple tap on end
    }
  }, []);

  const vibrateConfirm = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(120); // Longer confirmation pulse
    }
  }, []);

  return { vibrateStart, vibrateEnd, vibrateConfirm };
}
