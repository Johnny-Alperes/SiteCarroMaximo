import { NextRequest, NextResponse } from "next/server";

type PhotonFeature = {
  properties?: {
    osm_id?: number;
    osm_type?: string;
    name?: string;
    state?: string;
    country?: string;
    countrycode?: string;
    type?: string;
  };
  geometry?: { coordinates?: [number, number] };
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

function scoreMatch(name: string, label: string, q: string, type?: string) {
  const nn = norm(name);
  const nl = norm(label);
  const nq = norm(q);
  const qt = nq.split(/\s+/).filter(Boolean);
  const nt = nn.split(/\s+/).filter(Boolean);
  let s = 0;
  if (nn === nq || nl === nq) s = 150;
  else if (nn.startsWith(nq)) s = 120;
  else if (nt.some((w) => w.startsWith(nq))) s = 105;
  else if (nn.includes(nq)) s = 85;
  else if (nl.includes(nq)) s = 65;

  if (qt.length > 1) {
    if (qt.every((t) => nt.some((w) => w.startsWith(t)))) s = Math.max(s, 130);
    else if (qt.every((t) => nt.some((w) => w.startsWith(t) || w.includes(t)))) s = Math.max(s, 115);
    else if (qt.every((t) => nl.includes(t))) s = Math.max(s, 90);
  }

  if (s === 0) s = 10;
  if (type === "city" || type === "municipality") s += 20;
  else if (type === "town" || type === "village" || type === "locality") s += 15;
  else if (type === "district" || type === "county" || type === "state") s += 5;
  return s;
}

async function fetchPhoton(q: string) {
  const params = new URLSearchParams({ q, limit: "15", lang: "pt" });
  const res = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) return [] as PhotonFeature[];
  const data = await res.json();
  return Array.isArray(data?.features) ? (data.features as PhotonFeature[]) : [];
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json([]);

  const words = q.split(/\s+/).filter(Boolean);
  const queries = [q];
  if (words.length > 1) {
    const prefix = words.slice(0, -1).join(" ");
    if (prefix.length >= 2 && norm(prefix) !== norm(q)) queries.push(prefix);
  }

  const batches = await Promise.all(queries.map((term) => fetchPhoton(term)));
  const seen = new Set<string>();
  const out: Array<{ id: string; name: string; state: string; country: string; label: string; lat: number; lon: number; _s: number }> = [];

  for (const features of batches) {
    for (const feature of features) {
      const p = feature.properties || {};
      const coords = feature.geometry?.coordinates;
      const name = (p.name || "").trim();
      if (!name || !coords) continue;
      const [lon, lat] = coords;
      if (typeof lat !== "number" || typeof lon !== "number") continue;

      const country = p.country || "";
      let state = p.state || "";
      if (p.countrycode === "BR" && BR_STATE[state]) state = BR_STATE[state];

      const parts = [name];
      if (state && norm(state) !== norm(name)) parts.push(state);
      if (country && norm(country) !== norm(name) && norm(country) !== norm(state)) parts.push(country);
      const label = parts.join(" - ");

      const key = norm(`${name}|${state}|${country}`);
      if (seen.has(key)) continue;
      seen.add(key);

      out.push({
        id: `${p.osm_type || "place"}-${p.osm_id || key}`,
        name,
        state,
        country,
        label,
        lat,
        lon,
        _s: scoreMatch(name, label, q, p.type),
      });
    }
  }

  out.sort((a, b) => b._s - a._s || a.label.localeCompare(b.label, "pt-BR"));
  return NextResponse.json(out.slice(0, 8).map(({ _s, ...r }) => r));
}

  out.sort((a, b) => b._s - a._s || a.label.localeCompare(b.label, "pt-BR"));
  return NextResponse.json(out.slice(0, 8).map(({ _s, ...r }) => r));
}
