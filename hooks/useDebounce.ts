import { useEffect, useState } from 'react';

const useDebounce = <T = any>(value: T, delay = 600) => {
  const [debouncedValue, setDebounceValue] = useState<T>(() => value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceValue(value);
    }, delay);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
