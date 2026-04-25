/**
 * 🏆 CaspianMatch Gamification Engine
 * 
 * XP → Rank → League → Salary Boost
 * All client-side, persisted in localStorage.
 */

// ── Ranks ────────────────────────────────────────────────────────────────────
export type RankId = "D" | "C" | "B" | "A" | "S" | "SS";

export interface RankInfo {
  id: RankId;
  label: string;
  labelRu: string;
  minXP: number;
  color: string;
  gradient: string;
  salaryBoost: number; // percentage boost
  icon: string;
}

export const RANKS: RankInfo[] = [
  { id: "D",  label: "Newcomer",   labelRu: "Новичок",      minXP: 0,     color: "#8B8D98", gradient: "linear-gradient(135deg, #8B8D98, #6B6D78)", salaryBoost: 0,  icon: "🌱" },
  { id: "C",  label: "Explorer",   labelRu: "Искатель",     minXP: 200,   color: "#4A9D6E", gradient: "linear-gradient(135deg, #4A9D6E, #2E7C50)", salaryBoost: 3,  icon: "🧭" },
  { id: "B",  label: "Performer",  labelRu: "Исполнитель",  minXP: 600,   color: "#3A8FCC", gradient: "linear-gradient(135deg, #3A8FCC, #1B5A8F)", salaryBoost: 7,  icon: "⚡" },
  { id: "A",  label: "Expert",     labelRu: "Эксперт",      minXP: 1500,  color: "#7C5AE2", gradient: "linear-gradient(135deg, #7C5AE2, #5B3DB8)", salaryBoost: 12, icon: "💎" },
  { id: "S",  label: "Master",     labelRu: "Мастер",       minXP: 3500,  color: "#E3A030", gradient: "linear-gradient(135deg, #F0C54D, #D49B1F)", salaryBoost: 18, icon: "👑" },
  { id: "SS", label: "Legend",     labelRu: "Легенда",      minXP: 7000,  color: "#E84040", gradient: "linear-gradient(135deg, #FF6B5B, #E84040, #FF2D78)", salaryBoost: 25, icon: "🔱" },
];

export function getRank(xp: number): RankInfo {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) return RANKS[i];
  }
  return RANKS[0];
}

