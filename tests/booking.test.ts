import { test, before } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PDFDocument } from "pdf-lib";
import QRCode from "qrcode";
import jsQR from "jsqr";
process.env.DEMO_DB_PATH = `.data/test-${randomUUID()}`;
process.env.STAFF_PASSWORD = randomUUID();
process.env.TICKET_SECRET = randomUUID();
import { db } from "../src/lib/db";
import * as s from "../src/lib/service";
import { ticketPdf } from "../src/lib/pdf";
import { sriDate } from "../src/lib/types";
let tripId: string;
const owner = () => randomUUID();
before(async () => {
  const d = await db();
  const t = (await s.trips({ all: true })).find(
    (t) => t.route_id === "ampara-colombo-kandy",
  )!;
  tripId = `test-${randomUUID()}`;
  await d.query(
    `INSERT INTO trips VALUES($1,$2,$3,$4,$5,269500,10000,'open')`,
    [
      tripId,
      t.route_id,
      t.bus_id,
      new Date(Date.now() + 4 * 3600000).toISOString(),
      new Date(Date.now() + 10 * 3600000).toISOString(),
    ],
  );
  await d.query(
    "INSERT INTO inventory(trip_id,seat) SELECT $1,generate_series(1,51)",
    [tripId],
  );
});
function input(holdId: string, who: string, seats: number[]) {
  return {
    holdId,
    owner: who,
    idempotency: randomUUID(),
    name: "Demo Traveller",
    phone: "0771234567",
    email: "",
    pickup: "Ampara",
    dropoff: "Colombo",
    passengers: seats.map((seat) => ({ seat, name: "Demo Traveller" })),
    expectedTotal: 279500 * seats.length,
  };
}
test("database has persistent PostgreSQL inventory and valid layouts", async () => {
  const t = await s.trip(tripId);
  assert.equal(t.available, 51);
  const { buses } = await import("../src/lib/seed");
  for (const bus of buses) {
    const seats = bus.layout.flat().filter(Boolean);
    assert.equal(seats.length, bus.capacity);
    assert.equal(new Set(seats).size, bus.capacity);
    assert.equal(Math.max(...seats), bus.capacity);
  }
});
test("two simultaneous buyers cannot hold the same seat", async () => {
  const a = owner(),
    b = owner();
  const result = await Promise.allSettled([
    s.hold({ tripId, seats: [10], owner: a }),
    s.hold({ tripId, seats: [10], owner: b }),
  ]);
  assert.equal(result.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(result.filter((r) => r.status === "rejected").length, 1);
});
test("overnight intermediate-stop search uses the passenger boarding date", async () => {
  const source = (await s.trips({ all: true })).find(
    (t) => t.route_id === "ampara-colombo-kandy",
  )!;
  const offset = source.route.stops.find(
    (s) => s.name === "Mahiyanganaya",
  )!.offset;
  const day = sriDate(
    new Date(new Date(source.departure).getTime() + offset * 60000),
  );
  const matches = await s.trips({
    from: "Mahiyanganaya",
    to: "Colombo",
    date: day,
  });
  assert.ok(matches.some((t) => t.id === source.id));
  for (const t of matches) {
    const off = t.route.stops.find((s) => s.name === "Mahiyanganaya")!.offset;
    assert.equal(
      sriDate(new Date(new Date(t.departure).getTime() + off * 60000)),
      day,
    );
  }
});
test("multi-seat acquisition is atomic when one requested seat is held", async () => {
  await assert.rejects(
    s.hold({ tripId, seats: [10, 11], owner: owner() }),
    /just taken/,
  );
  const t = await s.trip(tripId);
  assert.equal(t.held.includes(11), false);
});
test("expired holds are reclaimable and stale holds cannot confirm", async () => {
  const who = owner();
  const h = await s.hold({ tripId, seats: [12], owner: who });
  await (
    await db()
  ).query(
    `UPDATE inventory SET hold_expires=NOW()-INTERVAL '1 minute' WHERE hold_id=$1`,
    [h.id],
  );
  await assert.rejects(s.confirm(input(h.id, who, [12])), /expired/);
  const next = await s.hold({ tripId, seats: [12], owner: owner() });
  assert.notEqual(h.id, next.id);
});
test("fare tampering fails without consuming a valid hold", async () => {
  const who = owner(),
    h = await s.hold({ tripId, seats: [13], owner: who });
  await assert.rejects(
    s.confirm({ ...input(h.id, who, [13]), expectedTotal: 1 }),
    /fare changed/,
  );
  assert.equal((await s.trip(tripId)).held.includes(13), true);
  await s.release(h.id, who);
});
test("guest confirmation is idempotent and protected ticket retrieval works", async () => {
  const who = owner(),
    h = await s.hold({ tripId, seats: [14, 15], owner: who });
  const request = input(h.id, who, [14, 15]);
  const [a, b] = await Promise.all([s.confirm(request), s.confirm(request)]);
  assert.equal(a.id, b.id);
  const booking = await s.booking(a.id, a.accessCode);
  assert.equal(booking.tickets.length, 2);
  assert.equal(booking.total, 559000);
  assert.equal(booking.payment_status, "demo");
  assert.equal((await s.trip(tripId)).booked.includes(14), true);
  await assert.rejects(s.booking(a.id, "wrong"), /incorrect/);
  const verify = await s.verify(booking.tickets[0].qr_token!);
  assert.equal(verify.valid, true);
  assert.equal("phone" in verify, false);
  assert.equal("email" in verify, false);
  assert.equal("passenger" in verify, false);
});
test("cancellation invalidates QR and releases inventory", async () => {
  const who = owner(),
    h = await s.hold({ tripId, seats: [16], owner: who });
  const result = await s.confirm(input(h.id, who, [16])),
    booking = await s.booking(result.id, result.accessCode);
  await s.cancel(booking.id, "test");
  assert.equal((await s.verify(booking.tickets[0].qr_token!)).valid, false);
  assert.equal((await s.trip(tripId)).booked.includes(16), false);
  await s.hold({ tripId, seats: [16], owner: owner() });
});
test("check-in rejects wrong trip and permits exactly one racing scan", async () => {
  const who = owner(),
    h = await s.hold({ tripId, seats: [17], owner: who }),
    result = await s.confirm(input(h.id, who, [17])),
    booking = await s.booking(result.id, result.accessCode),
    qr = booking.tickets[0].qr_token!;
  await assert.rejects(
    s.checkIn(qr, "different-trip", "test"),
    /different departure/,
  );
  const results = await Promise.allSettled([
    s.checkIn(qr, tripId, "test"),
    s.checkIn(qr, tripId, "test"),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal((await s.verify(qr)).status, "checked_in");
  await assert.rejects(s.cancel(booking.id, "test", true), /boarded/);
});
test("closed departures and blocked seats cannot be booked", async () => {
  await (
    await db()
  ).query("UPDATE inventory SET blocked=TRUE WHERE trip_id=$1 AND seat=18", [
    tripId,
  ]);
  await assert.rejects(
    s.hold({ tripId, seats: [18], owner: owner() }),
    /just taken/,
  );
  await (
    await db()
  ).query(`UPDATE trips SET status='closed' WHERE id=$1`, [tripId]);
  await assert.rejects(
    s.hold({ tripId, seats: [19], owner: owner() }),
    /closed/,
  );
  await (
    await db()
  ).query(`UPDATE trips SET status='open' WHERE id=$1`, [tripId]);
});
test("QR payload decodes and PDF supports Sinhala and Tamil names", async () => {
  const who = owner(),
    h = await s.hold({ tripId, seats: [20, 21], owner: who });
  const request = input(h.id, who, [20, 21]);
  request.passengers = [
    { seat: 20, name: "අනුක පෙරේරා" },
    { seat: 21, name: "அருண் குமார்" },
  ];
  const result = await s.confirm(request),
    booking = await s.booking(result.id, result.accessCode);
  const url = `https://demo.example/verify/${booking.tickets[0].qr_token}`;
  const qr = QRCode.create(url, { errorCorrectionLevel: "M" }),
    scale = 5,
    margin = 4,
    width = (qr.modules.size + margin * 2) * scale,
    data = new Uint8ClampedArray(width * width * 4);
  for (let y = 0; y < width; y++)
    for (let x = 0; x < width; x++) {
      const row = Math.floor(y / scale) - margin,
        col = Math.floor(x / scale) - margin,
        black =
          row >= 0 &&
          col >= 0 &&
          row < qr.modules.size &&
          col < qr.modules.size &&
          qr.modules.get(row, col);
      const offset = (y * width + x) * 4;
      data[offset] = data[offset + 1] = data[offset + 2] = black ? 0 : 255;
      data[offset + 3] = 255;
    }
  assert.equal(jsQR(data, width, width)?.data, url);
  for (const lang of ["en", "si", "ta"] as const) {
    // Includes independent Sinhala vowels in labels (e.g. ඔබේ), which crashed
    // the older font shaper even when ordinary passenger names worked.
    const bytes = await ticketPdf(booking, "https://demo.example", 30, lang);
    const pdf = await PDFDocument.load(bytes);
    assert.equal(pdf.getPageCount(), 2);
    assert.ok(bytes.length > 10000);
  }
});
