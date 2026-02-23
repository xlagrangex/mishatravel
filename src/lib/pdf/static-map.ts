import StaticMaps from "staticmaps";
import type { LocationPoint } from "./quote-pdf-data";

/**
 * Generate a static PNG map image from location coordinates.
 * Returns a Buffer with the PNG or null if no valid coordinates.
 */
export async function generateStaticMap(
  locations: LocationPoint[]
): Promise<Buffer | null> {
  // Parse valid coordinates
  const points = locations
    .filter((l) => l.coordinate)
    .map((l) => {
      const parts = l.coordinate!.split(",").map((s) => parseFloat(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { lat: parts[0], lng: parts[1], nome: l.nome };
      }
      return null;
    })
    .filter(Boolean) as { lat: number; lng: number; nome: string }[];

  if (points.length === 0) return null;

  try {
    const map = new StaticMaps({
      width: 700,
      height: 350,
      paddingX: 40,
      paddingY: 40,
      tileUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    });

    // Add markers
    for (const point of points) {
      map.addMarker({
        coord: [point.lng, point.lat],
        img: undefined as any, // use default
        width: 24,
        height: 24,
      });
    }

    // Add line connecting the points
    if (points.length > 1) {
      map.addLine({
        coords: points.map((p) => [p.lng, p.lat]),
        color: "#C41E2FCC",
        width: 3,
      });
    }

    await map.render();
    return await map.image.buffer("image/png");
  } catch (err) {
    console.error("Error generating static map:", err);
    return null;
  }
}