export function getNextRank(currentRank: RankInfo): RankInfo | null {
  const idx = RANKS.findIndex((r) => r.id === currentRank.id);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

export function getRankProgress(xp: number): number {
  const current = getRank(xp);
  const next = getNextRank(current);
  if (!next) return 1; // at max rank
  const range = next.minXP - current.minXP;
  const progress = xp - current.minXP;
  return Math.min(1, progress / range);
}

// ── Leagues ──────────────────────────────────────────────────────────────────
export type LeagueId = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface LeagueInfo {
  id: LeagueId;
  label: string;
  labelRu: string;
  minRank: RankId;
  color: string;
  gradient: string;
  bgGlow: string;
  salaryMultiplier: number; // stacks with rank boost
  icon: string;
  perks: string[];
}

export const LEAGUES: LeagueInfo[] = [
  {
    id: "bronze", label: "Bronze League", labelRu: "Бронзовая Лига",
    minRank: "D", color: "#CD7F32",
    gradient: "linear-gradient(135deg, #CD7F32, #A0522D)",
    bgGlow: "radial-gradient(ellipse at 30% 20%, rgba(205,127,50,0.15), transparent 60%)",
    salaryMultiplier: 1.0, icon: "🥉",
    perks: ["Базовый доступ", "Просмотр вакансий"],
  },
  {
    id: "silver", label: "Silver League", labelRu: "Серебряная Лига",
    minRank: "C", color: "#C0C0C0",
    gradient: "linear-gradient(135deg, #E8E8E8, #A8A8A8)",
    bgGlow: "radial-gradient(ellipse at 30% 20%, rgba(192,192,192,0.2), transparent 60%)",
    salaryMultiplier: 1.05, icon: "🥈",
    perks: ["Приоритетный отклик", "+5% к рекомендуемой ЗП"],
  },
  {
    id: "gold", label: "Gold League", labelRu: "Золотая Лига",
    minRank: "B", color: "#FFD700",
    gradient: "linear-gradient(135deg, #FFD700, #DAA520, #FFD700)",
    bgGlow: "radial-gradient(ellipse at 30% 20%, rgba(255,215,0,0.2), transparent 60%)",
    salaryMultiplier: 1.1, icon: "🥇",
    perks: ["Золотой бейдж", "+10% к ЗП", "Первый в очереди"],
  },
  {
    id: "platinum", label: "Platinum League", labelRu: "Платиновая Лига",
    minRank: "A", color: "#A0D2DB",
    gradient: "linear-gradient(135deg, #A0D2DB, #649FAD, #A0D2DB)",
    bgGlow: "radial-gradient(ellipse at 30% 20%, rgba(160,210,219,0.25), transparent 60%)",
    salaryMultiplier: 1.15, icon: "💠",
    perks: ["VIP бейдж", "+15% ЗП", "Прямой контакт HR", "Менторство"],
  },
  {
    id: "diamond", label: "Diamond League", labelRu: "Алмазная Лига",
    minRank: "S", color: "#B9F2FF",
    gradient: "linear-gradient(135deg, #B9F2FF, #7DD3E8, #B9F2FF, #E0F7FF)",
    bgGlow: "radial-gradient(ellipse at 30% 20%, rgba(185,242,255,0.3), transparent 60%)",
    salaryMultiplier: 1.25, icon: "💎",
    perks: ["Алмазный бейдж", "+25% ЗП", "Эксклюзивные вакансии", "Гарантия интервью", "Персональный агент"],
  },
];

export function getLeague(rank: RankInfo): LeagueInfo {
  const rankIndex = RANKS.findIndex((r) => r.id === rank.id);
  if (rankIndex >= 4) return LEAGUES[4]; // S, SS → Diamond
  if (rankIndex >= 3) return LEAGUES[3]; // A → Platinum
  if (rankIndex >= 2) return LEAGUES[2]; // B → Gold
  if (rankIndex >= 1) return LEAGUES[1]; // C → Silver
  return LEAGUES[0]; // D → Bronze
}

export function getTotalSalaryBoost(rank: RankInfo, league: LeagueInfo): number {
  return Math.round(rank.salaryBoost + (league.salaryMultiplier - 1) * 100);
}

// ── Achievements ─────────────────────────────────────────────────────────────
export interface Achievement {
  id: string;
  title: string;
  titleRu: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: (stats: UserStats) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_apply",     title: "First Step",      titleRu: "Первый шаг",       description: "Отправь первый отклик",          icon: "🚀", xpReward: 50,  condition: (s) => s.applicationsSubmitted >= 1 },
  { id: "apply_5",         title: "Job Hunter",      titleRu: "Охотник за работой", description: "Отправь 5 откликов",             icon: "🎯", xpReward: 100, condition: (s) => s.applicationsSubmitted >= 5 },
  { id: "apply_20",        title: "Persistent",      titleRu: "Настойчивый",       description: "Отправь 20 откликов",            icon: "💪", xpReward: 300, condition: (s) => s.applicationsSubmitted >= 20 },
  { id: "profile_complete", title: "Identity",        titleRu: "Личность",          description: "Заполни профиль полностью",      icon: "🪪", xpReward: 75,  condition: (s) => s.profileComplete },
  { id: "interview_1",     title: "Brave Speaker",   titleRu: "Смелый оратор",     description: "Пройди AI-интервью",             icon: "🎤", xpReward: 100, condition: (s) => s.interviewsCompleted >= 1 },
  { id: "interview_5",     title: "Seasoned",        titleRu: "Закалённый",        description: "Пройди 5 AI-интервью",           icon: "🏆", xpReward: 250, condition: (s) => s.interviewsCompleted >= 5 },
  { id: "vouch_received",  title: "Trusted",         titleRu: "Доверенный",        description: "Получи рекомендацию",            icon: "🤝", xpReward: 80,  condition: (s) => s.vouchesReceived >= 1 },
  { id: "vouch_3",         title: "Community Star",  titleRu: "Звезда комьюнити",  description: "Получи 3 рекомендации",          icon: "⭐", xpReward: 200, condition: (s) => s.vouchesReceived >= 3 },
  { id: "daily_3",         title: "Consistency",     titleRu: "Стабильность",      description: "Зайди 3 дня подряд",            icon: "📅", xpReward: 60,  condition: (s) => s.loginStreak >= 3 },
  { id: "daily_7",         title: "Weekly Warrior",  titleRu: "Недельный воин",    description: "Зайди 7 дней подряд",            icon: "🔥", xpReward: 150, condition: (s) => s.loginStreak >= 7 },
  { id: "daily_30",        title: "Dedication",      titleRu: "Преданность",       description: "Зайди 30 дней подряд",           icon: "💫", xpReward: 500, condition: (s) => s.loginStreak >= 30 },
  { id: "save_10",         title: "Organized",       titleRu: "Организованный",    description: "Сохрани 10 вакансий",            icon: "📌", xpReward: 60,  condition: (s) => s.jobsSaved >= 10 },
  { id: "pearl_chat",      title: "AI Explorer",     titleRu: "AI исследователь",  description: "Поговори с Жемчуг 5 раз",       icon: "🦪", xpReward: 70,  condition: (s) => s.pearlChats >= 5 },
  { id: "rank_b",          title: "Rising Star",     titleRu: "Восходящая звезда", description: "Достигни ранга B",              icon: "⚡", xpReward: 200, condition: (s) => s.xp >= 600 },
  { id: "rank_a",          title: "Elite",           titleRu: "Элита",             description: "Достигни ранга A",              icon: "💎", xpReward: 400, condition: (s) => s.xp >= 1500 },
  { id: "rank_s",          title: "Grandmaster",     titleRu: "Грандмастер",       description: "Достигни ранга S",              icon: "👑", xpReward: 750, condition: (s) => s.xp >= 3500 },
];

// ── XP Events ────────────────────────────────────────────────────────────────
export const XP_EVENTS = {
  APPLY:            25,
  GET_APPROVED:     50,
  COMPLETE_PROFILE: 100,
  DAILY_LOGIN:      15,
  INTERVIEW:        40,
  VOUCH_RECEIVED:   30,
  SAVE_JOB:         5,
  PEARL_CHAT:       10,
  POST_VACANCY:     20,  // for employers
} as const;

// ── User Stats ───────────────────────────────────────────────────────────────
export interface UserStats {
  xp: number;
  applicationsSubmitted: number;
  applicationsApproved: number;
  profileComplete: boolean;
  interviewsCompleted: number;
  vouchesReceived: number;
  loginStreak: number;
  lastLoginDate: string; // ISO date string
  jobsSaved: number;
  pearlChats: number;
  vacanciesPosted: number;
  unlockedAchievements: string[];
}

const DEFAULT_STATS: UserStats = {
  xp: 0,
  applicationsSubmitted: 0,
  applicationsApproved: 0,
  profileComplete: false,
  interviewsCompleted: 0,
  vouchesReceived: 0,
  loginStreak: 0,
  lastLoginDate: "",
  jobsSaved: 0,
  pearlChats: 0,
  vacanciesPosted: 0,
  unlockedAchievements: [],
};

const STATS_KEY = "caspian.gamification";

export function loadStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function saveStats(stats: UserStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export function addXP(amount: number): { stats: UserStats; newAchievements: Achievement[] } {
  const stats = loadStats();
  stats.xp += amount;

  // Check for newly unlocked achievements
  const newAchievements: Achievement[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (!stats.unlockedAchievements.includes(ach.id) && ach.condition(stats)) {
      stats.unlockedAchievements.push(ach.id);
      stats.xp += ach.xpReward;
      newAchievements.push(ach);
    }
  }

  saveStats(stats);
  return { stats, newAchievements };
}

export function recordEvent(event: keyof typeof XP_EVENTS): { stats: UserStats; newAchievements: Achievement[] } {
  const stats = loadStats();

  switch (event) {
    case "APPLY":            stats.applicationsSubmitted++; break;
    case "GET_APPROVED":     stats.applicationsApproved++; break;
    case "COMPLETE_PROFILE": stats.profileComplete = true; break;
    case "INTERVIEW":        stats.interviewsCompleted++; break;
    case "VOUCH_RECEIVED":   stats.vouchesReceived++; break;
    case "SAVE_JOB":         stats.jobsSaved++; break;
    case "PEARL_CHAT":       stats.pearlChats++; break;
    case "POST_VACANCY":     stats.vacanciesPosted++; break;
    case "DAILY_LOGIN": {
      const today = new Date().toISOString().slice(0, 10);
      if (stats.lastLoginDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        stats.loginStreak = stats.lastLoginDate === yesterday ? stats.loginStreak + 1 : 1;
        stats.lastLoginDate = today;
      }
      break;
    }
  }

  stats.xp += XP_EVENTS[event];
  saveStats(stats);
  return addXP(0); // triggers achievement checks without adding more XP
}

// ── Leaderboard (simulated with realistic users) ─────────────────────────────
export interface LeaderboardEntry {
  name: string;
  xp: number;
  rank: RankInfo;
  league: LeagueInfo;
  isYou: boolean;
  avatar: string;
}

const SIMULATED_USERS = [
  { name: "Арман К.", xp: 8200, avatar: "AK" },
  { name: "Дана С.", xp: 6800, avatar: "ДС" },
  { name: "Ерболат Н.", xp: 5400, avatar: "ЕН" },
  { name: "Гүлнұр А.", xp: 4100, avatar: "ГА" },
  { name: "Нурсултан Б.", xp: 3700, avatar: "НБ" },
  { name: "Айгерим Т.", xp: 2900, avatar: "AT" },
  { name: "Максат Р.", xp: 2400, avatar: "МР" },
  { name: "Камила Ж.", xp: 1800, avatar: "КЖ" },
  { name: "Самат Д.", xp: 1200, avatar: "СД" },
  { name: "Жанна М.", xp: 800, avatar: "ЖМ" },
  { name: "Тимур О.", xp: 450, avatar: "ТО" },
  { name: "Асель К.", xp: 250, avatar: "АК" },
];

export function getLeaderboard(userName: string, userXP: number): LeaderboardEntry[] {
  const allUsers = [
    ...SIMULATED_USERS.map((u) => {
      const rank = getRank(u.xp);
      return { ...u, rank, league: getLeague(rank), isYou: false };
    }),
    (() => {
      const rank = getRank(userXP);
      return { name: userName || "Вы", xp: userXP, rank, league: getLeague(rank), isYou: true, avatar: (userName || "?").charAt(0).toUpperCase() };
    })(),
  ];
  allUsers.sort((a, b) => b.xp - a.xp);
  return allUsers;
}

// ── Daily quests ─────────────────────────────────────────────────────────────
export interface DailyQuest {
  id: string;
  title: string;
  icon: string;
  xp: number;
  progress: number;
  target: number;
  done: boolean;
}

export function getDailyQuests(stats: UserStats): DailyQuest[] {
  return [
    { id: "login",     title: "Зайди в приложение",    icon: "📱", xp: 15,  progress: 1, target: 1, done: true },
    { id: "apply",     title: "Откликнись на вакансию", icon: "📨", xp: 25,  progress: Math.min(stats.applicationsSubmitted, 1), target: 1, done: stats.applicationsSubmitted > 0 },
    { id: "pearl",     title: "Поговори с Жемчуг",     icon: "🦪", xp: 10,  progress: Math.min(stats.pearlChats, 1), target: 1, done: stats.pearlChats > 0 },
    { id: "save",      title: "Сохрани 3 вакансии",     icon: "📌", xp: 15,  progress: Math.min(stats.jobsSaved, 3), target: 3, done: stats.jobsSaved >= 3 },
    { id: "interview", title: "Пройди AI-интервью",     icon: "🎤", xp: 40,  progress: Math.min(stats.interviewsCompleted, 1), target: 1, done: stats.interviewsCompleted > 0 },
  ];
}
