import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, MapPin, Briefcase, Award, Shield } from "lucide-react";
import { C } from "../lib/design";
import { loadPublicProfiles, ensureCommunityProfiles, type UserProfile, getTrustTier } from "../lib/trust";

export function Community() {
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<UserProfile[]>([]);

  useEffect(() => {
    ensureCommunityProfiles();
    setProfiles(loadPublicProfiles());
  }, []);

  const filtered = profiles.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    (p.headline && p.headline.toLowerCase().includes(query.toLowerCase())) ||
    p.skills.some(s => s.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-[12px] uppercase tracking-[0.12em] text-slate-500 mb-2" style={{ fontWeight: 700 }}>Сообщество</div>
      <h1 className="text-3xl mb-1" style={{ fontWeight: 800, letterSpacing: "-0.03em", color: C.abyss }}>
        Кандидаты и коллеги
      </h1>
      <p className="text-sm mb-6" style={{ color: C.tide500, fontWeight: 500 }}>
        Ищите профессионалов по навыкам, смотрите их опыт работы и читайте отзывы.
      </p>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.tide500 }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по имени, должности или навыкам..."
          className="w-full h-12 pl-11 pr-4 rounded-xl border text-[13px] outline-none transition-all"
          style={{ borderColor: C.tide100, fontWeight: 500, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
        />
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(p => {
          const hue = p.avatarHue || 210;
          const tier = getTrustTier(p.trust.score);
          return (
            <Link
              key={p.id}
              to={`/app/u/${p.id}`}
              className="group rounded-2xl border p-5 flex flex-col hover:border-blue-200 transition-all bg-white"
              style={{ borderColor: C.tide100, boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}
            >
              <div className="flex gap-4">
                {/* Avatar */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl shrink-0 border"
                  style={{ background: `linear-gradient(135deg, hsl(${hue}, 50%, 38%), hsl(${hue + 25}, 45%, 28%))`, fontWeight: 800, borderColor: "rgba(255,255,255,0.1)" }}
                >
                  {p.name.charAt(0)}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className="text-[15px] truncate pr-2" style={{ fontWeight: 700, color: C.abyss }}>{p.name}</h3>
                    {/* Trust badge */}
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] shrink-0" style={{ background: `${tier.color}15`, color: tier.color, fontWeight: 700 }}>
                      <Shield className="w-2.5 h-2.5" />
                      {tier.label}
                    </div>
                  </div>
                  
                  {p.headline && (
                    <div className="text-[12px] mt-0.5 truncate" style={{ color: C.depth, fontWeight: 500 }}>
                      {p.headline}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2 text-[11px]" style={{ color: C.tide500 }}>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.district} МКР</span>
                    {p.company && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3 truncate max-w-[80px]" />{p.company}</span>}
                  </div>
                </div>
              </div>

              {/* Skills preview */}
              {p.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5 h-[26px] overflow-hidden">
                  {p.skills.slice(0, 4).map(s => (
                    <span key={s} className="px-2 py-1 rounded-md text-[10px]" style={{ background: C.tide50, color: C.tide700, fontWeight: 600 }}>
                      {s}
                    </span>
                  ))}
                  {p.skills.length > 4 && (
                    <span className="px-2 py-1 rounded-md text-[10px]" style={{ background: C.tide50, color: C.tide500, fontWeight: 600 }}>
                      +{p.skills.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* Stats footer */}
              <div className="mt-4 pt-4 border-t flex justify-between text-[11px]" style={{ borderColor: C.tide50, fontWeight: 600 }}>
                <span className="flex gap-1" style={{ color: C.tide500 }}><Award className="w-3.5 h-3.5" /> Опыт: {p.experiences.length} мест</span>
                <span className="flex gap-1" style={{ color: "#E3A030" }}>⭐ {p.trust.avgRating > 0 ? p.trust.avgRating.toFixed(1) : "Нет оценок"} ({p.trust.reviewsReceived})</span>
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-12 rounded-2xl border" style={{ borderColor: C.tide100, background: "white" }}>
            <div className="text-[14px]" style={{ fontWeight: 600, color: C.abyss }}>Никого не найдено</div>
            <div className="text-[12px] mt-1" style={{ color: C.tide500 }}>Попробуйте изменить запрос</div>
          </div>
        )}
      </div>
    </div>
  );
}
