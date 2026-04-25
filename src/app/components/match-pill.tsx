import { matchTier, MATCH_LABEL, MATCH_STYLE } from "../lib/design";

export function MatchPill({ score, compact = false }: { score: number; compact?: boolean }) {
  const tier = matchTier(score);
  const { bg, fg } = MATCH_STYLE[tier];
  return (
    <span
      className={"inline-flex items-center gap-1 rounded-full " + (compact ? "px-2 h-5 text-[10px]" : "px-2.5 h-6 text-[11px]")}
      style={{ background: bg, color: fg, fontWeight: 600, letterSpacing: "0.02em" }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: fg }} />
      {MATCH_LABEL[tier]}
    </span>
  );
}
