# Dilanka Express — complete prototype build plan

Prepared 13 October 2026. This is the consolidated implementation plan; it supersedes earlier proposed scope wherever details differ. Implementation starts after planning. Evidence is recorded in research/DILANKA_RESEARCH.md and research/REFERENCE_DEFAULTS.md.

## 1. Outcome and definition of working

Deliver a distinctive, responsive Dilanka Express website with an integrated booking system, durable PostgreSQL bookings, accurate per-trip seat inventory, guest checkout, downloadable tickets and QR validation. Provide a protected staff area to manage demonstration operations. Deploy a client-review preview to Vercel connected to a managed PostgreSQL database.

Payments are simulated. Every reservation and ticket belongs to an isolated demo dataset and says it is not valid for travel. No card details, real charges or real refunds. No customer login or mandatory OTP. Staff access remains protected.

A working demo means two different devices see the same booked seats; reservations survive refresh and deployment restarts; conflicting bookings are rejected; tickets download and scan; staff can check passengers in; used/cancelled tickets are recognised; and operational changes propagate to the public flow. Browser-only storage is insufficient.

## 2. Product improvements to demonstrate

These are design goals to validate, not an untested claim of superiority over competitors:

| Improvement | Demonstration |
| --- | --- |
| One branded journey | Search through ticket remains inside Dilanka's website |
| Guest booking | A new visitor finishes without creating an account |
| Clear pricing | Base fare, fee and total agree on results, review and ticket |
| Better phone use | Seat map and checkout work at 360px without horizontal page overflow |
| Useful journey detail | Boarding time/location, route stops and next-day arrival are explicit |
| Trustworthy availability | Concurrent requests cannot confirm the same trip/seat twice |
| Useful QR | Real database verification and protected check-in, including repeat-use detection |
| Consistent states | Loading, empty results, expiry, unavailable seats and network errors have usable recovery |

## 3. Visual direction

Use the observed DE gold/black brand with warm ivory content surfaces, charcoal type and restrained gold highlights. Keep booking pages light; use a dark hero/footer for contrast. Colour values are proposed design tokens, not a client brand guide: charcoal #171A18, gold #C2A253, ivory #F8F6EF, white #FFFFFF. Verify text contrast and use dark labels on gold buttons.

Use the saved logo and fleet photo from research/assets. Keep originals unchanged and prepare optimised website copies. Do not copy competitors' layouts, contact details, logos, slogans or legal text. Avoid invented reviews, passenger counts, awards and amenity claims.

Desktop: prominent journey search, readable journey cards, booking form with a sticky price summary. Mobile: single-column steps, large seat controls, a persistent total/continue area that does not cover content, and visible step progress. Motion should be restrained and respect reduced-motion preferences.

All controls need labels, keyboard focus, descriptive errors and touch targets around 44px. Seat state must have a text/icon cue beyond colour. English, Sinhala and Tamil interface strings are in scope; final translated marketing/legal copy needs human review. Display fares in LKR and times in Asia/Colombo.

## 4. Public pages

| Page | Content and behaviour |
| --- | --- |
| Home | DE navigation, fleet hero, origin/destination/date search, featured routes, verified fleet content, how booking works, company/contact section |
| Search results | Departure cards, editable search, time/type filters, earliest/price sorting, availability and complete indicative per-seat price |
| Routes | Separate corridors and directions, ordered major stops, link to dated departures |
| Schedules | Date selection, departure/arrival, bus type and next-day indicators |
| Booking | Stops, seat map, temporary hold, passenger details, review and simulated confirmation |
| Ticket confirmation | Booking reference, clear demo status, journey, seats, boarding details, per-seat QR tickets, print/PDF download and private ticket link |
| Find my booking | Booking reference plus issued access code; generic failure messages and rate limiting; no account required |
| About / Fleet | Company details and sourced media; accurate bus-specific amenities |
| Contact | General hotlines, email, office address, map link, Facebook link and user-initiated call/WhatsApp actions |
| Help and policies | Booking guide, luggage, draft cancellation policy, privacy and demo notice |
| Public QR verification | Minimal ticket status and journey/seat data; no phone/email or privileged actions |

