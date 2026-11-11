"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiClient } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
}

const mono = "font-[family-name:var(--font-geist-mono)]";

export default function LoginPage() {
  const router = useRouter();
  const { isChecking } = useAuthGuard({ requireAuth: false });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isChecking) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiClient<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      setTokens(data.accessToken, data.refreshToken);
      router.push(CONFIG.ROUTES.DASHBOARD);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-800 p-4 text-neutral-100"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    >
      {/* soft light from the top */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.10),transparent_60%)]" />

      <div className="relative w-full max-w-md">
        {/* corner brackets */}
        <span className="absolute -top-2 -left-2 h-5 w-5 border-t-2 border-l-2 border-neutral-200" />
        <span className="absolute -top-2 -right-2 h-5 w-5 border-t-2 border-r-2 border-neutral-200" />
        <span className="absolute -bottom-2 -left-2 h-5 w-5 border-b-2 border-l-2 border-neutral-200" />
        <span className="absolute -right-2 -bottom-2 h-5 w-5 border-r-2 border-b-2 border-neutral-200" />

        <div className="border border-neutral-500 bg-neutral-700/60 shadow-2xl backdrop-blur">
          {/* status bar */}
          <div
            className={`${mono} flex items-center justify-between border-b border-neutral-500/60 bg-neutral-700/80 px-5 py-2 text-[11px] tracking-widest text-neutral-300 uppercase`}
          >
            <span>SYS://AUTH</span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-100" />
              ONLINE
            </span>
          </div>

          <div className="space-y-6 p-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Access Terminal
              </h1>
              <p className={`${mono} text-xs text-neutral-300`}>
                &gt; Enter your credentials to access your account.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div
                  className={`${mono} border border-neutral-400 bg-neutral-800 p-3 text-xs text-neutral-100`}
                >
                  [ERROR] {error}
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className={`${mono} text-[11px] tracking-widest text-neutral-300 uppercase`}
                >
                  01 / Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className={`${mono} rounded-none border-neutral-500 bg-neutral-800 text-white focus-visible:border-white focus-visible:ring-0`}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className={`${mono} text-[11px] tracking-widest text-neutral-300 uppercase`}
                >
                  02 / Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`${mono} rounded-none border-neutral-500 bg-neutral-800 text-white focus-visible:border-white focus-visible:ring-0`}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={`${mono} w-full rounded-none bg-neutral-100 text-sm font-semibold tracking-widest text-neutral-900 uppercase hover:bg-white`}
              >
                {loading ? "Authenticating..." : "Initialize Login"}
              </Button>
            </form>

            <p className={`${mono} text-center text-xs text-neutral-300`}>
              No account?{" "}
              <Link
                href={CONFIG.ROUTES.REGISTER}
                className="text-white underline underline-offset-4"
              >
                Register unit
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}