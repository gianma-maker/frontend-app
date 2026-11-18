"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown, Trophy } from "lucide-react";
import { apiClient } from "@/lib/api";

interface Player { player_id: number; first_name: string; last_name: string }
interface Match {
  match_id: number;
  tournament_id: number;
  player_one_id: number;
  player_two_id: number;
  match_date: string;
  round_name: string;
  match_status: string | null;
  winner_id: number | null;
}
interface Score { match_id: number; set_number: number; player_one_score: number; player_two_score: number }
interface Tournament { tournament_id: number; tournament_name: string }

const COLORS = ["#ff6a1f", "#ffb703", "#8fe3ff", "#ff9fb2", "#c4f24a", "#c9b6ff", "#ff5ea8", "#9ad1ff"];

function Initials({ p, size = 40 }: { p?: Player; size?: number }) {
  const text = p ? `${p.first_name[0] ?? ""}${p.last_name[0] ?? ""}`.toUpperCase() : "?";
  return (
    <span
      className="font-display inline-grid shrink-0 place-items-center rounded-full border-2 border-[var(--ink)] text-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)]"
      style={{ width: size, height: size, background: COLORS[(p?.player_id ?? 0) % COLORS.length], fontSize: size * 0.4 }}
    >
      {text}
    </span>
  );
}

