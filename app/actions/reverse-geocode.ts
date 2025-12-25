"use server";

export type ReverseGeoResult = {
  city: string | null;
  state: string | null; // region
  country: string | null;
};

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeoResult> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) throw new Error("Missing MAPBOX_SECRET_TOKEN");

  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
    `?types=place,region,country&language=en&access_token=${token}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Reverse geocode failed");

  const data = await res.json();
  const features: Array<{ place_type: string[]; text: string }> =
    data.features ?? [];

  const city =
    features.find((f) => f.place_type?.includes("place"))?.text ?? null;
  const state =
    features.find((f) => f.place_type?.includes("region"))?.text ?? null;
  const country =
    features.find((f) => f.place_type?.includes("country"))?.text ?? null;

  return { city, state, country };
}
