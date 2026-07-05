"use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Sheet(props: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetContent({
  children,
  className,
  ...props
}: SheetPrimitive.Popup.Props) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Backdrop className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm transition-opacity duration-normal data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
      <SheetPrimitive.Popup
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(20rem,88vw)] flex-col border-r border-border bg-sidebar text-sidebar-foreground shadow-card-hover outline-none transition duration-normal ease-standard data-ending-style:-translate-x-10 data-ending-style:opacity-0 data-starting-style:-translate-x-10 data-starting-style:opacity-0 motion-reduce:transition-none",
          className,
        )}
        data-slot="sheet-content"
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          render={
            <Button
              className="absolute top-4 right-4 size-8"
              size="icon"
              variant="ghost"
            />
          }
        >
          <X aria-hidden="true" />
          <span className="sr-only">Close navigation</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  );
}

function SheetTitle({
  className,
  ...props
}: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      className={cn("font-heading text-base font-medium", className)}
      data-slot="sheet-title"
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      data-slot="sheet-description"
      {...props}
    />
  );
}

function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1 p-6", className)}
      data-slot="sheet-header"
      {...props}
    />
  );
}

export {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
};