No decorative control should appear functional when its feature is absent. Contact uses call/email/WhatsApp links initially; do not add a message form without a receiving backend. External messages are never sent automatically.

## 5. Passenger booking flow

1. Choose origin, destination and date. Prevent identical endpoints and past dates. Popular route cards populate the same search. Seed upcoming demo departures relative to Sri Lanka's date so the demonstration does not expire.
2. Compare departures. Show operator branding, bus/demo vehicle ID, supported amenities, departure, arrival date, remaining seats and price including the service fee. Explain whether a displayed fare is for the full route.
3. Choose boarding and drop-off stops. Require forward stop order; display exact boarding time and location where supplied. Apply only explicitly seeded fares for supported stop pairs; do not invent distance-based fares for unknown pairs.
4. Select seats in the assigned layout. Display bus front, driver, aisle and numbers. Booked/blocked seats cannot be selected. Cap an initial booking at six seats as a configurable demo rule. Acquire all selected seats atomically for a proposed five-minute hold. Show expiry and preserve form fields if seats must be reselected.
5. Enter lead passenger name and phone, plus a name for each seat; allow copying the lead name. Email is optional. Validate Sri Lankan and international numbers. Do not collect NIC/passport details for the prototype.
6. Review travel date, stops, seat numbers, passenger names, base fares, fee and total. Keep payment status visibly Demo. Explicit button: Confirm demo booking. No payment-card form.
7. Confirm server-side in one transaction. Return a stable booking on retried/double-clicked requests. A failure must never leave half a multi-seat booking confirmed.
8. Issue one QR ticket per seat, collected on one booking page and one downloadable PDF. This supersedes the earlier proposed single group QR: individual tickets allow passengers in one booking to board separately.
9. Display booking reference and recovery access code, private ticket link, download/print controls and boarding guidance. Refresh must restore the issued ticket. No email/SMS delivery claim unless that integration actually exists.

## 6. Seats, fares and operating data

Use actual Dilanka identity and published route corridors from the research inventory. Include Ampara–Colombo via Kandy and via the expressway as separate route variants, Monaragala–Colombo, and Ampara–Matara. Only seed dated services whose demonstration assumptions are explicit. Do not assign every rotating Matara departure to Dilanka.

Use the observed 53-seat NE-3230 layout for that bus. Keep 49-seat and 51-seat Tripimate layouts as separate reference templates assigned to fictional DEMO vehicle IDs where assignments are unconfirmed. The published Nuwantha registrations are research evidence, not Dilanka seed assignments. Seat numbering must match each chosen template, not merely seat count.

For a sample Colombo–Ampara fare, use LKR 2,695 base plus LKR 100 fee, clearly labelled demo/reference based. Keep base, fees and totals distinct. All prices are integer minor units and calculated on the server. Store source URL, observed date, approval status and a demo flag with seeded records.

Initially inventory is for the whole trip: a seat sold for any supported stop pair is blocked for that entire trip. Segment-based resale is deferred. This is simpler and prevents overlapping bookings without pretending to support segment reuse.

Proposed editable policy defaults: one bag up to 15kg, arrive 30 minutes early, three-hour cancellation-request threshold, three-hour booking cutoff. Reference pages conflict on booking cutoff/arrival guidance; these are chosen prototype rules, not a claim that Dilanka approved them. Administrative policy settings must drive the UI and server validation consistently.

## 7. QR ticket and boarding flow

Create a cryptographically random verification token per seat after confirmation; store its hash. QR encodes an HTTPS verification URL. Do not embed passenger contacts in QR content. Use a separate secret for private booking retrieval; QR verification alone must not expose the complete booking.

Public scanning shows Demo ticket, status, route/date, departure and seat, with minimal personal data. Viewing a QR URL never checks in a passenger. A protected staff scanner verifies the ticket, confirms it belongs to the selected departure, shows the passenger name to staff, and requires a check-in action.

