'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Under reduced motion: CSS ([data-reveal] in globals.css) shows content from first paint,
// and the transition drops to 0. `initial` must stay identical on server and client.
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={reduce ? { duration: 0 } : { duration: 0.4, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}
