import type { Transition } from "framer-motion";

export const MOTION_DURATION = {
  fast: 0.15,
  normal: 0.25,
  large: 0.4,
  page: 0.3,
  charts: 0.6,
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
  charts: {
    duration: MOTION_DURATION.charts,
    ease: MOTION_EASING.emphasized,
  },
} satisfies Record<string, Transition>;

export const SPRING = {
  gentle: {
    type: "spring" as const,
    stiffness: 120,
    damping: 18,
    mass: 0.8,
  },
  snappy: {
    type: "spring" as const,
    stiffness: 200,
    damping: 22,
    mass: 0.6,
  },
  smooth: {
    type: "spring" as const,
    stiffness: 100,
    damping: 20,
    mass: 1,
  },
  card: {
    type: "spring" as const,
    stiffness: 180,
    damping: 20,
    mass: 0.7,
  },
  button: {
    type: "spring" as const,
    stiffness: 250,
    damping: 18,
    mass: 0.5,
  },
  press: {
    type: "spring" as const,
    stiffness: 400,
    damping: 25,
    mass: 0.3,
  },
} satisfies Record<string, Transition>;
