"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ImagesOverTimeDatum = {
  dateLabel: string;
  dateFull: string;
  count: number;
};

export type CoverageDatum = {
  name: string;
  value: number;
  color: string;
};

export type BucketDatum = {
  name: string;
  count: number;
  color: string;
};

export type LeaderboardEntry = {
  userId: string;
  email: string;
  count: number;
  activity: "high" | "low";
};

export type ActivitySnapshot = {
  latestImage?: { url: string; createdAt: string; email: string };
  latestCaption?: { createdAt: string };
  mostActive?: { email: string; count: number; unit: "images" | "captions" };
};

export type TopImage = {
  url: string;
  email: string;
  captionCount: number;
  createdAt: string | null;
};

export type StatsChartsData = {
  coverage: CoverageDatum[];
  buckets: BucketDatum[];
  cumulativeImages: ImagesOverTimeDatum[];
  topUsers: LeaderboardEntry[];
  activity: ActivitySnapshot;
  topImage: TopImage | null;
};

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/40 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; payload?: Record<string, unknown> }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  const value = data.value ?? 0;
  const title =
    (data.payload?.fullLabel as string | undefined) ??
    (data.payload?.dateFull as string | undefined) ??
    label ??
    "";
  const name = (data.payload?.name as string | undefined) ?? data.name ?? "Value";

  return (
    <div className="rounded-2xl border border-border bg-card px-3 py-2 text-xs shadow-lg">
      {title ? <p className="font-semibold text-foreground">{title}</p> : null}
      <p className="text-muted-foreground">
        {name}: <span className="font-semibold text-foreground">{value}</span>
      </p>
    </div>
  );
}

export default function StatsCharts({ data }: { data: StatsChartsData }) {
  const hasCoverage = data.coverage.reduce((sum, item) => sum + item.value, 0) > 0;
  const hasTrend = data.cumulativeImages.some((item) => item.count > 0);
  const hasTopUsers = data.topUsers.length > 0;
  const bucketTotal = data.buckets.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:brightness-110 hover:shadow-lg">
          <CardHeader>
            <CardTitle>Caption Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            {hasCoverage ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.coverage}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                    >
                      {data.coverage.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      height={36}
                      formatter={(value) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState message="Upload images to see caption coverage." />
            )}
          </CardContent>
        </Card>
        <Card className="transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:brightness-110 hover:shadow-lg">
          <CardHeader>
            <CardTitle>Caption Density</CardTitle>
          </CardHeader>
          <CardContent>
            {data.buckets.length > 0 ? (
              <div className="h-72">
                {bucketTotal === 0 ? (
                  <p className="mb-3 text-xs text-muted-foreground">
                    No images yet. Buckets will fill as captions are added.
                  </p>
                ) : null}
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.buckets} margin={{ top: 8, right: 12, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      label={{ value: "Caption Buckets", position: "insideBottom", offset: -8, fill: "#94a3b8" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      label={{
                        value: "Images",
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                        fill: "#94a3b8"
                      }}
                      allowDecimals={false}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "#0f172a" }} />
                    <Bar dataKey="count" name="Images" radius={[6, 6, 0, 0]}>
                      {data.buckets.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState message="No caption density data yet." />
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:brightness-110 hover:shadow-lg">
        <CardHeader>
          <CardTitle>Cumulative Images Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {hasTrend ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.cumulativeImages} margin={{ top: 10, right: 12, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    label={{ value: "Date", position: "insideBottom", offset: -6, fill: "#94a3b8" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    allowDecimals={false}
                    label={{
                      value: "Total Images",
                      angle: -90,
                      position: "insideLeft",
                      offset: 10,
                      fill: "#94a3b8"
                    }}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#3b82f6", strokeWidth: 1 }} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Total Images"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState message="No uploads yet." />
          )}
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:brightness-110 hover:shadow-lg">
          <CardHeader>
            <CardTitle>Top Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hasTopUsers ? (
              data.topUsers.map((user, index) => {
                const rank = index + 1;
                const rankClasses =
                  rank === 1
                    ? "bg-blue-500/20 text-blue-200"
                    : rank === 2
                    ? "bg-indigo-500/20 text-indigo-200"
                    : rank === 3
                    ? "bg-cyan-500/20 text-cyan-200"
                    : "bg-card text-muted-foreground";
                return (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between rounded-2xl border border-border px-3 py-2 text-sm transition duration-200 hover:brightness-110"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                          rankClasses
                        )}
                      >
                        {rank}
                      </span>
                      <div>
                        <p className="max-w-[200px] truncate font-medium text-foreground">
                          {user.email}
                        </p>
                        <p
                          className={cn(
                            "text-xs font-medium",
                            user.activity === "high" ? "text-emerald-400" : "text-rose-400"
                          )}
                        >
                          {user.activity === "high" ? "High activity" : "Low activity"}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-foreground">{user.count} images</span>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-6 text-sm text-muted-foreground">
                No leaderboard data yet.
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:brightness-110 hover:shadow-lg">
          <CardHeader>
            <CardTitle>Activity Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card/60 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">Most recent image</p>
                <p className="font-medium text-foreground">
                  {data.activity.latestImage ? data.activity.latestImage.email : "No uploads yet"}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {data.activity.latestImage?.createdAt ?? "--"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card/60 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">Most recent caption</p>
                <p className="font-medium text-foreground">
                  {data.activity.latestCaption ? "Caption created" : "No captions yet"}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {data.activity.latestCaption?.createdAt ?? "--"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card/60 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">Most active user</p>
                <p className="font-medium text-foreground">
                  {data.activity.mostActive ? data.activity.mostActive.email : "No activity yet"}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {data.activity.mostActive
                  ? `${data.activity.mostActive.count} ${data.activity.mostActive.unit}`
                  : "--"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:brightness-110 hover:shadow-lg">
        <CardHeader>
          <CardTitle>Top Image</CardTitle>
        </CardHeader>
        <CardContent>
          {data.topImage ? (
            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
              <div className="h-40 w-full overflow-hidden rounded-2xl border border-border bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.topImage.url}
                  alt="Top image"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Uploader</p>
                  <p className="font-medium text-foreground">{data.topImage.email}</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Captions</p>
                    <p className="text-lg font-semibold text-foreground">
                      {data.topImage.captionCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Uploaded</p>
                    <p className="font-medium text-foreground">
                      {data.topImage.createdAt ?? "--"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState message="Upload images to see top content." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
