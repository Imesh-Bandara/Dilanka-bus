# Media and route-map additions

Reviewed 13 October 2026. The supplied screenshots informed the feature request; competitor photographs were not reused.

## Dilanka media

- Fleet lineup and team: https://www.facebook.com/photo.php?fbid=1038245622526825 — company photograph optimised to `public/images/dilanka-lineup.webp`.
- Hill-country coach: https://www.facebook.com/photo.php?fbid=1047297211621666 — company photograph with photographer watermark retained; `public/images/dilanka-hills.webp`, source copy in `research/assets/dilanka-hills-facebook.jpg`.
- Existing Yutong pair: https://www.facebook.com/photo/?fbid=1093924306958956 — `public/images/fleet.webp`.
- Short company film: https://www.facebook.com/reel/1217697760553948 — “Comfort. Safety. Reliability.”, 14 February; embedded player reported duration/currentTime 10.68 seconds and ended=true during browser acceptance testing.
- Featured expressway film: https://www.facebook.com/100090241902532/videos/1075628290781857/ — previously researched public company announcement.

Photographs are Facebook-served copies. Obtain approved originals before public client launch. Fleet photography is labelled illustrative on demo departures, rather than asserting a photographed registration is assigned to a particular trip. A matching Dilanka cabin still was not found in the inspected sources; another operator's interior was not substituted.

Videos load through Facebook's embedded player after the user chooses Play. A direct Facebook link is available if playback fails. No video was downloaded or republished locally.

## References and implementation

- FlixBus route-map and stop-details navigation: https://global.flixbus.com/bus-routes
- Leaflet markers, polylines and popups: https://leafletjs.com/examples/quick-start/
- OpenStreetMap tile policy: https://operations.osmfoundation.org/policies/tiles/
- RDA E01 network description: https://www.exway.rda.gov.lk/index.php?page=expressway_network/e01 — establishes the Kottawa–Mattala southern corridor.
- Dilanka's expressway announcement lists Mattala, Southern Expressway and Makumbura; see DILANKA_RESEARCH.md.

The prototype uses Leaflet 1.9.4, visible OSM attribution, lazy map initialisation, no tile prefetching, and an origin-only image referrer compatible with the tile policy. No map key is required for this small preview. Review provider suitability before high-traffic deployment.

`src/lib/journey-map.ts` contains manually rounded town centres and illustrative corridor points, not surveyed boarding locations or approved road geometry. Dashed green shows the main corridor; dashed gold shows the indicative E01 section. Interchanges do not become selectable boarding stops. Both highway directions include the southern corridor rather than drawing a direct line from Thanamalvila to Makumbura. Exact road routing, entry/exit, distance and live GPS are not claimed.

The stop list retains the same trip stops/times used by booking. Selecting a town focuses the map and shows a Google Maps town search link. Unknown towns added through staff tools remain in the list even without mapped coordinates.
