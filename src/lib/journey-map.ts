import type { Route } from "./types";
export type Coordinate = [number, number];
// Rounded town centres for a corridor preview, never exact boarding coordinates.
export const townCentres: Record<string, Coordinate> = {
  Colombo: [6.935, 79.851],
  Kadawatha: [7.001, 79.953],
  Kandy: [7.291, 80.637],
  Kurunegala: [7.486, 80.364],
  Mahiyanganaya: [7.331, 81.004],
  "Maha Oya": [7.53, 81.355],
  Uhana: [7.364, 81.636],
  Ampara: [7.297, 81.674],
  Siyambalanduwa: [6.91, 81.551],
  Monaragala: [6.872, 81.35],
  Buttala: [6.758, 81.235],
  Wellawaya: [6.736, 81.103],
  Thanamalvila: [6.439, 81.134],
  Makumbura: [6.84, 79.972],
  Hingurana: [7.227, 81.668],
  Hambantota: [6.125, 81.119],
  Tangalle: [6.024, 80.794],
  Dikwella: [5.971, 80.695],
  Matara: [5.949, 80.549],
  Kalmunai: [7.414, 81.827],
  Oluvil: [7.291, 81.861],
};
export const expresswayRoute = (r: Route) =>
  /highway/.test(r.id) ||
  r.id === "monaragala-colombo" ||
  /expressway/i.test(r.via);
// E01 is Kottawa–Mattala (RDA). These intermediate points illustrate the
// southern corridor; interchanges are not passenger boarding stops.
const southernExpressway: Coordinate[] = [
  [6.288, 81.133],
  [6.286, 80.992],
  [6.229, 80.889],
  [6.151, 80.794],
  [6.071, 80.677],
  [6.015, 80.539],
  [6.049, 80.416],
  [6.093, 80.277],
  [6.191, 80.193],
  [6.294, 80.14],
  [6.434, 80.088],
  [6.586, 80.027],
  [6.704, 79.998],
  [6.805, 79.974],
  townCentres.Makumbura,
];
export function journeyGeometry(route: Route) {
  const stops = route.stops.map((s) => ({
    ...s,
    coordinate: townCentres[s.name],
  }));
  const highway = expresswayRoute(route);
  const points: Coordinate[] = [];
  for (let i = 0; i < stops.length; i++) {
    if (stops[i].coordinate) points.push(stops[i].coordinate);
    const pair = [stops[i].name, stops[i + 1]?.name];
    if (
      highway &&
      pair.includes("Thanamalvila") &&
      pair.includes("Makumbura")
    ) {
      points.push(
        ...(pair[0] === "Thanamalvila"
          ? southernExpressway.slice(0, -1)
          : [...southernExpressway].reverse().slice(1)),
      );
    }
  }
  return { stops, points, highway: highway ? southernExpressway : [] };
}
