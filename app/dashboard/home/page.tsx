"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Crown, Radio } from "lucide-react";
import { apiClient } from "@/lib/api";

interface Player { player_id: number; first_name: string; last_name: string }
interface Match {
  match_id: number;
  player_one_id: number;
  player_two_id: number;
  match_date: string;
  match_time: string;
  round_name: string;
  winner_id: number | null;
}
interface Tournament { tournament_id: number }

function CountUp({ to }: { to: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      setV(Math.round(to * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{v}</>;
}

const get = <T,>(url: string) =>
  apiClient<T>(url, { method: "GET", requiresAuth: true });

export default function HomePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      get<Player[]>("/players"),
      get<Match[]>("/matches"),
      get<Tournament[]>("/tournaments"),
    ])
      .then(([p, m, t]) => {
        if (cancelled) return;
        setPlayers(p);
        setMatches(m);
        setTournaments(t);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const name = (id: number) => {
    const p = players.find((x) => x.player_id === id);
    return p ? `${p.first_name} ${p.last_name}` : `Player #${id}`;
  };

  const next = useMemo(
    () =>
      matches
        .filter((m) => m.winner_id == null)
        .sort((x, y) =>
          `${x.match_date}${x.match_time}`.localeCompare(`${y.match_date}${y.match_time}`)
        )[0],
    [matches]
  );

  const leader = useMemo(() => {
    const wins = new Map<number, number>();
    matches.forEach((m) => {
      if (m.winner_id != null) wins.set(m.winner_id, (wins.get(m.winner_id) ?? 0) + 1);
    });
    const top = [...wins.entries()].sort((x, y) => y[1] - x[1])[0];
    return top ? { id: top[0], wins: top[1] } : null;
  }, [matches]);

  const recent = matches
    .filter((m) => m.winner_id != null)
    .sort((x, y) => y.match_id - x.match_id)
    .slice(0, 4);

  const stats = [
    { label: "Players", value: players.length },
    { label: "Tournaments", value: tournaments.length },
    { label: "Matches", value: matches.length },
    { label: "Completed", value: matches.filter((m) => m.winner_id != null).length },
  ];

  return (
    <div className="space-y-6">
      <div className="stagger grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className="pop bg-[var(--card)] p-5">
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
              {s.label}
            </p>
            <p
              className="font-display text-6xl"
              style={{ color: i % 2 ? "var(--ball)" : "var(--table)" }}
            >
              {loading ? "–" : <CountUp to={s.value} />}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="pop anim-rise bg-[var(--card)] p-6">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--table)]">
            ● Next Game
          </p>
          {next ? (
            <>
              <p className="font-display mt-2 text-3xl">
                {name(next.player_one_id)}{" "}
                <span className="text-[var(--ball)]">vs</span>{" "}
                {name(next.player_two_id)}
              </p>
              <p className="font-mono mt-1 text-xs text-[var(--muted-foreground)]">
                {next.round_name} · {String(next.match_date).slice(0, 10)} ·{" "}
                {String(next.match_time).slice(0, 5)}
              </p>
              <Link
                href="/dashboard/live"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-[var(--ink)] bg-[var(--ball)] px-4 py-2 text-sm font-bold shadow-[3px_3px_0_0_var(--ink)] transition-all hover:-translate-y-0.5"
              >
                <Radio className="h-4 w-4" /> Start scoring
              </Link>
            </>
          ) : (
            <p className="font-mono mt-2 text-sm text-[var(--muted-foreground)]">
              No upcoming match.
            </p>
          )}
        </div>

        <div className="pop anim-rise bg-[var(--card)] p-6">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--table)]">
            ● Leader
          </p>
          {leader ? (
            <div className="mt-2 flex items-center gap-4">
              <Crown className="anim-bounce h-10 w-10 text-[var(--ball)]" />
              <div>
                <p className="font-display text-3xl">{name(leader.id)}</p>
                <p className="font-mono text-xs text-[var(--muted-foreground)]">
                  {leader.wins} wins
                </p>
              </div>
            </div>
          ) : (
            <p className="font-mono mt-2 text-sm text-[var(--muted-foreground)]">
              No winner yet.
            </p>
          )}
        </div>
      </div>

      <div className="pop anim-rise bg-[var(--card)] p-6">
        <h3 className="font-display mb-3 text-2xl">Latest results</h3>
        {recent.length === 0 ? (
          <p className="font-mono text-sm text-[var(--muted-foreground)]">None yet.</p>
        ) : (
          <ul className="stagger space-y-2">
            {recent.map((m) => (
              <li
                key={m.match_id}
                className="flex items-center gap-3 rounded-xl border-2 border-[var(--ink)] bg-white px-3 py-2 text-sm"
              >
                <span className="font-mono font-bold">#{m.match_id}</span>
                <span className="min-w-0 flex-1 truncate">
                  {name(m.player_one_id)} vs {name(m.player_two_id)}
                </span>
                <span className="font-mono rounded-full border-2 border-[var(--ink)] bg-[var(--lime)] px-2 py-0.5 text-xs font-bold">
                  🏆 {name(m.winner_id as number)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}