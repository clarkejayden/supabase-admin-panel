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

export default async function LlmPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireSuperadmin();

  const modelsParams = getTableParams(searchParams, "models");
  const providersParams = getTableParams(searchParams, "providers");
  const chainsParams = getTableParams(searchParams, "chains");
  const responsesParams = getTableParams(searchParams, "responses");

  const [models, providers, chains, responses] = await Promise.all([
    fetchTablePage({
      table: "llm_models",
      page: modelsParams.page,
      pageSize: PAGE_SIZE,
      sort: modelsParams.sort,
      direction: modelsParams.dir
    }),
    fetchTablePage({
      table: "llm_providers",
      page: providersParams.page,
      pageSize: PAGE_SIZE,
      sort: providersParams.sort,
      direction: providersParams.dir
    }),
    fetchTablePage({
      table: "llm_prompt_chains",
      page: chainsParams.page,
      pageSize: PAGE_SIZE,
      sort: chainsParams.sort,
      direction: chainsParams.dir
    }),
    fetchTablePage({
      table: "llm_responses",
      page: responsesParams.page,
      pageSize: PAGE_SIZE,
      sort: responsesParams.sort,
      direction: responsesParams.dir
    })
  ]);

  const params = buildSearchParams(searchParams);
  const editModelIdRaw = searchParams.edit_models;
  const editProviderIdRaw = searchParams.edit_providers;
  const editModelId = Array.isArray(editModelIdRaw) ? editModelIdRaw[0] : editModelIdRaw;
  const editProviderId = Array.isArray(editProviderIdRaw)
    ? editProviderIdRaw[0]
    : editProviderIdRaw;

  const editModelRow = models.data.find((row) => row.id && String(row.id) === editModelId);
  const editProviderRow = providers.data.find(
    (row) => row.id && String(row.id) === editProviderId
  );

  const editModelPayload = editModelRow
    ? JSON.stringify(
        Object.fromEntries(Object.entries(editModelRow).filter(([key]) => key !== "id")),
        null,
        2
      )
    : undefined;
  const editProviderPayload = editProviderRow
    ? JSON.stringify(
        Object.fromEntries(Object.entries(editProviderRow).filter(([key]) => key !== "id")),
        null,
        2
      )
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">LLM</h2>
        <p className="text-sm text-muted-foreground">
          Manage LLM providers and models, with read-only prompt chains and responses.
        </p>
      </div>

      <TableCard title="LLM Providers" description="Create, update, and delete providers.">
        <JsonCreateForm table="llm_providers" placeholder='{ "name": "OpenAI" }' />
        <div className="mt-4">
          <DataTable
            columns={buildColumns({
              rows: providers.data,
              basePath: "/admin/llm",
              params,
              prefix: "providers",
              currentSort: providersParams.sort,
              currentDir: providersParams.dir
            })}
            rows={providers.data}
            emptyMessage="No providers available."
          />
          <Pagination
            basePath="/admin/llm"
            params={params}
            currentPage={providersParams.page}
            totalPages={Math.max(1, Math.ceil(providers.count / PAGE_SIZE))}
            pageParam="providers_page"
          />
        </div>
        <div className="mt-4 space-y-3">
          <JsonUpdateForm
            table="llm_providers"
            defaultId={editProviderId}
            defaultPayload={editProviderPayload}
          />
          {providers.data.map((row) =>
            row.id ? (
              <div key={String(row.id)} className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/llm?edit_providers=${row.id}`}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:brightness-110"
                >
                  Edit {row.id}
                </Link>
                <JsonDeleteForm table="llm_providers" id={String(row.id)} />
              </div>
            ) : null
          )}
        </div>
      </TableCard>

      <TableCard title="LLM Models" description="Create, update, and delete models.">
        <JsonCreateForm table="llm_models" placeholder='{ "name": "gpt-4", "provider_id": "..." }' />
        <div className="mt-4">
          <DataTable
            columns={buildColumns({
              rows: models.data,
              basePath: "/admin/llm",
              params,
              prefix: "models",
              currentSort: modelsParams.sort,
              currentDir: modelsParams.dir
            })}
            rows={models.data}
            emptyMessage="No models available."
          />
          <Pagination
            basePath="/admin/llm"
            params={params}
            currentPage={modelsParams.page}
            totalPages={Math.max(1, Math.ceil(models.count / PAGE_SIZE))}
            pageParam="models_page"
          />
        </div>
        <div className="mt-4 space-y-3">
          <JsonUpdateForm
            table="llm_models"
            defaultId={editModelId}
            defaultPayload={editModelPayload}
          />
          {models.data.map((row) =>
            row.id ? (
              <div key={String(row.id)} className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/llm?edit_models=${row.id}`}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:brightness-110"
                >
                  Edit {row.id}
                </Link>
                <JsonDeleteForm table="llm_models" id={String(row.id)} />
              </div>
            ) : null
          )}
        </div>
      </TableCard>

      <TableCard title="Prompt Chains" description="Read-only prompt chain definitions.">
        <DataTable
          columns={buildColumns({
            rows: chains.data,
            basePath: "/admin/llm",
            params,
            prefix: "chains",
            currentSort: chainsParams.sort,
            currentDir: chainsParams.dir
          })}
          rows={chains.data}
          emptyMessage="No prompt chains available."
        />
        <Pagination
          basePath="/admin/llm"
          params={params}
          currentPage={chainsParams.page}
          totalPages={Math.max(1, Math.ceil(chains.count / PAGE_SIZE))}
          pageParam="chains_page"
        />
      </TableCard>

      <TableCard title="LLM Responses" description="Read-only response history.">
        <DataTable
          columns={buildColumns({
            rows: responses.data,
            basePath: "/admin/llm",
            params,
            prefix: "responses",
            currentSort: responsesParams.sort,
            currentDir: responsesParams.dir
          })}
          rows={responses.data}
          emptyMessage="No LLM responses available."
        />
        <Pagination
          basePath="/admin/llm"
          params={params}
          currentPage={responsesParams.page}
          totalPages={Math.max(1, Math.ceil(responses.count / PAGE_SIZE))}
          pageParam="responses_page"
        />
      </TableCard>
    </div>
  );
}
