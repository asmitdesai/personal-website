'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

// Reduced motion is handled globally by <MotionConfig reducedMotion="user"> in PageWrapper.
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}
