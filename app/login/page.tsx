"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";
import AuthShell, {
  buttonClass,
  fieldClass,
  labelClass,
} from "@/components/AuthShell";

interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiClient<LoginResponse>(CONFIG.ENDPOINTS.LOGIN, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      setTokens(
        data.accessToken ?? data.access_token,
        data.refreshToken ?? data.refresh_token
      );
      router.push(CONFIG.ROUTES.DASHBOARD);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Player login"
      footer={
        <>
          New player?{" "}
          <Link href={CONFIG.ROUTES.REGISTER} className="font-bold underline decoration-[var(--ball)] decoration-2 underline-offset-4">
            Create account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border-2 border-[var(--ink)] bg-red-100 p-3 text-sm font-medium text-red-800">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="username" className={labelClass}>Username</label>
          <input
            id="username"
            className={fieldClass}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>Password</label>
          <input
            id="password"
            type="password"
            className={fieldClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? "Serving..." : "Serve! Log in 🏓"}
        </button>
      </form>
    </AuthShell>
  );
}