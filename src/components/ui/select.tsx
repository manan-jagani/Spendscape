"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

function SelectRoot<Value, Multiple extends boolean | undefined = false>({
  children,
  ...props
}: SelectPrimitive.Root.Props<Value, Multiple>) {
  return (
    <SelectPrimitive.Root data-slot="select-root" {...props}>
      {children}
    </SelectPrimitive.Root>
  );
}

function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background transition-all duration-fast ease-standard placeholder:text-muted-foreground select-none hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:bg-background/85 focus-visible:glass focus-visible:backdrop-blur-[12px] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none data-popup-open:bg-muted/50 data-invalid:border-negative",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="shrink-0 text-muted-foreground">
        <ChevronDown aria-hidden="true" className="size-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectValue({
  className,
  ...props
}: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn(
        "flex-1 truncate text-left data-placeholder:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function SelectPopup({
  className,
  ...props
}: SelectPrimitive.Popup.Props) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Backdrop className="fixed inset-0 z-50" />
      <SelectPrimitive.Positioner
        className="z-50 outline-hidden"
        sideOffset={4}
      >
        <SelectPrimitive.Popup
          data-slot="select-popup"
          className={cn(
            "origin-(--transform-origin) min-w-(--anchor-width) max-h-(--available-height) overflow-y-auto rounded-md border border-border/60 bg-popover/95 backdrop-blur-xl text-popover-foreground shadow-xl outline-hidden transition-[scale,opacity] duration-100 ease-out motion-reduce:transition-none data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-ending-style:scale-[0.98] data-ending-style:opacity-0",
            className,
          )}
          {...props}
        />
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectList({
  className,
  ...props
}: SelectPrimitive.List.Props) {
  return (
    <SelectPrimitive.List
      data-slot="select-list"
      className={cn("relative py-1", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex cursor-default items-center gap-2 px-2.5 py-1.5 pr-8 text-sm outline-hidden select-none data-highlighted:bg-muted data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function SelectItemIndicator({
  className,
  ...props
}: SelectPrimitive.ItemIndicator.Props) {
  return (
    <SelectPrimitive.ItemIndicator
      data-slot="select-item-indicator"
      className={cn("absolute right-2 flex items-center", className)}
      {...props}
    />
  );
}

function SelectItemText({
  className,
  ...props
}: SelectPrimitive.ItemText.Props) {
  return (
    <SelectPrimitive.ItemText
      data-slot="select-item-text"
      className={cn("flex-1 truncate", className)}
      {...props}
    />
  );
}

function SelectGroup({
  className,
  ...props
}: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("", className)}
      {...props}
    />
  );
}

function SelectGroupLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-group-label"
      className={cn(
        "px-2.5 py-1.5 text-xs font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

export {
  SelectRoot as Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectList,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectGroup,
  SelectGroupLabel,
  SelectSeparator,
};
