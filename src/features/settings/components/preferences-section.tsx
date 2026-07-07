import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PreferencesSection() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Preferences</CardTitle>
          <Badge variant="outline" className="text-2xs">Coming soon</Badge>
        </div>
        <CardDescription>
          Default account, transaction type, and formatting preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 opacity-50">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Default account</p>
          <p className="text-xs text-muted-foreground">
            Select which account to use by default when adding transactions.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Default transaction type</p>
          <p className="text-xs text-muted-foreground">
            Choose between income, expense, or transfer as the default.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Date format</p>
          <p className="text-xs text-muted-foreground">
            How dates are displayed throughout the app.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Week starts on</p>
          <p className="text-xs text-muted-foreground">
            Set the first day of the week for budgets and calendars.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Number format</p>
          <p className="text-xs text-muted-foreground">
            Configure thousand and decimal separators.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
