"use client";

import * as React from "react";
import {
  motion,
  useReducedMotion,
  type TargetAndTransition,
} from "framer-motion";

import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type PremiumHoverMode = "card" | "row";

const MODE_ANIMATIONS: Record<
  PremiumHoverMode,
  { hover: TargetAndTransition; tap: TargetAndTransition }
> = {
  card: {
    hover: {
      y: -4,
      scale: 1.015,
      transition: SPRING.card,
    },
    tap: {
      scale: 0.985,
      transition: SPRING.press,
    },
  },
  row: {
    hover: {
      x: 4,
      transition: SPRING.gentle,
    },
    tap: {
      scale: 0.99,
      transition: SPRING.press,
    },
  },
};

interface PremiumHoverProps extends React.ComponentPropsWithoutRef<"div"> {
  mode?: PremiumHoverMode;
}

export function PremiumHover({
  children,
  className,
  mode = "card",
  ...props
}: PremiumHoverProps) {
  const shouldReduceMotion = useReducedMotion();
  const animations = MODE_ANIMATIONS[mode];

  if (shouldReduceMotion) {
    return (
      <div className={cn("motion-reduce:transition-none", className)} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={animations.hover}
      whileTap={animations.tap}
      className={cn("will-change-transform", className)}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.div>)}
    >
      {children}
    </motion.div>
  );
}
