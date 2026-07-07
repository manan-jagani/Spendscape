"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { create } from "zustand";

import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: "bg-positive/10",
    border: "border-positive/30",
    icon: "text-positive",
  },
  error: {
    bg: "bg-negative/10",
    border: "border-negative/30",
    icon: "text-negative",
  },
  info: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    icon: "text-primary",
  },
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/30",
    icon: "text-warning",
  },
};

export function ToastContainer({ className }: { className?: string }) {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      className={cn("pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end", className)}
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const styles = TOAST_STYLES[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "pointer-events-auto flex w-[calc(100vw-2rem)] max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-xl motion-reduce:transition-none",
                styles.bg,
                styles.border,
                "bg-background/92",
              )}
              role="alert"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
