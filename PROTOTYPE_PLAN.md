# Dilanka Express booking prototype

Prepared 13 October 2026. Planning only; implementation has not started.

Consolidated implementation specification: [BUILD_PLAN.md](BUILD_PLAN.md) is the current complete build plan and supersedes earlier scope choices in this document, including ticket grouping.

Research update: signed-in Facebook inspection and the company's linked Magiya booking platform supplied published routes, schedules, one dated fare quote and a numbered seat chart for NE-3230. See [research/DILANKA_RESEARCH.md](research/DILANKA_RESEARCH.md) for sources, collected media and unresolved discrepancies. Earlier references below to unverified routes/media describe the initial inspection; the research inventory is the current evidence record. The full operating dataset and current fare matrix still require client confirmation.

Prototype assumptions update: the user requested Nuwantha/Tripimate as the source for missing values. [research/REFERENCE_DEFAULTS.md](research/REFERENCE_DEFAULTS.md) records observed fares, four reference assignments, exact 49/51-seat numbering and policy differences. Use them as explicitly labelled demo defaults; retain Dilanka's observed 53-seat layout separately. This removes the need to wait for all client data before building the prototype, without misidentifying another operator's data as Dilanka-confirmed.

## Scope and evidence

The user's requirements are: a distinct, improved Dilanka Express experience informed by Nuwantha and Tripimate; guest booking; no working payment gateway; and a working QR ticket. The attached client conversation provides proposed Next.js, PostgreSQL and Vercel choices and requests Facebook media and company contacts. These are context, not independent authorization or verified operational data.

Reviewed public Nuwantha Home, About and Contact pages; Tripimate Home, Routes, Schedules, booking form, timetable, boarding-point selector, Ticket Policy and Refund pages; and the accessible Dilanka Facebook profile and cover image. No live reservation, payment or message was submitted. Authenticated checkout, payment processing, actual ticket delivery and private/admin functionality were not inspected or verified.

Sources:
- https://nuwantha.lk/
- https://nuwantha.lk/about
- https://nuwantha.lk/contact
- https://www.tripimate.com/
- https://www.tripimate.com/routes
- https://www.tripimate.com/schedules
- https://www.tripimate.com/book?routeId=18&date=2026-10-13&scheduleId=22
- https://www.tripimate.com/ticket-policy
- https://www.tripimate.com/refund
- https://www.facebook.com/people/Dilanka-Express/100090241902532/

Nuwantha is a company showcase whose booking links lead to Tripimate. Tripimate provides route/date search, schedules, bus details, seat availability, boarding/drop-off choices and fare summaries. Its policy describes login and emailed tickets; those delivery claims were not tested. For Dilanka, use an integrated branded flow and guest checkout.

Dilanka's accessible public profile shows a gold-and-black DE logo; an Ampara base; hotline numbers 0777 914680 and 0777 205634; email dilankaexpress@gmail.com; and BL-26, 3rd Lane, Ampara. It describes normal, luxury, super-luxury and tourist services. Confirm contact formatting before the client presentation. Routes, fares, schedules, seat layouts and booking policies remain unverified; never copy those from Nuwantha as Dilanka facts. Facebook did not provide reliable full access to the media/post history.

## Design direction

Use warm ivory backgrounds, charcoal typography and restrained gold accents from the visible DE brand. Pair an expressive bus photo with a prominent journey search. Keep booking screens light and easy to read. Use original composition, spacing and components; do not reproduce reference layouts. Use clear labelled seat states, strong keyboard focus and large touch targets. Gold must have adequate contrast or use dark text on it.

Home order: navigation; hero and search; featured journeys; fleet and comfort details supported by client information; how booking works; company introduction; contact section and footer. Prefer one strong bus image and an optional user-played video rather than a heavy carousel. Use client-supplied originals or appropriately permitted assets; do not depend on Facebook-hosted image URLs.

## Passenger journey

1. Search origin, destination and travel date. Default to Sri Lanka's current date; block past dates. Quick route cards populate the same search.
2. Compare departures: bus photo/type, date and time, next-day arrival indicator, amenities, remaining seats and full per-seat total.
3. Choose boarding/drop-off stops in valid route order and seats on a front-facing bus diagram. Show driver/aisle, seat numbers and available/selected/held/booked states. Show stop-specific boarding time.
4. Enter passenger name and Sri Lankan/international phone number; optional email. Support multiple seats. Collect only operationally needed information; no customer account or mandatory OTP for the prototype.
5. Review route, date, stops, seats, passenger details and server-calculated total. Display a clear demo notice. Button: Confirm demo booking. Do not collect card details or label the result paid.
6. Display the persisted e-ticket immediately, with booking reference, QR, seats, bus, departure, boarding point/time and contact information. Allow download/print and copy ticket link. Mark it Demo ticket — not valid for travel. Real email/SMS delivery is a later integration.

