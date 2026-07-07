"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Archive,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SPRING } from "@/lib/motion";
import {
  ACCOUNT_TYPE_COLORS,
  ACCOUNT_TYPE_ICONS,
  ACCOUNT_TYPE_LABELS,
} from "@/features/accounts/types";

import type { AccountRow } from "@/features/accounts/types";

interface AccountCardProps {
  account: AccountRow;
  portfolioFraction: number;
  onSelect: (account: AccountRow) => void;
  onEdit: (account: AccountRow) => void;
  onArchive: (account: AccountRow) => void;
  onRestore: (account: AccountRow) => void;
  onDelete: (account: AccountRow) => void;
}

const currencyFormatter = (currency: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

function useAnimatedNumber(target: number, duration = 500) {
  const [value, setValue] = useState(target);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (prevTarget.current === target) return;
    prevTarget.current = target;
    const startTime = performance.now();
    const startValue = value;
    let raf: number;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(startValue + (target - startValue) * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}

function MiniSparkline({ color, gradientId }: { color: string; gradientId: string }) {
  const path = "M0,24 C8,18 16,30 24,20 C32,10 40,26 48,16 C56,6 64,22 72,18";
  return (
    <svg viewBox="0 0 72 32" className="h-8 w-full" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L72,32 L0,32 Z`} fill={`url(#${gradientId})`} />
      <path
        d={path}
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

export function AccountCard({
  account,
  portfolioFraction,
  onSelect,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: AccountCardProps) {
  const sparklineId = useId();
  const accentColor = ACCOUNT_TYPE_COLORS[account.type];
  const Icon = ACCOUNT_TYPE_ICONS[account.type];
  const isArchived = !account.is_active;
  const [isHovered, setIsHovered] = useState(false);
  const animatedBalance = useAnimatedNumber(account.current_balance);

  const handleEdit = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); onEdit(account); },
    [account, onEdit],
  );
  const handleArchive = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); onArchive(account); },
    [account, onArchive],
  );
  const handleRestore = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); onRestore(account); },
    [account, onRestore],
  );
  const handleDelete = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); onDelete(account); },
    [account, onDelete],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(account);
      }
    },
    [account, onSelect],
  );

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(account)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4, scale: 1.015, transition: SPRING.card }}
      whileTap={{ scale: 0.985, transition: SPRING.press }}
      className={cn(
        "group/card relative flex w-full flex-col overflow-hidden rounded-xl border text-left outline-none motion-reduce:transition-none",
        "glass-premium text-card-foreground",
        "hover:z-10",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isArchived && "opacity-60 hover:opacity-80",
      )}
      aria-label={`${account.name}, ${ACCOUNT_TYPE_LABELS[account.type]}, balance ${currencyFormatter(account.currency).format(account.current_balance)}`}
    >
      {/* Top accent strip */}
      <div
        className="absolute inset-x-0 top-0 z-10 h-1 rounded-t-xl"
        style={{ backgroundColor: accentColor }}
      />

      {/* Animated hover glow */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-normal motion-reduce:transition-none",
        )}
        style={{
          boxShadow: isHovered && !isArchived ? `inset 0 0 40px -12px ${accentColor}` : undefined,
          opacity: isHovered && !isArchived ? 0.6 : 0,
        } as React.CSSProperties}
      />

      {/* Reflection overlay on hover */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-full w-1/2 rounded-xl transition-all duration-normal motion-reduce:transition-none",
          "bg-gradient-to-r from-transparent via-white/5 to-transparent",
        )}
        style={{
          transform: isHovered ? "translateX(200%) skewX(-20deg)" : "translateX(-100%) skewX(-20deg)",
          opacity: isHovered ? 1 : 0,
        }}
      />

      <div className="relative z-10 flex flex-col gap-3 p-4">
        {/* Row 1: Icon + Type + Menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className="grid size-9 shrink-0 place-items-center rounded-lg"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <Icon className="size-4" style={{ color: accentColor }} aria-hidden="true" />
            </div>
            <Badge
              variant="outline"
              className="border-none px-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              {ACCOUNT_TYPE_LABELS[account.type]}
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 shrink-0 opacity-0 group-hover/card:opacity-100 focus-visible:opacity-100 motion-reduce:opacity-100"
                  aria-label="Account actions"
                />
              }
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={2}>
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="size-3.5" aria-hidden="true" />
                Edit
              </DropdownMenuItem>
              {isArchived ? (
                <DropdownMenuItem onClick={handleRestore}>
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                  Restore
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="size-3.5" aria-hidden="true" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                <Trash2 className="size-3.5" aria-hidden="true" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Row 2: Account name + institution */}
        <div className="min-w-0">
          <h3
            className={cn(
              "truncate font-heading text-base font-medium",
              isArchived ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {account.name}
          </h3>
          {account.institution && (
            <p className="truncate text-xs text-muted-foreground">
              {account.institution}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50" />

        {/* Row 3: Balance */}
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Balance</p>
            <p
              className={cn(
                "font-heading text-2xl font-semibold tracking-tight tabular-nums",
                isArchived ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {currencyFormatter(account.currency).format(Math.round(animatedBalance))}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {portfolioFraction < 0.1 ? "<1" : (portfolioFraction * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Sparkline */}
        <MiniSparkline color={accentColor} gradientId={sparklineId} />
      </div>
    </motion.div>
  );
}
