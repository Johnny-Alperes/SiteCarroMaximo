import { NextRequest, NextResponse } from "next/server";

function haversineKm(oLat: number, oLon: number, dLat: number, dLon: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLatR = toRad(dLat - oLat);
  const dLonR = toRad(dLon - oLon);
  const a = Math.sin(dLatR / 2) ** 2 + Math.cos(toRad(oLat)) * Math.cos(toRad(dLat)) * Math.sin(dLonR / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const oLat = Number(sp.get("oLat"));
  const oLon = Number(sp.get("oLon"));
  const dLat = Number(sp.get("dLat"));
  const dLon = Number(sp.get("dLon"));
  if (![oLat, oLon, dLat, dLon].every(Number.isFinite)) {
    return NextResponse.json({ distance: null }, { status: 400 });
  }

  try {
    const coords = `${oLon},${oLat};${dLon},${dLat}`;
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=false`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const meters = data?.routes?.[0]?.distance;
      if (typeof meters === "number" && Number.isFinite(meters) && meters > 0) {
        return NextResponse.json({ distance: Math.round(meters / 1000) });
      }
    }
  } catch {
    // fallback
  }

  return NextResponse.json({ distance: Math.round(haversineKm(oLat, oLon, dLat, dLon)) });
}
