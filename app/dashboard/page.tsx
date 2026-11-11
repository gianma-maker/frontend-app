"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { clearTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";

const mono = "font-[family-name:var(--font-geist-mono)]";

export default function DashboardPage() {
  const router = useRouter();
  const { isChecking } = useAuthGuard({ requireAuth: true });
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-GB"));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  let tokenLength = 0;
  let hasRefresh = false;

  if (typeof window !== "undefined") {
    try {
      tokenLength = localStorage.getItem("accessToken")?.length ?? 0;
      hasRefresh = !!localStorage.getItem("refreshToken");
    } catch {
      /* storage unavailable */
    }
  }

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-800 text-neutral-300">
        <p className={`${mono} flex items-center gap-2 text-xs tracking-widest uppercase`}>
          <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-100" />
          Verifying session...
        </p>
      </main>
    );
  }

  const handleLogout = () => {
    clearTokens();
    router.push(CONFIG.ROUTES.LOGIN);
  };

  const stats = [
    { label: "SESSION", value: "ACTIVE" },
    { label: "ACCESS TOKEN", value: `${tokenLength} CHARS` },
    { label: "REFRESH TOKEN", value: hasRefresh ? "STORED" : "NONE" },
    { label: "STORAGE", value: "LOCAL" },
  ];

  return (
    <main className="min-h-screen bg-neutral-800 p-6 text-neutral-100 md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex items-end justify-between border-b border-neutral-500 pb-4">
          <div className="space-y-1">
            <p className={`${mono} text-[11px] tracking-widest text-neutral-400 uppercase`}>
              UNIT-07 &middot; SYS://DASHBOARD
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className={`${mono} hidden text-2xl tabular-nums text-neutral-200 sm:block`}>
              {time}
            </span>
            <button
              onClick={handleLogout}
              className={`${mono} border border-neutral-400 px-4 py-2 text-xs tracking-widest text-neutral-200 uppercase transition hover:bg-neutral-100 hover:text-neutral-900`}
            >
              Logout
            </button>
          </div>
        </header>

        {/* welcome banner */}
        <section className="relative overflow-hidden border border-neutral-500 bg-neutral-700/60 p-6">
          <div className="absolute inset-y-0 left-0 w-1 bg-white" />
          <div className="absolute top-0 right-0 h-full w-1/3 bg-[repeating-linear-gradient(135deg,transparent,transparent_8px,rgba(255,255,255,0.05)_8px,rgba(255,255,255,0.05)_16px)]" />
          <h2 className="text-2xl font-semibold text-white">Welcome back!</h2>
          <p className={`${mono} mt-2 text-sm text-neutral-300`}>
            &gt; You are authenticated. Your active JWT session is stored in LocalStorage.
          </p>
        </section>

        {/* telemetry cards */}
        <section className="grid grid-cols-2 gap-px border border-neutral-500 bg-neutral-500 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-neutral-800 p-5">
              <p className={`${mono} text-[10px] tracking-widest text-neutral-400 uppercase`}>
                {s.label}
              </p>
              <p className={`${mono} mt-3 text-lg font-semibold text-white`}>
                {s.value}
              </p>
              <div className="mt-3 h-1 w-full bg-neutral-700">
                <div className="h-1 w-2/3 animate-pulse bg-neutral-200" />
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}