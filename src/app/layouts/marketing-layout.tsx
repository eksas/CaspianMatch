import { Link, Outlet, useLocation } from "react-router";
import { motion } from "motion/react";
import { Logo } from "../components/logo";
import { Footer } from "../components/footer";
import { useAuth } from "../lib/auth";
import { C, EASE } from "../lib/design";

export function MarketingLayout() {
  const loc = useLocation();
  const { user } = useAuth();
  const isAuthPage = loc.pathname === "/sign-in" || loc.pathname === "/sign-up";

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ fontFamily: "var(--font-sans)", background: C.foam, color: C.abyss }}
    >
      {/* Primary header */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "rgba(251,253,255,0.94)",
          backdropFilter: "blur(14px)",
          borderBottom: `1px solid ${C.abyss}`,
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-[68px] grid grid-cols-[auto_1fr_auto] items-center gap-8">
          <Logo />

          {/* Center: live feed pulse */}
          <div className="hidden md:flex items-center justify-center gap-2.5 font-mono"
            style={{ fontSize: 11, letterSpacing: "0.2em", color: C.depth, fontWeight: 700, textTransform: "uppercase" }}
          >
            <motion.span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "#FF4D2E" }}
              animate={{ opacity: [1, 0.25, 1], scale: [1, 1.25, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            Живая лента · Актау
          </div>

          {/* Right: CTA cluster */}
          <div className="flex items-center gap-3 justify-self-end">
            {user ? (
              <Link
                to="/app"
                className="relative h-10 pl-4 pr-5 inline-flex items-center gap-2 group"
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: "white",
                  background: C.abyss,
                  letterSpacing: "-0.005em",
                }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: "#4ADE80" }}
                />
                Enter app
                <span
                  className="inline-block transition-transform group-hover:translate-x-1"
                  aria-hidden
                >
                  →
                </span>
              </Link>
            ) : (
              <>
                <Link
                  to="/sign-in"
                  className="hidden sm:inline-flex h-10 px-3 items-center"
                  style={{ color: C.depth, fontWeight: 500, fontSize: 13 }}
                >
                  Sign in
                </Link>
                <Link
                  to="/sign-up"
                  className="relative h-10 pl-4 pr-5 inline-flex items-center gap-2 group overflow-hidden"
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: "white",
                    background: C.abyss,
                    letterSpacing: "-0.005em",
                  }}
                >
                  <motion.span
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, rgba(255,77,46,0.4) 50%, transparent 100%)",
                    }}
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="relative">Join beta</span>
                  <span
                    className="relative inline-block transition-transform group-hover:translate-x-1"
                    aria-hidden
                  >
                    →
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Hairline wave decoration */}
        <svg
          className="block w-full pointer-events-none"
          height="6"
          viewBox="0 0 1200 6"
          preserveAspectRatio="none"
          aria-hidden
        >
          <motion.path
            d="M0 3 Q 150 0, 300 3 T 600 3 T 900 3 T 1200 3"
            stroke={C.tide500}
            strokeWidth="1"
            fill="none"
            strokeOpacity="0.4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: EASE.splash }}
          />
        </svg>
      </header>

      <motion.main
        key={loc.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE.splash }}
        className="flex-1"
      >
        <Outlet />
      </motion.main>

      {!isAuthPage && <Footer />}
    </div>
  );
}
