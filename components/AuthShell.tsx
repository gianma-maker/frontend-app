import { Arena, Ball, Paddle } from "@/components/TT";
import ThemePicker from "@/components/ThemePicker";

const DRIFTERS: { left: string; delay: string; size: number }[] = [
  { left: "12%", delay: "0s", size: 14 },
  { left: "38%", delay: "3s", size: 10 },
  { left: "64%", delay: "6s", size: 18 },
  { left: "86%", delay: "9s", size: 12 },
];

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* KALIWA = silid ng laro */}
      <section className="relative hidden overflow-hidden bg-[var(--table)] p-10 text-white md:flex md:flex-col md:justify-between">
        <div className="net-bg pointer-events-none absolute inset-0 opacity-40" />

        {DRIFTERS.map((d, i) => (
          <span
            key={i}
            className="drift pointer-events-none absolute -bottom-6 rounded-full border-2 border-[var(--ink)] bg-[var(--ball)]/70"
            style={{
              left: d.left,
              animationDelay: d.delay,
              width: d.size,
              height: d.size,
            }}
          />
        ))}

        <div className="pointer-events-none absolute inset-6 rounded-2xl border-2 border-white/40" />

        <div className="relative flex items-center gap-3">
          <span className="relative h-11 w-11 shrink-0">
            <Paddle className="anim-sway h-full w-full -rotate-12" />
            <Ball className="anim-bounce absolute -right-2 -top-1 h-5 w-5" />
          </span>
          <p className="font-display text-xl">PING&amp;PONG</p>
        </div>

        <div className="relative my-6">
          <Arena className="mx-auto max-w-xl" />
        </div>

        <div className="relative">
          <p className="font-mono text-xs uppercase tracking-widest text-white/70">
            Tournament HQ
          </p>
          <h2 className="font-display anim-rise mt-2 text-6xl leading-[0.95]">
            Serve. Rally.
            <br />
            <span className="shine">Win.</span>
          </h2>
          <p className="font-mono mt-4 text-xs text-white/70">
            11 – 7 · 9 – 11 · 11 – 9
          </p>
        </div>
      </section>

      {/* KANAN = form */}
      <section className="relative flex items-center justify-center p-6">
        <div className="absolute right-6 top-6">
          <ThemePicker variant="light" />
        </div>

        <div className="pop anim-pop w-full max-w-md bg-[var(--card)] p-8">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--table)]">
            ● {subtitle}
          </p>
          <h1 className="font-display mt-1 text-4xl">{title}</h1>
          <div className="mt-6">{children}</div>
          <div className="font-mono mt-6 text-center text-sm">{footer}</div>
        </div>
      </section>
    </div>
  );
}

export const fieldClass =
  "w-full rounded-xl border-2 border-[var(--ink)] bg-white px-3 py-2.5 text-sm outline-none transition focus:shadow-[3px_3px_0_0_var(--ball)]";

export const buttonClass =
  "w-full rounded-xl border-2 border-[var(--ink)] bg-[var(--ball)] px-4 py-3 text-sm font-bold uppercase tracking-wide text-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] transition-all hover:-translate-y-0.5 disabled:opacity-60";

export const labelClass =
  "font-mono mb-1.5 block text-xs font-bold uppercase tracking-wider";