import { Link } from "react-router";

export function Footer() {
  const year = 2026;
  return (
    <footer className="relative mt-16" style={{ background: "#0A0A0A", color: "#F5F3EE" }}>
      <svg viewBox="0 0 1440 60" className="w-full h-10 block" preserveAspectRatio="none" aria-hidden>
        <path d="M0 30 Q 360 0, 720 30 T 1440 30 L 1440 0 L 0 0 Z" fill="#F5F3EE" />
      </svg>
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-10">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1B5A8F] text-white overflow-hidden">
            <svg viewBox="0 0 40 40" className="absolute inset-0" aria-hidden>
              <path d="M0 25 Q 10 18, 20 25 T 40 25 L 40 40 L 0 40 Z" fill="rgba(255,255,255,0.25)" />
              <path d="M0 30 Q 10 23, 20 30 T 40 30 L 40 40 L 0 40 Z" fill="rgba(255,255,255,0.4)" />
            </svg>
            <span className="relative" style={{ fontWeight: 800, fontSize: 16 }}>C</span>
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>
              Caspian<span style={{ color: "#FF4D2E", fontStyle: "italic" }}>Match</span>
            </div>
            <div className="text-[11px] text-white/50" style={{ fontWeight: 500, letterSpacing: "0.04em" }}>jobs · Mangystau</div>
          </div>
        </div>

        <div className="mt-10 grid md:grid-cols-4 gap-10 pt-10 border-t border-white/10">
          <div>
            <div className="text-[11px] uppercase tracking-[0.1em] mb-3 text-white/40" style={{ fontWeight: 700 }}>About</div>
            <p className="text-[13px] text-white/70 max-w-xs" style={{ fontWeight: 500, lineHeight: 1.7 }}>
              CaspianMatch is the hiring platform for Mangystau. Made in Aktau, for the people and small businesses that live here.
            </p>
          </div>
          <FootCol head="Product" links={[["Overview","/"],["Browse jobs","/app/browse"]]} />
          <FootCol head="Account" links={[["Sign in","/sign-in"],["Sign up","/sign-up"]]} />
        </div>

        <div className="mt-12 flex items-center justify-between flex-wrap gap-3 pt-6 border-t border-white/10">
          <div className="text-[12px] text-white/40" style={{ fontWeight: 500 }}>
            © {year} CaspianMatch · Aktau, Kazakhstan
          </div>
          <div className="text-[12px] text-white/40" style={{ fontWeight: 500 }}>
            Made on the Caspian Sea
          </div>
        </div>
      </div>
    </footer>
  );
}

function FootCol({ head, links }: { head: string; links: [string, string][] }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.1em] mb-3 text-white/40" style={{ fontWeight: 700 }}>{head}</div>
      <ul className="space-y-2.5">
        {links.map(([l, to]) => (
          <li key={l}>
            <Link to={to} className="text-[13px] text-white/75 hover:text-white transition-colors" style={{ fontWeight: 500 }}>
              {l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
