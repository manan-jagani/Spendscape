import type { Transition } from "framer-motion";

export const MOTION_DURATION = {
  fast: 0.15,
  normal: 0.25,
  large: 0.4,
  page: 0.5,
} as const;

export const MOTION_EASING = {
  standard: [0.22, 1, 0.36, 1],
  emphasized: [0.16, 1, 0.3, 1],
} as const;

export const MOTION_TRANSITION = {
  fast: {
    duration: MOTION_DURATION.fast,
    ease: MOTION_EASING.standard,
  },
  normal: {
    duration: MOTION_DURATION.normal,
    ease: MOTION_EASING.standard,
  },
  large: {
    duration: MOTION_DURATION.large,
    ease: MOTION_EASING.emphasized,
  },
  page: {
    duration: MOTION_DURATION.page,
    ease: MOTION_EASING.emphasized,
  },
} satisfies Record<string, Transition>;
