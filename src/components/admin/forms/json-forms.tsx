"use client";

import { useFormState } from "react-dom";
import { createRecord, updateRecord, deleteRecord } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = { error: null as string | null };

export function JsonCreateForm({
  table,
  placeholder
}: {
  table: string;
  placeholder?: string;
}) {
  const [state, formAction] = useFormState(createRecord, initialState);

  return (
    <form action={formAction} className="grid gap-3 md:grid-cols-[1fr_auto]">
      <input type="hidden" name="table" value={table} />
      <textarea
        name="payload"
        rows={4}
        className="w-full rounded-2xl border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder={placeholder ?? '{ "name": "Example" }'}
        required
      />
      <Button type="submit">Create</Button>
      {state.error ? (
        <p className="text-sm text-destructive md:col-span-2">{state.error}</p>
      ) : null}
    </form>
  );
}

export function JsonUpdateForm({
  table,
  defaultId,
  defaultPayload
}: {
  table: string;
  defaultId?: string;
  defaultPayload?: string;
}) {
  const [state, formAction] = useFormState(updateRecord, initialState);

  return (
    <form action={formAction} className="grid gap-3 md:grid-cols-[220px_1fr_auto]">
      <input type="hidden" name="table" value={table} />
      <Input name="id" placeholder="Row ID" defaultValue={defaultId} required />
      <textarea
        name="payload"
        rows={3}
        className="w-full rounded-2xl border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder='{ "name": "Updated value" }'
        defaultValue={defaultPayload}
        required
      />
      <Button type="submit" variant="secondary">
        Update
      </Button>
      {state.error ? (
        <p className="text-sm text-destructive md:col-span-3">{state.error}</p>
      ) : null}
    </form>
  );
}

export function JsonDeleteForm({ table, id }: { table: string; id: string }) {
  const [state, formAction] = useFormState(deleteRecord, initialState);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="destructive">
        Delete
      </Button>
      {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
    </form>
  );
}
