import { createAdminClient } from "@/lib/supabase/server";

export async function fetchTablePage({
  table,
  page,
  pageSize,
  sort,
  direction
}: {
  table: string;
  page: number;
  pageSize: number;
  sort?: string;
  direction?: "asc" | "desc";
}) {
  const supabase = createAdminClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const baseQuery = supabase.from(table).select("*", { count: "exact" });
  const runQuery = async (withOrder: boolean) => {
    let query = baseQuery.range(from, to);
    if (withOrder && sort) {
      query = query.order(sort, { ascending: direction !== "desc" });
    }
    return query;
  };

  let { data, count, error } = await runQuery(true);
  if (error && sort) {
    const fallback = await runQuery(false);
    data = fallback.data;
    count = fallback.count;
    error = fallback.error;
  }

  return {
    data: (data ?? []) as Record<string, unknown>[],
    count: count ?? 0,
    error
  };
}
