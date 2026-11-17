"use client";

import { useSyncExternalStore } from "react";

export const THEMES = [
  { id: "classic", label: "Classic", colors: ["#0b6b4a", "#ff6a1f", "#d7f23a"] },
  { id: "ocean", label: "Ocean", colors: ["#0f5c8a", "#ff7a59", "#8fe3ff"] },
  { id: "sunset", label: "Sunset", colors: ["#c2410c", "#ffd23f", "#ff9fb2"] },
  { id: "grape", label: "Grape", colors: ["#5b21b6", "#ff5ea8", "#c4f24a"] },
  { id: "cherry", label: "Cherry", colors: ["#9f1239", "#ffb703", "#ffd6a5"] },
] as const;

const KEY = "tt-theme";
const EVENT = "tt-theme-change";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
const getSnapshot = () => document.documentElement.dataset.theme || "classic";
const getServerSnapshot = () => "classic";

function applyTheme(id: string) {
  document.documentElement.dataset.theme = id;
  try {
    localStorage.setItem(KEY, id);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export default function ThemePicker({
  variant = "dark",
}: {
  variant?: "dark" | "light";
}) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div>
      <p
        className={`font-mono mb-2 text-[10px] font-bold uppercase tracking-widest ${
          variant === "dark" ? "text-white/70" : "text-[var(--ink)]/70"
        }`}
      >
        Theme · {THEMES.find((t) => t.id === theme)?.label}
      </p>
      <div className="flex gap-2">
        {THEMES.map((t) => {
          const active = theme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => applyTheme(t.id)}
              aria-label={`${t.label} theme`}
              aria-pressed={active}
              title={t.label}
              className={`relative h-8 w-8 overflow-hidden rounded-full border-2 border-[var(--ink)] transition-transform hover:-translate-y-0.5 ${
                active
                  ? "scale-110 ring-2 ring-offset-2 ring-[var(--ball)] ring-offset-transparent"
                  : ""
              }`}
              style={{
                background: `conic-gradient(${t.colors[0]} 0 33%, ${t.colors[1]} 33% 66%, ${t.colors[2]} 66% 100%)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}