Check-in is an atomic conditional update. Outcomes: valid/not yet boarded, already checked in, cancelled, expired/wrong date or wrong trip, and invalid code. A repeated scan cannot produce a second successful check-in. Staff can scan via camera over HTTPS, upload a QR image for decoding, or enter a reference manually. Camera access is requested only when staff starts scanning. Validation requires network access; no offline-sync claim.

Ticket/PDF includes DE branding, demo marker, booking and ticket references, passenger, route, trip date, departure/boarding time, stops, seat, bus/demo ID, fare summary, hotline and a sharp QR with sufficient white margin. Never expose the booking recovery code on the public QR page.

## 8. Protected staff area

Staff sign-in is separate from guest booking. Start with an administrator role and a check-in role; initialise credentials through secure environment/configuration, never a hardcoded public password.

| Area | Required actions |
| --- | --- |
| Overview | Upcoming demo trips, confirmed seats, check-ins, simulated booking value labelled as such |
| Bookings | Search reference/date/phone, view details, download ticket and cancel eligible demo bookings |
| Trips | Create dated departures, assign bus/layout, set times/fares/cutoff, close or cancel a trip |
| Buses/layouts | Manage vehicle labels, seat templates and bus-specific amenities |
| Routes/stops | Manage ordered stops, boarding information and supported fare pairs |
| Seat controls | Block/unblock unsold seats with reason; show active holds |
| Manifest | Trip passenger/seat list and CSV export |
| Scanner | Select departure, validate QR/reference and check in individual tickets |
| Policies | Edit configured demo baggage/cutoff/cancellation settings |
| Demo tools | Seed future sample departures and explicitly reset named demo data with an audit trail |

Restrict check-in staff to manifests and validation for their scope. Log trip changes, blocked seats, cancellations and check-ins. Prevent layout reassignment after tickets are sold unless seat mappings are preserved through an explicit controlled migration. Reject edits that orphan bookings. Trip cancellation invalidates tickets and releases inventory transactionally; it does not trigger money movement or notifications.

## 9. Technical architecture

- Next.js App Router with TypeScript for pages and server endpoints.
- Tailwind CSS and a small reusable accessible component system.
- Managed PostgreSQL with Prisma ORM and versioned migrations; choose provider based on available deployment access.
- Vercel for the application and server functions; PostgreSQL is the persistent source of truth.
- QR generation/decoding libraries and server-generated PDF tickets, selected at implementation and checked against current documentation.
- Schema validation shared where useful, with authoritative server validation.
- Provider-backed rate limiting or a database-compatible implementation; never rely on per-function memory for cross-instance limits/holds.
- No gateway integration in the prototype; isolate a simulated-payment adapter for later replacement.

Do not put database secrets in browser bundles. Keep preview and later production datasets separate. Add deployment environment validation, database connection pooling, health checks and structured logs with sensitive fields/ticket tokens redacted.

## 10. Data model and integrity

Core entities: StaffUser/Session/Role; Bus; SeatLayout/Seat; Route/OrderedStop; DatedTrip/TripStop; StopPairFare/Fee; TripSeatInventory; SeatHold/HoldSeat; Booking/BookingPassenger/BookingSeat; Ticket; CheckInEvent; PolicySettings; AuditEvent.

Each trip has explicit timestamps including next-day arrivals. Inventory has one authoritative row per trip/seat. Holds have owner and expiry. Bookings distinguish held/confirmed/cancelled/expired from payment state demo (and future pending/paid/failed/refunded). Tickets distinguish issued/checked_in/cancelled. A demo booking may be confirmed while payment remains demo.

Lock affected inventory rows in consistent seat order during acquisition and confirmation. Expired holds are reclaimable based on database time without depending on a browser timer or continuously running process. Confirm only an unexpired hold belonging to the requester, on an open/bookable trip, with valid stop order and current server price. Reject stale pricing for review rather than silently charging a changed amount. Database constraints and transactions enforce uniqueness; UI disabling is insufficient.

Idempotency keys make repeated confirmation safe. Cancellation invalidates all affected tickets and releases seats together. Check-in requires authenticated staff and a valid selected trip; only one success per ticket. Server endpoints validate every mutation and do not trust user-submitted fare, role, vehicle or booking status.

