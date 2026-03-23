import Link from "next/link";
import { createAdminClient, requireSuperadmin } from "@/lib/supabase/server";
import { fetchTablePage } from "@/lib/supabase/admin-table";
import { buildSearchParams, getTableParams } from "@/lib/admin-table-params";
import { TableCard } from "@/components/admin/table/table-card";
import { DataTable, type ColumnDef } from "@/components/admin/table/data-table";
import { Pagination } from "@/components/admin/table/pagination";
import { SortableHead } from "@/components/admin/table/sortable-head";
import { JsonCreateForm, JsonUpdateForm, JsonDeleteForm } from "@/components/admin/forms/json-forms";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PAGE_SIZE = 10;

type CaptionRow = {
  id: string;
  text: string | null;
  image_id: string | null;
  images?: { url: string } | { url: string }[] | null;
};

export default async function CaptionsPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireSuperadmin();
  const supabase = createAdminClient();

  const captionsParams = getTableParams(searchParams, "captions");
  const requestsParams = getTableParams(searchParams, "requests");
  const examplesParams = getTableParams(searchParams, "examples");

  const { data: captions, count: captionsCount } = await supabase
    .from("captions")
    .select("id,text,image_id,images(url)", { count: "exact" })
    .order(captionsParams.sort ?? "id", { ascending: captionsParams.dir === "asc" })
    .range((captionsParams.page - 1) * PAGE_SIZE, captionsParams.page * PAGE_SIZE - 1);
  const captionRows = (captions ?? []) as CaptionRow[];

  const [requests, examples] = await Promise.all([
    fetchTablePage({
      table: "caption_requests",
      page: requestsParams.page,
      pageSize: PAGE_SIZE,
      sort: requestsParams.sort,
      direction: requestsParams.dir
    }),
    fetchTablePage({
      table: "caption_examples",
      page: examplesParams.page,
      pageSize: PAGE_SIZE,
      sort: examplesParams.sort,
      direction: examplesParams.dir
    })
  ]);

  const params = buildSearchParams(searchParams);
  const editIdRaw = searchParams.edit_examples;
  const editId = Array.isArray(editIdRaw) ? editIdRaw[0] : editIdRaw;
  const editRow = examples.data.find((row) => row.id && String(row.id) === editId);
  const editPayload = editRow
    ? JSON.stringify(
        Object.fromEntries(Object.entries(editRow).filter(([key]) => key !== "id")),
        null,
        2
      )
    : undefined;

  const exampleColumns = Object.keys(examples.data[0] ?? {}).map<ColumnDef<Record<string, unknown>>>(
    (key) => ({
      key,
      label: (
        <SortableHead
          basePath="/admin/captions"
          params={params}
          label={key.replace(/_/g, " ")}
          sortKey={key}
          currentSort={examplesParams.sort ?? ""}
          currentDir={examplesParams.dir}
          sortParam="examples_sort"
          dirParam="examples_dir"
          pageParam="examples_page"
        />
      ),
      render: (row) => {
        const value = row[key];
        if (value === null || value === undefined) return "-";
        if (typeof value === "object") return JSON.stringify(value);
        return String(value);
      }
    })
  );

  const requestColumns = Object.keys(requests.data[0] ?? {}).map<ColumnDef<Record<string, unknown>>>(
    (key) => ({
      key,
      label: (
        <SortableHead
          basePath="/admin/captions"
          params={params}
          label={key.replace(/_/g, " ")}
          sortKey={key}
          currentSort={requestsParams.sort ?? ""}
          currentDir={requestsParams.dir}
          sortParam="requests_sort"
          dirParam="requests_dir"
          pageParam="requests_page"
        />
      ),
      render: (row) => {
        const value = row[key];
        if (value === null || value === undefined) return "-";
        if (typeof value === "object") return JSON.stringify(value);
        return String(value);
      }
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Captions</h2>
        <p className="text-sm text-muted-foreground">
          Read-only captions linked to images.
        </p>
      </div>
      <TableCard title="Caption List" description="Read-only caption entries.">
        {captionRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-6 text-sm text-muted-foreground">
            No captions available.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortableHead
                    basePath="/admin/captions"
                    params={params}
                    label="Caption"
                    sortKey="text"
                    currentSort={captionsParams.sort ?? "id"}
                    currentDir={captionsParams.dir}
                    sortParam="captions_sort"
                    dirParam="captions_dir"
                    pageParam="captions_page"
                  />
                </TableHead>
                <TableHead>Image</TableHead>
                <TableHead>
                  <SortableHead
                    basePath="/admin/captions"
                    params={params}
                    label="Image ID"
                    sortKey="image_id"
                    currentSort={captionsParams.sort ?? "id"}
                    currentDir={captionsParams.dir}
                    sortParam="captions_sort"
                    dirParam="captions_dir"
                    pageParam="captions_page"
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {captionRows.map((caption) => {
                const imageUrl = Array.isArray(caption.images)
                  ? caption.images[0]?.url
                  : caption.images?.url;
                return (
                  <TableRow key={caption.id}>
                    <TableCell className="max-w-[420px]">{caption.text}</TableCell>
                    <TableCell>
                      {imageUrl ? (
                        <div className="h-12 w-12 overflow-hidden rounded-md border border-border bg-secondary">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageUrl}
                            alt="Image"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{caption.image_id}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        <Pagination
          basePath="/admin/captions"
          params={params}
          currentPage={captionsParams.page}
          totalPages={Math.max(1, Math.ceil((captionsCount ?? 0) / PAGE_SIZE))}
          pageParam="captions_page"
        />
      </TableCard>

      <TableCard
        title="Caption Requests"
        description="Read-only inbound caption requests."
      >
        <DataTable
          columns={requestColumns}
          rows={requests.data}
          emptyMessage="No caption requests available."
        />
        <Pagination
          basePath="/admin/captions"
          params={params}
          currentPage={requestsParams.page}
          totalPages={Math.max(1, Math.ceil(requests.count / PAGE_SIZE))}
          pageParam="requests_page"
        />
      </TableCard>

      <TableCard
        title="Caption Examples"
        description="Create, update, and delete caption examples."
      >
        <JsonCreateForm table="caption_examples" placeholder='{ "text": "Example caption" }' />
        <div className="mt-4">
          <DataTable
            columns={exampleColumns}
            rows={examples.data}
            emptyMessage="No caption examples available."
          />
          <Pagination
            basePath="/admin/captions"
            params={params}
            currentPage={examplesParams.page}
            totalPages={Math.max(1, Math.ceil(examples.count / PAGE_SIZE))}
            pageParam="examples_page"
          />
        </div>
        <div className="mt-4 space-y-3">
          <JsonUpdateForm
            table="caption_examples"
            defaultId={editId}
            defaultPayload={editPayload}
          />
          {examples.data.map((row) =>
            row.id ? (
              <div key={String(row.id)} className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/captions?edit_examples=${row.id}`}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:brightness-110"
                >
                  Edit {String(row.id)}
                </Link>
                <JsonDeleteForm table="caption_examples" id={String(row.id)} />
              </div>
            ) : null
          )}
        </div>
      </TableCard>
    </div>
  );
}
