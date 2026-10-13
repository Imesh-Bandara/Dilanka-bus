import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import fs from "node:fs/promises";
import { db, transaction, hash, token, type DB, seedTrips } from "./db";
import type { Trip, Route, Bus, Booking } from "./types";
import { sriDate } from "./types";
import { z } from "zod";
export class Fault extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
let secretPromise: Promise<string> | undefined;
async function secret() {
  return (secretPromise ??= (async () => {
    if (process.env.TICKET_SECRET) return process.env.TICKET_SECRET;
    if (process.env.VERCEL)
      throw new Fault("TICKET_SECRET must be configured.", 503);
    await fs.mkdir(".data", { recursive: true });
    try {
      return await fs.readFile(".data/ticket-secret", "utf8");
    } catch {
      const s = token();
      await fs.writeFile(".data/ticket-secret", s);
      return s;
    }
  })());
}
const ticketToken = async (id: string) =>
  `${id}.${createHmac("sha256", await secret())
    .update(id)
    .digest("base64url")}`;
export async function policy() {
  return (
    await (
      await db()
    ).query<{
      value: {
        cutoffMinutes: number;
        cancellationMinutes: number;
        holdMinutes: number;
        bagKg: number;
        arrivalMinutes: number;
      };
    }>(`SELECT value FROM settings WHERE key='policy'`)
  ).rows[0].value;
}
export async function trips(
  filters: {
    date?: string;
    from?: string;
    to?: string;
    all?: boolean;
    id?: string;
  } = {},
) {
  const d = await db();
  const result = await d.query<Record<string, unknown>>(
    `SELECT t.*,r.data AS route,b.data AS bus FROM trips t JOIN routes r ON r.id=t.route_id JOIN buses b ON b.id=t.bus_id WHERE ($1::text IS NULL OR (t.departure AT TIME ZONE 'Asia/Colombo')::date BETWEEN $1::date-1 AND $1::date+1) AND ($2::text IS NULL OR t.id=$2) ORDER BY t.departure`,
    [filters.date || null, filters.id || null],
  );
  const out: Trip[] = [];
  for (const row of result.rows) {
    const route = row.route as Route;
    const boardingOffset =
      route.stops.find((s) => s.name === filters.from)?.offset || 0;
    if (
      filters.date &&
      sriDate(
        new Date(
          new Date(row.departure as string).getTime() + boardingOffset * 60000,
        ),
      ) !== filters.date
    )
      continue;
    if (filters.from && !route.stops.some((s) => s.name === filters.from))
      continue;
    if (filters.to && !route.stops.some((s) => s.name === filters.to)) continue;
    if (
      filters.from &&
      filters.to &&
      route.stops.findIndex((s) => s.name === filters.from) >=
        route.stops.findIndex((s) => s.name === filters.to)
    )
      continue;
    const inv = await d.query<{
      seat: number;
      blocked: boolean;
      booking_id: string | null;
      held: boolean;
    }>(
      `SELECT seat,blocked,booking_id,(hold_expires>NOW()) AS held FROM inventory WHERE trip_id=$1`,
      [row.id],
    );
    const booked = inv.rows.filter((s) => s.booking_id).map((s) => s.seat),
      blocked = inv.rows.filter((s) => s.blocked).map((s) => s.seat),
      held = inv.rows.filter((s) => s.held && !s.booking_id).map((s) => s.seat);
    out.push({
      ...row,
      departure: new Date(row.departure as string).toISOString(),
      arrival: new Date(row.arrival as string).toISOString(),
      booked,
      blocked,
      held,
      available: inv.rows.filter((s) => !s.blocked && !s.booking_id && !s.held)
        .length,
    } as unknown as Trip);
  }
  return filters.all ? out : out.filter((t) => t.status === "open");
}
export async function trip(id: string) {
  const result = (await trips({ all: true, id })).find((t) => t.id === id);
  if (!result) throw new Fault("That departure was not found.", 404);
  return result;
}
export const holdSchema = z.object({
  tripId: z.string().max(120),
  seats: z.array(z.number().int().positive()).min(1).max(6),
  owner: z.string().min(20).max(100),
});
export async function hold(input: z.infer<typeof holdSchema>) {
  const p = await policy();
  return transaction(async (d) => {
    const t = (
      await d.query<{ departure: string; status: string }>(
        "SELECT departure,status FROM trips WHERE id=$1 FOR UPDATE",
        [input.tripId],
      )
    ).rows[0];
    if (!t) throw new Fault("Departure not found.", 404);
    if (
      t.status !== "open" ||
      new Date(t.departure).getTime() - Date.now() < p.cutoffMinutes * 60000
    )
      throw new Fault(
        "Booking has closed for this departure. Please choose another trip.",
        409,
      );
    const seats = [...new Set(input.seats)].sort((a, b) => a - b);
    if (seats.length !== input.seats.length)
      throw new Fault("Seat numbers must be unique.");
    const inv = (
      await d.query<{
        seat: number;
        blocked: boolean;
        booking_id: string;
        owner_hash: string;
        active: boolean;
      }>(
        "SELECT *,hold_expires>NOW() AS active FROM inventory WHERE trip_id=$1 AND seat=ANY($2::int[]) ORDER BY seat FOR UPDATE",
        [input.tripId, seats],
      )
    ).rows;
    if (
      inv.length !== seats.length ||
      inv.some(
        (s) =>
          s.blocked ||
          s.booking_id ||
          (s.active && s.owner_hash !== hash(input.owner)),
      )
    )
      throw new Fault(
        "One of these seats was just taken. Refresh availability and choose again.",
        409,
      );
    const id = randomUUID();
    const expires = new Date(Date.now() + p.holdMinutes * 60000).toISOString();
    await d.query(
      "UPDATE inventory SET hold_id=NULL,owner_hash=NULL,hold_expires=NULL WHERE trip_id=$1 AND owner_hash=$2 AND booking_id IS NULL",
      [input.tripId, hash(input.owner)],
    );
    await d.query(
      "UPDATE inventory SET hold_id=$3,owner_hash=$4,hold_expires=$5 WHERE trip_id=$1 AND seat=ANY($2::int[])",
      [input.tripId, seats, id, hash(input.owner), expires],
    );
    return { id, expires, seats };
  });
}
export async function release(holdId: string, owner: string) {
  await transaction((d) =>
    d.query(
      "UPDATE inventory SET hold_id=NULL,owner_hash=NULL,hold_expires=NULL WHERE hold_id=$1 AND owner_hash=$2 AND booking_id IS NULL",
      [holdId, hash(owner)],
    ),
  );
}
const phone = z
  .string()
  .trim()
  .regex(/^\+?[\d\s()-]{9,20}$/, "Enter a valid phone number.");
