'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

const ROLES = [
  'Security Engineering Student',
  'CTF Player & Challenge Author',
  'Detection Engineer',
  'SOC Engineering Enthusiast',
];

export function TypewriterText() {
  const [displayed, setDisplayed] = useState('');
  const [roleIdx, setRoleIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    if (paused) {
      const t = setTimeout(() => setPaused(false), 1800);
      return () => clearTimeout(t);
    }

    const current = ROLES[roleIdx];
    const delay = deleting ? 38 : 72;

    const t = setTimeout(() => {
      if (!deleting) {
        if (charIdx < current.length) {
          setDisplayed(current.slice(0, charIdx + 1));
          setCharIdx((i) => i + 1);
        } else {
          setPaused(true);
          setDeleting(true);
        }
      } else {
        if (charIdx > 0) {
          setDisplayed(current.slice(0, charIdx - 1));
          setCharIdx((i) => i - 1);
        } else {
          setDeleting(false);
          setRoleIdx((i) => (i + 1) % ROLES.length);
        }
      }
    }, delay);

    return () => clearTimeout(t);
  }, [charIdx, deleting, paused, roleIdx, reduce]);

  // Reduced motion: show a stable role with no typing animation.
  if (reduce) {
    return <span className="text-[#22c55e]">{ROLES[0]}</span>;
  }

  return (
    <span className="text-[#22c55e]">
      {displayed}
      <span className="animate-pulse opacity-80">|</span>
    </span>
  );
}
