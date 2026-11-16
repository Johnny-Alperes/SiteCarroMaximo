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

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json([]);

  const params = new URLSearchParams({
    q,
    format: "jsonv2",
    addressdetails: "1",
    limit: "12",
    "accept-language": "pt-BR,pt,en",
  });

  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: { "User-Agent": "SiteCarroMaximo/1.0 (travel-search)" },
    cache: "no-store",
  });
  if (!res.ok) return NextResponse.json([]);

  const data = (await res.json()) as NominatimItem[];
  if (!Array.isArray(data)) return NextResponse.json([]);

  const nq = norm(q);
  const seen = new Set<string>();
  const out: Array<{ id: string; name: string; state: string; country: string; label: string; lat: number; lon: number; _s: number }> = [];

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

    const nn = norm(name);
    const nl = norm(label);
    let _s = 0;
    if (nn === nq || nl === nq) _s = 120;
    else if (nn.startsWith(nq)) _s = 95;
    else if (nl.startsWith(nq) || nn.includes(nq)) _s = 75;
    else if (nl.includes(nq)) _s = 55;
    else _s = 20;
    const t = item.addresstype || item.type || "";
    if (["city", "town", "village", "municipality", "administrative"].includes(t)) _s += 10;

    out.push({ id: String(item.place_id), name, state, country, label, lat, lon, _s });
  }

  out.sort((a, b) => b._s - a._s || a.label.localeCompare(b.label, "pt-BR"));
  return NextResponse.json(out.slice(0, 8).map(({ _s, ...r }) => r));
}
