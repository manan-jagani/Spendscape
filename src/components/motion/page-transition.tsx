"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

import { MOTION_TRANSITION } from "@/lib/motion";

export function PageTransition({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={
        shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }
      }
      key={pathname}
      transition={
        shouldReduceMotion ? { duration: 0 } : MOTION_TRANSITION.page
      }
    >
      {children}
    </motion.div>
  );
}
