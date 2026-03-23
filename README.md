# Supabase Admin Dashboard

Production-ready admin dashboard for managing Supabase data with strict superadmin access.

## Environment

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_PIPELINE_API_BASE_URL=your_pipeline_api_base_url
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client. It is used only in
server-side code.

## Required Supabase Settings

- Enable Google OAuth in Supabase Auth.
- Set the redirect URL to `/auth/callback`.
- Manually mark a profile as superadmin by setting `profiles.is_superadmin = true`.

## Example Queries

These mirror the queries used in the app:

```ts
// Fetch users
supabase.from("profiles").select("id,email,is_superadmin").order("email");

// Create image
supabase.from("images").insert({ url, user_id });

// Update image
supabase.from("images").update({ url, user_id }).eq("id", imageId);

// Delete image
supabase.from("images").delete().eq("id", imageId);

// Fetch captions
supabase.from("captions").select("id,text,image_id,images(url)");
```
