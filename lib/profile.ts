"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { getUserId } from "@/lib/auth";

export interface Profile {
  avatar: string;
  name: string;
  playerId: number | null;
}

export const AVATARS = [
  { id: "paddle", emoji: "🏓", bg: "#ff6a1f" },
  { id: "fox", emoji: "🦊", bg: "#ffb703" },
  { id: "panda", emoji: "🐼", bg: "#8fe3ff" },
  { id: "tiger", emoji: "🐯", bg: "#ffd23f" },
  { id: "lion", emoji: "🦁", bg: "#ff9fb2" },
  { id: "frog", emoji: "🐸", bg: "#c4f24a" },
  { id: "octopus", emoji: "🐙", bg: "#ff5ea8" },
  { id: "unicorn", emoji: "🦄", bg: "#c9b6ff" },
  { id: "robot", emoji: "🤖", bg: "#d9dee3" },
  { id: "crown", emoji: "👑", bg: "#ffd6a5" },
  { id: "rocket", emoji: "🚀", bg: "#9ad1ff" },
  { id: "fire", emoji: "🔥", bg: "#ff8a65" },
] as const;

const EVENT = "tt-profile-change";
const keyFor = () => `tt-profile:${getUserId() ?? "guest"}`;

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

const getSnapshot = () => {
  try {
    return localStorage.getItem(keyFor()) ?? "";
  } catch {
    return "";
  }
};
const getServerSnapshot = () => "";

const DEFAULT: Profile = { avatar: "paddle", name: "", playerId: null };

export function useProfile() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const profile = useMemo<Profile>(() => {
    try {
      return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
    } catch {
      return DEFAULT;
    }
  }, [raw]);

  const update = useCallback(
    (patch: Partial<Profile>) => {
      const next = { ...profile, ...patch };
      try {
        localStorage.setItem(keyFor(), JSON.stringify(next));
      } catch {}
      window.dispatchEvent(new Event(EVENT));
    },
    [profile]
  );

  return { profile, update };
}