Logical endpoints cover trip search/details/availability; hold create/release; booking confirmation/retrieval/PDF; minimal public verification; staff session, trip/route/bus administration, cancellation, manifests and check-in.

## 11. Build order and checkpoints

1. **Foundation and design:** scaffold repository; define tokens, layouts, translations and data schemas; create responsive home/search/result/booking/ticket screens. Check navigation and phone layouts with seeded display data.
2. **Database and trip search:** migrations, demo seeds, route variants, explicit timestamps/fares and API search. Check date boundaries, sorting, empty results and overnight arrivals against the database.
3. **Seat engine:** 49/51/53-seat templates, availability, blocking and expiring transactional holds. Pass a real concurrent request test before connecting checkout.
4. **Guest checkout:** form validation, review, simulated confirmation, idempotency, private retrieval and durable bookings. Verify across refresh and a second browser.
5. **Tickets and QR:** per-seat token, public verification, PDF, print, recovery access code and staff scan/check-in. Scan actual generated tickets using a phone and uploaded image.
6. **Staff operations:** protected roles, CRUD, booking list, manifest/export, cancellation, audit events and safe demo reset. Verify role restrictions and sold-seat edit guards.
7. **Polish and deployment:** original composition, optimised media, three-language UI, keyboard/accessibility work, responsive error handling, staging database and Vercel preview. Rerun complete acceptance flows on the deployed URL.

Each checkpoint must leave reviewable working behaviour. Do not treat completion of static screens as completion of the booking system. Deployment requires available Vercel/database access and environment configuration; if missing, finish and validate locally, then report the exact setup dependency without claiming a live preview.

## 12. Acceptance test matrix

- Happy path: search → stops/seats → guest details → demo confirmation → PDF → QR → staff check-in.
- Inventory: concurrent buyers for one seat; all-or-nothing multi-seat hold; expiry/reclaim; blocked seats; cancellation/rebooking; browser refresh; cross-device persistence.
- Confirmation: double-click/retry returns one booking; expired hold fails safely; altered price rejected; closed/cancelled trip rejected.
- Tickets: unknown token, cancelled ticket, wrong-trip scan, repeated check-in and two scanners racing; one success only. Public response omits phone/email/recovery secret.
- Operations: unauthenticated staff mutations denied; check-in role cannot manage routes; layout changes cannot invalidate sold seats; manifest matches bookings; demo reset is scoped.
- Dates: Asia/Colombo midnight, past date, booking cutoff and next-day arrival.
- Usability: 360px phone, tablet, desktop; keyboard-only booking; meaningful labels/errors; readable contrast; reduced motion; missing-image fallback.
- Connectivity: loading/no results, server failure, stale availability, PDF error and camera denial all provide a recovery path.
- Payment: no real transaction, no card collection, every ticket/demo value labelled accurately.
- Build: typecheck, lint, build, focused unit/integration tests and browser end-to-end checks. Check QR decode/PDF legibility and scan the deployed HTTPS ticket on a real phone.

Use meaningful tests for financial totals, seat concurrency, transitions, authorisation and QR validation. Avoid superficial tests mirroring styling.

## 13. Delivery and later production work

Deliver source code, migrations, deterministic demo seed/reset commands, setup/environment documentation, client preview when hosting access is available, protected demo staff access, a short demonstration script and a source/assumption register.

Client-demo script: choose an upcoming Ampara journey; book two seats as a guest; download the two QR tickets; confirm a second browser sees them unavailable; check in one ticket; scan it again; show the other remains unboarded; cancel an unboarded demo booking and show its QR rejected.

Later production release requires Dilanka approval of the operating dataset/policies, selected payment provider and webhook reconciliation, actual notification delivery, abuse controls suited to traffic, production staff/security setup, backups/monitoring and operational handling of changed/cancelled services. Live GPS, segment seat resale, native apps, passenger accounts and offline scanner sync are separate features. Do not advertise them in the prototype.

Immediate next milestone: foundation plus responsive home, search results and seat-selection design, followed by the database/seat engine in the order above.
