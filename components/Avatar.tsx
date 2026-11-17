import { AVATARS } from "@/lib/profile";

export default function Avatar({
  id,
  size = 40,
  className = "",
}: {
  id: string;
  size?: number;
  className?: string;
}) {
  const a = AVATARS.find((x) => x.id === id) ?? AVATARS[0];
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full border-2 border-[var(--ink)] shadow-[3px_3px_0_0_var(--ink)] ${className}`}
      style={{
        width: size,
        height: size,
        background: a.bg,
        fontSize: size * 0.55,
        lineHeight: 1,
      }}
      aria-hidden
    >
      {a.emoji}
    </span>
  );
}