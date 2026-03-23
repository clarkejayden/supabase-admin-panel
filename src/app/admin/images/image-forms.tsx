"use client";

import { useFormState } from "react-dom";
import { createImage, updateImage, deleteImage } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = { error: null as string | null };

export function ImageCreateForm() {
  const [state, formAction] = useFormState(createImage, initialState);

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]"
    >
      <Input name="url" placeholder="Image URL (optional)" />
      <Input name="user_id" placeholder="User ID" required />
      <Input name="file" type="file" accept="image/*" />
      <Button type="submit">Create</Button>
      {state.error ? (
        <p className="text-sm text-destructive md:col-span-4">{state.error}</p>
      ) : null}
    </form>
  );
}

export function ImageUpdateForm({
  id,
  defaultUrl,
  defaultUserId
}: {
  id: string;
  defaultUrl: string;
  defaultUserId: string;
}) {
  const [state, formAction] = useFormState(updateImage, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <Input name="url" defaultValue={defaultUrl} className="min-w-[220px]" />
      <Input name="user_id" defaultValue={defaultUserId} className="min-w-[200px]" />
      <Button type="submit" variant="secondary">
        Update
      </Button>
      {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
    </form>
  );
}

export function ImageDeleteForm({ id }: { id: string }) {
  const [state, formAction] = useFormState(deleteImage, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="destructive">
        Delete
      </Button>
      {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
    </form>
  );
}
