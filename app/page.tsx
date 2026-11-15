"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { CONFIG } from "@/lib/config";
import AuthShell, {
  buttonClass,
  fieldClass,
  labelClass,
} from "@/components/AuthShell";

export default function RegisterPage() {
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
      await apiClient(CONFIG.ENDPOINTS.REGISTER, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      router.push(CONFIG.ROUTES.LOGIN);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Join the club"
      subtitle="New player"
      footer={
        <>
          Already registered?{" "}
          <Link href={CONFIG.ROUTES.LOGIN} className="font-bold underline decoration-[var(--ball)] decoration-2 underline-offset-4">
            Log in
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
            autoComplete="new-password"
          />
        </div>
        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? "Registering..." : "Sign me up 🏓"}
        </button>
      </form>
    </AuthShell>
  );
}