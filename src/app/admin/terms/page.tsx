import Link from "next/link";
import { requireSuperadmin } from "@/lib/supabase/server";
import { fetchTablePage } from "@/lib/supabase/admin-table";
import { buildSearchParams, getTableParams } from "@/lib/admin-table-params";
import { TableCard } from "@/components/admin/table/table-card";
import { DataTable, type ColumnDef } from "@/components/admin/table/data-table";
import { Pagination } from "@/components/admin/table/pagination";
import { SortableHead } from "@/components/admin/table/sortable-head";
import { JsonCreateForm, JsonUpdateForm, JsonDeleteForm } from "@/components/admin/forms/json-forms";

const PAGE_SIZE = 10;

function labelize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildColumns({
  rows,
  basePath,
  params,
  currentSort,
  currentDir
}: {
  rows: Record<string, unknown>[];
  basePath: string;
  params: URLSearchParams;
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
        sortParam="terms_sort"
        dirParam="terms_dir"
        pageParam="terms_page"
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

export default async function TermsPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireSuperadmin();
  const tableParams = getTableParams(searchParams, "terms");
  const editIdRaw = searchParams.edit_terms;
  const editId = Array.isArray(editIdRaw) ? editIdRaw[0] : editIdRaw;

  const terms = await fetchTablePage({
    table: "terms",
    page: tableParams.page,
    pageSize: PAGE_SIZE,
    sort: tableParams.sort,
    direction: tableParams.dir
  });

  const params = buildSearchParams(searchParams);
  const editRow = terms.data.find((row) => row.id && String(row.id) === editId);
  const editPayload = editRow
    ? JSON.stringify(
        Object.fromEntries(
          Object.entries(editRow).filter(([key]) => key !== "id")
        ),
        null,
        2
      )
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Terms</h2>
        <p className="text-sm text-muted-foreground">
          Create, update, and delete terms content.
        </p>
      </div>

      <TableCard
        title="Create Term"
        description="Provide a JSON payload that matches the terms table schema."
      >
        <JsonCreateForm table="terms" placeholder='{ "title": "Terms v1", "content": "..." }' />
      </TableCard>

      <TableCard title="Terms Directory" description="Edit or delete existing terms.">
        <DataTable
          columns={buildColumns({
            rows: terms.data,
            basePath: "/admin/terms",
            params,
            currentSort: tableParams.sort,
            currentDir: tableParams.dir
          })}
          rows={terms.data}
          emptyMessage="No terms available. Create the first entry."
        />
        <Pagination
          basePath="/admin/terms"
          params={params}
          currentPage={tableParams.page}
          totalPages={Math.max(1, Math.ceil(terms.count / PAGE_SIZE))}
          pageParam="terms_page"
        />
        <div className="mt-4 space-y-3">
          <JsonUpdateForm table="terms" defaultId={editId} defaultPayload={editPayload} />
          {terms.data.map((row) =>
            row.id ? (
              <div key={String(row.id)} className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/terms?edit_terms=${row.id}`}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:brightness-110"
                >
                  Edit {String(row.id)}
                </Link>
                <JsonDeleteForm table="terms" id={String(row.id)} />
              </div>
            ) : null
          )}
        </div>
      </TableCard>
    </div>
  );
}
