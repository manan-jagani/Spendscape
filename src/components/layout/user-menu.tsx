"use client";

import { ChevronDown, CircleUserRound, Settings } from "lucide-react";
import Link from "next/link";

import type { ShellUser } from "@/components/layout/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({ user }: { user: ShellUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            aria-label="Open user menu"
            className="flex h-10 items-center gap-2 rounded-md px-1.5 text-left outline-none transition-colors duration-fast hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            type="button"
          />
        }
      >
        <span className="grid size-7 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
          {user.initials}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-28 truncate text-xs font-medium">
            {user.name}
          </span>
          <span className="block max-w-28 truncate text-[0.6875rem] text-muted-foreground">
            Personal
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className="hidden size-3 text-muted-foreground sm:block"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 rounded-lg p-2 shadow-card-hover"
        sideOffset={8}
      >
        <DropdownMenuLabel className="px-3 py-2">
          <span className="block text-sm font-medium text-foreground">
            {user.name}
          </span>
          <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-3 px-3 py-2"
          render={<Link href="/profile" />}
        >
          <CircleUserRound aria-hidden="true" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-3 px-3 py-2"
          render={<Link href="/settings" />}
        >
          <Settings aria-hidden="true" />
          Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
