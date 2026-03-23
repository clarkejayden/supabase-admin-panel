import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Trend = "positive" | "negative" | "neutral";

type KpiCardProps = {
  title: string;
  value: string;
  subtext?: string;
  trend?: Trend;
  icon: LucideIcon;
};

const trendClasses: Record<Trend, string> = {
  positive: "text-emerald-400",
  negative: "text-rose-400",
  neutral: "text-muted-foreground"
};

export function KpiCard({
  title,
  value,
  subtext,
  trend = "neutral",
  icon: Icon
}: KpiCardProps) {
  const isEmptyValue = value === "No data yet";
  return (
    <Card className="transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:brightness-110 hover:shadow-lg">
      <CardContent className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-accent">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={cn(isEmptyValue ? "text-sm text-muted-foreground" : "text-2xl font-semibold text-foreground")}>
            {value}
          </p>
          {subtext ? (
            <p className={cn("text-xs font-medium", trendClasses[trend])}>{subtext}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
