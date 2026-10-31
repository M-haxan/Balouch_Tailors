import { useState, useEffect } from 'react';

/**
 * Hook to detect whether current viewport is below a breakpoint (default: 768px - Tailwind 'md').
 * Helps avoid running heavy array maps and rendering duplicate hidden views simultaneously.
 */
export const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const updateMatch = (e) => setIsMobile(e.matches);

    setIsMobile(mediaQuery.matches);

    mediaQuery.addEventListener('change', updateMatch);
    return () => mediaQuery.removeEventListener('change', updateMatch);
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;