## Working QR and staff demonstration

Generate QR only after successful server confirmation. Encode an HTTPS verification URL containing a cryptographically random opaque token; do not encode passenger contact details. Store a hash of the token and resolve it to the database record.

A phone camera can open a minimal verification page showing demo status and basic journey/seat information. Provide a staff-protected validation page with camera scanning and manual reference entry. Scanning or opening a link must not itself consume the ticket: a staff action marks it checked in. Use an atomic update so a second check-in reports already used. Reject invalid, cancelled and wrong-trip tickets. For multiple seats, use one QR per booking and explicitly track/check in the whole group for the initial prototype.

Passengers need no login. Staff management/check-in requires a separate protected staff session or demo access gate. This is not a public admin page. Demonstration data remains separate from actual transport operations.

## Architecture

- Next.js App Router and TypeScript for the UI and server endpoints; Tailwind CSS for styling.
- Managed PostgreSQL for durable journeys, bookings and tickets, with a server-only database connection and migrations. Select the database provider when deployment access is known.
- Vercel for frontend and server functions. Persistent bookings belong in PostgreSQL, not local files or function memory.
- A dedicated demo payment adapter returns simulated confirmation. Keep booking status separate from payment status; store payment status as demo, never paid.

Main records: buses, seat layouts, routes, ordered route stops, dated trips, trip stops/times, seat inventory, temporary holds, bookings, booking seats, tickets and check-in events.

Start with whole-trip seat inventory: a booked seat cannot be resold on another segment of the same trip. Segment-based seat reuse is a later operational feature. Boarding/drop-off choices can still affect fare and stop-specific times when approved data exists.

Use a short server-managed hold (proposed five minutes), visible countdown and automatic expiry evaluated against database time. Acquire seats transactionally and reject conflicting requests. Confirm all seats in one transaction; repeated confirmation requests must return the same booking rather than duplicate tickets. Validate stop order, date, trip status, hold ownership and fare on the server. Release cancelled bookings transactionally. Do not trust browser-submitted prices.

Store departure/arrival timestamps consistently and display Asia/Colombo time. Model next-day arrivals explicitly. Keep ticket tokens unguessable, rate-limit public endpoints and omit phone/email from public verification responses.

Technical references:
- https://nextjs.org/docs/app/getting-started/route-handlers
- https://vercel.com/docs/functions
- https://www.postgresql.org/docs/current/ddl-constraints.html

## Build sequence

1. Create design tokens, page structure and a responsive home/search/results design. Prepare clearly labelled sample routes and a media inventory.
2. Build schema, migrations and seeded demo trips; implement search, correct seat maps, inventory and expiring holds.
3. Build guest details, review and simulated confirmation; persist booking and issue downloadable QR tickets.
4. Add minimal protected staff booking list, ticket scanner, check-in and cancellation/reset actions for demo data.
5. Validate on phone and desktop, deploy a preview with persistent database, and test a complete booking-to-scan demonstration using a real phone.

Acceptance checks: successful guest booking; refresh retains ticket; second browser sees booked seats; simultaneous requests cannot sell one seat twice; expired holds release seats; double-click confirmation is idempotent; totals agree across results/review/ticket; invalid and cancelled QR tokens fail; repeated check-in is detected; no card form or real charge; no passenger phone/email in public verification; usable keyboard/mobile flow; next-day arrival and Asia/Colombo date boundaries behave correctly.

## Client inputs still needed

Original logo and suitable bus media; approved route pairs, stop order, departure/arrival times, fares, booking cutoff and seat layouts; confirmation of public contacts and office location; cancellation/luggage rules. Until supplied, sample trips must be labelled demo data. English first is a proposed prototype assumption; Sinhala/Tamil translations can follow client review.

Out of initial scope: live payments/refunds, passenger accounts, SMS/WhatsApp/email automation, live GPS, offline check-in sync and segment seat resale. A scanner needs network access for authoritative validation in this prototype.
