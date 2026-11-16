import { NextRequest, NextResponse } from "next/server";

type NominatimItem = {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name?: string;
  addresstype?: string;
  type?: string;
  class?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    hamlet?: string;
    suburb?: string;
    county?: string;
    state?: string;
    state_district?: string;
    country?: string;
    country_code?: string;
  };
};

const BR_STATE: Record<string, string> = {
  Acre: "AC", Alagoas: "AL", Amapá: "AP", Amazonas: "AM", Bahia: "BA", Ceará: "CE",
  "Distrito Federal": "DF", "Espírito Santo": "ES", Goiás: "GO", Maranhão: "MA",
  "Mato Grosso": "MT", "Mato Grosso do Sul": "MS", "Minas Gerais": "MG", Pará: "PA",
  Paraíba: "PB", Paraná: "PR", Pernambuco: "PE", Piauí: "PI", "Rio de Janeiro": "RJ",
  "Rio Grande do Norte": "RN", "Rio Grande do Sul": "RS", Rondônia: "RO", Roraima: "RR",
  "Santa Catarina": "SC", "São Paulo": "SP", Sergipe: "SE", Tocantins: "TO",
};

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const tokens = (s: string) => norm(s).split(/\s+/).filter(Boolean);

function scoreMatch(name: string, label: string, q: string) {
  const nn = norm(name);
  const nl = norm(label);
  const nq = norm(q);
  const qt = tokens(q);
  const nt = tokens(name);
  let s = 0;
  if (nn === nq || nl === nq) s = 140;
  else if (nn.startsWith(nq)) s = 110;
  else if (nl.startsWith(nq) || nn.includes(nq)) s = 90;
  else if (nl.includes(nq)) s = 70;
  if (qt.length > 1 && qt.every((t) => nt.some((w) => w.startsWith(t) || w.includes(t)))) s = Math.max(s, 100);
  if (qt.length > 1 && qt.every((t) => norm(label).includes(t))) s = Math.max(s, 80);
  if (s === 0) s = 10;
  return s;
}

async function nominatimSearch(params: URLSearchParams) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: { "User-Agent": "SiteCarroMaximo/1.0 (travel-search)" },
    cache: "no-store",
  });
  if (!res.ok) return [] as NominatimItem[];
  const data = await res.json();
  return Array.isArray(data) ? (data as NominatimItem[]) : [];
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json([]);

  const base = {
    format: "jsonv2",
    addressdetails: "1",
    limit: "12",
    "accept-language": "pt-BR,pt,en",
  };

  const queries: URLSearchParams[] = [new URLSearchParams({ ...base, q })];
  queries.push(new URLSearchParams({ ...base, city: q }));
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const prefix = words.slice(0, -1).join(" ");
    if (prefix.length >= 2) {
      queries.push(new URLSearchParams({ ...base, q: prefix, city: prefix }));
    }
  }

  const batches = await Promise.all(queries.map((p) => nominatimSearch(p)));
  const nq = norm(q);
  const seen = new Set<string>();
  const out: Array<{ id: string; name: string; state: string; country: string; label: string; lat: number; lon: number; _s: number }> = [];

  for (const data of batches) {
    for (const item of data) {
      const lat = Number(item.lat);
      const lon = Number(item.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      const a = item.address || {};
      const name = (item.name || a.city || a.town || a.village || a.municipality || a.hamlet || a.suburb || a.county || a.state || "").trim();
      if (!name) continue;
      const country = a.country || "";
      const cc = (a.country_code || "").toUpperCase();
      let state = a.state || a.state_district || "";
      if (cc === "BR" && BR_STATE[state]) state = BR_STATE[state];

      const parts = [name];
      if (state && norm(state) !== norm(name)) parts.push(state);
      if (country && norm(country) !== norm(name) && norm(country) !== norm(state)) parts.push(country);
      const label = parts.join(" - ");

      const key = norm(`${name}|${state}|${country}`);
      if (seen.has(key)) continue;
      seen.add(key);

      let _s = scoreMatch(name, label, q);
      const t = item.addresstype || item.type || "";
      if (["city", "town", "village", "municipality", "administrative"].includes(t)) _s += 10;
      out.push({ id: String(item.place_id), name, state, country, label, lat, lon, _s });
    }
  }

  out.sort((a, b) => b._s - a._s || a.label.localeCompare(b.label, "pt-BR"));
  return NextResponse.json(out.slice(0, 8).map(({ _s, ...r }) => r));
}

  out.sort((a, b) => b._s - a._s || a.label.localeCompare(b.label, "pt-BR"));
  return NextResponse.json(out.slice(0, 8).map(({ _s, ...r }) => r));
}
