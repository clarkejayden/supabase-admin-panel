import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-secondary/60 ${className}`} />;
}

export function StatsChartsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <SkeletonBlock className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            <SkeletonBlock className="h-48 w-full rounded-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <SkeletonBlock className="h-5 w-36" />
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <SkeletonBlock className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <SkeletonBlock className="h-5 w-44" />
        </CardHeader>
        <CardContent>
          <SkeletonBlock className="h-56 w-full" />
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <SkeletonBlock className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-12 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <SkeletonBlock className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <SkeletonBlock className="h-5 w-28" />
        </CardHeader>
        <CardContent className="space-y-3">
          <SkeletonBlock className="h-40 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
