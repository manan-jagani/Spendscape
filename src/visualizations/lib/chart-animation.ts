import type { Transition, Variants } from "framer-motion";

import { MOTION_TRANSITION } from "@/lib/motion";

export const chartEntry: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0.1,
    },
  },
};

export const cellEntry: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: MOTION_TRANSITION.large as Transition,
  },
};

export const lineDraw: Variants = {
  hidden: { pathLength: 0 },
  visible: {
    pathLength: 1,
    transition: {
      ...(MOTION_TRANSITION.large as Transition),
      duration: 0.8,
    },
  },
};

export const areaFill: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      ...(MOTION_TRANSITION.large as Transition),
      duration: 0.6,
    },
  },
};
