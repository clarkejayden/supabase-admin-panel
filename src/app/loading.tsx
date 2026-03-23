export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-4 text-sm text-muted-foreground shadow-card">
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        Checking your session...
      </div>
    </div>
  );
}
