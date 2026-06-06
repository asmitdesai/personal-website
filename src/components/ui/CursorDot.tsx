'use client';

import { useEffect, useRef } from 'react';

export function CursorDot() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Desktop only — skip touch / coarse-pointer devices.
    if (!window.matchMedia('(pointer: fine)').matches) return;

    function move(e: MouseEvent) {
      const dot = dotRef.current;
      if (dot) dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }

    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  // The dot is rendered always but only shown on fine-pointer devices via CSS.
  return <div ref={dotRef} className="cursor-dot" aria-hidden="true" />;
}
