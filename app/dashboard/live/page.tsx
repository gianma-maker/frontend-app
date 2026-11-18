"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Undo2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import Confetti from "@/components/Confetti";

interface Player { player_id: number; first_name: string; last_name: string }
interface Match {
  match_id: number;
  player_one_id: number;
  player_two_id: number;
  round_name: string;
  match_status: string | null;
  winner_id: number | null;
}
interface Score { match_id: number; set_number: number; player_one_score: number; player_two_score: number }

const get = <T,>(url: string) => apiClient<T>(url, { method: "GET", requiresAuth: true });
const fetchAll = () =>
  Promise.all([get<Player[]>("/players"), get<Match[]>("/matches"), get<Score[]>("/match-scores")]);

const gameOver = (a: number, b: number) => (a >= 11 || b >= 11) && Math.abs(a - b) >= 2;

export default function LivePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [matchId, setMatchId] = useState("");
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [history, setHistory] = useState<("a" | "b")[]>([]);
  const [first, setFirst] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [celebrate, setCelebrate] = useState(0);

  const apply = useCallback(([p, m, s]: [Player[], Match[], Score[]]) => {
    setPlayers(p);
    setMatches(m);
    setScores(s);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchAll()
      .then((d) => !cancelled && apply(d))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Failed to load."));
    return () => {
      cancelled = true;
    };
  }, [apply]);

  const name = (id: number) => {
    const p = players.find((x) => x.player_id === id);
    return p ? `${p.first_name} ${p.last_name}` : `Player #${id}`;
  };

  const playable = useMemo(
    () => matches.filter((m) => m.winner_id == null && m.match_status !== "Cancelled"),
    [matches]
  );
  const match = matches.find((m) => String(m.match_id) === matchId);
  const sets = useMemo(
    () =>
      scores
        .filter((s) => String(s.match_id) === matchId)
        .sort((x, y) => x.set_number - y.set_number),
    [scores, matchId]
  );
  const g1 = sets.filter((s) => s.player_one_score > s.player_two_score).length;
  const g2 = sets.filter((s) => s.player_two_score > s.player_one_score).length;
  const finished = !!match && match.winner_id != null;

  const total = a + b;
  const n = a >= 10 && b >= 10 ? total - 10 : Math.floor(total / 2);
  const server = (first + n) % 2;

  const saveGame = async (fa: number, fb: number) => {
    if (!match) return;
    setBusy(true);
    setError("");
    try {
      const nextSet = (sets.length ? Math.max(...sets.map((s) => s.set_number)) : 0) + 1;
      await apiClient("/match-scores", {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({
          match_id: match.match_id,
          set_number: nextSet,
          player_one_score: fa,
          player_two_score: fb,
        }),
      });
      const data = await fetchAll();
      apply(data);
      setA(0);
      setB(0);
      setHistory([]);
      setFirst((f) => 1 - f);
      const updated = data[1].find((m) => m.match_id === match.match_id);
      if (updated?.winner_id != null) setCelebrate((c) => c + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save game.");
    } finally {
      setBusy(false);
    }
  };

  const point = (side: "a" | "b") => {
    if (!match || busy || finished) return;
    const na = side === "a" ? a + 1 : a;
    const nb = side === "b" ? b + 1 : b;
    setA(na);
    setB(nb);
    setHistory((h) => [...h, side]);
    if (gameOver(na, nb)) void saveGame(na, nb);
  };

  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    if (last === "a") setA((x) => x - 1);
    else setB((x) => x - 1);
    setHistory((h) => h.slice(0, -1));
  };

  const panel = (side: "a" | "b") => {
    const id = side === "a" ? match?.player_one_id : match?.player_two_id;
    const pts = side === "a" ? a : b;
    const games = side === "a" ? g1 : g2;
    const idx = side === "a" ? 0 : 1;
    const isWinner = finished && match?.winner_id === id;
    return (
      <div
        className={`pop flex flex-col items-center gap-3 p-6 text-center ${
          isWinner ? "bg-[var(--lime)]" : "bg-[var(--card)]"
        }`}
      >
        <p className="font-display truncate text-2xl">{id ? name(id) : "—"}</p>
        <div className="font-mono flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
          {server === idx && !finished && match && (
            <span className="anim-bounce rounded-full border-2 border-[var(--ink)] bg-[var(--ball)] px-2 py-0.5">
              🏓 Serve
            </span>
          )}
          <span>Games: {games}</span>
        </div>
        <div
          key={`${side}${pts}`}
          className="font-mono anim-pop grid h-36 w-44 place-items-center rounded-2xl border-2 border-[var(--ink)] bg-[var(--ink)] text-8xl font-bold text-[var(--lime)] shadow-[5px_5px_0_0_var(--ball)]"
        >
          {String(pts).padStart(2, "0")}
        </div>
        <button
          type="button"
          onClick={() => point(side)}
          disabled={!match || busy || finished}
          className="w-full rounded-xl border-2 border-[var(--ink)] bg-[var(--ball)] py-4 text-2xl font-extrabold text-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] transition-all hover:-translate-y-0.5 disabled:opacity-50"
        >
          +1
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {celebrate > 0 && <Confetti key={celebrate} count={70} />}

      {error && (
        <div className="anim-shake rounded-xl border-2 border-[var(--ink)] bg-red-100 p-3 text-sm font-medium text-red-800 shadow-[3px_3px_0_0_var(--ink)]">
          {error}
        </div>
      )}

      <div className="pop anim-rise grid gap-4 bg-[var(--card)] p-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <label className="font-mono mb-1.5 block text-xs font-bold uppercase tracking-wider">
            Select match
          </label>
          <select
            value={matchId}
            onChange={(e) => {
              setMatchId(e.target.value);
              setA(0);
              setB(0);
              setHistory([]);
              setFirst(0);
            }}
            className="h-[42px] w-full rounded-xl border-2 border-[var(--ink)] bg-white px-3 text-sm outline-none focus:shadow-[3px_3px_0_0_var(--ball)]"
          >
            <option value="">— Select —</option>
            {playable.map((m) => (
              <option key={m.match_id} value={m.match_id}>
                #{m.match_id} · {name(m.player_one_id)} vs {name(m.player_two_id)} · {m.round_name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={undo}
          disabled={history.length === 0 || busy}
          className="flex h-[42px] items-center gap-2 rounded-xl border-2 border-[var(--ink)] bg-white px-4 text-sm font-bold shadow-[3px_3px_0_0_var(--ink)] disabled:opacity-40"
        >
          <Undo2 className="h-4 w-4" /> Undo
        </button>
      </div>

      {!match ? (
        <p className="font-mono text-sm text-[var(--muted-foreground)]">
          Select a match to start scoring. Is the list empty? Create a match first.
        </p>
      ) : (
        <>
          <div className="stagger grid gap-4 md:grid-cols-2">
            {panel("a")}
            {panel("b")}
          </div>

          <div className="pop bg-[var(--card)] p-4">
            <p className="font-mono mb-2 text-xs font-bold uppercase tracking-widest">
              Completed games · up to 11, win by 2
            </p>
            {sets.length === 0 ? (
              <p className="font-mono text-sm text-[var(--muted-foreground)]">None yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sets.map((s) => (
                  <span
                    key={s.set_number}
                    className="font-mono rounded-lg border-2 border-[var(--ink)] bg-white px-3 py-1 text-sm font-bold"
                  >
                    G{s.set_number}: {s.player_one_score}–{s.player_two_score}
                  </span>
                ))}
              </div>
            )}
            {finished && (
              <p className="font-display anim-pop mt-3 text-2xl">
                🏆 {name(match.winner_id as number)} won!
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}