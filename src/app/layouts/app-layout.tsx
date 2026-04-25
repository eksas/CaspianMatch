import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, Compass, Inbox, UserCircle,
  Navigation, MessageSquareText, GraduationCap, Shield,
  Search, Command, LogOut, Plus, Briefcase, Settings, Sparkles,
  Trophy, Users, Activity
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { CommandPalette } from "../components/command-palette";
import { PearlDrawer } from "../components/pearl-drawer";
import { useJobs } from "../lib/store";
import type { Job } from "../lib/store";
import { C, EASE } from "../lib/design";

type NavItem = { to: string; end?: boolean; icon: any; label: string; badge?: number };

export function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { jobs } = useJobs();
  const loc = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [pearlOpen, setPearlOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isEmployer = user?.role === "EMPLOYER";

  const seekerNav: NavItem[] = [
    { to: "/app", end: true, icon: Compass, label: "Живая лента", badge: jobs.length },
    { to: "/app/nearby", icon: Navigation, label: "Рядом со мной" },
    { to: "/app/mentor", icon: GraduationCap, label: "AI-наставник" },
    { to: "/app/reputation", icon: Shield, label: "Репутация" },
    { to: "/app/community", icon: Users, label: "Сообщество" },
    { to: "/app/rank", icon: Trophy, label: "Рейтинг" },
  ];
  const employerNav: NavItem[] = [
    { to: "/app/employer", end: true, icon: LayoutDashboard, label: "Обзор" },
    { to: "/app/employer/vacancies", icon: Briefcase, label: "Вакансии" },
    { to: "/app/employer/inbox", icon: Inbox, label: "Входящие" },
    { to: "/app/employer/post", icon: Plus, label: "Новая вакансия" },
  ];
  const items = isEmployer ? employerNav : seekerNav;

  return (
    <div className="min-h-screen flex relative" style={{ fontFamily: "var(--font-sans)", background: C.foam, color: C.abyss }}>
      {/* Sidebar */}
      <aside
        className="hidden lg:flex w-[260px] shrink-0 flex-col relative z-10 border-r"
        style={{ borderColor: C.tide100, background: "rgba(255,255,255,0.78)", backdropFilter: "blur(20px)" }}
      >
        {/* Brand */}
        <Link to={isEmployer ? "/app/employer" : "/app"} className="group relative h-[72px] px-5 flex items-center gap-3 border-b overflow-hidden" style={{ borderColor: C.tide100 }}>
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, ${C.tide700}, ${C.abyss})` }}>
            <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full" aria-hidden>
              <motion.path
                d="M0 26 Q 10 20, 20 26 T 40 26 L 40 40 L 0 40 Z"
                fill="rgba(255,255,255,0.22)"
                animate={{ d: ["M0 26 Q 10 20, 20 26 T 40 26 L 40 40 L 0 40 Z", "M0 26 Q 10 30, 20 26 T 40 26 L 40 40 L 0 40 Z", "M0 26 Q 10 20, 20 26 T 40 26 L 40 40 L 0 40 Z"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.path
                d="M0 31 Q 10 26, 20 31 T 40 31 L 40 40 L 0 40 Z"
                fill="rgba(255,255,255,0.4)"
                animate={{ d: ["M0 31 Q 10 26, 20 31 T 40 31 L 40 40 L 0 40 Z", "M0 31 Q 10 35, 20 31 T 40 31 L 40 40 L 0 40 Z", "M0 31 Q 10 26, 20 31 T 40 31 L 40 40 L 0 40 Z"] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>
            <span className="relative z-10 w-full h-full flex items-center justify-center text-white" style={{ fontWeight: 900, fontSize: 17, letterSpacing: "-0.04em" }}>C</span>
          </div>
          <div className="flex flex-col leading-none">
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.03em", color: C.abyss }}>
              Caspian<span style={{ color: "#FF4D2E", fontStyle: "italic" }}>Match</span>
            </span>
            <span className="text-[10px] mt-1.5 font-mono" style={{ fontWeight: 500, letterSpacing: "0.14em", color: C.tide500 }}>
              АКТАУ · MVP
            </span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] uppercase font-mono" style={{ color: C.tide500, letterSpacing: "0.18em", fontWeight: 600 }}>
            {isEmployer ? "Работодатель" : "Для тебя"}
          </div>
          <div className="space-y-0.5">
            {items.map((it) => (
              <SideLink key={it.to} item={it} />
            ))}
          </div>

          <div className="px-3 pt-6 pb-2 text-[10px] uppercase font-mono" style={{ color: C.tide500, letterSpacing: "0.18em", fontWeight: 600 }}>
            Аккаунт
          </div>
          <div className="space-y-0.5">
            <SideLink item={{ to: "/app/profile", icon: isEmployer ? Settings : UserCircle, label: "Профиль" }} />
          </div>

          {/* Pearl card */}
          <motion.button
            onClick={() => setPearlOpen(true)}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.25, ease: EASE.splash }}
            className="mt-6 w-full relative overflow-hidden rounded-2xl p-4 text-left text-white"
            style={{ background: `linear-gradient(135deg, ${C.abyss}, ${C.tide700})` }}
          >
            <svg viewBox="0 0 220 90" className="absolute inset-0 w-full h-full opacity-40" aria-hidden>
              <motion.path
                d="M0 60 Q 55 45, 110 60 T 220 60"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={1.2}
                fill="none"
                animate={{ d: ["M0 60 Q 55 45, 110 60 T 220 60", "M0 60 Q 55 70, 110 60 T 220 60", "M0 60 Q 55 45, 110 60 T 220 60"] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>
            <div className="relative flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono" style={{ letterSpacing: "0.18em", fontWeight: 600 }}>ЖЕМЧУГ · AI</span>
            </div>
            <div className="relative text-[13px] leading-snug" style={{ fontWeight: 600 }}>
              Спроси что угодно про работу в Актау
            </div>
          </motion.button>
        </nav>

        {/* User card */}
        <div className="p-3 border-t" style={{ borderColor: C.tide100 }}>
          <div className="rounded-xl p-3 border" style={{ borderColor: C.tide100, background: "white" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: `linear-gradient(135deg, ${C.tide700}, ${C.abyss})`, fontWeight: 800, fontSize: 14 }}>
                {(user?.name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] truncate" style={{ fontWeight: 700, color: C.abyss, letterSpacing: "-0.01em" }}>{user?.name}</div>
                <div className="text-[10px] truncate font-mono" style={{ color: C.tide500, letterSpacing: "0.1em", fontWeight: 500 }}>
                  {isEmployer ? (user?.company || "РАБОТОДАТЕЛЬ") : "СОИСКАТЕЛЬ"}
                </div>
              </div>
              <button
                onClick={() => { signOut(); navigate("/"); }}
                className="w-7 h-7 rounded-md hover:bg-[#F0F7FC] flex items-center justify-center transition-colors"
                style={{ color: C.tide500 }}
                title="Выйти"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-[72px] px-6 lg:px-8 border-b flex items-center gap-3 sticky top-0 z-20" style={{ borderColor: C.tide100, background: "rgba(255,255,255,0.78)", backdropFilter: "blur(20px)" }}>
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2.5 h-11 px-4 rounded-full border bg-white hover:border-[#8FB8D9] text-[13px] w-full max-w-[420px] transition-all"
            style={{ borderColor: C.tide100, color: C.tide500, fontWeight: 500 }}
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Найти работу, компанию…</span>
            <kbd className="px-1.5 py-0.5 rounded-md text-[10px] text-white inline-flex items-center gap-0.5 font-mono" style={{ background: C.tide700, fontWeight: 600 }}>
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>
          <button
            onClick={() => setPearlOpen(true)}
            className="ml-auto flex items-center gap-2 h-11 px-4 rounded-full text-white text-[13px] hover:brightness-110 transition-all"
            style={{ fontWeight: 700, letterSpacing: "-0.01em", background: C.abyss }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Жемчуг
          </button>
        </header>

        <AnimatePresence mode="wait">
          <motion.main
            key={loc.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: EASE.splash }}
            className="flex-1 p-6 lg:p-10 max-w-6xl w-full"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        jobs={jobs}
        onPick={(j: Job) => navigate(`/app/jobs/${j.id}`)}
      />
      <PearlDrawer open={pearlOpen} onClose={() => setPearlOpen(false)} />
    </div>
  );
}

function SideLink({ item }: { item: NavItem }) {
  const { to, end, icon: Icon, label, badge } = item;
  return (
    <NavLink to={to} end={end} className="block">
      {({ isActive }) => (
        <motion.div
          whileHover={{ x: 2 }}
          transition={{ duration: 0.2, ease: EASE.splash }}
          className="relative flex items-center gap-3 h-10 px-3 rounded-xl text-[13.5px]"
          style={{
            fontWeight: isActive ? 700 : 500,
            color: isActive ? C.abyss : C.depth,
            background: isActive ? "white" : "transparent",
            boxShadow: isActive ? "0 1px 0 rgba(15,48,87,0.04), 0 4px 12px -6px rgba(15,48,87,0.12)" : "none",
            letterSpacing: "-0.01em",
          }}
        >
          {isActive && (
            <motion.span
              layoutId="sidebar-active-bar"
              className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full"
              style={{ background: `linear-gradient(180deg, ${C.tide500}, ${C.tide700})` }}
              transition={{ duration: 0.35, ease: EASE.splash }}
            />
          )}
          <Icon className="w-[17px] h-[17px] shrink-0" strokeWidth={isActive ? 2.3 : 2} style={{ color: isActive ? C.tide700 : C.tide500 }} />
          <span className="flex-1">{label}</span>
          {typeof badge === "number" && badge > 0 && (
            <span
              className="h-5 min-w-[20px] px-1.5 rounded-full text-[10.5px] flex items-center justify-center font-mono"
              style={{
                background: isActive ? C.tide700 : C.tide50,
                color: isActive ? "white" : C.tide700,
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}
            >
              {badge}
            </span>
          )}
        </motion.div>
      )}
    </NavLink>
  );
}
