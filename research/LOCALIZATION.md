# Sinhala and Tamil interface coverage

The language switch now covers the shared shell, landing and information pages, destination filters, route search, city/stop labels, map controls, galleries and video dialogs, departures, seat selection, passenger forms, review, validation/error messages, confirmation, private recovery, public QR verification, staff operations and manifest column labels. PDF downloads use the selected language too.

## Translation sources and boundaries

- `src/lib/locales/catalog.json` holds English source messages and both translations. `src/lib/i18n.ts` contains variable messages, statuses and formatting translations. These are authored translations, with no runtime translation service or external transmission of passenger details.
- Components translate presentation text explicitly using `useTranslation()`. There is no rewriting of rendered page text. Passenger-entered names/contact details, booking references, access codes, registrations, IDs, URLs, form values and QR payloads retain their original values. Brand names, attribution names, technical abbreviations and the staff reset confirmation code remain identifiable.
- Town options have explicit canonical values. Sinhala/Tamil town and help searches include translated text without altering route matching or booking payloads.
- The preference persists in local storage and a same-site language cookie. The root layout reads the cookie using the installed Next.js asynchronous `cookies()` API, so subsequent full reloads render the selected language on the server. This makes pages request-rendered. Old local-storage preferences migrate on first hydration; restricted storage does not prevent switching languages.
- Local Noto Sinhala/Tamil fonts, language-specific line spacing and wrapping support both scripts. Native required-field and format errors follow the chosen language. Third-party video contents, basemap imagery and the browser's own date-picker chrome are controlled by their providers/browser.
- PDFs use the existing fonts and the maintained Fontkit 2 shaper. A small adapter supplies the stream-based subset API expected by pdf-lib. This fixes the observed independent-vowel crash on Sinhala text such as `ඔබේ`. PDF headings and values are translated independently of passenger input. No booking authorisation or QR verification logic changed.

## Checks

- Translation coverage tests verify every explicit UI message, dictionary entries, all seeded town/coach/amenity/stop labels, variable counts, dates, times and invariant codes.
- The booking test generates two-passenger PDFs in English, Sinhala and Tamil. `scripts/verify-localized-pdf.ts` generates an isolated local fixture under ignored `test-output/localization` for visual rendering; it writes no database records.
- Reviewed eight main public pages at 360 px in both languages. Inspected translated mobile header, selected-page labels, native validation, form values, required-field errors and the booking review layout. Corrected Tamil review overflow and shortened utility labels.
- A local QA booking exercised search, selected-seat preservation during language switching, passenger-name preservation (including an English name matching a town), confirmation, Tamil PDF download, public QR verification and private recovery. Cancelled that QA booking afterwards to release its seat. Other passenger records were not changed.
- Sinhala/Tamil PDF fixtures were rendered with Poppler and visually inspected. QR background/payload generation remains unchanged.

Reference documentation: installed Next.js guides for internationalisation, Client Components and asynchronous cookies; [Fontkit](https://github.com/foliojs/fontkit) for font layout/subsetting.
