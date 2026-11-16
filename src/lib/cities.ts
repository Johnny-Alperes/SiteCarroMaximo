export interface City {
  id: string;
  name: string;
  state: string;
  country: string;
  label: string;
  lat: number;
  lon: number;
}

export async function searchCities(query: string, signal?: AbortSignal): Promise<City[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const res = await fetch(`/api/places/search?q=${encodeURIComponent(q)}`, { signal, cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as City[]) : [];
  } catch {
    return [];
  }
}

export async function getRouteDistanceKm(origin: City, destination: City, signal?: AbortSignal): Promise<number> {
  try {
    const params = new URLSearchParams({
      oLat: String(origin.lat),
      oLon: String(origin.lon),
      dLat: String(destination.lat),
      dLon: String(destination.lon),
    });
    const res = await fetch(`/api/places/distance?${params.toString()}`, { signal, cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (typeof data?.distance === "number" && Number.isFinite(data.distance)) return data.distance;
    }
  } catch {
    // fallback local
  }
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(destination.lat - origin.lat);
  const dLon = toRad(destination.lon - origin.lon);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(origin.lat)) * Math.cos(toRad(destination.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}
