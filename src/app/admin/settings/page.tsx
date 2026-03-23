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

export default async function SettingsPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireSuperadmin();

  const domainsParams = getTableParams(searchParams, "domains");
  const emailsParams = getTableParams(searchParams, "emails");

  const [domains, emails] = await Promise.all([
    fetchTablePage({
      table: "allowed_signup_domains",
      page: domainsParams.page,
      pageSize: PAGE_SIZE,
      sort: domainsParams.sort,
      direction: domainsParams.dir
    }),
    fetchTablePage({
      table: "whitelisted_email_addresses",
      page: emailsParams.page,
      pageSize: PAGE_SIZE,
      sort: emailsParams.sort,
      direction: emailsParams.dir
    })
  ]);

  const params = buildSearchParams(searchParams);

  const editDomainIdRaw = searchParams.edit_domains;
  const editEmailIdRaw = searchParams.edit_emails;
  const editDomainId = Array.isArray(editDomainIdRaw) ? editDomainIdRaw[0] : editDomainIdRaw;
  const editEmailId = Array.isArray(editEmailIdRaw) ? editEmailIdRaw[0] : editEmailIdRaw;

  const editDomainRow = domains.data.find((row) => row.id && String(row.id) === editDomainId);
  const editEmailRow = emails.data.find((row) => row.id && String(row.id) === editEmailId);

  const editDomainPayload = editDomainRow
    ? JSON.stringify(
        Object.fromEntries(Object.entries(editDomainRow).filter(([key]) => key !== "id")),
        null,
        2
      )
    : undefined;
  const editEmailPayload = editEmailRow
    ? JSON.stringify(
        Object.fromEntries(Object.entries(editEmailRow).filter(([key]) => key !== "id")),
        null,
        2
      )
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure allowed domains and whitelisted accounts.
        </p>
      </div>

      <TableCard title="Allowed Signup Domains" description="Manage allowed domains list.">
        <JsonCreateForm table="allowed_signup_domains" placeholder='{ "domain": "example.com" }' />
        <div className="mt-4">
          <DataTable
            columns={buildColumns({
              rows: domains.data,
              basePath: "/admin/settings",
              params,
              prefix: "domains",
              currentSort: domainsParams.sort,
              currentDir: domainsParams.dir
            })}
            rows={domains.data}
            emptyMessage="No domains configured."
          />
          <Pagination
            basePath="/admin/settings"
            params={params}
            currentPage={domainsParams.page}
            totalPages={Math.max(1, Math.ceil(domains.count / PAGE_SIZE))}
            pageParam="domains_page"
          />
        </div>
        <div className="mt-4 space-y-3">
          <JsonUpdateForm
            table="allowed_signup_domains"
            defaultId={editDomainId}
            defaultPayload={editDomainPayload}
          />
          {domains.data.map((row) =>
            row.id ? (
              <div key={String(row.id)} className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/settings?edit_domains=${row.id}`}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:brightness-110"
                >
                  Edit {row.id}
                </Link>
                <JsonDeleteForm table="allowed_signup_domains" id={String(row.id)} />
              </div>
            ) : null
          )}
        </div>
      </TableCard>

      <TableCard title="Whitelisted Email Addresses" description="Manage explicit email allowlist.">
        <JsonCreateForm
          table="whitelisted_email_addresses"
          placeholder='{ "email": "user@example.com" }'
        />
        <div className="mt-4">
          <DataTable
            columns={buildColumns({
              rows: emails.data,
              basePath: "/admin/settings",
              params,
              prefix: "emails",
              currentSort: emailsParams.sort,
              currentDir: emailsParams.dir
            })}
            rows={emails.data}
            emptyMessage="No whitelisted emails available."
          />
          <Pagination
            basePath="/admin/settings"
            params={params}
            currentPage={emailsParams.page}
            totalPages={Math.max(1, Math.ceil(emails.count / PAGE_SIZE))}
            pageParam="emails_page"
          />
        </div>
        <div className="mt-4 space-y-3">
          <JsonUpdateForm
            table="whitelisted_email_addresses"
            defaultId={editEmailId}
            defaultPayload={editEmailPayload}
          />
          {emails.data.map((row) =>
            row.id ? (
              <div key={String(row.id)} className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/settings?edit_emails=${row.id}`}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:brightness-110"
                >
                  Edit {row.id}
                </Link>
                <JsonDeleteForm table="whitelisted_email_addresses" id={String(row.id)} />
              </div>
            ) : null
          )}
        </div>
      </TableCard>
    </div>
  );
}
