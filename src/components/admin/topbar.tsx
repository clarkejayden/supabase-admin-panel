"use client";

import { LogoutButton } from "@/components/auth/logout-button";

export function Topbar({ email }: { email: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-background/80 px-8 py-4 backdrop-blur">
      <div>
        <p className="text-sm text-muted-foreground">Signed in as</p>
        <p className="text-sm font-semibold text-foreground">{email}</p>
      </div>
      <LogoutButton />
    </div>
  );
}
