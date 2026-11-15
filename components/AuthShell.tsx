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
      {/* KALIWA = ang "mesa" */}
      <section className="relative hidden overflow-hidden bg-[var(--table)] p-10 text-white md:flex md:flex-col md:justify-between">
        <div className="pointer-events-none absolute inset-6 rounded-2xl border-2 border-white/40" />
        <div className="pointer-events-none absolute bottom-6 top-6 left-1/2 border-l-2 border-white/40" />
        <div className="pointer-events-none absolute left-6 right-6 top-1/2 border-t-2 border-dashed border-white/10" />

        {/* bola */}
        <div className="absolute right-16 top-24 h-24 w-24 rounded-full border-2 border-[var(--ink)] bg-[var(--ball)] shadow-[6px_6px_0_0_var(--ink)]" />
        <div className="absolute bottom-32 left-20 h-10 w-10 rounded-full border-2 border-[var(--ink)] bg-[var(--lime)] shadow-[4px_4px_0_0_var(--ink)]" />

        <div className="relative flex items-center gap-3">
          <span className="h-10 w-10 rounded-full border-2 border-[var(--ink)] bg-[var(--ball)] shadow-[3px_3px_0_0_var(--ink)]" />
          <p className="font-display text-xl">PING&amp;PONG</p>
        </div>

        <div className="relative">
          <p className="font-mono text-xs uppercase tracking-widest text-white/70">
            Tournament HQ
          </p>
          <h2 className="font-display mt-2 text-6xl leading-[0.95]">
            Serve.
            <br />
            Rally.
            <br />
            <span className="text-[var(--lime)]">Win.</span>
          </h2>
        </div>

        <p className="font-mono relative text-xs text-white/70">
          11 – 7 · 9 – 11 · 11 – 9
        </p>
      </section>

      {/* KANAN = form */}
      <section className="flex items-center justify-center p-6">
        <div className="pop w-full max-w-md bg-[var(--card)] p-8">
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
  "w-full rounded-xl border-2 border-[var(--ink)] bg-[var(--ball)] px-4 py-3 text-sm font-bold uppercase tracking-wide text-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_0_var(--ink)] disabled:opacity-60";

export const labelClass =
  "font-mono mb-1.5 block text-xs font-bold uppercase tracking-wider";