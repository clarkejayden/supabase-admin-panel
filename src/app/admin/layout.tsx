import { requireSuperadmin } from "@/lib/supabase/server";
import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireSuperadmin();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-[260px_1fr]">
        <Sidebar />
        <div className="flex min-h-screen flex-col">
          <Topbar email={profile.email ?? "unknown"} />
          <main className="flex-1 px-8 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
