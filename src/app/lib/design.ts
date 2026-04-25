import { Coffee, Bike, ShoppingBag, ChefHat, Store, Briefcase, Hammer, Baby, Sparkles } from "lucide-react";

/* Caspian "Deep Calm" tokens */
export const C = {
  foam: "#FBFDFF",
  shell: "#FFFFFF",
  tide50: "#F0F7FC",
  tide100: "#D6E4F0",
  tide300: "#8FB8D9",
  tide500: "#3A8FCC",
  tide700: "#1B5A8F",
  depth: "#0F3057",
  abyss: "#0A1F3D",
  coral: "#FF6B5B",
  kelp: "#0D5D5A",
  sand: "#E8DCC8",
  /* back-compat aliases used across older components */
  paper: "#FBFDFF",
  ink: "#0A1F3D",
  line: "#D6E4F0",
  sub: "#1B5A8F",
  accent: "#1B5A8F",
  hot: "#FF6B5B",
  ok: "#0D5D5A",
};

export const EASE = {
  tide: [0.33, 1, 0.68, 1] as [number, number, number, number],
  swell: [0.65, 0, 0.35, 1] as [number, number, number, number],
  splash: [0.16, 1, 0.3, 1] as [number, number, number, number],
};

export const CATEGORY: Record<string, string> = {
  waiter: "#1B5A8F",
  courier: "#3A8FCC",
  cashier: "#0D5D5A",
  cook: "#0F3057",
  retail: "#FF6B5B",
  construction: "#E8DCC8",
  childcare: "#3A8FCC",
  beauty: "#FF6B5B",
  food: "#1B5A8F",
  logistics: "#3A8FCC",
};

export const CATEGORY_ICON: Record<string, typeof Coffee> = {
  waiter: Coffee,
  food: Coffee,
  courier: Bike,
  logistics: Bike,
  cashier: ShoppingBag,
  retail: ShoppingBag,
  cook: ChefHat,
  construction: Hammer,
  childcare: Baby,
  beauty: Sparkles,
};

export function categoryIcon(cat: string) {
  return CATEGORY_ICON[cat] ?? Briefcase;
}

/* 3-tier MatchPill per spec §4.3 */
export type MatchTier = "high" | "mid" | "low";
export function matchTier(score: number): MatchTier {
  if (score >= 80) return "high";
  if (score >= 60) return "mid";
  return "low";
}
export const MATCH_LABEL: Record<MatchTier, string> = {
  high: "Высокая",
  mid: "Средняя",
  low: "Низкая",
};
export const MATCH_STYLE: Record<MatchTier, { bg: string; fg: string }> = {
  high: { bg: "#F0F7FC", fg: "#0D5D5A" },
  mid: { bg: "#FBFDFF", fg: "#0F3057" },
  low: { bg: "#F5F3EE", fg: "#6B6B6B" },
};
