import Link from "next/link";
import { cn } from "@/lib/utils";

function buildUrl(basePath: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function SortableHead({
  basePath,
  params,
  label,
  sortKey,
  currentSort,
  currentDir,
  sortParam,
  dirParam,
  pageParam,
  className
}: {
  basePath: string;
  params: URLSearchParams;
  label: string;
  sortKey: string;
  currentSort: string;
  currentDir: "asc" | "desc";
  sortParam: string;
  dirParam: string;
  pageParam: string;
  className?: string;
}) {
  const nextDir = currentSort === sortKey && currentDir === "asc" ? "desc" : "asc";
  const nextParams = new URLSearchParams(params);
  nextParams.set(sortParam, sortKey);
  nextParams.set(dirParam, nextDir);
  nextParams.set(pageParam, "1");

  return (
    <Link
      href={buildUrl(basePath, nextParams)}
      className={cn("flex items-center gap-1 text-xs font-semibold uppercase tracking-wide", className)}
    >
      {label}
      <span className="text-[10px] text-muted-foreground">
        {currentSort === sortKey ? (currentDir === "asc" ? "▲" : "▼") : ""}
      </span>
    </Link>
  );
}
