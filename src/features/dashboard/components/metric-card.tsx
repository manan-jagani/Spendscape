import { useId, useMemo } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  WalletCards,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricTone = "neutral" | "income" | "expense" | "savings";

interface MetricCardProps {
  change: string;
  context: string;
  label: string;
  tone: MetricTone;
  value: string;
}

const TONE_STYLES: Record<
  MetricTone,
  { accent: string; icon: typeof WalletCards; color: string; glow: string }
> = {
  neutral: { accent: "text-foreground bg-muted", icon: WalletCards, color: "oklch(0.5 0.02 270)", glow: "oklch(0.5 0.02 270 / 0.15)" },
  income: { accent: "text-income bg-income/10", icon: ArrowDownLeft, color: "var(--color-income)", glow: "oklch(0.55 0.18 155 / 0.15)" },
  expense: { accent: "text-expense bg-expense/10", icon: ArrowUpRight, color: "var(--color-expense)", glow: "oklch(0.55 0.2 25 / 0.15)" },
  savings: { accent: "text-savings bg-savings/10", icon: PiggyBank, color: "var(--color-savings)", glow: "oklch(0.65 0.15 85 / 0.15)" },
};

/* ── Mini sparkline (pure SVG, no dependencies) ── */

function MiniSparkline({ color, gradientId }: { color: string; gradientId: string }) {
  const points = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const w = 56;
    const h = 20;
    const count = 5;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const x = t * w;
      const y = h - (0.2 + 0.6 * t + 0.2 * Math.sin(t * Math.PI)) * h;
      pts.push({ x, y });
    }
    return pts;
  }, []);

  if (points.length === 0) return null;
  const last = points[points.length - 1]!;
  const first = points[0]!;
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = `${pathD} L${last.x},20 L${first.x},20 Z`;

  return (
    <svg viewBox="0 0 56 20" className="h-5 w-14 shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradientId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ── Main component ── */

export function MetricCard({
  change,
  context,
  label,
  tone,
  value,
}: MetricCardProps) {
  const { accent, icon: Icon, color, glow } = TONE_STYLES[tone];
  const gradientId = useId();

  return (
    <Card className="min-h-44 motion-reduce:transition-none">
      <CardContent className="relative flex h-full flex-col justify-between">
        {/* Hover glow effect */}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-normal group-hover/card:opacity-100 motion-reduce:opacity-0"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${glow}, transparent 70%)`,
          }}
        />
        <div className="relative z-10 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="flex items-center gap-2">
            <MiniSparkline color={color} gradientId={gradientId} />
            <span
              className={cn(
                "grid size-8 place-items-center rounded-md transition-all duration-fast ease-standard group-hover/card:scale-110 group-hover/card:shadow-sm motion-reduce:transition-none",
                accent,
              )}
            >
              <Icon aria-hidden="true" className="size-4" strokeWidth={1.8} />
            </span>
          </div>
        </div>
        <div className="relative z-10 mt-8">
          <p className="font-heading text-2xl font-semibold tracking-[-0.05em] sm:text-3xl">
            {value}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            <span
              className={cn(
                "font-medium",
                tone === "expense"
                  ? "text-expense"
                  : tone === "income"
                    ? "text-income"
                    : "text-foreground",
              )}
            >
              {change}
            </span>{" "}
            {context}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
