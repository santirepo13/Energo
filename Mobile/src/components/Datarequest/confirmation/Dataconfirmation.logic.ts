// Confirmation Logic - business logic for confirmation screen
import { useState, useEffect, useCallback } from 'react';

export interface ConfirmationLogicResult {
  countdown: number;
  onCountdownEnd: () => void;
}

export function useConfirmationLogic(onCountdownEnd: () => void): ConfirmationLogicResult {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onCountdownEnd();
    }
  }, [countdown, onCountdownEnd]);

  return {
    countdown,
  };
}