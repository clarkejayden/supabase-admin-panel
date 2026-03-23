"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Images,
  Captions,
  Sparkles,
  FileText,
  Bot,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/stats", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/images", label: "Images", icon: Images },
  { href: "/admin/humor", label: "Humor", icon: Sparkles },
  { href: "/admin/terms", label: "Terms", icon: FileText },
  { href: "/admin/captions", label: "Captions", icon: Captions },
  { href: "/admin/llm", label: "LLM", icon: Bot },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex h-full w-full flex-col gap-6 border-r border-border bg-secondary/80 px-6 py-8 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Supabase Admin
        </p>
        <h1 className="mt-2 text-xl font-semibold text-foreground">
          Command Center
        </h1>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition hover:scale-105",
                isActive
                  ? "bg-accent text-accent-foreground shadow-card"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-2xl border border-border bg-card px-3 py-3 text-xs text-muted-foreground">
        Manage users, images, and captions securely.
      </div>
    </aside>
  );
}
