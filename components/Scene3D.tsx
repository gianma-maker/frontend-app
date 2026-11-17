"use client";

import { useEffect, useRef } from "react";

const W = 420; // haba ng mesa
const D = 240; // lapad
const H = 46; // taas ng mesa

function Paddle3D({ late = false, side }: { late?: boolean; side: "l" | "r" }) {
  const x = side === "l" ? -34 : W + 34;
  return (
    <div
      className="s3d-bill"
      style={{ transform: `translate3d(${x}px, ${D / 2}px, ${H + 34}px) var(--unrot)` }}
    >
      <div className={`s3d-swing ${late ? "s3d-swing-late" : ""}`} style={{ scale: side === "r" ? "-1 1" : "1 1" }}>
        <div className="s3d-handle" />
        <div className="s3d-blade">
          <div className="s3d-rubber" />
        </div>
      </div>
    </div>
  );
}

export default function Scene3D({ compact = false }: { compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      el.style.setProperty("--rx", String(56 - ny * 10));
      el.style.setProperty("--rz", String(-34 + nx * 18));
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      className="s3d-stage"
      style={{ height: compact ? 250 : 470, ["--k" as string]: compact ? 0.5 : 0.95 }}
    >
      <div className="s3d-scene" style={{ width: W, height: D, margin: `${-D / 2}px 0 0 ${-W / 2}px` }}>
        {/* anino sa sahig */}
        <div className="s3d-floor" />

        {/* paa */}
        {[
          [24, 22],
          [W - 40, 22],
          [24, D - 40],
          [W - 40, D - 40],
        ].map(([lx, ly], i) => (
          <div key={i} className="s3d-leg" style={{ left: lx, top: ly }}>
            <i className="s3d-leg-f" />
            <i className="s3d-leg-r" />
          </div>
        ))}

        {/* katawan ng mesa */}
        <div className="s3d-side s3d-front" style={{ width: W, height: H, top: D }} />
        <div className="s3d-side s3d-right" style={{ width: H, height: D, left: W }} />

        {/* ibabaw */}
        <div className="s3d-top" style={{ width: W, height: D, transform: `translateZ(${H}px)` }}>
          <div className="s3d-border" />
          <div className="s3d-mid" />
          <div className="s3d-sheen" />
        </div>

        {/* net */}
        <div
          className="s3d-net"
          style={{ left: W / 2 - D / 2 - 6, top: D / 2 - 40, width: D + 12, height: 40 }}
        >
          <div className="s3d-net-tape" />
        </div>
        <div className="s3d-post" style={{ left: W / 2 - 3, top: -8 }} />
        <div className="s3d-post" style={{ left: W / 2 - 3, top: D + 2 }} />

        <Paddle3D side="l" />
        <Paddle3D side="r" late />

        {/* bola: x linear, taas/baba hiwalay para realistic ang talbog */}
        <div className="s3d-ball-x">
          <div className="s3d-ball-shadow" />
          <div className="s3d-ball-z">
            <div className="s3d-bill" style={{ transform: "var(--unrot)" }}>
              <div className="s3d-ball" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}