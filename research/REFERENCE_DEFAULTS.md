# Nuwantha / Tripimate reference values for the Dilanka prototype

Inspected 13 October 2026. User requested these sources as a basis for missing prototype details. These are Nuwantha/Tripimate observations and proposed demo assumptions, not confirmation of Dilanka's operating data.

## Reference fares and assignments

| Reference service | Bus | Departure → arrival | Seats | Fare evidence |
| --- | --- | --- | --- | --- |
| Colombo–Meegahakiula | NE-3909, Yutong C12 Pro Super Luxury AC | 14:30 → 21:30 | 51 | Booking form: LKR 2,115 fare + LKR 100 fee = LKR 2,215 |
| Katunayake–Badulla | NE-3908, Yutong C12 Pro Super Luxury AC | 18:30 → 01:00 next day | 51 | Schedule card: LKR 2,119; component breakdown not inspected |
| Colombo–Ampara | NE-5106, Leyland Luxury AC | 20:45 → 04:30 next day | 49 | Booking form: LKR 2,695 fare + LKR 100 fee = LKR 2,795 |
| Ampara–Colombo | NE-5104, Leyland Luxury AC | 16:15 → 02:00 next day | 49 | Schedule card: LKR 2,795; component breakdown not inspected |

The supplied routeId=18 link is Colombo–Meegahakiula, not Ampara. Nuwantha's home page links its routes to Tripimate and does not establish any common fleet ownership with Dilanka. Nuwantha's registrations above must not appear as actual Dilanka bus assignments.

Sources:
- https://nuwantha.lk/
- https://www.tripimate.com/schedules
- https://www.tripimate.com/book?routeId=18&date=2026-10-13&scheduleId=22
- https://www.tripimate.com/book?routeId=27&date=2026-10-13&scheduleId=34

## Exact seat numbering observed

Rows below run from rear at the top to front at the bottom, in the reference screen's left-to-right order. Preserve the driver/aisle geometry separately; a five-seat rear row is contiguous. The final pair in the 51-seat layout is on the screen's right, with driver at front left. Disabled seats are date-specific availability, not evidence that numbered positions should be removed from the layout.

51-seat NE-3909:
```
47 48 51 50 49
41 42 | 46 45
37 38 | 44 43
33 34 | 40 39
29 30 | 36 35
25 26 | 32 31
21 22 | 28 27
17 18 | 24 23
13 14 | 20 19
09 10 | 16 15
05 06 | 12 11
01 02 | 08 07
      | 04 03
```

49-seat NE-5106:
```
49 48 47 46 45
44 43 | 42 41
40 39 | 38 37
36 35 | 34 33
32 31 | 30 29
28 27 | 26 25
24 23 | 22 21
20 19 | 18 17
16 15 | 14 13
12 11 | 10 09
08 07 | 06 05
04 03 | 02 01
```

Dilanka's separately observed NE-3230 layout has 53 positions. Keep all three as distinct templates. Assign unconfirmed 49/51-seat templates to fictional DEMO vehicle IDs only, until Dilanka confirms a match.

## Policy observations

The booking form states one bag up to 15 kg per seat, with excess charged at boarding. Cancellation/refund requests go through WhatsApp with the receipt at least three hours before departure; missed travel, late arrival and boarding the wrong bus are excluded.

Tripimate's general ticket policy describes login, full payment, emailed non-transferable tickets, ticket plus ID at boarding, and arrival at least 15 minutes early. Its schedules page advises 30 minutes early instead. Its general booking timing is at least three hours before departure, but the inspected individual trip cutoffs are 90 minutes before departure (13:00 for 14:30 and 19:15 for 20:45). Record these inconsistencies rather than presenting a single confirmed rule.

Sources:
- https://www.tripimate.com/ticket-policy
- https://www.tripimate.com/refund
- The booking and schedules pages above.

## Proposed demo defaults

- Colombo–Ampara and return: LKR 2,695 base + LKR 100 service fee, labelled sample fare based on a reference operator.
- Use Dilanka-published corridors/times from DILANKA_RESEARCH.md where available; retain demo status and do not substitute another operator's registrations.
- NE-3230 may use its observed 53-seat chart. Fictional DEMO buses may use the observed 49/51-seat reference charts.
- Prototype policy draft: one bag up to 15 kg; arrive 30 minutes early; cancellation requests at least three hours before departure. These are editable assumptions awaiting Dilanka approval.
- Use a three-hour booking cutoff as a conservative demo default, explicitly a chosen assumption given conflicting reference guidance. Demo trips must be seeded sufficiently far ahead to remain bookable.
- Customer guest checkout, simulated payment and immediate downloadable QR ticket follow the user's requirements. Do not inherit Tripimate's login/payment requirements.
- Do not display Tripimate's support number on Dilanka pages. Do not send cancellation messages or perform real refunds. Any WhatsApp support link must use a confirmed Dilanka number and be user-initiated.
- Label all tickets Demo — not valid for travel. Real operating approval remains a separate step when moving beyond the prototype.
