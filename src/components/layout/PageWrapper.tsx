'use client';

import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          data-reveal
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={reduce ? { duration: 0 } : { duration: 0.18, ease: 'easeInOut' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
