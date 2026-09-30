'use client';

import { useEffect, useRef } from 'react';
import { scrollProgress } from '@/lib/utils';

export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    function render() {
      frame = 0;
      const bar = barRef.current;
      if (!bar) return;
      const doc = document.documentElement;
      bar.style.transform = `scaleX(${scrollProgress(window.scrollY, doc.scrollHeight, window.innerHeight)})`;
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(render);
    }

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={barRef} aria-hidden className="reading-progress" />;
}
