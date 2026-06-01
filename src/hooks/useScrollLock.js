import { useEffect } from 'react';

let lockCount = 0;

export const useScrollLock = (isLocked = true) => {
  useEffect(() => {
    if (!isLocked) return;

    lockCount++;
    if (lockCount === 1) {
      document.body.classList.add('overflow-hidden');
    }

    return () => {
      lockCount--;
      if (lockCount === 0) {
        document.body.classList.remove('overflow-hidden');
      }
    };
  }, [isLocked]);
};
