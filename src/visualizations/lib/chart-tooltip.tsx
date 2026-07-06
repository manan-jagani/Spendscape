"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface TooltipPosition {
  x: number;
  y: number;
}

interface ChartTooltipProps {
  active: boolean;
  children: React.ReactNode;
  position: TooltipPosition;
  parentRef: React.RefObject<HTMLDivElement | null>;
}

export function ChartTooltip({
  active,
  children,
  position,
  parentRef,
}: ChartTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!active || !tooltipRef.current || !parentRef.current) {
      setAdjustedPosition(position);
      return;
    }

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const parentRect = parentRef.current.getBoundingClientRect();

    const relativeX = position.x - parentRect.left;
    const relativeY = position.y - parentRect.top;

    let adjustedX = relativeX + 12;
    let adjustedY = relativeY - 8;

    if (adjustedX + tooltipRect.width > parentRect.width - 8) {
      adjustedX = relativeX - tooltipRect.width - 8;
    }

    if (adjustedY + tooltipRect.height > parentRect.height - 8) {
      adjustedY = parentRect.height - tooltipRect.height - 8;
    }

    if (adjustedY < 8) adjustedY = 8;

    setAdjustedPosition({ x: adjustedX, y: adjustedY });
  }, [active, position, parentRef]);

  if (!active) return null;

  return (
    <motion.div
      animate={
        shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
      }
      className="pointer-events-none absolute z-50 rounded-lg bg-background/92 px-3 py-2 text-xs glass-floating"
      exit={
        shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }
      }
      initial={
        shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }
      }
      ref={tooltipRef}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
    >
      {children}
    </motion.div>
  );
}
