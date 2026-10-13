# Dilanka Express

A Next.js client prototype with guest booking, persistent PostgreSQL seat inventory, downloadable per-seat QR tickets, and protected staff operations. All bookings are demonstrations; no payment gateway is connected.

## Run locally

Requires Node.js 22.16+ (tested on 24.21) and npm.

```powershell
npm install
npm run dev
```

Open http://localhost:3000. First database access creates the PostgreSQL demo schema and upcoming sample trips. Without `DATABASE_URL`, PGlite runs embedded PostgreSQL and persists data in `.data/demo-postgres`. Do not run two application processes against that directory simultaneously. The embedded transaction queue serialises writes and reads; managed PostgreSQL uses pooled database transactions.

The local server automatically creates `.data/staff-access.txt` on first initialisation. Open that file locally for administrator and check-in credentials; it is ignored by Git. Staff sign-in is at `/staff`. Secrets and passenger data must not be committed. If `STAFF_PASSWORD` is supplied, it replaces the administrator password at startup. Supply `STAFF_CHECKIN_PASSWORD` to initialise/rotate the conductor account.

## What works

- Original Dilanka-branded responsive home, route, fleet, company, contact and help pages.
- Dated trip search, supported intermediate stop pairs, sort and time/layout filters.
- Separate 49-, 51- and 53-seat numbered templates.
- Atomic multi-seat holds, five-minute expiry, six-seat booking cap and server-calculated prices.
- Guest confirmation, duplicate-request protection, private reference/code recovery and cancellation.
- One QR ticket per seat, browser printing and PDF download with Sinhala/Tamil passenger fonts.
- Minimal public QR verification; protected camera/image/reference validation and atomic check-in.
- Staff overview, bookings, manifests/CSV, departure creation/editing, seat blocking, new bus/route variants, policy settings, audit activity and explicitly confirmed demo reset.
- PostgreSQL schema migration and local persistent data, with managed PostgreSQL compatibility.

Interface language choices currently translate navigation, search and booking-step labels. Descriptive/help/staff copy is English and needs a full translation pass before a multilingual client release. Do not describe the current UI as fully translated. Passenger names support Sinhala/Tamil in web tickets and PDFs.

## Evidence and demo assumptions

See `research/DILANKA_RESEARCH.md` and `research/REFERENCE_DEFAULTS.md`. Collected logo/fleet photos are Facebook-served copies, not original design files. Route corridors are informed by Dilanka posts. Future departures are demo copies. Unknown registrations use DEMO IDs. Reference fares and timings must not be presented as approved real operating information.

The demo uses an explicitly flat fare for every supported stop pair on each trip. Stop offsets are illustrative except where documented. A booked seat is reserved for the entire trip; segment resale is not supported. This prevents overlapping seat sales. Policies are editable draft assumptions.

## Architecture

`src/lib/db.ts` selects a pooled `pg` connection or persistent local PGlite. `migrations/001_initial.sql` defines the schema. `src/lib/service.ts` owns inventory, holds, confirmation, ticket lookup, cancellation and check-in. `src/lib/auth.ts` handles hashed staff passwords and expiring HTTP-only sessions. `src/lib/pdf.ts` renders QR ticket PDFs. `src/app/api/[...path]/route.ts` exposes validated endpoints. UI components are in `src/components`.

The original plan suggested Prisma; this implementation uses parameterised PostgreSQL SQL and versioned SQL migrations directly, keeping embedded and hosted transaction semantics aligned. Dates are stored as timestamptz and displayed in Asia/Colombo; prices are integer minor units. Ticket verification and booking recovery use separate secrets. Public QR responses omit passenger contact details.

## Checks

```powershell
npm run typecheck
npm test
npm run build
```

Tests use a separate `.data/test-<uuid>` database. They cover layout integrity, racing holds, atomic multi-seat acquisition, hold expiry, fare tampering, idempotent confirmation, private retrieval, cancellation/release, wrong-trip and racing check-in, closed/blocked inventory, QR decoding and multilingual PDF generation. Test databases contain only fictional records. Local browser/API acceptance results are recorded in `VERIFICATION.md`.

## Vercel deployment

The repository is ready for a Next.js deployment; publishing requires access to a Vercel project and managed PostgreSQL database. No hosted deployment is claimed until those are configured and verified.

Set these environment variables in Vercel:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled managed PostgreSQL URL; required in Vercel |
| `STAFF_PASSWORD` | Strong administrator password |
| `STAFF_CHECKIN_PASSWORD` | Separate strong conductor password |
| `TICKET_SECRET` | Stable random signing secret, at least 32 random bytes recommended |
| `APP_URL` | Final HTTPS origin used inside QR codes |

Generate secrets locally with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` and enter them directly in hosting settings. Never commit secrets. Keep `TICKET_SECRET` stable: changing it invalidates regenerated QR links. Keep the project preview dataset separate from any future production transport system. Vercel must have read access to bundled `migrations/` and `public/fonts/` files; the build traces them.

## Demonstration script

1. Search Colombo → Ampara for tomorrow and choose an open departure.
2. Select two seats, enter fictional passenger details and confirm the demo booking.
3. Download the two-ticket PDF and save the private recovery code.
4. Search the same departure in a separate browser; those seats are unavailable.
5. In `/staff`, select the departure and upload/scan one QR or enter the booking reference.
6. Confirm individual check-in, then scan it again to see repeat-use detection. Check-in opens 24 hours before departure.
7. Cancel a different unboarded demo booking and verify its QR is rejected and seats released.

For a real-phone scan, the phone must reach the configured HTTPS `APP_URL`. A localhost QR cannot be opened from another device. Camera denial has image-upload and manual-reference fallbacks. Internet is required for authoritative validation.

## Still required for a public operating service

Client-approved fares, vehicle assignments, boarding locations, policies and media; real payment/webhook reconciliation; email/SMS provider; production security/abuse review, monitoring, backups and operational support. GPS, passenger accounts, native apps, offline sync and segment-based seat resale are outside this prototype.
