"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LogoutButton({
  label = "Log out",
  variant = "secondary"
}: {
  label?: string;
  variant?: "default" | "secondary" | "ghost" | "destructive";
}) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <Button variant={variant} onClick={handleLogout}>
      {label}
    </Button>
  );
}
