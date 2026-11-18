
"use client";

interface ConfettiProps {
  count?: number;
}

export default function Confetti({ count = 70 }: ConfettiProps) {
  const colors = [
    "#B6E23A",
    "#FFD43B",
    "#FF6B6B",
    "#4DABF7",
    "#CC5DE8",
    "#20C997",
  ];

  return (
    <>
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }

        .confetti-piece {
          position: fixed;
          top: -20px;
          width: 10px;
          height: 14px;
          animation: confetti-fall linear forwards;
          pointer-events: none;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${(i * 37) % 100}%`,
              backgroundColor: colors[i % colors.length],
              animationDelay: `${(i % 15) * 0.1}s`,
              animationDuration: `${3 + (i % 4)}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