export default function ResultsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const get = <T,>(url: string) => apiClient<T>(url, { method: "GET", requiresAuth: true });
    Promise.all([
      get<Player[]>("/players"),
      get<Match[]>("/matches"),
      get<Score[]>("/match-scores"),
      get<Tournament[]>("/tournaments"),
    ])
      .then(([p, m, s, t]) => {
        if (cancelled) return;
        setPlayers(p); setMatches(m); setScores(s); setTournaments(t);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Failed to load."))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const pById = useMemo(() => new Map(players.map((p) => [p.player_id, p])), [players]);
  const tById = useMemo(() => new Map(tournaments.map((t) => [t.tournament_id, t])), [tournaments]);
  const name = (id: number) => {
    const p = pById.get(id);
    return p ? `${p.first_name} ${p.last_name}` : `Player #${id}`;
  };

  const board = useMemo(() => {
    const rec = new Map<number, { w: number; l: number }>();
    players.forEach((p) => rec.set(p.player_id, { w: 0, l: 0 }));
    matches.forEach((m) => {
      if (m.winner_id == null) return;
      const loser = m.winner_id === m.player_one_id ? m.player_two_id : m.player_one_id;
      const w = rec.get(m.winner_id); if (w) w.w++;
      const l = rec.get(loser); if (l) l.l++;
    });
    return players
      .map((p) => {
        const r = rec.get(p.player_id)!;
        const played = r.w + r.l;
        return { p, ...r, played, rate: played ? Math.round((r.w / played) * 100) : 0 };
      })
      .sort((a, b) => b.w - a.w || b.rate - a.rate || a.l - b.l);
  }, [players, matches]);

  const completed = matches.filter((m) => m.winner_id != null).length;
  const stats = [
    { label: "Players", value: players.length },
    { label: "Tournaments", value: tournaments.length },
    { label: "Matches", value: matches.length },
    { label: "Completed", value: completed },
  ];

  const podium = board.slice(0, 3);
  const order = [1, 0, 2]; // 2nd, 1st, 3rd
  const heights = ["h-24", "h-32", "h-20"];

  return (
    <div className="space-y-6">
      {error && (
        <div className="anim-shake rounded-xl border-2 border-[var(--ink)] bg-red-100 p-3 text-sm font-medium text-red-800 shadow-[3px_3px_0_0_var(--ink)]">
          {error}
        </div>
      )}

      {/* STAT CARDS */}
      <div className="stagger grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className="pop bg-[var(--card)] p-4">
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
              {s.label}
            </p>
            <p
              className="font-display text-5xl"
              style={{ color: i % 2 ? "var(--ball)" : "var(--table)" }}
            >
              {loading ? "–" : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* LEADERBOARD */}
      <div className="pop anim-rise bg-[var(--card)] p-6">
        <h3 className="font-display mb-6 flex items-center gap-2 text-2xl">
          <Crown className="h-6 w-6" /> Leaderboard
        </h3>

        {board.length === 0 ? (
          <p className="font-mono text-sm text-[var(--muted-foreground)]">No players yet.</p>
        ) : (
          <>
            <div className="mb-8 flex items-end justify-center gap-4">
              {order.map((idx, col) => {
                const row = podium[idx];
                if (!row) return <div key={col} className="w-28" />;
                return (
                  <div key={row.p.player_id} className="flex w-28 flex-col items-center text-center">
                    {idx === 0 && <Crown className="anim-bounce mb-1 h-6 w-6 text-[var(--ball)]" />}
                    <Initials p={row.p} size={idx === 0 ? 64 : 52} />
                    <p className="mt-2 w-full truncate text-sm font-bold">{row.p.first_name}</p>
                    <div
                      className={`${heights[col]} font-display mt-2 grid w-full place-items-start rounded-t-xl border-2 border-[var(--ink)] pt-2 text-3xl`}
                      style={{ background: idx === 0 ? "var(--lime)" : "var(--muted)" }}
                    >
                      <span className="w-full text-center">{idx + 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="overflow-hidden rounded-xl border-2 border-[var(--ink)]">
              {board.map((r, i) => (
                <div
                  key={r.p.player_id}
                  className="flex items-center gap-3 border-b border-[var(--ink)]/20 bg-white px-3 py-2 last:border-b-0"
                >
                  <span className="font-mono w-6 text-sm font-bold">{i + 1}</span>
                  <Initials p={r.p} size={34} />
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">
                    {r.p.first_name} {r.p.last_name}
                  </span>
                  <span className="font-mono text-xs">{r.w}W · {r.l}L</span>
                  <div className="hidden h-3 w-28 overflow-hidden rounded-full border-2 border-[var(--ink)] sm:block">
                    <div className="h-full bg-[var(--ball)] transition-all duration-700" style={{ width: `${r.rate}%` }} />
                  </div>
                  <span className="font-mono w-10 text-right text-xs font-bold">{r.rate}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* MATCH RESULTS */}
      <div>
        <h3 className="font-display mb-4 text-2xl">Match results</h3>
        {matches.length === 0 ? (
          <p className="font-mono text-sm text-[var(--muted-foreground)]">No matches yet.</p>
        ) : (
          <div className="stagger grid gap-4 lg:grid-cols-2">
            {matches.map((m) => {
              const sets = scores
                .filter((s) => s.match_id === m.match_id)
                .sort((a, b) => a.set_number - b.set_number);
              const g1 = sets.filter((s) => s.player_one_score > s.player_two_score).length;
              const g2 = sets.filter((s) => s.player_two_score > s.player_one_score).length;
              const rows = [
                { id: m.player_one_id, games: g1, pts: sets.map((s) => s.player_one_score) },
                { id: m.player_two_id, games: g2, pts: sets.map((s) => s.player_two_score) },
              ];
              return (
                <div key={m.match_id} className="pop bg-[var(--card)] p-4">
                  <div className="font-mono mb-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider">
                    <span>{tById.get(m.tournament_id)?.tournament_name ?? `Tournament #${m.tournament_id}`}</span>
                    <span className="rounded-full border-2 border-[var(--ink)] px-2 py-0.5"
                      style={{ background: m.winner_id != null ? "var(--lime)" : "var(--muted)" }}>
                      {m.round_name} · {m.winner_id != null ? "Final" : m.match_status ?? "Scheduled"}
                    </span>
                  </div>

                  {rows.map((r) => {
                    const won = m.winner_id === r.id;
                    return (
                      <div
                        key={r.id}
                        className={`mb-2 flex items-center gap-3 rounded-xl border-2 px-3 py-2 ${
                          won ? "border-[var(--ink)] bg-[var(--lime)]" : "border-[var(--ink)]/30 bg-white"
                        }`}
                      >
                        <Initials p={pById.get(r.id)} size={36} />
                        <span className="min-w-0 flex-1 truncate text-sm font-bold">{name(r.id)}</span>
                        {won && <Trophy className="anim-bounce h-4 w-4" />}
                        <div className="flex gap-1">
                          {r.pts.map((pt, i) => (
                            <span key={i} className="font-mono grid h-7 w-8 place-items-center rounded-md bg-[var(--ink)] text-xs font-bold text-[var(--lime)]">
                              {pt}
                            </span>
                          ))}
                        </div>
                        <span className="font-display w-8 text-right text-3xl">{r.games}</span>
                      </div>
                    );
                  })}
                  <p className="font-mono mt-1 text-[11px] text-[var(--muted-foreground)]">
                    Match #{m.match_id} · {String(m.match_date).slice(0, 10)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}