import Link from "next/link";
import { cn } from "@/lib/utils";

function buildUrl(basePath: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function Pagination({
  basePath,
  params,
  currentPage,
  totalPages,
  pageParam
}: {
  basePath: string;
  params: URLSearchParams;
  currentPage: number;
  totalPages: number;
  pageParam: string;
}) {
  if (totalPages <= 1) return null;

  const prevParams = new URLSearchParams(params);
  prevParams.set(pageParam, String(Math.max(1, currentPage - 1)));
  const nextParams = new URLSearchParams(params);
  nextParams.set(pageParam, String(Math.min(totalPages, currentPage + 1)));

  return (
    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
      <Link
        href={buildUrl(basePath, prevParams)}
        className={cn(
          "rounded-full border border-border px-3 py-1 transition hover:brightness-110",
          currentPage === 1 && "pointer-events-none opacity-50"
        )}
      >
        Previous
      </Link>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <Link
        href={buildUrl(basePath, nextParams)}
        className={cn(
          "rounded-full border border-border px-3 py-1 transition hover:brightness-110",
          currentPage === totalPages && "pointer-events-none opacity-50"
        )}
      >
        Next
      </Link>
    </div>
  );
}
