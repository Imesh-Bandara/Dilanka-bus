import test from "node:test";
import assert from "node:assert/strict";
import { routes } from "../src/lib/seed";
import { journeyGeometry } from "../src/lib/journey-map";

test("every seeded boarding town has a finite coordinate within Sri Lanka", () => {
  for (const route of routes)
    for (const stop of journeyGeometry(route).stops) {
      assert.ok(stop.coordinate, `${route.id}: ${stop.name}`);
      const [lat, lng] = stop.coordinate;
      assert.ok(lat > 5.8 && lat < 10 && lng > 79.5 && lng < 82);
    }
});
test("both highway directions traverse the southern corridor without inventing boarding stops", () => {
  for (const id of [
    "ampara-colombo-highway",
    "colombo-ampara-highway",
    "monaragala-colombo",
  ]) {
    const route = routes.find((r) => r.id === id)!;
    const geometry = journeyGeometry(route);
    assert.ok(geometry.highway.length > 10);
    assert.deepEqual(geometry.points[0], geometry.stops[0].coordinate);
    assert.deepEqual(geometry.points.at(-1), geometry.stops.at(-1)!.coordinate);
    assert.deepEqual(
      geometry.stops.map((s) => s.name),
      route.stops.map((s) => s.name),
    );
    assert.ok(
      geometry.points.some(([lat]) => lat < 6.1),
      "corridor must continue south through Matara, not cut inland",
    );
    const makumbura = geometry.points.findIndex(
      (p) =>
        p === geometry.stops.find((s) => s.name === "Makumbura")!.coordinate,
    );
    const thanamalvila = geometry.points.findIndex(
      (p) =>
        p === geometry.stops.find((s) => s.name === "Thanamalvila")!.coordinate,
    );
    assert.ok(Math.abs(makumbura - thanamalvila) > 10);
  }
});
test("hill-country and coastal services do not show an expressway segment", () => {
  for (const route of routes.filter((r) => /kandy|oluvil|matara/.test(r.id)))
    assert.equal(journeyGeometry(route).highway.length, 0);
});
