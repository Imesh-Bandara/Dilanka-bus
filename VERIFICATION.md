# Prototype verification

Verified locally on 13 October 2026. All records used in testing were fictional.

## Automated checks

- TypeScript validation passed.
- Eleven service tests passed: layout integrity; competing seat holds; overnight intermediate boarding dates; atomic multi-seat acquisition; hold expiry; fare tampering; idempotent guest confirmation and private retrieval; cancellation and seat release; wrong-trip/repeat/racing check-in; closed/blocked inventory; QR decoding and Sinhala/Tamil PDF generation.
- Next.js production compilation passed.
- HTTP acceptance smoke passed: authentication, administrator/conductor separation, rejected unauthorised requests, guest confirmation, private ticket protection, QR verification without passenger contacts, PDF download, prevention of editing/blocking booked seats, and repeat check-in rejection.

## Browser acceptance

- Reviewed desktop home, route search, seat selection and booking confirmation.
- Booked two seats as fictional passengers, downloaded the two-page ticket PDF, and visually inspected its rendered output.
- Recovered the booking using its reference and private code.
- Opened a QR destination and observed “Demo ticket verified”, with the correct route, date and seat.
- Confirmed booked seats were unavailable on a subsequent departure view.
- Reviewed the interface at 360px mobile width and corrected route-card text clipping and seat-selection controls.

## Boundaries

- No actual payment, SMS/email delivery or public deployment occurred.
- Hosted PostgreSQL and Vercel require provider configuration and hosted acceptance testing. Transaction tests currently run on embedded PostgreSQL (PGlite).
- QR encoding/decoding and validation were tested; a physical phone camera scan over deployed HTTPS remains to be tested. Localhost links cannot be opened by a separate phone.
- Language switching currently translates navigation/search/booking-step labels; English descriptive and staff copy still needs full translation.
- Fares, future schedules, vehicle assignments, boarding points and policies remain clearly labelled sample assumptions pending client approval.

See README.md for setup, staff credentials location and the client demonstration script.
