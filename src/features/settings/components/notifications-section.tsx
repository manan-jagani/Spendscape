import { BellOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const NOTIFICATION_ITEMS = [
  {
    title: "Budget alerts",
    description: "Get notified when you are close to reaching a budget limit.",
  },
  {
    title: "Weekly summary",
    description: "Receive a summary of your spending every week.",
  },
  {
    title: "Monthly report",
    description: "Get a detailed monthly spending report.",
  },
  {
    title: "Email notifications",
    description: "Receive notifications via email in addition to in-app.",
  },
] as const;

export function NotificationsSection() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Notifications</CardTitle>
          <Badge variant="outline" className="text-2xs">Coming soon</Badge>
        </div>
        <CardDescription>
          Control which notifications you receive and how.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 opacity-50">
        <div className="flex items-center justify-center py-6">
          <BellOff aria-hidden="true" className="size-8 text-muted-foreground" />
        </div>
        {NOTIFICATION_ITEMS.map((item) => (
          <div key={item.title} className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
