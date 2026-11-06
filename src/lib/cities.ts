export interface City {
  id: string;
  name: string;
  state: string;
  country: string;
  label: string;
  lat: number;
  lon: number;
}

interface PhotonFeature {
  properties?: {
    osm_id?: number;
    osm_type?: string;
    name?: string;
    state?: string;
    country?: string;
    countrycode?: string;
    type?: string;
  };
  geometry?: {
    coordinates?: [number, number];
  };
}

const STATE_ABBREVIATIONS: Record<string, string> = {
  Acre: "AC",
  Alagoas: "AL",
  Amapá: "AP",
  Amazonas: "AM",
  Bahia: "BA",
  Ceará: "CE",
  "Distrito Federal": "DF",
  "Espírito Santo": "ES",
  Goiás: "GO",
  Maranhão: "MA",
  "Mato Grosso": "MT",
  "Mato Grosso do Sul": "MS",
  "Minas Gerais": "MG",
  Pará: "PA",
  Paraíba: "PB",
  Paraná: "PR",
  Pernambuco: "PE",
  Piauí: "PI",
  "Rio de Janeiro": "RJ",
  "Rio Grande do Norte": "RN",
  "Rio Grande do Sul": "RS",
  Rondônia: "RO",
  Roraima: "RR",
  "Santa Catarina": "SC",
  "São Paulo": "SP",
  Sergipe: "SE",
  Tocantins: "TO",
};

const VALID_CITY_TYPES = new Set(["city", "town", "village", "municipality"]);

function getStateAbbreviation(state?: string) {
  if (!state) return "";
  return STATE_ABBREVIATIONS[state] ?? state;
}

export async function searchCities(query: string, signal?: AbortSignal): Promise<City[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=10&bbox=-74,-34,-34,6`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error("Não foi possível buscar as cidades.");
  }

  const data = (await response.json()) as { features?: PhotonFeature[] };
  const features = data.features ?? [];
  const seen = new Set<string>();
  const cities: City[] = [];

  for (const feature of features) {
    const properties = feature.properties;
    const coordinates = feature.geometry?.coordinates;
    if (!properties?.name || !coordinates) continue;
    if (properties.countrycode !== "BR") continue;
    if (!VALID_CITY_TYPES.has(properties.type ?? "")) continue;

    const [lon, lat] = coordinates;
    if (typeof lat !== "number" || typeof lon !== "number") continue;

    const state = getStateAbbreviation(properties.state);
    const key = `${properties.name}|${state}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    cities.push({
      id: `${properties.osm_type ?? "city"}${properties.osm_id ?? key}`,
      name: properties.name,
      state,
      country: properties.country ?? "Brasil",
      label: state ? `${properties.name} - ${state}` : properties.name,
      lat,
      lon,
    });
  }

  return cities.slice(0, 6);
}

function haversineKm(origin: City, destination: City) {
  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLat = toRadians(destination.lat - origin.lat);
  const deltaLon = toRadians(destination.lon - origin.lon);
  const originLat = toRadians(origin.lat);
  const destinationLat = toRadians(destination.lat);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(originLat) * Math.cos(destinationLat) * Math.sin(deltaLon / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

export async function getRouteDistanceKm(
  origin: City,
  destination: City,
  signal?: AbortSignal
): Promise<number> {
  try {
    const coordinates = `${origin.lon},${origin.lat};${destination.lon},${destination.lat}`;
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=false`,
      { signal }
    );

    if (response.ok) {
      const data = await response.json();
      const distanceInMeters = data?.routes?.[0]?.distance;
      if (typeof distanceInMeters === "number" && Number.isFinite(distanceInMeters) && distanceInMeters > 0) {
        return Math.round(distanceInMeters / 1000);
      }
    }
  } catch {
    // Em caso de falha da rota, usa a distância em linha reta como fallback.
  }

  return Math.round(haversineKm(origin, destination));
}
