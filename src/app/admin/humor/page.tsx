import { requireSuperadmin } from "@/lib/supabase/server";
import { fetchTablePage } from "@/lib/supabase/admin-table";
import { buildSearchParams, getTableParams } from "@/lib/admin-table-params";
import { TableCard } from "@/components/admin/table/table-card";
import { DataTable, type ColumnDef } from "@/components/admin/table/data-table";
import { Pagination } from "@/components/admin/table/pagination";
import { SortableHead } from "@/components/admin/table/sortable-head";
import { JsonUpdateForm } from "@/components/admin/forms/json-forms";

const PAGE_SIZE = 10;

function labelize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildColumns({
  rows,
  basePath,
  params,
  prefix,
  currentSort,
  currentDir
}: {
  rows: Record<string, unknown>[];
  basePath: string;
  params: URLSearchParams;
  prefix: string;
  currentSort?: string;
  currentDir: "asc" | "desc";
}) {
  const keys = Object.keys(rows[0] ?? {});
  return keys.map<ColumnDef<Record<string, unknown>>>((key) => ({
    key,
    label: (
      <SortableHead
        basePath={basePath}
        params={params}
        label={labelize(key)}
        sortKey={key}
        currentSort={currentSort ?? ""}
        currentDir={currentDir}
        sortParam={`${prefix}_sort`}
        dirParam={`${prefix}_dir`}
        pageParam={`${prefix}_page`}
      />
    ),
    render: (row) => {
      const value = row[key];
      if (value === null || value === undefined) return "-";
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    }
  }));
}

export default async function HumorPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireSuperadmin();

  const flavorsParams = getTableParams(searchParams, "flavors");
  const stepsParams = getTableParams(searchParams, "steps");
  const mixParams = getTableParams(searchParams, "mix");

  const [flavors, steps, mix] = await Promise.all([
    fetchTablePage({
      table: "humor_flavors",
      page: flavorsParams.page,
      pageSize: PAGE_SIZE,
      sort: flavorsParams.sort,
      direction: flavorsParams.dir
    }),
    fetchTablePage({
      table: "humor_flavor_steps",
      page: stepsParams.page,
      pageSize: PAGE_SIZE,
      sort: stepsParams.sort,
      direction: stepsParams.dir
    }),
    fetchTablePage({
      table: "humor_mix",
      page: mixParams.page,
      pageSize: PAGE_SIZE,
      sort: mixParams.sort,
      direction: mixParams.dir
    })
  ]);

  const baseParams = buildSearchParams(searchParams);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Humor</h2>
        <p className="text-sm text-muted-foreground">
          Manage humor configuration tables and flavor sequencing.
        </p>
      </div>

      <TableCard
        title="Humor Flavors"
        description="Read-only list of available humor flavors."
      >
        <DataTable
          columns={buildColumns({
            rows: flavors.data,
            basePath: "/admin/humor",
            params: baseParams,
            prefix: "flavors",
            currentSort: flavorsParams.sort,
            currentDir: flavorsParams.dir
          })}
          rows={flavors.data}
          emptyMessage="No humor flavors available."
        />
        <Pagination
          basePath="/admin/humor"
          params={baseParams}
          currentPage={flavorsParams.page}
          totalPages={Math.max(1, Math.ceil(flavors.count / PAGE_SIZE))}
          pageParam="flavors_page"
        />
      </TableCard>

      <TableCard
        title="Humor Flavor Steps"
        description="Read-only steps that define how flavors are assembled."
      >
        <DataTable
          columns={buildColumns({
            rows: steps.data,
            basePath: "/admin/humor",
            params: baseParams,
            prefix: "steps",
            currentSort: stepsParams.sort,
            currentDir: stepsParams.dir
          })}
          rows={steps.data}
          emptyMessage="No humor flavor steps available."
        />
        <Pagination
          basePath="/admin/humor"
          params={baseParams}
          currentPage={stepsParams.page}
          totalPages={Math.max(1, Math.ceil(steps.count / PAGE_SIZE))}
          pageParam="steps_page"
        />
      </TableCard>

      <TableCard
        title="Humor Mix"
        description="Update the humor mix configuration by ID."
        actions={<div className="text-xs text-muted-foreground">Update only</div>}
      >
        <JsonUpdateForm table="humor_mix" />
        <div className="mt-4">
          <DataTable
            columns={buildColumns({
              rows: mix.data,
              basePath: "/admin/humor",
              params: baseParams,
              prefix: "mix",
              currentSort: mixParams.sort,
              currentDir: mixParams.dir
            })}
            rows={mix.data}
            emptyMessage="No humor mix entries available."
          />
          <Pagination
            basePath="/admin/humor"
            params={baseParams}
            currentPage={mixParams.page}
            totalPages={Math.max(1, Math.ceil(mix.count / PAGE_SIZE))}
            pageParam="mix_page"
          />
        </div>
      </TableCard>
    </div>
  );
}
