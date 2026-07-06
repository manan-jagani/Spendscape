"use client";

import { Bell } from "lucide-react";
import Link from "next/link";

import type { ShellNotification } from "@/components/layout/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotificationsMenuProps {
  notifications: readonly ShellNotification[];
}

export function NotificationsMenu({
  notifications,
}: NotificationsMenuProps) {
  const hasUnread = notifications.some((notification) => notification.unread);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label="Open notifications"
            className="relative size-9"
            size="icon"
            variant="ghost"
          />
        }
      >
        <Bell aria-hidden="true" />
        {hasUnread ? (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-investment ring-[3px] ring-background" />
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(22rem,calc(100vw-2rem))] rounded-lg p-2 shadow-card-hover"
        sideOffset={8}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-medium text-foreground">
              Notifications
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              {notifications.length} new
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.map((notification) => (
          <DropdownMenuItem
            className="items-start gap-3 px-3 py-3"
            key={notification.id}
            render={<Link href="/insights" />}
          >
            <span
              aria-hidden="true"
              className="mt-1.5 size-1.5 shrink-0 rounded-full bg-investment"
            />
            <span className="min-w-0">
              <span className="block font-medium text-foreground">
                {notification.title}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                {notification.description}
              </span>
              <span className="mt-1.5 block text-[0.6875rem] text-muted-foreground">
                {notification.time}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center py-2 text-xs font-medium"
          render={<Link href="/insights" />}
        >
          View all insights
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
