"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  LogOut,
  MapPin,
  Medal,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { clearTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";
import { Arena, Ball, Paddle } from "@/components/TT";
import ThemePicker from "@/components/ThemePicker";

const NAV = [
  { href: "/dashboard", label: "Tournaments", icon: Trophy },
  { href: "/dashboard/venues", label: "Venues", icon: MapPin },
  { href: "/dashboard/players", label: "Players", icon: Users },
  { href: "/dashboard/registrations", label: "Registrations", icon: ClipboardList },
  { href: "/dashboard/matches", label: "Matches", icon: Swords },
  { href: "/dashboard/match-scores", label: "Scores", icon: Medal },
];

const SIDE_DRIFTERS = [
  { left: "18%", delay: "0s", size: 10 },
  { left: "52%", delay: "4s", size: 14 },
  { left: "80%", delay: "8s", size: 8 },
];

const SPARKLES = [
  { top: "6%", left: "4%", delay: "0s", size: 16 },
  { top: "2%", left: "46%", delay: "0.8s", size: 12 },
  { top: "14%", left: "92%", delay: "1.6s", size: 18 },
  { top: "58%", left: "-2%", delay: "2.2s", size: 12 },
  { top: "70%", left: "96%", delay: "1.1s", size: 14 },
];

function WaveTitle({ text }: { text: string }) {
  return (
    <h1 className="font-display text-4xl md:text-6xl" aria-label={text}>
      {text.split("").map((ch, i) => (
        <span
          key={i}
          className="wave-letter"
          style={{ animationDelay: `${i * 45}ms` }}
          aria-hidden
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </h1>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isChecking } = useAuthGuard({ requireAuth: true });

  const current = NAV.find((n) => n.href === pathname) ?? NAV[0];

  const handleLogout = () => {
    clearTokens();
    router.push(CONFIG.ROUTES.LOGIN);
  };

  const ticker = Array.from({ length: 8 }, () => "SERVE ● RALLY ● WIN ● ").join("");

  return (
    <div className="min-h-screen md:flex">
      {/* SIDEBAR */}
      <aside className="relative overflow-hidden bg-[var(--table)] text-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0">
        {SIDE_DRIFTERS.map((d, i) => (
          <span
            key={i}
            className="drift pointer-events-none absolute -bottom-6 rounded-full border-2 border-[var(--ink)] bg-[var(--ball)]/60"
            style={{
              left: d.left,
              animationDelay: d.delay,
              width: d.size,
              height: d.size,
            }}
          />
        ))}
        <div className="pointer-events-none absolute inset-2 rounded-xl border-2 border-white/40" />

        <div className="relative flex flex-col gap-4 p-5 md:h-full md:gap-8 md:p-6">
          <div className="flex items-center gap-3">
            <span className="relative h-11 w-11 shrink-0">
              <Paddle className="anim-sway h-full w-full -rotate-12" />
              <Ball className="anim-bounce absolute -right-2 -top-1 h-5 w-5" />
            </span>
            <div className="leading-none">
              <p className="font-display text-xl">PING&amp;PONG</p>
              <p className="font-mono mt-1 text-[10px] uppercase tracking-widest text-white/70">
                Tournament HQ
              </p>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
            {NAV.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`wiggle-hover flex items-center gap-3 whitespace-nowrap rounded-xl border-2 px-3 py-2 text-sm font-bold transition-all ${
                    active
                      ? "border-[var(--ink)] bg-[var(--ball)] text-[var(--ink)] shadow-[3px_3px_0_0_var(--ink)]"
                      : "border-transparent text-white/85 hover:translate-x-1 hover:border-white/40 hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {active && (
                    <span className="anim-bounce ml-auto h-2.5 w-2.5 rounded-full border border-[var(--ink)] bg-white" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-5">
            <ThemePicker variant="dark" />
            <div className="relative hidden md:block">
              <div className="net-bg h-6 rounded-sm border-y-4 border-white/90" />
              <span className="absolute -left-1 -top-2 h-10 w-1.5 rounded bg-[var(--ink)]" />
              <span className="absolute -right-1 -top-2 h-10 w-1.5 rounded bg-[var(--ink)]" />
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--ink)] bg-[var(--lime)] px-3 py-2 text-sm font-bold text-[var(--ink)] shadow-[3px_3px_0_0_var(--ink)] transition-all"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="min-w-0 flex-1 space-y-6 p-4 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--table)]">
              ● Live dashboard
            </p>
            <WaveTitle key={current.label} text={current.label} />
          </div>

          {/* mesa, kapantay ng pamagat */}
          <div className="relative hidden w-[420px] lg:block">
            <div className="animate-pulse pointer-events-none absolute inset-x-8 top-6 bottom-0 rounded-full bg-[var(--ball)]/20 blur-2xl" />
            {SPARKLES.map((s, i) => (
              <svg
                key={i}
                viewBox="0 0 24 24"
                className="twinkle pointer-events-none absolute"
                style={{
                  top: s.top,
                  left: s.left,
                  width: s.size,
                  height: s.size,
                  animationDelay: s.delay,
                }}
                aria-hidden
              >
                <path
                  d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"
                  fill="#ff6a1f"
                  stroke="#0f2a1d"
                  strokeWidth="1.5"
                />
              </svg>
            ))}
            <Arena className="relative -mb-2 -mt-14" />
          </div>
        </div>

        {/* ticker */}
        <div className="overflow-hidden rounded-xl border-2 border-[var(--ink)] bg-[var(--ink)] py-1.5 shadow-[3px_3px_0_0_var(--ball)]">
          <div className="marquee-track font-mono text-xs font-bold uppercase tracking-[0.3em] text-[var(--lime)]">
            <span className="whitespace-pre pr-4">{ticker}</span>
            <span className="whitespace-pre pr-4" aria-hidden>
              {ticker}
            </span>
          </div>
        </div>

        {isChecking && (
          <p className="font-mono text-sm text-muted-foreground">
            Verifying session...
          </p>
        )}
        <div key={pathname} className={isChecking ? "hidden" : "anim-rise"}>
          {children}
        </div>
      </main>
    </div>
  );
}