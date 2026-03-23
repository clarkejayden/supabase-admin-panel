export type TableParams = {
  page: number;
  sort?: string;
  dir: "asc" | "desc";
};

export function getTableParams(
  searchParams: Record<string, string | string[] | undefined>,
  prefix: string
): TableParams {
  const pageRaw = searchParams[`${prefix}_page`];
  const sortRaw = searchParams[`${prefix}_sort`];
  const dirRaw = searchParams[`${prefix}_dir`];

  const pageValue = Number(Array.isArray(pageRaw) ? pageRaw[0] : pageRaw ?? "1");
  const page = Number.isFinite(pageValue) && pageValue > 0 ? Math.floor(pageValue) : 1;
  const sort = Array.isArray(sortRaw) ? sortRaw[0] : sortRaw;
  const dir = (Array.isArray(dirRaw) ? dirRaw[0] : dirRaw) === "asc" ? "asc" : "desc";

  return { page, sort, dir };
}

export function buildSearchParams(
  searchParams: Record<string, string | string[] | undefined>
) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else {
      params.set(key, value);
    }
  });
  return params;
}
