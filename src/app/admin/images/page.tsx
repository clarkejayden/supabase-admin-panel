import { createAdminClient, requireSuperadmin } from "@/lib/supabase/server";
import { TableCard } from "@/components/admin/table/table-card";
import { Pagination } from "@/components/admin/table/pagination";
import { SortableHead } from "@/components/admin/table/sortable-head";
import { buildSearchParams, getTableParams } from "@/lib/admin-table-params";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImageCreateForm, ImageDeleteForm, ImageUpdateForm } from "./image-forms";

const PAGE_SIZE = 10;

export default async function ImagesPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireSuperadmin();
  const supabase = createAdminClient();

  const tableParams = getTableParams(searchParams, "images");
  const { data: images, count } = await supabase
    .from("images")
    .select("id,url,user_id,created_at", { count: "exact" })
    .order(tableParams.sort ?? "created_at", { ascending: tableParams.dir === "asc" })
    .range((tableParams.page - 1) * PAGE_SIZE, tableParams.page * PAGE_SIZE - 1);

  const params = buildSearchParams(searchParams);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Images</h2>
        <p className="text-sm text-muted-foreground">
          Create, update, and delete images with strict validation.
        </p>
      </div>
      <TableCard title="Create Image">
        <ImageCreateForm />
      </TableCard>
      <TableCard title="All Images">
        {(images ?? []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-6 text-sm text-muted-foreground">
            No images available. Upload your first image above.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>
                    <SortableHead
                      basePath="/admin/images"
                      params={params}
                      label="URL"
                      sortKey="url"
                      currentSort={tableParams.sort ?? "created_at"}
                      currentDir={tableParams.dir}
                      sortParam="images_sort"
                      dirParam="images_dir"
                      pageParam="images_page"
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHead
                      basePath="/admin/images"
                      params={params}
                      label="User ID"
                      sortKey="user_id"
                      currentSort={tableParams.sort ?? "created_at"}
                      currentDir={tableParams.dir}
                      sortParam="images_sort"
                      dirParam="images_dir"
                      pageParam="images_page"
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHead
                      basePath="/admin/images"
                      params={params}
                      label="Created"
                      sortKey="created_at"
                      currentSort={tableParams.sort ?? "created_at"}
                      currentDir={tableParams.dir}
                      sortParam="images_sort"
                      dirParam="images_dir"
                      pageParam="images_page"
                    />
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(images ?? []).map((image) => (
                  <TableRow key={image.id}>
                    <TableCell>
                      <div className="h-12 w-12 overflow-hidden rounded-md border border-border bg-secondary">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.url}
                          alt="Uploaded"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate">{image.url}</TableCell>
                    <TableCell className="font-mono text-xs">{image.user_id}</TableCell>
                    <TableCell className="text-xs">
                      {image.created_at ? new Date(image.created_at).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell className="space-y-2">
                      <ImageUpdateForm
                        id={image.id}
                        defaultUrl={image.url}
                        defaultUserId={image.user_id}
                      />
                      <ImageDeleteForm id={image.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              basePath="/admin/images"
              params={params}
              currentPage={tableParams.page}
              totalPages={Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))}
              pageParam="images_page"
            />
          </>
        )}
      </TableCard>
    </div>
  );
}
