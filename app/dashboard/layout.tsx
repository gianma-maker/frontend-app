"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { clearTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/dashboard", label: "Tournaments" },
  { href: "/dashboard/venues", label: "Venues" },
  { href: "/dashboard/players", label: "Players" },
  { href: "/dashboard/registrations", label: "Registrations" },
  { href: "/dashboard/matches", label: "Matches" },
  { href: "/dashboard/match-scores", label: "Scores" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isChecking } = useAuthGuard({ requireAuth: true });

  const handleLogout = () => {
    clearTokens();
    router.push(CONFIG.ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-primary text-primary-foreground shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-lg shadow-inner">
              🏓
            </span>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight">
                TT Manager
              </h1>
              <p className="text-xs opacity-80">Table tennis tournaments</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 md:px-8">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-background text-primary"
                    : "text-primary-foreground/80 hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
        {isChecking && (
          <p className="text-sm text-muted-foreground">Verifying session...</p>
        )}
        <div className={isChecking ? "hidden" : ""}>{children}</div>
      </main>
    </div>
  );
}