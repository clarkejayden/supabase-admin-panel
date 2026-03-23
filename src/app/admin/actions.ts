"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminClient, requireSuperadmin } from "@/lib/supabase/server";

const writableTables = [
  "terms",
  "caption_examples",
  "llm_models",
  "llm_providers",
  "allowed_signup_domains",
  "whitelisted_email_addresses"
] as const;

const updatableTables = [...writableTables, "humor_mix"] as const;

const tableSchema = z.enum(writableTables);
const updateTableSchema = z.enum(updatableTables);

const payloadSchema = z
  .string()
  .min(1)
  .transform((value, ctx) => {
    try {
      return JSON.parse(value);
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid JSON." });
      return z.NEVER;
    }
  })
  .refine((value) => value && typeof value === "object" && !Array.isArray(value), {
    message: "Payload must be a JSON object."
  });

export async function createRecord(
  _prevState: { error: string | null },
  formData: FormData
) {
  await requireSuperadmin();
  const supabase = createAdminClient();

  const parsed = z
    .object({
      table: tableSchema,
      payload: payloadSchema
    })
    .safeParse({
      table: formData.get("table"),
      payload: formData.get("payload")
    });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase.from(parsed.data.table).insert(parsed.data.payload);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { error: null };
}

export async function updateRecord(
  _prevState: { error: string | null },
  formData: FormData
) {
  await requireSuperadmin();
  const supabase = createAdminClient();

  const parsed = z
    .object({
      table: updateTableSchema,
      id: z.string().min(1),
      payload: payloadSchema
    })
    .safeParse({
      table: formData.get("table"),
      id: formData.get("id"),
      payload: formData.get("payload")
    });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase
    .from(parsed.data.table)
    .update(parsed.data.payload)
    .eq("id", parsed.data.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { error: null };
}

export async function deleteRecord(
  _prevState: { error: string | null },
  formData: FormData
) {
  await requireSuperadmin();
  const supabase = createAdminClient();

  const parsed = z
    .object({
      table: tableSchema,
      id: z.string().min(1)
    })
    .safeParse({
      table: formData.get("table"),
      id: formData.get("id")
    });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase.from(parsed.data.table).delete().eq("id", parsed.data.id);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { error: null };
}
