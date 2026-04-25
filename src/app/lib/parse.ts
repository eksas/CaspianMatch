export type ParsedQuery = { role?: string; district?: number; minSalary?: number };

export type ParsedAd = {
  title: string;
  salary: string;
  microdistrict: number | null;
  requirements: string[];
  category: string;
  description: string;
};

const ROLE_MAP: Record<string, { cat: string; pretty: string }> = {
  waiter: { cat: "waiter", pretty: "Waiter" },
  официант: { cat: "waiter", pretty: "Waiter" },
  barista: { cat: "waiter", pretty: "Barista" },
  бариста: { cat: "waiter", pretty: "Barista" },
  courier: { cat: "courier", pretty: "Courier" },
  курьер: { cat: "courier", pretty: "Courier" },
  cashier: { cat: "cashier", pretty: "Cashier" },
  кассир: { cat: "cashier", pretty: "Cashier" },
  cook: { cat: "cook", pretty: "Cook" },
  повар: { cat: "cook", pretty: "Cook" },
  retail: { cat: "retail", pretty: "Retail" },
  продавец: { cat: "retail", pretty: "Shop Assistant" },
};

export function parseQuery(q: string): ParsedQuery {
  const lower = q.toLowerCase();
  const out: ParsedQuery = {};
  for (const k of Object.keys(ROLE_MAP)) {
    if (lower.includes(k)) { out.role = ROLE_MAP[k].cat; break; }
  }
  const dm = lower.match(/\b(\d{1,2})(?:\s*(?:th|st|nd|rd|мкр|microdistrict|район|мр))?\b/);
  if (dm) {
    const n = parseInt(dm[1]);
    if (n >= 1 && n <= 40) out.district = n;
  }
  const sm = lower.match(/(\d{2,3})\s*k/);
  if (sm) out.minSalary = parseInt(sm[1]) * 1000;
  return out;
}

export function parseAd(raw: string): ParsedAd {
  const lower = raw.toLowerCase();
  let cat = "waiter";
  let pretty = "Position";
  for (const k of Object.keys(ROLE_MAP)) {
    if (lower.includes(k)) { cat = ROLE_MAP[k].cat; pretty = ROLE_MAP[k].pretty; break; }
  }
  const dm = lower.match(/(\d{1,2})\s*(мкр|мр|район|microdistrict)/);
  const sm = raw.match(/(\d[\d\s]{2,})\s*(тг|тенге|kzt|₸)/i);
  const reqs: string[] = [];
  if (/опыт|experience/i.test(raw)) reqs.push("Experience required");
  if (/english|англ/i.test(raw)) reqs.push("English");
  if (/смен|shift|2\/2/i.test(raw)) reqs.push("Shift work");
  if (/18\+/.test(raw)) reqs.push("18+");
  if (reqs.length === 0) reqs.push("No special requirements");
  return {
    title: pretty,
    salary: sm ? sm[0].replace(/\s+/g, " ").trim() : "Negotiable",
    microdistrict: dm ? parseInt(dm[1]) : null,
    requirements: reqs,
    category: cat,
    description: raw.trim(),
  };
}
