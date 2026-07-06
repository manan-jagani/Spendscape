"use client";

import { useEffect, useRef, useState } from "react";

export interface ChartDimensions {
  width: number;
  height: number;
}

export function useChartDimensions(): [
  React.RefObject<HTMLDivElement | null>,
  ChartDimensions,
] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, dimensions];
}
