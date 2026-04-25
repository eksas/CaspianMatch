import { Link } from "react-router";
import { motion } from "motion/react";

export function Logo({ to = "/", compact = false }: { to?: string; compact?: boolean }) {
  return (
    <Link to={to} className="group inline-flex items-baseline gap-2 select-none">
      {/* Mark: two interlocking arcs — sea horizon meeting handshake */}
      <span className="relative inline-block align-middle translate-y-[3px]" style={{ width: 26, height: 22 }}>
        <svg viewBox="0 0 26 22" width={26} height={22} aria-hidden>
          <motion.path
            d="M1 14 Q 7 4, 13 14"
            stroke="#0F3057"
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          />
          <motion.path
            d="M13 14 Q 19 4, 25 14"
            stroke="#1B5A8F"
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
          />
          <motion.circle
            cx={13}
            cy={14}
            r={2.2}
            fill="#FF4D2E"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.85, type: "spring", stiffness: 300, damping: 14 }}
          />
        </svg>
      </span>
      <span className="inline-flex items-baseline leading-none">
        <span style={{ fontWeight: 800, fontSize: compact ? 15 : 17, letterSpacing: "-0.025em", color: "#0F3057" }}>
          Caspian
        </span>
        <span
          className="ml-[2px]"
          style={{
            fontWeight: 800,
            fontSize: compact ? 15 : 17,
            letterSpacing: "-0.025em",
            color: "#FF4D2E",
            fontStyle: "italic",
          }}
        >
          Match
        </span>
      </span>
    </Link>
  );
}
