"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { PropsWithChildren } from "react";

import { MOTION_TRANSITION } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface RevealProps extends PropsWithChildren {
  className?: string;
  delay?: number;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(className)}
      initial={
        shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }
      }
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { ...MOTION_TRANSITION.large, delay }
      }
    >
      {children}
    </motion.div>
  );
}
