"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#1e3a8a,_#020617_45%)] px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card/90 p-8 shadow-card backdrop-blur">
        <h1 className="text-2xl font-semibold text-foreground">Admin Sign In</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use Google to authenticate. Access is restricted to superadmins.
        </p>
        <Button className="mt-6 w-full" onClick={handleGoogleLogin} disabled={isLoading}>
          {isLoading ? "Connecting..." : "Continue with Google"}
        </Button>
        {error ? (
          <p className="mt-4 text-sm text-destructive">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
