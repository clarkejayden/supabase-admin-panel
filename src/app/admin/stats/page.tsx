import dynamic from "next/dynamic";
import { createAdminClient, requireSuperadmin } from "@/lib/supabase/server";
import { KpiCard } from "@/components/admin/stats/kpi-card";
import { StatsChartsSkeleton } from "@/components/admin/stats/stats-skeleton";
import type { StatsChartsData } from "@/components/admin/stats/stats-charts";
import { BarChart3, Image as ImageIcon, Percent, Target, UserCheck } from "lucide-react";

const StatsCharts = dynamic(
  () => import("@/components/admin/stats/stats-charts"),
  {
    ssr: false,
    loading: () => <StatsChartsSkeleton />
  }
);

type ImageRow = {
  id: string;
  user_id: string;
  url: string;
  created_at: string | null;
};

type CaptionRow = {
  id: string;
  image_id: string;
  created_at: string | null;
};

type ProfileRow = {
  id: string;
  email: string | null;
};

const RANGE_DAYS = 30;
const TOP_USER_LIMIT = 3;

const numberFormatter = new Intl.NumberFormat("en-US");

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1
});

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDateTime(value?: string | null) {
  if (!value) return "--";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function safePercent(numerator: number, denominator: number) {
  if (denominator <= 0) return "No data yet";
  return percentFormatter.format(numerator / denominator);
}

function safeRatio(numerator: number, denominator: number) {
  if (denominator <= 0) return "No data yet";
  return (numerator / denominator).toFixed(2);
}

export default async function StatsPage() {
  await requireSuperadmin();
  const supabase = createAdminClient();

  const [
    { count: userCount },
    { count: imageCount },
    { count: captionCount },
    { data: images },
    { data: captions }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("images").select("*", { count: "exact", head: true }),
    supabase.from("captions").select("*", { count: "exact", head: true }),
    supabase.from("images").select("id,user_id,url,created_at"),
    supabase.from("captions").select("id,image_id,created_at")
  ]);

  const imageRows = (images ?? []) as ImageRow[];
  const captionRows = (captions ?? []) as CaptionRow[];

  const userIds = Array.from(
    new Set(imageRows.map((row) => row.user_id).filter(Boolean))
  );

  const { data: profiles } =
    userIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id,email")
          .in("id", userIds)
      : { data: [] as ProfileRow[] };

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile.email])
  );

  const imageMap = new Map<string, ImageRow>();
  imageRows.forEach((row) => {
    imageMap.set(row.id, row);
  });

  const imageCountByUser = new Map<string, number>();
  imageRows.forEach((row) => {
    imageCountByUser.set(row.user_id, (imageCountByUser.get(row.user_id) ?? 0) + 1);
  });

  const sortedUsers = Array.from(imageCountByUser.entries())
    .map(([userId, count]) => ({
      userId,
      count,
      email: profileMap.get(userId) ?? userId
    }))
    .sort((a, b) => b.count - a.count);

  const topUsers = sortedUsers.slice(0, TOP_USER_LIMIT);
  const averagePerUser =
    sortedUsers.length > 0 ? (imageCount ?? imageRows.length) / sortedUsers.length : 0;

  const now = new Date();

  const dateBuckets = Array.from({ length: RANGE_DAYS }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (RANGE_DAYS - 1 - index));
    const key = toDateKey(date);
    return {
      key,
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      full: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    };
  });

  const imagesByDate = new Map<string, number>();
  imageRows.forEach((row) => {
    if (!row.created_at) return;
    const key = toDateKey(new Date(row.created_at));
    imagesByDate.set(key, (imagesByDate.get(key) ?? 0) + 1);
  });

  let cumulativeTotal = 0;
  const cumulativeImages = dateBuckets.map((bucket) => {
    cumulativeTotal += imagesByDate.get(bucket.key) ?? 0;
    return {
      dateLabel: bucket.label,
      dateFull: bucket.full,
      count: cumulativeTotal
    };
  });

  const totalImages = imageCount ?? imageRows.length;
  const captionCountByImage = new Map<string, number>();
  captionRows.forEach((row) => {
    captionCountByImage.set(
      row.image_id,
      (captionCountByImage.get(row.image_id) ?? 0) + 1
    );
  });

  const captionCountByUser = new Map<string, number>();
  captionRows.forEach((row) => {
    const image = imageMap.get(row.image_id);
    if (!image) return;
    captionCountByUser.set(
      image.user_id,
      (captionCountByUser.get(image.user_id) ?? 0) + 1
    );
  });

  const imagesWithCaptions = imageRows.filter(
    (row) => (captionCountByImage.get(row.id) ?? 0) > 0
  ).length;
  const imagesWithoutCaptions = Math.max(0, totalImages - imagesWithCaptions);

  const coverage = [
    { name: "With captions", value: imagesWithCaptions, color: "#3b82f6" },
    { name: "Without captions", value: imagesWithoutCaptions, color: "#1e293b" }
  ];

  const bucketCounts = { zero: 0, few: 0, many: 0 };
  imageRows.forEach((row) => {
    const count = captionCountByImage.get(row.id) ?? 0;
    if (count === 0) bucketCounts.zero += 1;
    else if (count <= 2) bucketCounts.few += 1;
    else bucketCounts.many += 1;
  });

  const buckets = [
    { name: "0 captions", count: bucketCounts.zero, color: "#1e293b" },
    { name: "1-2 captions", count: bucketCounts.few, color: "#3b82f6" },
    { name: "3+ captions", count: bucketCounts.many, color: "#38bdf8" }
  ];

  const latestImage = imageRows
    .filter((row) => row.created_at)
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))[0];
  const latestCaption = captionRows
    .filter((row) => row.created_at)
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))[0];

  const topImageCandidate = imageRows.reduce<{
    image: ImageRow | null;
    count: number;
  }>(
    (acc, row) => {
      const count = captionCountByImage.get(row.id) ?? 0;
      if (!acc.image || count > acc.count) return { image: row, count };
      if (count === acc.count && row.created_at && acc.image?.created_at) {
        return row.created_at > acc.image.created_at ? { image: row, count } : acc;
      }
      return acc;
    },
    { image: null, count: -1 }
  );

  const fallbackCaptionLeader =
    captionCountByUser.size > 0
      ? Array.from(captionCountByUser.entries())
          .map(([userId, count]) => ({
            userId,
            count,
            email: profileMap.get(userId) ?? userId
          }))
          .sort((a, b) => b.count - a.count)[0]
      : undefined;

  const chartData: StatsChartsData = {
    coverage,
    buckets,
    cumulativeImages,
    topUsers: topUsers.map((user) => ({
      userId: user.userId,
      email: user.email,
      count: user.count,
      activity: user.count >= averagePerUser ? "high" : "low"
    })),
    activity: {
      latestImage: latestImage
        ? {
            url: latestImage.url,
            createdAt: formatDateTime(latestImage.created_at),
            email: profileMap.get(latestImage.user_id) ?? latestImage.user_id
          }
        : undefined,
      latestCaption: latestCaption
        ? {
            createdAt: formatDateTime(latestCaption.created_at)
          }
        : undefined,
      mostActive: topUsers[0]
        ? {
            email: topUsers[0].email,
            count: topUsers[0].count,
            unit: "images"
          }
        : fallbackCaptionLeader
        ? {
            email: fallbackCaptionLeader.email,
            count: fallbackCaptionLeader.count,
            unit: "captions"
          }
        : undefined
    },
    topImage: topImageCandidate.image
      ? {
          url: topImageCandidate.image.url,
          email:
            profileMap.get(topImageCandidate.image.user_id) ??
            topImageCandidate.image.user_id,
          captionCount: Math.max(0, topImageCandidate.count),
          createdAt: formatDateTime(topImageCandidate.image.created_at)
        }
      : null
  };

  const totalCaptions = captionCount ?? captionRows.length;
  const usersWithImages = imageCountByUser.size;
  const avgCaptionsPerImage = safeRatio(totalCaptions, totalImages);
  const percentImagesWithCaptions = safePercent(imagesWithCaptions, totalImages);
  const percentUsersWithImages = safePercent(usersWithImages, userCount ?? 0);
  const engagementScore = safeRatio(totalCaptions, totalImages);
  const userActivityScore = safeRatio(totalImages, userCount ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Live operational insights for admins.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          title="Images With Captions"
          value={percentImagesWithCaptions}
          subtext={`${imagesWithCaptions} of ${numberFormatter.format(totalImages)} images`}
          trend="positive"
          icon={Percent}
        />
        <KpiCard
          title="Avg. Captions / Image"
          value={avgCaptionsPerImage}
          subtext="Engagement depth"
          trend="neutral"
          icon={BarChart3}
        />
        <KpiCard
          title="Users With Uploads"
          value={percentUsersWithImages}
          subtext={`${usersWithImages} of ${numberFormatter.format(userCount ?? 0)} users`}
          trend="positive"
          icon={UserCheck}
        />
        <KpiCard
          title="Engagement Score"
          value={engagementScore}
          subtext="Captions per image"
          trend="neutral"
          icon={Target}
        />
        <KpiCard
          title="User Activity Score"
          value={userActivityScore}
          subtext="Images per user"
          trend="neutral"
          icon={ImageIcon}
        />
      </div>
      <StatsCharts data={chartData} />
    </div>
  );
}
