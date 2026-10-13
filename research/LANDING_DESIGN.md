# Landing page redesign

Prepared 13 October 2026. This redesign keeps the existing guest booking, QR/PDF, map, staff and demo-data behaviour.

## International references

- Vonlane (United States): https://vonlane.com/ — spacious service presentation, clear booking entry, service details and FAQ progression.
- National Express (United Kingdom): https://www.nationalexpress.com/en — prominent journey planning and route exploration. Its international page was reachable, but its rendered page content was limited in the research tool.
- The Jet (United States): https://thejet.coach/features-amenities/ — considered as a premium-coach presentation reference. Its fleet/service claims are not attributed to Dilanka.

The implementation uses original Dilanka copy, ivory/forest/champagne-gold styling, an editorial serif heading system, a fleet-photo hero, live journey search, category-filtered destinations, fleet information, three booking steps, company media, a company story, useful FAQs and a final booking entry.

## Photographs and saved files

| Asset                            | Saved location                                    | Source                                                                                                     |
| -------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Enhanced fleet hero              | `public/images/dilanka-fleet-enhanced.webp`       | Client attachment edited using the built-in image-generation tool                                          |
| Full-resolution enhanced master  | `research/assets/dilanka-fleet-enhanced.png`      | Same generated edit, preserved without overwriting the original                                            |
| Original fleet photo for website | `public/images/dilanka-fleet-original.webp`       | Client attachment, compression/size optimisation only                                                      |
| Original client upload           | `research/assets/dilanka-fleet-user-original.jpg` | Client attachment                                                                                          |
| Colombo                          | `public/images/destination-colombo.webp`          | Manorie Kodithuwakku: https://unsplash.com/photos/lotus-tower-stands-tall-over-a-city-skyline-6iqB-y0EBCw  |
| Kandy Lake                       | `public/images/destination-kandy.webp`            | Ajai S: https://unsplash.com/photos/a-serene-lake-under-a-clear-blue-sky-haJVERPHkGE                       |
| Matara coastline                 | `public/images/destination-matara.webp`           | Kasun Eranda: https://unsplash.com/photos/aerial-view-of-a-tropical-beach-with-rocky-coastline-7II6rU76_3Q |

Destination photographs were marked free under the Unsplash License on their individual source pages: https://unsplash.com/license. Credits are available on the landing page. Destination photos do not assert exact boarding-point locations. Existing Dilanka Facebook photographs retain their earlier provenance in MEDIA_AND_MAPS.md.

The hero is explicitly described as a photograph enhanced for presentation; the original is shown in the fleet section. AI enhancement may alter small visual details and is not evidence of a vehicle's current condition or specifications. The image was inspected before integration. All web images are stored locally as optimised WebP files, with offscreen images lazy-loaded.

## Final image prompt

Built-in image-generation tool, edit mode. Edit target: the client-supplied four-coach fleet photograph.

> Use case: lighting-weather / precise-object-edit. Edit target: the supplied real Dilanka Express fleet photograph. Create a polished, photorealistic luxury travel website photograph, wide landscape 16:9. Preserve exactly the same four gold Dilanka coaches, their physical shapes, their placement, recognisable black DE logo, Dilanka Express lettering, badges, wheels and windows; do not invent another vehicle, people, interiors or travel amenities. Preserve the depot context and perspective. Carefully remove distracting overhead utility wires and minor litter/clutter. Improve natural colour balance, recover detail in highlights and windows, make gold paint warm champagne-gold rather than oversaturated yellow, sky a softly graduated natural blue, and give the photo elegant warm late-afternoon editorial lighting with believable shadows. Keep the buses tack-sharp with realistic texture, soften only the distant depot background very slightly. Retain a clean sky area and wide framing suitable for a full-width website banner. No added typography, no slogan, no watermark, no fake company logos, no illustration, no excessive HDR, no dramatic invented landscape. This is tasteful photographic enhancement of the actual fleet, not a new coach design.

## Verification

Browser review includes desktop composition, a 360px mobile viewport, destination category filtering, FAQ expansion, anchor navigation and the original search form. The booking/backend logic was not changed. Production build and TypeScript validation are performed before handoff.
