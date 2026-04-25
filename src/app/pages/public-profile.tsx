import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Clock, Briefcase, Star, MessageSquare, Users, Shield, ArrowLeft, Send, ChevronDown } from "lucide-react";
import { C, EASE } from "../lib/design";
import { useAuth } from "../lib/auth";
import {
  getPublicProfile, ensureCommunityProfiles, getTrustTier, calculateTrustScore,
  loadReviews, loadReferrals, saveReview, saveReferral, renderStars,
  TRUST_TIERS,
  type UserProfile, type Review, type Referral,
} from "../lib/trust";

export function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user: me } = useAuth();
  const [tab, setTab] = useState<"about" | "reviews" | "trust">("about");
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewRelationship, setReviewRelationship] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Referral form
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [refName, setRefName] = useState("");
  const [refJob, setRefJob] = useState("");

  // Ensure community profiles exist
  useEffect(() => { ensureCommunityProfiles(); }, []);

  const profile = useMemo(() => userId ? getPublicProfile(userId) : null, [userId]);
  const reviews = useMemo(() => userId ? loadReviews(userId) : [], [userId, submitted]);
  const referrals = useMemo(() => userId ? loadReferrals(userId) : [], [userId]);
  const trust = useMemo(() => calculateTrustScore(reviews, referrals), [reviews, referrals]);
  const tier = useMemo(() => getTrustTier(trust.score), [trust.score]);

  if (!profile) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="text-xl" style={{ fontWeight: 700, color: C.abyss }}>Профиль не найден</h2>
        <p className="mt-2 text-sm" style={{ color: C.tide500 }}>Этот пользователь ещё не заполнил профиль</p>
        <Link to="/app/community" className="inline-flex mt-4 px-4 py-2 rounded-full text-sm text-white" style={{ background: C.tide700, fontWeight: 600 }}>
          Все профили
        </Link>
      </div>
    );
  }

  const isMe = me?.id === profile.id;
  const hue = profile.avatarHue || 210;
  const memberDays = Math.floor((Date.now() - profile.joinedAt) / 86400000);

  const submitReview = () => {
    if (!me || !reviewText.trim()) return;
    saveReview({
      id: "rv-" + Date.now(),
      authorId: me.id,
      authorName: me.name,
      authorRole: me.role,
      authorCompany: me.company,
      targetUserId: profile.id,
      rating: reviewRating,
      text: reviewText.trim(),
      relationship: reviewRelationship.trim() || (me.role === "EMPLOYER" ? `Работодатель` : "Знакомый"),
      createdAt: Date.now(),
    });
    setSubmitted(true);
    setShowReviewForm(false);
    setReviewText("");
    setReviewRelationship("");
    setTimeout(() => setSubmitted(false), 100); // force re-render
  };

  const submitReferral = () => {
    if (!me || !refName.trim() || !refJob.trim()) return;
    saveReferral({
      id: "rf-" + Date.now(),
      referrerId: me.id,
      referrerName: me.name,
      referredId: profile.id,
      referredName: profile.name,
      jobId: "j-" + Date.now(),
      jobTitle: refJob.trim(),
      status: "PENDING",
      createdAt: Date.now(),
    });
    setShowReferralForm(false);
    setRefName(""); setRefJob("");
  };

  const tabs = [
    { id: "about" as const, label: "Профиль", count: profile.experiences.length },
    { id: "reviews" as const, label: "Отзывы", count: reviews.length },
    { id: "trust" as const, label: "Доверие", count: null },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        to="/app/community"
        className="inline-flex items-center gap-1.5 mb-4 text-[12px] px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
        style={{ color: C.tide500, fontWeight: 600 }}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Все профили
      </Link>

      {/* ── Cover ─── */}
      <div className="relative">
        <div
          className="h-36 sm:h-44 rounded-t-[24px] relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, hsl(${hue}, 55%, 22%) 0%, hsl(${hue + 40}, 45%, 15%) 60%, ${C.abyss} 100%)` }}
        >
          {/* Wave */}
          <svg className="absolute bottom-0 w-full" viewBox="0 0 800 30" preserveAspectRatio="none" style={{ height: 24 }}>
            <motion.path
              d="M0,15 C200,25 400,5 600,15 C700,20 750,10 800,15 L800,30 L0,30 Z"
              fill="white"
              animate={{ d: [
                "M0,15 C200,25 400,5 600,15 C700,20 750,10 800,15 L800,30 L0,30 Z",
                "M0,12 C200,5 400,22 600,12 C700,8 750,18 800,12 L800,30 L0,30 Z",
                "M0,15 C200,25 400,5 600,15 C700,20 750,10 800,15 L800,30 L0,30 Z",
              ] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>

          {/* Trust badge on cover */}
          <div className="absolute top-4 right-5 flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <span className="text-sm">{tier.emoji}</span>
            <span className="text-[11px] text-white font-mono" style={{ fontWeight: 700 }}>{tier.label}</span>
          </div>
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-12 left-6">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl border-4 border-white"
            style={{ background: `linear-gradient(135deg, hsl(${hue}, 50%, 38%), hsl(${hue + 25}, 45%, 28%))`, fontWeight: 800, boxShadow: "0 6px 24px rgba(0,0,0,0.12)" }}
          >
            {profile.name.charAt(0)}
          </div>
        </div>

        {/* Actions */}
        {!isMe && me && (
          <div className="absolute -bottom-12 right-6 flex gap-2">
            <button onClick={() => setShowReviewForm(!showReviewForm)} className="h-8 px-4 rounded-full text-[11px] text-white flex items-center gap-1.5" style={{ background: C.tide700, fontWeight: 700 }}>
              <Star className="w-3 h-3" />Оставить отзыв
            </button>
            <button onClick={() => setShowReferralForm(!showReferralForm)} className="h-8 px-4 rounded-full text-[11px] flex items-center gap-1.5 border" style={{ borderColor: C.tide100, color: C.tide700, fontWeight: 700, background: "white" }}>
              <Users className="w-3 h-3" />Рекомендовать
            </button>
          </div>
        )}
      </div>

      {/* ── Info ─── */}
      <div className="pt-16 px-2 mb-6">
        <h1 className="text-2xl" style={{ fontWeight: 800, letterSpacing: "-0.03em", color: C.abyss }}>{profile.name}</h1>
        {profile.headline && <p className="mt-1 text-[14px]" style={{ fontWeight: 500, color: C.depth }}>{profile.headline}</p>}
        <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[12px]" style={{ color: C.tide500, fontWeight: 500 }}>
          <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.district} МКР, Актау</span>
          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{memberDays} дней на платформе</span>
          {profile.company && <span className="inline-flex items-center gap-1"><Briefcase className="w-3 h-3" />{profile.company}</span>}
        </div>

        {/* Trust chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          <TrustChip emoji={tier.emoji} label="Доверие" value={`${trust.score}/100`} color={tier.color} />
          {trust.avgRating > 0 && <TrustChip emoji="⭐" label="Рейтинг" value={trust.avgRating.toFixed(1)} color="#E3A030" />}
          <TrustChip emoji="📝" label="Отзывов" value={`${trust.reviewsReceived}`} color={C.tide700} />
          {trust.referralsSuccessful > 0 && <TrustChip emoji="🤝" label="Успешных рекомендаций" value={`${trust.referralsSuccessful}`} color="#0D5D5A" />}
        </div>
      </div>

      {/* ── Review form overlay ─── */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 rounded-2xl border p-5 mx-2"
            style={{ borderColor: C.tide100, background: "white" }}
          >
            <div className="text-[13px] mb-4" style={{ fontWeight: 700, color: C.abyss }}>Оставить отзыв о {profile.name}</div>
            {/* Stars */}
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setReviewRating(s)} className="text-2xl transition-transform hover:scale-110" style={{ color: s <= reviewRating ? "#E3A030" : "#ddd" }}>
                  ★
                </button>
              ))}
              <span className="ml-2 text-[12px] self-center" style={{ color: C.tide500, fontWeight: 600 }}>{reviewRating}/5</span>
            </div>
            <input value={reviewRelationship} onChange={e => setReviewRelationship(e.target.value)} placeholder="Ваша связь (напр. Работодатель, Коллега)" className="w-full h-9 px-3 mb-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: C.tide100, fontWeight: 500 }} />
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Напишите отзыв..." rows={3} className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none resize-none" style={{ borderColor: C.tide100, fontWeight: 500 }} />
            <div className="flex gap-2 mt-3">
              <button onClick={submitReview} className="h-8 px-4 rounded-lg text-white text-[12px] flex items-center gap-1.5" style={{ background: C.tide700, fontWeight: 700 }}>
                <Send className="w-3 h-3" />Отправить
              </button>
              <button onClick={() => setShowReviewForm(false)} className="h-8 px-4 rounded-lg text-[12px] border" style={{ borderColor: C.tide100, fontWeight: 600, color: C.tide500 }}>Отмена</button>
            </div>
          </motion.div>
        )}
        {showReferralForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 rounded-2xl border p-5 mx-2"
            style={{ borderColor: C.tide100, background: "white" }}
          >
            <div className="text-[13px] mb-3" style={{ fontWeight: 700, color: C.abyss }}>Рекомендовать {profile.name} на вакансию</div>
            <p className="text-[11px] mb-3 px-3 py-2 rounded-lg" style={{ background: "#0D5D5A08", color: "#0D5D5A", fontWeight: 500 }}>
              🤝 Если {profile.name.split(" ")[0]} будет нанят — вы оба получите бонус доверия!
            </p>
            <input value={refJob} onChange={e => setRefJob(e.target.value)} placeholder="На какую вакансию? (напр. Бариста в Coffee Point)" className="w-full h-9 px-3 mb-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: C.tide100, fontWeight: 500 }} />
            <div className="flex gap-2 mt-2">
              <button onClick={submitReferral} className="h-8 px-4 rounded-lg text-white text-[12px] flex items-center gap-1.5" style={{ background: "#0D5D5A", fontWeight: 700 }}>
                <Users className="w-3 h-3" />Рекомендовать
              </button>
              <button onClick={() => setShowReferralForm(false)} className="h-8 px-4 rounded-lg text-[12px] border" style={{ borderColor: C.tide100, fontWeight: 600, color: C.tide500 }}>Отмена</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabs ─── */}
      <div className="flex gap-1 mb-6 px-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="relative px-4 py-2 rounded-xl text-[13px] transition-all"
            style={{
              fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? C.abyss : C.tide500,
              background: tab === t.id ? "white" : "transparent",
              boxShadow: tab === t.id ? "0 1px 6px rgba(0,0,0,0.05)" : "none",
            }}
          >
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: C.tide50, color: C.tide700, fontWeight: 700 }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ─── */}
      <AnimatePresence mode="wait">
        {tab === "about" && (
          <motion.div key="about" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="grid lg:grid-cols-[1fr_280px] gap-5 px-2">
              <div className="space-y-5">
                {/* Bio */}
                {profile.bio && (
                  <Card title="О себе" icon="📝">
                    <p className="text-[14px] leading-relaxed" style={{ color: C.depth, fontWeight: 500 }}>{profile.bio}</p>
                  </Card>
                )}

                {/* Experience */}
                <Card title="Опыт работы" icon="💼">
                  {profile.experiences.length === 0 ? (
                    <p className="text-[13px] italic" style={{ color: C.tide500 }}>Нет записей</p>
                  ) : (
                    <div className="space-y-0">
                      {profile.experiences.map((exp, i) => (
                        <div key={exp.id} className="relative pl-6 pb-5 last:pb-0">
                          {i < profile.experiences.length - 1 && (
                            <div className="absolute left-[7px] top-6 bottom-0 w-px" style={{ background: C.tide100 }} />
                          )}
                          <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2" style={{ borderColor: exp.current ? C.tide700 : C.tide300, background: exp.current ? C.tide700 : "white" }} />
                          <div>
                            <div className="text-[14px] flex items-center gap-2" style={{ fontWeight: 700, color: C.abyss }}>
                              {exp.title}
                              {exp.current && <span className="text-[8px] px-1.5 py-0.5 rounded-full text-white" style={{ background: "#0D5D5A", fontWeight: 800 }}>СЕЙЧАС</span>}
                            </div>
                            {exp.company && <div className="text-[13px] mt-0.5" style={{ fontWeight: 600, color: C.depth }}>{exp.company}</div>}
                            {exp.period && <div className="text-[11px] mt-1 flex items-center gap-1" style={{ color: C.tide500, fontWeight: 500 }}><Clock className="w-3 h-3" />{exp.period}</div>}
                            {exp.description && <p className="mt-2 text-[13px] leading-relaxed" style={{ color: C.depth, fontWeight: 500 }}>{exp.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Skills */}
                {profile.skills.length > 0 && (
                  <Card title="Навыки" icon="🎯">
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map(s => (
                        <span key={s} className="px-3 py-1.5 rounded-lg text-[12px]" style={{ background: C.tide50, color: C.tide700, fontWeight: 600 }}>{s}</span>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Trust card */}
                <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${C.abyss}, ${tier.color}35)` }}>
                  <div className="relative z-10 text-white">
                    <div className="text-[9px] font-mono tracking-[0.2em] mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>ВОЛНА ДОВЕРИЯ</div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{tier.emoji}</span>
                      <div>
                        <div className="text-lg" style={{ fontWeight: 800 }}>{tier.label}</div>
                        <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>{trust.score}/100</div>
                      </div>
                    </div>
                    {/* Trust bar */}
                    <div className="h-1.5 rounded-full mt-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: tier.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${trust.score}%` }}
                        transition={{ duration: 1, ease: EASE.splash }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="rounded-2xl border p-4" style={{ borderColor: C.tide100, background: "white" }}>
                  <div className="text-[9px] font-mono tracking-[0.2em] mb-3" style={{ color: C.tide500, fontWeight: 600 }}>СТАТИСТИКА</div>
                  {[
                    { l: "Отзывов", v: trust.reviewsReceived, e: "📝" },
                    { l: "Ср. оценка", v: trust.avgRating > 0 ? trust.avgRating.toFixed(1) : "—", e: "⭐" },
                    { l: "Рекомендаций", v: trust.referralsMade, e: "🤝" },
                    { l: "Успешных", v: trust.referralsSuccessful, e: "✅" },
                  ].map(s => (
                    <div key={s.l} className="flex items-center justify-between py-1.5">
                      <span className="text-[12px] flex items-center gap-2" style={{ color: C.depth, fontWeight: 500 }}>
                        <span className="text-sm">{s.e}</span>{s.l}
                      </span>
                      <span className="text-[13px] font-mono" style={{ fontWeight: 700, color: C.abyss }}>{s.v}</span>
                    </div>
                  ))}
                </div>

                {/* Badges */}
                {trust.badges.length > 0 && (
                  <div className="rounded-2xl border p-4" style={{ borderColor: C.tide100, background: "white" }}>
                    <div className="text-[9px] font-mono tracking-[0.2em] mb-3" style={{ color: C.tide500, fontWeight: 600 }}>ЗНАЧКИ</div>
                    <div className="flex flex-wrap gap-2">
                      {trust.badges.map(b => (
                        <span key={b} className="px-2.5 py-1 rounded-full text-[10px]" style={{ background: C.tide50, color: C.tide700, fontWeight: 700 }}>
                          {b === "first_review" ? "📝 Первый отзыв" :
                           b === "popular" ? "🔥 Популярный" :
                           b === "connector" ? "🤝 Связной" :
                           b === "networker" ? "🌐 Нетворкер" :
                           b === "top_rated" ? "⭐ Топ рейтинг" :
                           b === "verified" ? "✅ Проверенный" : b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {tab === "reviews" && (
          <motion.div key="reviews" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-2">
            {reviews.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border" style={{ borderColor: C.tide100, background: "white" }}>
                <div className="text-3xl mb-3">💬</div>
                <div className="text-[14px]" style={{ fontWeight: 600, color: C.abyss }}>Пока нет отзывов</div>
                <div className="text-[12px] mt-1" style={{ color: C.tide500 }}>Будьте первым, кто оценит {profile.name}</div>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl border p-5"
                    style={{ borderColor: C.tide100, background: "white" }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm shrink-0"
                        style={{ background: r.authorRole === "EMPLOYER" ? C.abyss : C.tide700, fontWeight: 700 }}
                      >
                        {r.authorName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px]" style={{ fontWeight: 700, color: C.abyss }}>{r.authorName}</span>
                          {r.authorRole === "EMPLOYER" && r.authorCompany && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: C.abyss + "08", color: C.abyss, fontWeight: 600 }}>
                              {r.authorCompany}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] mt-0.5" style={{ color: C.tide500, fontWeight: 500 }}>{r.relationship}</div>
                        <div className="mt-1.5 text-[13px]" style={{ color: "#E3A030", letterSpacing: "0.05em" }}>
                          {renderStars(r.rating)}
                        </div>
                        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: C.depth, fontWeight: 500 }}>"{r.text}"</p>
                        <div className="mt-2 text-[10px]" style={{ color: C.tide500 }}>
                          {new Date(r.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === "trust" && (
          <motion.div key="trust" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-2 space-y-5">
            {/* Trust gauge */}
            <div className="rounded-2xl border p-6 text-center" style={{ borderColor: C.tide100, background: "white" }}>
              <div className="text-[10px] font-mono tracking-[0.2em] mb-6" style={{ color: C.tide500, fontWeight: 600 }}>УРОВЕНЬ ДОВЕРИЯ</div>
              <div className="relative w-48 h-48 mx-auto mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke={C.tide50} strokeWidth="6" />
                  <motion.circle
                    cx="50" cy="50" r="42"
                    fill="none" stroke={tier.color} strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${trust.score * 2.64} 264`}
                    initial={{ strokeDasharray: "0 264" }}
                    animate={{ strokeDasharray: `${trust.score * 2.64} 264` }}
                    transition={{ duration: 1.5, ease: EASE.splash }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl mb-1">{tier.emoji}</span>
                  <span className="text-2xl" style={{ fontWeight: 800, color: C.abyss }}>{trust.score}</span>
                  <span className="text-[10px]" style={{ color: C.tide500, fontWeight: 600 }}>/100</span>
                </div>
              </div>
              <div className="text-lg" style={{ fontWeight: 700, color: tier.color }}>{tier.label}</div>
              <p className="text-[12px] mt-1" style={{ color: C.tide500, fontWeight: 500 }}>{tier.description}</p>
            </div>

            {/* Trust tiers roadmap */}
            <div className="rounded-2xl border p-5" style={{ borderColor: C.tide100, background: "white" }}>
              <div className="text-[10px] font-mono tracking-[0.2em] mb-4" style={{ color: C.tide500, fontWeight: 600 }}>ПУТЬ ДОВЕРИЯ</div>
              {TRUST_TIERS.map((t, i) => {
                const active = trust.score >= t.minScore;
                const current = t.id === tier.id;
                return (
                  <div key={t.id} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: C.tide50, opacity: active ? 1 : 0.35 }}>
                    <span className="text-xl w-8 text-center" style={{ filter: active ? "none" : "grayscale(1)" }}>{t.emoji}</span>
                    <div className="flex-1">
                      <div className="text-[13px] flex items-center gap-2" style={{ fontWeight: 700, color: active ? C.abyss : "#999" }}>
                        {t.label}
                        {current && <span className="text-[8px] px-1.5 py-0.5 rounded-full text-white" style={{ background: t.color, fontWeight: 800 }}>ВЫ</span>}
                      </div>
                      <div className="text-[11px]" style={{ color: active ? C.tide500 : "#ccc", fontWeight: 500 }}>{t.description}</div>
                    </div>
                    <span className="text-[11px] font-mono" style={{ color: active ? t.color : "#ddd", fontWeight: 700 }}>{t.minScore}+</span>
                  </div>
                );
              })}
            </div>

            {/* Referral history */}
            {referrals.length > 0 && (
              <div className="rounded-2xl border p-5" style={{ borderColor: C.tide100, background: "white" }}>
                <div className="text-[10px] font-mono tracking-[0.2em] mb-4" style={{ color: C.tide500, fontWeight: 600 }}>ИСТОРИЯ РЕКОМЕНДАЦИЙ</div>
                {referrals.map(ref => (
                  <div key={ref.id} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: C.tide50 }}>
                    <span className="text-lg">
                      {ref.status === "HIRED" ? "✅" : ref.status === "REJECTED" ? "❌" : "⏳"}
                    </span>
                    <div className="flex-1">
                      <div className="text-[13px]" style={{ fontWeight: 600, color: C.abyss }}>
                        {ref.referrerName} → {ref.referredName}
                      </div>
                      <div className="text-[11px]" style={{ color: C.tide500, fontWeight: 500 }}>{ref.jobTitle}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{
                      background: ref.status === "HIRED" ? "#0D5D5A10" : ref.status === "REJECTED" ? "#E8404010" : C.tide50,
                      color: ref.status === "HIRED" ? "#0D5D5A" : ref.status === "REJECTED" ? "#E84040" : C.tide500,
                      fontWeight: 700,
                    }}>
                      {ref.status === "HIRED" ? "Нанят" : ref.status === "REJECTED" ? "Отклонён" : "Ожидание"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* How trust works */}
            <div className="rounded-2xl border p-5" style={{ borderColor: C.tide100, background: C.tide50 }}>
              <div className="text-[13px] mb-3" style={{ fontWeight: 700, color: C.abyss }}>🤝 Как работает система доверия?</div>
              <div className="space-y-2 text-[12px]" style={{ color: C.depth, fontWeight: 500, lineHeight: 1.6 }}>
                <p>• <b>Отзывы:</b> Работодатели и коллеги оставляют вам оценки и отзывы</p>
                <p>• <b>Рекомендации:</b> Рекомендуйте знакомых на вакансии. Если их наймут — вы оба получаете +12 доверия</p>
                <p>• <b>Стабильность:</b> 3+ положительных отзыва подряд дают бонус</p>
                <p>• <b>Риск:</b> Неудачные рекомендации снижают доверие на -2</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Helpers ─── */
function Card({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: C.tide100, background: "white" }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">{icon}</span>
        <span className="text-[13px]" style={{ fontWeight: 700, color: C.abyss }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function TrustChip({ emoji, label, value, color }: { emoji: string; label: string; value: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px]" style={{ background: `${color}08`, border: `1px solid ${color}15`, fontWeight: 600 }}>
      <span>{emoji}</span>
      <span style={{ color: C.tide500 }}>{label}</span>
      <span style={{ fontWeight: 800, color }}>{value}</span>
    </span>
  );
}
