"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminClient, requireSuperadmin } from "@/lib/supabase/server";

const createSchema = z.object({
  url: z.string().url().optional().or(z.literal("")),
  user_id: z.string().uuid()
});

const updateSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url().optional().or(z.literal("")),
  user_id: z.string().uuid().optional().or(z.literal(""))
});

export async function createImage(
  _prevState: { error: string | null },
  formData: FormData
) {
  const { user } = await requireSuperadmin();
  const supabase = createAdminClient();

  const url = formData.get("url");
  const userId = formData.get("user_id");
  const file = formData.get("file");

  const parsed = createSchema.safeParse({
    url: typeof url === "string" ? url : "",
    user_id: typeof userId === "string" ? userId : ""
  });

  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  let finalUrl = parsed.data.url?.trim();

  if (!finalUrl && file instanceof File && file.size > 0) {
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const { data: publicData } = supabase.storage
      .from("images")
      .getPublicUrl(filePath);

    finalUrl = publicData.publicUrl;
  }

  if (!finalUrl) {
    return { error: "Provide a valid URL or upload a file." };
  }

  const { error } = await supabase.from("images").insert({
    url: finalUrl,
    user_id: parsed.data.user_id
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/images");
  return { error: null };
}

export async function updateImage(
  _prevState: { error: string | null },
  formData: FormData
) {
  await requireSuperadmin();
  const supabase = createAdminClient();

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    url: formData.get("url") ?? "",
    user_id: formData.get("user_id") ?? ""
  });

  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  const updates: Record<string, string> = {};

  if (parsed.data.url) {
    updates.url = parsed.data.url;
  }

  if (parsed.data.user_id) {
    updates.user_id = parsed.data.user_id;
  }

  const { error } = await supabase
    .from("images")
    .update(updates)
    .eq("id", parsed.data.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/images");
  return { error: null };
}

export async function deleteImage(
  _prevState: { error: string | null },
  formData: FormData
) {
  await requireSuperadmin();
  const supabase = createAdminClient();
  const id = formData.get("id");

  if (typeof id !== "string") {
    return { error: "Invalid image id." };
  }

  const { error } = await supabase.from("images").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/images");
  return { error: null };
}
