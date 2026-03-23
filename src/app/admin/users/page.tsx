import { requireSuperadmin, createAdminClient } from "@/lib/supabase/server";
import { TableCard } from "@/components/admin/table/table-card";
import { Pagination } from "@/components/admin/table/pagination";
import { SortableHead } from "@/components/admin/table/sortable-head";
import { buildSearchParams, getTableParams } from "@/lib/admin-table-params";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PAGE_SIZE = 10;

export default async function UsersPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireSuperadmin();
  const supabase = createAdminClient();

  const tableParams = getTableParams(searchParams, "users");
  const { data: profiles, count } = await supabase
    .from("profiles")
    .select("id,email,is_superadmin", { count: "exact" })
    .order(tableParams.sort ?? "email", { ascending: tableParams.dir === "asc" })
    .range((tableParams.page - 1) * PAGE_SIZE, tableParams.page * PAGE_SIZE - 1);

  const params = buildSearchParams(searchParams);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Users</h2>
        <p className="text-sm text-muted-foreground">
          Read-only view of all authenticated users.
        </p>
      </div>
      <TableCard title="Profiles" description="Read-only profiles table.">
        {(profiles ?? []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-6 text-sm text-muted-foreground">
            No user profiles available.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortableHead
                      basePath="/admin/users"
                      params={params}
                      label="Email"
                      sortKey="email"
                      currentSort={tableParams.sort ?? "email"}
                      currentDir={tableParams.dir}
                      sortParam="users_sort"
                      dirParam="users_dir"
                      pageParam="users_page"
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHead
                      basePath="/admin/users"
                      params={params}
                      label="User ID"
                      sortKey="id"
                      currentSort={tableParams.sort ?? "email"}
                      currentDir={tableParams.dir}
                      sortParam="users_sort"
                      dirParam="users_dir"
                      pageParam="users_page"
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHead
                      basePath="/admin/users"
                      params={params}
                      label="Superadmin"
                      sortKey="is_superadmin"
                      currentSort={tableParams.sort ?? "email"}
                      currentDir={tableParams.dir}
                      sortParam="users_sort"
                      dirParam="users_dir"
                      pageParam="users_page"
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(profiles ?? []).map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell className="font-mono text-xs">{profile.id}</TableCell>
                    <TableCell>{profile.is_superadmin ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              basePath="/admin/users"
              params={params}
              currentPage={tableParams.page}
              totalPages={Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))}
              pageParam="users_page"
            />
          </>
        )}
      </TableCard>
    </div>
  );
}
