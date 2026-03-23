import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#1e3a8a,_#020617_45%)] px-6">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card/90 p-8 text-center shadow-card backdrop-blur">
        <h1 className="text-2xl font-semibold text-foreground">Access Denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You do not have permission to view this page. Contact a project owner to
          grant superadmin access.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-card transition duration-200 hover:brightness-110 hover:scale-105"
          >
            Back to login
          </Link>
          <LogoutButton label="Log out" variant="secondary" />
        </div>
      </div>
    </div>
  );
}
