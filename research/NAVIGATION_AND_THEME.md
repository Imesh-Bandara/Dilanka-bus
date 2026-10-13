# Header and appearance update

Reviewed 13 October 2026.

## References

- [FlixBus](https://www.flixbus.com/): separates journey planning and service navigation from booking-management and language tools. Reviewed its public header in the browser and through the official page text.
- [Magiya, Sri Lanka](https://magiya.lk/): distinct Journeys/My Tickets links, a separate utility row for language and text size, and an appearance control. Reviewed the public desktop header in the browser, including its dark presentation.
- [Singapore Airlines](https://www.singaporeair.com/): considered as an additional international travel reference from its public page. The research tool redirected to a regional page, so this update does not claim a complete visual audit of it. National Express's home URL redirected to its international retailer in this pass.

The Dilanka composition is original: a restrained bordered navigation rail, gold current-page outline, compact utility controls, a separate ticket-recovery action and a gold booking button. No competitor branding, copy, photographs or company claims were imported.

## Implemented behaviour

- Sticky header with a balanced brand/navigation/action layout. Current pages expose `aria-current="page"`; hover and keyboard focus have visible boundaries.
- Below 1200 px, navigation becomes an accessible disclosure. It includes booking, ticket recovery, help and a direct hotline. It closes after selection, on outside pointer interaction, on Escape (returning focus to its button), or when expanding to the desktop breakpoint.
- Keyboard skip link targets the main content. Anchored sections account for the sticky header.
- Sun/moon button switches light and dark modes. `de-theme` stores the explicit preference locally, synchronises open tabs, and survives navigation and refresh. Without a saved choice, the system preference applies and follows system changes.
- A fixed inline bootstrap applies the stored/system theme before paint. This follows the installed Next.js guide at `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`. Only the root's intentionally changed theme attribute uses hydration-warning suppression.
- Dark mode uses forest surfaces, warm readable text and gold actions. It covers marketing, information pages, forms, departures, seat selection, recovery, tickets, verification, maps' stop lists, staff tables and dialogs.
- Photographs, embedded video, map tiles and QR pixels are not inverted or filtered. QR codes keep a white background; printed boarding passes use white paper colours. PDF generation and all booking/service behaviour remain unchanged.
- Theme and language controls tolerate unavailable browser storage. Cross-page copy remains subject to the prototype's existing translation scope.

## Validation

Browser checks cover light/dark switching, route changes, refresh, seat selection surviving a theme change, active navigation, Escape dismissal/focus, sticky positioning and mobile menu navigation. Reviewed Sinhala and Tamil header spacing at 1280 px, Tamil menu content at 320 px, and nine page types at 360 px without horizontal document overflow. Inspected the dark ticket QR's white background. Dark text-contrast sampling found and corrected low-contrast landing links, metadata and search controls; this is targeted verification rather than a complete WCAG audit.
