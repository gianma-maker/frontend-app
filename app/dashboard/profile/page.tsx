"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Swords, Trophy } from "lucide-react";
import { apiClient } from "@/lib/api";
import { getUserId } from "@/lib/auth";
import { AVATARS, useProfile } from "@/lib/profile";
import Avatar from "@/components/Avatar";

interface PlayerRow {
  player_id: number;
  user_id: number | null;
  first_name: string;
  last_name: string;
  ranking_points: number | null;
}
interface MatchRow {
  match_id: number;
  player_one_id: number;
  player_two_id: number;
  winner_id: number | null;
  match_date: string;
  round_name: string;
}

export default function ProfilePage() {
  const { profile, update } = useProfile();
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiClient<PlayerRow[]>("/players", { method: "GET", requiresAuth: true }),
      apiClient<MatchRow[]>("/matches", { method: "GET", requiresAuth: true }),
    ])
      .then(([p, m]) => {
        if (cancelled) return;
        setPlayers(Array.isArray(p) ? p : []);
        setMatches(Array.isArray(m) ? m : []);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load stats.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const me = useMemo(() => {
    const uid = getUserId();
    return (
      players.find((p) => p.player_id === profile.playerId) ??
      players.find((p) => uid !== null && p.user_id === uid) ??
      null
    );
  }, [players, profile.playerId]);

  const stats = useMemo(() => {
    if (!me) return { wins: 0, losses: 0, played: 0, recent: [] as MatchRow[] };
    const mine = matches
      .filter(
        (m) => m.player_one_id === me.player_id || m.player_two_id === me.player_id
      )
      .sort((a, b) => b.match_id - a.match_id);
    const decided = mine.filter((m) => m.winner_id !== null);
    const wins = decided.filter((m) => m.winner_id === me.player_id).length;
    return {
      wins,
      losses: decided.length - wins,
      played: decided.length,
      recent: decided.slice(0, 5),
    };
  }, [matches, me]);

  const rate = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;
  const displayName =
    profile.name || (me ? `${me.first_name} ${me.last_name}` : "New Player");

  const flash = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  const box =
    "font-mono grid h-20 w-24 place-items-center rounded-xl border-2 border-[var(--ink)] bg-[var(--ink)] text-5xl font-bold shadow-[4px_4px_0_0_var(--ball)]";

  return (
    <div className="space-y-6">
      {error && (
        <div className="anim-shake rounded-xl border-2 border-[var(--ink)] bg-red-100 p-3 text-sm font-medium text-red-800 shadow-[3px_3px_0_0_var(--ink)]">
          {error}
        </div>
      )}

      <div className="pop anim-rise bg-[var(--card)] p-6">
        <div className="flex flex-wrap items-center gap-6">
          <Avatar id={profile.avatar} size={104} className="anim-bounce" />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--table)]">
              ● Player profile
            </p>
            <h2 className="font-display truncate text-4xl">{displayName}</h2>
            <p className="font-mono mt-1 text-xs text-[var(--muted-foreground)]">
              {me
                ? `Player #${me.player_id} · ${me.ranking_points ?? 0} ranking pts`
                : "No linked player"}
            </p>
          </div>

          {/* WIN / LOSS scoreboard */}
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div key={`w${stats.wins}`} className={`${box} anim-pop text-[var(--lime)]`}>
                {String(stats.wins).padStart(2, "0")}
              </div>
              <p className="font-mono mt-2 text-[11px] font-bold uppercase tracking-widest">
                Wins
              </p>
            </div>
            <span className="font-display pb-6 text-3xl">:</span>
            <div className="text-center">
              <div key={`l${stats.losses}`} className={`${box} anim-pop text-red-300`}>
                {String(stats.losses).padStart(2, "0")}
              </div>
              <p className="font-mono mt-2 text-[11px] font-bold uppercase tracking-widest">
                Losses
              </p>
            </div>
          </div>
        </div>

        {/* win rate */}
        <div className="mt-6">
          <div className="font-mono mb-1 flex justify-between text-xs font-bold uppercase tracking-wider">
            <span>Win rate</span>
            <span>
              {loading ? "..." : `${rate}%`} · {stats.played} played
            </span>
          </div>
          <div className="h-4 overflow-hidden rounded-full border-2 border-[var(--ink)] bg-white">
            <div
              className="h-full bg-[var(--ball)] transition-all duration-700"
              style={{ width: `${rate}%` }}
            />
          </div>
        </div>
      </div>

      {/* AVATAR PICKER */}
      <div className="pop anim-rise bg-[var(--card)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-2xl">Select Avatar</h3>
          {saved && (
            <span className="anim-pop font-mono flex items-center gap-1 rounded-full border-2 border-[var(--ink)] bg-[var(--lime)] px-2.5 py-0.5 text-xs font-bold">
              <Check className="h-3 w-3" /> Saved
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
          {AVATARS.map((a) => {
            const active = profile.avatar === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  update({ avatar: a.id });
                  flash();
                }}
                aria-pressed={active}
                aria-label={a.id}
                className={`relative grid place-items-center rounded-2xl border-2 p-2 transition-transform hover:-translate-y-1 ${
                  active
                    ? "border-[var(--ink)] bg-[var(--lime)] shadow-[3px_3px_0_0_var(--ink)]"
                    : "border-transparent hover:border-[var(--ink)]"
                }`}
              >
                <Avatar id={a.id} size={56} />
                {active && (
                  <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full border-2 border-[var(--ink)] bg-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SETTINGS */}
      <div className="pop anim-rise grid gap-4 bg-[var(--card)] p-6 md:grid-cols-2">
        <div>
          <label className="font-mono mb-1.5 block text-xs font-bold uppercase tracking-wider">
            Display name
          </label>
          <input
            value={profile.name}
            onChange={(e) => update({ name: e.target.value })}
            onBlur={flash}
            placeholder={me ? `${me.first_name} ${me.last_name}` : "Ilagay ang pangalan"}
            maxLength={24}
            className="w-full rounded-xl border-2 border-[var(--ink)] bg-white px-3 py-2.5 text-sm outline-none focus:shadow-[3px_3px_0_0_var(--ball)]"
          />
        </div>
        <div>
          <label className="font-mono mb-1.5 block text-xs font-bold uppercase tracking-wider">
            My Name is (Player)
          </label>
          <select
            value={me?.player_id ?? ""}
            onChange={(e) => {
              update({ playerId: e.target.value ? Number(e.target.value) : null });
              flash();
            }}
            className="h-[42px] w-full rounded-xl border-2 border-[var(--ink)] bg-white px-3 text-sm outline-none focus:shadow-[3px_3px_0_0_var(--ball)]"
          >
            <option value="">— SELECT —</option>
            {players.map((p) => (
              <option key={p.player_id} value={p.player_id}>
                #{p.player_id} {p.first_name} {p.last_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* RECENT MATCHES */}
      <div className="pop anim-rise bg-[var(--card)] p-6">
        <h3 className="font-display mb-4 flex items-center gap-2 text-2xl">
          <Swords className="h-5 w-5" /> Last Match
        </h3>
        {!me ? (
          <p className="font-mono text-sm text-[var(--muted-foreground)]">
            Select who you are above to view your record.
          </p>
        ) : stats.recent.length === 0 ? (
          <p className="font-mono text-sm text-[var(--muted-foreground)]">
            No finished matches yet. Serve the first one! 🏓
          </p>
        ) : (
          <ul className="stagger space-y-2">
            {stats.recent.map((m) => {
              const won = m.winner_id === me.player_id;
              return (
                <li
                  key={m.match_id}
                  className="flex items-center gap-3 rounded-xl border-2 border-[var(--ink)] bg-white px-3 py-2"
                >
                  <span
                    className={`font-mono grid h-8 w-8 place-items-center rounded-lg border-2 border-[var(--ink)] text-sm font-bold ${
                      won ? "bg-[var(--lime)]" : "bg-red-200"
                    }`}
                  >
                    {won ? "W" : "L"}
                  </span>
                  <span className="font-mono text-sm font-bold">#{m.match_id}</span>
                  <span className="text-sm">{m.round_name}</span>
                  <span className="font-mono ml-auto text-xs text-[var(--muted-foreground)]">
                    {m.match_date}
                  </span>
                  {won && <Trophy className="h-4 w-4" />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}