export const confirmSchema = z.object({
  holdId: z.string().uuid(),
  owner: z.string().min(20).max(100),
  idempotency: z.string().uuid(),
  name: z.string().trim().min(2).max(100),
  phone,
  email: z.union([z.email(), z.literal("")]).default(""),
  pickup: z.string().min(1).max(100),
  dropoff: z.string().min(1).max(100),
  passengers: z
    .array(
      z.object({
        seat: z.number().int(),
        name: z.string().trim().min(2).max(100),
      }),
    )
    .min(1)
    .max(6),
  expectedTotal: z.number().int().positive(),
});
export async function confirm(input: z.infer<typeof confirmSchema>) {
  const p = await policy();
  const recovery = createHmac("sha256", await secret())
    .update(input.idempotency + input.owner)
    .digest("base64url")
    .slice(0, 16);
  return transaction(async (d) => {
    // Lock the departure before its seats, matching hold acquisition. Re-check
    // idempotency after waiting so concurrent confirmations return one booking.
    const heldTrip = (
      await d.query<{ trip_id: string }>(
        "SELECT trip_id FROM inventory WHERE hold_id=$1 LIMIT 1",
        [input.holdId],
      )
    ).rows[0];
    if (heldTrip)
      await d.query("SELECT id FROM trips WHERE id=$1 FOR UPDATE", [
        heldTrip.trip_id,
      ]);
    const previous = (
      await d.query<{ id: string; access_hash: string; hold_id: string }>(
        "SELECT id,access_hash,hold_id FROM bookings WHERE idempotency=$1",
        [input.idempotency],
      )
    ).rows[0];
    if (previous) {
      if (
        previous.access_hash !== hash(recovery) ||
        previous.hold_id !== input.holdId
      )
        throw new Fault("Confirmation conflict.", 409);
      return { id: previous.id, accessCode: recovery };
    }
    const inv = (
      await d.query<{
        trip_id: string;
        seat: number;
        owner_hash: string;
        active: boolean;
        booking_id: string;
      }>(
        "SELECT *,hold_expires>NOW() AS active FROM inventory WHERE hold_id=$1 ORDER BY seat FOR UPDATE",
        [input.holdId],
      )
    ).rows;
    if (
      !inv.length ||
      inv.some(
        (s) => !s.active || s.booking_id || s.owner_hash !== hash(input.owner),
      )
    )
      throw new Fault(
        "Your seat hold expired. Please choose your seats again.",
        409,
      );
    const t = (
      await d.query<{
        id: string;
        departure: string;
        status: string;
        fare: number;
        fee: number;
        route: Route;
      }>(
        "SELECT t.*,r.data AS route FROM trips t JOIN routes r ON r.id=t.route_id WHERE t.id=$1 FOR UPDATE",
        [inv[0].trip_id],
      )
    ).rows[0];
    if (
      t.status !== "open" ||
      new Date(t.departure).getTime() - Date.now() < p.cutoffMinutes * 60000
    )
      throw new Fault("Booking has closed for this departure.", 409);
    const start = t.route.stops.findIndex((s) => s.name === input.pickup),
      end = t.route.stops.findIndex((s) => s.name === input.dropoff);
    if (start < 0 || end <= start)
      throw new Fault("Choose boarding and drop-off stops in travel order.");
    if (
      input.passengers.length !== inv.length ||
      new Set(input.passengers.map((s) => s.seat)).size !== inv.length ||
      inv.some((s) => !input.passengers.some((p) => p.seat === s.seat))
    )
      throw new Fault("Passenger names must match your held seats.");
    const total = inv.length * (t.fare + t.fee);
    if (total !== input.expectedTotal)
      throw new Fault(
        "The fare changed. Please review the updated price.",
        409,
      );
    const id = randomUUID(),
      reference = `DE-${randomBytesShort()}`;
    await d.query(
      `INSERT INTO bookings(id,reference,access_hash,status,trip_id,name,phone,email,pickup,dropoff,total,fare,fee,idempotency,hold_id) VALUES($1,$2,$3,'confirmed',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        id,
        reference,
        hash(recovery),
        t.id,
        input.name,
        input.phone,
        input.email,
        input.pickup,
        input.dropoff,
        total,
        t.fare,
        t.fee,
        input.idempotency,
        input.holdId,
      ],
    );
    for (const passenger of input.passengers) {
      const ticketId = randomUUID();
      await d.query(
        "INSERT INTO tickets(id,booking_id,seat,passenger,token_hash) VALUES($1,$2,$3,$4,$5)",
        [
          ticketId,
          id,
          passenger.seat,
          passenger.name,
          hash(await ticketToken(ticketId)),
        ],
      );
    }
    await d.query(
      "UPDATE inventory SET booking_id=$2,hold_id=NULL,owner_hash=NULL,hold_expires=NULL WHERE hold_id=$1",
      [input.holdId, id],
    );
    await audit(d, "guest", "booking.confirmed", {
      reference,
      seats: inv.map((s) => s.seat),
    });
    return { id, accessCode: recovery };
  });
}
const randomBytesShort = () =>
  randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase();
export async function booking(
  idOrRef: string,
  access?: string,
  staff = false,
): Promise<Booking> {
  const d = await db();
  const b = (
    await d.query<Record<string, unknown>>(
      "SELECT * FROM bookings WHERE id=$1 OR reference=$1",
      [idOrRef],
    )
  ).rows[0];
  if (!b || (!staff && (!access || hash(access) !== b.access_hash)))
    throw new Fault("Booking not found or access code is incorrect.", 404);
  const tickets = (
    await d.query<Record<string, unknown>>(
      "SELECT id,seat,passenger,status,checked_in_at FROM tickets WHERE booking_id=$1 ORDER BY seat",
      [b.id],
    )
  ).rows;
  return {
    id: b.id,
    reference: b.reference,
    status: b.status,
    payment_status: b.payment_status,
    name: b.name,
    phone: b.phone,
    email: b.email,
    pickup: b.pickup,
    dropoff: b.dropoff,
    total: b.total,
    fare: b.fare,
    fee: b.fee,
    created_at: b.created_at,
    trip: await trip(b.trip_id as string),
    tickets: await Promise.all(
      tickets.map(async (t) => ({
        ...t,
        qr_token: await ticketToken(t.id as string),
      })),
    ),
  } as Booking;
}
export async function verify(qr: string) {
  const result = (
    await (
      await db()
    ).query<{
      id: string;
      seat: number;
      passenger: string;
      status: string;
      checked_in_at: string;
      booking_status: string;
      trip_id: string;
      departure: string;
      arrival: string;
      route: Route;
    }>(
      `SELECT t.id,t.seat,t.status,t.checked_in_at,b.status AS booking_status,b.trip_id,tr.departure,tr.arrival,r.data AS route FROM tickets t JOIN bookings b ON b.id=t.booking_id JOIN trips tr ON tr.id=b.trip_id JOIN routes r ON r.id=tr.route_id WHERE t.token_hash=$1`,
      [hash(qr)],
    )
  ).rows[0];
  if (!result) throw new Fault("This ticket could not be verified.", 404);
  const expired = Date.now() > new Date(result.arrival).getTime() + 86400000;
  return {
    ...result,
    status: expired && result.status === "issued" ? "expired" : result.status,
    valid:
      !expired &&
      result.status === "issued" &&
      result.booking_status === "confirmed",
  };
}
export async function checkIn(qr: string, tripId: string, actor: string) {
  return transaction(async (d) => {
    const t = (
      await d.query<{
        id: string;
        status: string;
        trip_id: string;
        booking_status: string;
        departure: string;
        arrival: string;
      }>(
        `SELECT t.*,b.trip_id,b.status AS booking_status,tr.departure,tr.arrival FROM tickets t JOIN bookings b ON b.id=t.booking_id JOIN trips tr ON tr.id=b.trip_id WHERE t.token_hash=$1 FOR UPDATE OF t,b`,
        [hash(qr)],
      )
    ).rows[0];
    if (!t) throw new Fault("Invalid ticket.", 404);
    if (t.trip_id !== tripId)
      throw new Fault("This ticket belongs to a different departure.", 409);
    if (t.status === "checked_in")
      throw new Fault("This ticket has already been checked in.", 409);
    if (t.status !== "issued" || t.booking_status !== "confirmed")
      throw new Fault("This ticket has been cancelled.", 409);
    if (Date.now() > new Date(t.arrival).getTime() + 86400000)
      throw new Fault("This ticket has expired.", 409);
    if (Date.now() < new Date(t.departure).getTime() - 86400000)
      throw new Fault("Check-in opens 24 hours before departure.", 409);
    await d.query(
      `UPDATE tickets SET status='checked_in',checked_in_at=NOW() WHERE id=$1`,
      [t.id],
    );
    await audit(d, actor, "ticket.checked_in", { ticketId: t.id, tripId });
    return { ok: true };
  });
}
export async function cancel(id: string, actor: string, staff = false) {
  const p = await policy();
  await transaction(async (d) => {
    const b = (
      await d.query<{
        id: string;
        trip_id: string;
        status: string;
        departure: string;
      }>(
        `SELECT b.id,b.trip_id,b.status,t.departure FROM bookings b JOIN trips t ON t.id=b.trip_id WHERE b.id=$1 FOR UPDATE OF b`,
        [id],
      )
    ).rows[0];
    if (!b) throw new Fault("Booking not found.", 404);
    if (b.status === "cancelled") return;
    if (
      !staff &&
      new Date(b.departure).getTime() - Date.now() <
        p.cancellationMinutes * 60000
    )
      throw new Fault(
        "The cancellation window has closed. Please contact the operator.",
        409,
      );
    if (
      (
        await d.query(
          `SELECT id FROM tickets WHERE booking_id=$1 AND status='checked_in'`,
          [id],
        )
      ).rows.length
    )
      throw new Fault("A boarded booking cannot be cancelled.", 409);
    await d.query(`UPDATE bookings SET status='cancelled' WHERE id=$1`, [id]);
    await d.query(`UPDATE tickets SET status='cancelled' WHERE booking_id=$1`, [
      id,
    ]);
    await d.query("UPDATE inventory SET booking_id=NULL WHERE booking_id=$1", [
      id,
    ]);
    await audit(d, actor, "booking.cancelled", { id });
  });
}
export async function audit(
  d: DB,
  actor: string,
  action: string,
  details: unknown,
) {
  await d.query("INSERT INTO audit(actor,action,details) VALUES($1,$2,$3)", [
    actor,
    action,
    JSON.stringify(details),
  ]);
}
export async function limit(key: string, max = 30) {
  const r = await (
    await db()
  ).query<{ count: number }>(
    `INSERT INTO rate_limits VALUES($1,1,NOW()+INTERVAL '10 minutes') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.expires<NOW() THEN 1 ELSE rate_limits.count+1 END,expires=CASE WHEN rate_limits.expires<NOW() THEN NOW()+INTERVAL '10 minutes' ELSE rate_limits.expires END RETURNING count`,
    [key],
  );
  if (r.rows[0].count > max)
    throw new Fault("Too many attempts. Please try again in 10 minutes.", 429);
}
export async function refreshSeed() {
  await transaction(seedTrips);
}
