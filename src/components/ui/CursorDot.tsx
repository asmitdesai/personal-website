'use client';

import { useEffect, useRef } from 'react';

export function CursorDot() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Desktop only — skip touch / coarse-pointer devices.
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let x = 0;
    let y = 0;
    let frame = 0;

    function render() {
      frame = 0;
      const dot = dotRef.current;
      if (dot) dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }

    function move(e: MouseEvent) {
      x = e.clientX;
      y = e.clientY;
      // Coalesce multiple mousemove events into one paint per frame.
      if (!frame) frame = requestAnimationFrame(render);
    }

    window.addEventListener('mousemove', move);
    return () => {
      window.removeEventListener('mousemove', move);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // The dot is rendered always but only shown on fine-pointer devices via CSS.
  return <div ref={dotRef} className="cursor-dot" aria-hidden="true" />;
}
