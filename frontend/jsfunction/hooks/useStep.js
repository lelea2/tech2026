/**
 * Implement a useStep hook that manages a step counter for a multi-step process.
 * The hook should provide utility methods to go to the next and previous steps, 
 * and allow resetting of the step counter. 
 * The step number is 1-indexed and goes up at most to maxStep.
 */
/**
 * @param {number} maxStep
 */
import {useCallback, useMemo, useState} from 'react';

export default function useStep(maxStep) {
  const [step, setStepState] = useState(1);

  const setStep = useCallback(
    (value) => {
      setStepState((prev) => {
        const val =
          typeof value === 'function'
            ? value(prev)
            : value;
        // If the value is greater than the maximum step, reset to 1
        if (val > maxStep) {
          return 1;
        }
        return Math.max(1, Math.min(val, maxStep));
      });
    },
    [maxStep],
  );

  const next = useCallback(() => {
    setStepState((prev) => Math.min(prev + 1, maxStep));
  }, [maxStep]);

  const previous = useCallback(() => {
    setStepState((prev) => Math.max(prev - 1, 1));
  }, []);

  const reset = useCallback(() => {
    setStepState(1);
  }, []);

  const hasNext = useMemo(() => step < maxStep, [step, maxStep]);
  const hasPrevious = useMemo(() => step > 1, [step]);

  return {
    step,
    next,
    previous,
    reset,
    setStep,
    hasNext,
    hasPrevious
  };
}