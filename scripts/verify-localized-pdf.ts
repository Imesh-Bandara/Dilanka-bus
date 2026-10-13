// Local QA fixture only. No passenger records or database writes.
import fs from "node:fs/promises";
import { ticketPdf } from "../src/lib/pdf";
import { routes, buses } from "../src/lib/seed";
import type { Booking } from "../src/lib/types";
async function main() {
  const route = routes[0],
    bus = buses.find((b) => b.id === route.busId)!;
  const booking: Booking = {
    id: "localization-qa",
    reference: "DE-LANGUAGEQA",
    status: "confirmed",
    payment_status: "demo",
    name: "Kandy",
    phone: "",
    email: "",
    pickup: route.origin,
    dropoff: route.destination,
    total: 279500,
    fare: 269500,
    fee: 10000,
    created_at: "2026-10-13T12:00:00+05:30",
    trip: {
      id: "qa",
      route_id: route.id,
      bus_id: bus.id,
      departure: "2026-10-14T23:00:00+05:30",
      arrival: "2026-10-15T06:00:00+05:30",
      fare: 269500,
      fee: 10000,
      status: "open",
      route,
      bus,
      available: 50,
      booked: [],
      held: [],
      blocked: [],
    },
    tickets: [
      {
        id: "qa-seat-7",
        seat: 7,
        passenger: "අනුක / அனுக / Kandy",
        status: "valid",
        checked_in_at: null,
        qr_token: "localization-qa-token",
      },
    ],
  };
  await fs.mkdir("test-output/localization", { recursive: true });
  for (const lang of ["en", "si", "ta"] as const)
    await fs.writeFile(
      `test-output/localization/ticket-${lang}.pdf`,
      await ticketPdf(booking, "https://example.com", 30, lang),
    );
  console.log("English, Sinhala and Tamil QA tickets generated.");
}
main();
