"use client";

import { useEffect, useState } from "react";

export function Ball({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="14" fill="#ff6a1f" stroke="#0f2a1d" strokeWidth="2.5" />
      <ellipse cx="11" cy="10" rx="5" ry="3" fill="#fff" opacity=".55" transform="rotate(-30 11 10)" />
    </svg>
  );
}

export function Paddle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 92" className={className} aria-hidden>
      <rect x="25" y="46" width="10" height="38" rx="4" fill="#e3b571" stroke="#0f2a1d" strokeWidth="3" />
      <rect x="25" y="46" width="10" height="8" fill="#0f2a1d" />
      <circle cx="30" cy="27" r="24" fill="#d62828" stroke="#0f2a1d" strokeWidth="3" />
      <circle cx="30" cy="27" r="17" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="2" />
    </svg>
  );
}

function ArenaPaddle() {
  return (
    <g>
      <rect x="-5" y="14" width="10" height="42" rx="4" fill="#e3b571" stroke="#0f2a1d" strokeWidth="3" />
      <rect x="-5" y="14" width="10" height="9" fill="#0f2a1d" />
      <circle cx="0" cy="0" r="22" fill="#d62828" stroke="#0f2a1d" strokeWidth="3" />
      <circle cx="0" cy="0" r="15" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="2" />
    </g>
  );
}

/* Bola: ang "ghost" ay ang trail na nahuhuli nang kaunti */
function BallSprite({
  delay = 0,
  opacity = 1,
  r = 10,
  ghost = false,
}: {
  delay?: number;
  opacity?: number;
  r?: number;
  ghost?: boolean;
}) {
  const style = { animationDelay: `${delay}s` };
  return (
    <g className="tt-ball-x" style={style} opacity={opacity}>
      {!ghost && (
        <ellipse className="tt-shadow" cx="78" cy="196" rx="9" ry="3" fill="#000" />
      )}
      <g className="tt-ball-y" style={style}>
        <g className={ghost ? undefined : "tt-squash"}>
          <circle
            cx="78"
            cy="132"
            r={r}
            fill="#ff6a1f"
            stroke={ghost ? "none" : "#0f2a1d"}
            strokeWidth="2.5"
          />
          {!ghost && (
            <ellipse cx="75" cy="128" rx="3.5" ry="2" fill="#fff" opacity=".6" />
          )}
        </g>
      </g>
    </g>
  );
}

export function Arena({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 270" className={`block w-full ${className}`} aria-hidden>
      <defs>
        <pattern id="tt-net" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 0H6M0 0V6" stroke="#fff" strokeWidth="1" fill="none" />
        </pattern>
      </defs>

      {/* mga paa */}
      <rect x="150" y="168" width="8" height="70" fill="#0f2a1d" opacity=".4" />
      <rect x="442" y="168" width="8" height="70" fill="#0f2a1d" opacity=".4" />
      <rect x="66" y="226" width="14" height="40" fill="#0f2a1d" />
      <rect x="520" y="226" width="14" height="40" fill="#0f2a1d" />

      {/* mesa */}
      <polygon points="130,160 470,160 555,214 45,214" fill="#14398f" stroke="#0f2a1d" strokeWidth="3" strokeLinejoin="round" />
      <polygon points="142,166 458,166 536,208 64,208" fill="none" stroke="#fff" strokeWidth="2" opacity=".85" />
      <line x1="300" y1="160" x2="300" y2="214" stroke="#fff" strokeWidth="2" opacity=".85" />
      <polygon points="45,214 555,214 555,230 45,230" fill="#0e2a6b" stroke="#0f2a1d" strokeWidth="3" strokeLinejoin="round" />

      {/* net (umuugoy) */}
      <g className="tt-net-sway">
        <rect x="296" y="132" width="8" height="60" fill="rgba(0,0,0,.25)" />
        <rect x="296" y="132" width="8" height="60" fill="url(#tt-net)" />
      </g>
      <rect x="292" y="128" width="16" height="6" rx="2" fill="#fff" stroke="#0f2a1d" strokeWidth="2" />
      <rect x="290" y="128" width="3" height="68" fill="#0f2a1d" />
      <rect x="307" y="128" width="3" height="68" fill="#0f2a1d" />

      {/* paddles */}
      <g transform="translate(46,128)">
        <g className="tt-swing">
          <ArenaPaddle />
        </g>
      </g>
      <g transform="translate(554,128) scale(-1,1)">
        <g className="tt-swing tt-swing-late">
          <ArenaPaddle />
        </g>
      </g>

      {/* trail (nasa ilalim) at ang totoong bola (nasa ibabaw) */}
      <BallSprite ghost delay={0.14} opacity={0.18} r={8} />
      <BallSprite ghost delay={0.07} opacity={0.35} r={9} />
      <BallSprite />
    </svg>
  );
}

export function Scoreboard() {
  const [s, setS] = useState({ a: 0, b: 0 });

  useEffect(() => {
    const t = setInterval(() => {
      setS((p) => {
        if (p.a >= 11 || p.b >= 11) return { a: 0, b: 0 };
        return Math.random() > 0.5 ? { ...p, a: p.a + 1 } : { ...p, b: p.b + 1 };
      });
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const box =
    "font-mono grid h-12 w-12 place-items-center rounded-lg border-2 border-[var(--ink)] bg-[var(--ink)] text-2xl font-bold text-[var(--lime)] shadow-[3px_3px_0_0_var(--ball)]";

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest">P1</span>
      {/* key = nagre-restart ang pop kapag nagbago ang numero */}
      <div key={`a${s.a}`} className={`${box} anim-pop`}>
        {String(s.a).padStart(2, "0")}
      </div>
      <span className="font-display text-2xl">:</span>
      <div key={`b${s.b}`} className={`${box} anim-pop`}>
        {String(s.b).padStart(2, "0")}
      </div>
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest">P2</span>
    </div>
  );
}