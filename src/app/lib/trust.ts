/**
 * 🤝 CaspianMatch Trust Engine
 * 
 * Referral-based trust system:
 * - Users can recommend friends for jobs
 * - If the referred person performs well (gets approved), BOTH gain trust points
 * - Reviews from employers add/subtract trust
 * - Trust score displayed as "Волна доверия" (Wave of Trust)
 */

// ── Trust Score ──────────────────────────────────────────────────────────────
export interface TrustProfile {
  score: number;           // 0-100
  referralsMade: number;
  referralsSuccessful: number;
  reviewsReceived: number;
  avgRating: number;       // 1-5
  badges: string[];
}

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: "EMPLOYER" | "SEEKER";
  authorCompany?: string;
  targetUserId: string;
  rating: number;  // 1-5
  text: string;
  relationship: string; // e.g. "Работодатель в Coffee Point", "Коллега"
  createdAt: number;
}

export interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  referredId: string;
  referredName: string;
  jobId: string;
  jobTitle: string;
  status: "PENDING" | "HIRED" | "REJECTED";
  createdAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  headline: string;
  bio: string;
  district: number;
  role: "SEEKER" | "EMPLOYER";
  company?: string;
  skills: string[];
  experiences: Experience[];
  trust: TrustProfile;
  reviews: Review[];
  referrals: Referral[];
  avatarHue: number;
  joinedAt: number;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  current: boolean;
}

// ── Trust Tiers ──────────────────────────────────────────────────────────────
export type TrustTier = "new" | "rising" | "trusted" | "verified" | "elite";

export interface TrustTierInfo {
  id: TrustTier;
  label: string;
  emoji: string;
  minScore: number;
  color: string;
  description: string;
}

export const TRUST_TIERS: TrustTierInfo[] = [
  { id: "new",      label: "Новичок",       emoji: "🌱", minScore: 0,  color: "#8B8D98", description: "Начните рекомендовать и получать отзывы" },
  { id: "rising",   label: "Растущий",      emoji: "🌿", minScore: 20, color: "#4A9D6E", description: "Первые успешные рекомендации" },
  { id: "trusted",  label: "Доверенный",    emoji: "🛡️", minScore: 45, color: "#3A8FCC", description: "Стабильная репутация в сообществе" },
  { id: "verified", label: "Проверенный",   emoji: "✅", minScore: 70, color: "#7C5AE2", description: "Высокий уровень доверия" },
  { id: "elite",    label: "Элита доверия", emoji: "💎", minScore: 90, color: "#E3A030", description: "Максимальный авторитет" },
];

export function getTrustTier(score: number): TrustTierInfo {
  for (let i = TRUST_TIERS.length - 1; i >= 0; i--) {
    if (score >= TRUST_TIERS[i].minScore) return TRUST_TIERS[i];
  }
  return TRUST_TIERS[0];
}

// ── Trust Score Calculation ──────────────────────────────────────────────────
const TRUST_POINTS = {
  REVIEW_RECEIVED: 5,       // per review (weighted by rating)
  REFERRAL_MADE: 3,         // referring someone
  REFERRAL_HIRED: 12,       // referred person got hired — BOTH get this
  REFERRAL_REJECTED: -2,    // referred person rejected
  FIVE_STAR_REVIEW: 8,      // bonus for 5-star
  CONSISTENCY_BONUS: 5,     // 3+ positive reviews in a row
} as const;

export function calculateTrustScore(reviews: Review[], referrals: Referral[]): TrustProfile {
  let score = 10; // base score for joining
  let referralsMade = referrals.length;
  let referralsSuccessful = referrals.filter(r => r.status === "HIRED").length;
  let referralsRejected = referrals.filter(r => r.status === "REJECTED").length;

  // Review points
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  reviews.forEach(r => {
    score += TRUST_POINTS.REVIEW_RECEIVED * (r.rating / 3); // normalize: 5-star = ~8.3pts, 1-star = ~1.7pts
    if (r.rating === 5) score += TRUST_POINTS.FIVE_STAR_REVIEW;
    if (r.rating <= 2) score -= 3;
  });

  // Referral points
  score += referralsMade * TRUST_POINTS.REFERRAL_MADE;
  score += referralsSuccessful * TRUST_POINTS.REFERRAL_HIRED;
  score += referralsRejected * TRUST_POINTS.REFERRAL_REJECTED;

  // Consistency bonus
  if (reviews.filter(r => r.rating >= 4).length >= 3) {
    score += TRUST_POINTS.CONSISTENCY_BONUS;
  }

  // Clamp 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Badges
  const badges: string[] = [];
  if (reviews.length >= 1) badges.push("first_review");
  if (reviews.length >= 5) badges.push("popular");
  if (referralsSuccessful >= 1) badges.push("connector");
  if (referralsSuccessful >= 3) badges.push("networker");
  if (avgRating >= 4.5 && reviews.length >= 3) badges.push("top_rated");
  if (score >= 70) badges.push("verified");

  return { score, referralsMade, referralsSuccessful, reviewsReceived: reviews.length, avgRating, badges };
}

// ── localStorage persistence ─────────────────────────────────────────────────
const REVIEWS_KEY = "caspian.reviews";
const REFERRALS_KEY = "caspian.referrals";
const PROFILES_KEY = "caspian.publicProfiles";

export function loadReviews(userId?: string): Review[] {
  try {
    const all: Review[] = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "[]");
    return userId ? all.filter(r => r.targetUserId === userId) : all;
  } catch { return []; }
}

export function saveReview(review: Review): void {
  try {
    const all = loadReviews();
    all.unshift(review);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
  } catch {}
}

export function loadReferrals(userId?: string): Referral[] {
  try {
    const all: Referral[] = JSON.parse(localStorage.getItem(REFERRALS_KEY) || "[]");
    return userId ? all.filter(r => r.referrerId === userId || r.referredId === userId) : all;
  } catch { return []; }
}

export function saveReferral(ref: Referral): void {
  try {
    const all = loadReferrals();
    all.unshift(ref);
    localStorage.setItem(REFERRALS_KEY, JSON.stringify(all));
  } catch {}
}

export function updateReferralStatus(refId: string, status: "HIRED" | "REJECTED"): void {
  try {
    const all: Referral[] = JSON.parse(localStorage.getItem(REFERRALS_KEY) || "[]");
    const idx = all.findIndex(r => r.id === refId);
    if (idx >= 0) {
      all[idx].status = status;
      localStorage.setItem(REFERRALS_KEY, JSON.stringify(all));
    }
  } catch {}
}

// ── Public profiles directory ────────────────────────────────────────────────
export function loadPublicProfiles(): UserProfile[] {
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]");
  } catch { return []; }
}

export function savePublicProfile(profile: UserProfile): void {
  try {
    const all = loadPublicProfiles().filter(p => p.id !== profile.id);
    all.unshift(profile);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(all));
  } catch {}
}

export function getPublicProfile(userId: string): UserProfile | null {
  return loadPublicProfiles().find(p => p.id === userId) || null;
}

// ── No more mock data ────────────────────────────────────────────────────────
export function ensureCommunityProfiles(): void {
  // Clearing any previously seeded mock data as requested
  try {
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]");
    if (profiles.some((p: any) => p.id === "u-arman")) {
      localStorage.setItem(PROFILES_KEY, "[]");
      localStorage.setItem(REVIEWS_KEY, "[]");
      localStorage.setItem(REFERRALS_KEY, "[]");
    }
  } catch {}
}

// ── Stars helper ─────────────────────────────────────────────────────────────
export function renderStars(rating: number): string {
  return "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
}
