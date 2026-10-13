import messages from "./locales/catalog.json";
export type Language = "en" | "si" | "ta";
const catalog: Record<string, { si: string; ta: string }> = messages;
const patterns: [RegExp, string, string][] = [
  [
    /^Please arrive (\d+) minutes before your boarding time\.$/,
    "නගින වේලාවට විනාඩි $1කට පෙර පැමිණෙන්න.",
    "ஏறும் நேரத்திற்கு $1 நிமிடங்கள் முன் வரவும்.",
  ],
  [
    /^Too (?:small|big):.*$|^Invalid (?:input|email|option|UUID).*$/s,
    "ඇතුළත් කළ විස්තර පරීක්ෂා කර නැවත උත්සාහ කරන්න.",
    "உள்ளிட்ட விவரங்களைச் சரிபார்த்து மீண்டும் முயலவும்.",
  ],
  [
    /^Seats held for (.+)$/,
    "ආසන රඳවා තැබීමේ ඉතිරි කාලය: $1",
    "இருக்கை ஒதுக்கீட்டின் மீதமுள்ள நேரம்: $1",
  ],
  [
    /^Continue with (.+) seats?$/,
    "ආසන $1 සමඟ ඉදිරියට",
    "$1 இருக்கைகளுடன் தொடரவும்",
  ],
  [/^Seat (\d+), (.+)$/, "ආසනය $1, $2", "இருக்கை $1, $2"],
  [/^Passenger for seat (\d+)$/, "ආසන $1 සඳහා මගියා", "இருக்கை $1க்கான பயணி"],
  [/^Passenger (\d+) name$/, "මගියා $1ගේ නම", "பயணி $1 பெயர்"],
  [
    /^Scannable QR for seat (\d+)$/,
    "ආසන $1 සඳහා ස්කෑන් කළ හැකි QR කේතය",
    "இருக்கை $1க்கான ஸ்கேன் செய்யக்கூடிய QR",
  ],
  [
    /^Seat (\d+) checked in successfully\.$/,
    "ආසන $1 ඇතුළුවීම සාර්ථකව සටහන් කෙරිණි.",
    "இருக்கை $1 வருகை வெற்றிகரமாகப் பதிவு செய்யப்பட்டது.",
  ],
  [
    /^Show photo (\d+): (.+)$/,
    "ඡායාරූප $1 පෙන්වන්න: $2",
    "படம் $1 காட்டவும்: $2",
  ],
  [
    /^The editable demo policy allows one bag up to (\d+) kg per seat\. Confirm actual luggage terms with Dilanka before travelling\.$/,
    "ආදර්ශ ප්‍රතිපත්තිය අනුව එක් ආසනයකට කිලෝග්‍රෑම් $1 දක්වා එක් බෑගයක් ගෙන යා හැක. සැබෑ නීති ගමනට පෙර දිලංකා වෙතින් තහවුරු කරගන්න.",
    "மாதிரிக் கொள்கையின்படி ஓர் இருக்கைக்கு $1 கிலோ வரை ஒரு பை அனுமதிக்கப்படும். பயணத்திற்கு முன் உண்மையான விதிகளைத் திலங்காவிடம் உறுதிசெய்யவும்.",
  ],
  [
    /^The demo guidance is (\d+) minutes before your boarding time\. Intermediate stop times and exact boarding points require operator confirmation\.$/,
    "ආදර්ශ උපදෙස අනුව නගින වේලාවට විනාඩි $1කට පෙර පැමිණෙන්න. අතරමැදි වේලා සහ නිවැරදි නගින ස්ථාන ක්‍රියාකරුගෙන් තහවුරු කළ යුතුය.",
    "மாதிரி வழிகாட்டுதலின்படி ஏறும் நேரத்திற்கு $1 நிமிடங்கள் முன் வரவும். இடைநிலை நேரங்களையும் சரியான ஏறும் இடங்களையும் இயக்குநர் உறுதிசெய்ய வேண்டும்.",
  ],
  [
    /^Unboarded demo bookings can be cancelled until (\d+) minutes before departure\. Open your private ticket page to cancel\. No money moves; these are draft rules for client review\.$/,
    "ගමන් ආරම්භ නොකළ ආදර්ශ වෙන්කිරීම් පිටත්වීමට විනාඩි $1කට පෙර දක්වා අවලංගු කළ හැක. පෞද්ගලික ටිකට් පිටුවෙන් අවලංගු කරන්න. මුදල් ගනුදෙනුවක් නොවේ; මේවා සේවාලාභී සමාලෝචනය සඳහා කෙටුම්පත් නීති වේ.",
    "ஏறாத பயணிகளின் மாதிரி முன்பதிவுகளை புறப்பாட்டிற்கு $1 நிமிடங்கள் முன் வரை ரத்துசெய்யலாம். தனிப்பட்ட பயணச்சீட்டுப் பக்கத்தில் ரத்துசெய்யவும். பணப் பரிவர்த்தனை இல்லை; இவை வாடிக்கையாளர் மதிப்பாய்வுக்கான வரைவு விதிகள்.",
  ],
  [
    /^The current demo cutoff is (\d+) minutes before the bus starts its departure\. Choose a later departure if booking has closed\.$/,
    "වත්මන් ආදර්ශ වෙන්කිරීම් සීමාව පිටත්වීමට විනාඩි $1කට පෙරය. වෙන්කිරීම් අවසන් නම් පසු පිටත්වීමක් තෝරන්න.",
    "தற்போதைய மாதிரி முன்பதிவு வரம்பு புறப்பாட்டிற்கு $1 நிமிடங்கள் முன். முன்பதிவு முடிந்தால் பிந்தைய புறப்பாட்டைத் தேர்ந்தெடுக்கவும்.",
  ],
  [
    /^(.+) bus stand · sample boarding point$/,
    "$1 බස් නැවතුම · ආදර්ශ නගින ස්ථානය",
    "$1 பேருந்து நிலையம் · மாதிரி ஏறும் இடம்",
  ],
  [
    /^(.+) bus stand · demo location$/,
    "$1 බස් නැවතුම · ආදර්ශ ස්ථානය",
    "$1 பேருந்து நிலையம் · மாதிரி இடம்",
  ],
  [
    /^(.+) to (.+) approximate route map$/,
    "$1 සිට $2 දක්වා ආදර්ශ මාර්ග සිතියම",
    "$1 முதல் $2 வரை தோராயமான வழித்தட வரைபடம்",
  ],
];
const extras: Record<string, { si: string; ta: string }> = {
  "Discover Sri Lanka with Dilanka Express. Explore routes and try our guest bus booking prototype with scannable QR tickets.":
    {
      si: "දිලංකා එක්ස්ප්‍රස් සමඟ ශ්‍රී ලංකාව සොයායන්න. ගමන් මාර්ග බලන්න, ගිණුමක් නොමැතිව ආසන වෙන්කර ස්කෑන් කළ හැකි QR ටිකට්පත් ලබාගන්නා ආදර්ශය භාවිතා කරන්න.",
      ta: "திலங்கா எக்ஸ்பிரஸுடன் இலங்கையை அறியுங்கள். வழித்தடங்களைப் பார்த்து, கணக்கின்றி முன்பதிவு செய்து ஸ்கேன் செய்யக்கூடிய QR பயணச்சீட்டுகளைப் பெறும் மாதிரியை முயலுங்கள்.",
    },
  issued: { si: "නිකුත් කර ඇත", ta: "வழங்கப்பட்டது" },
  expired: { si: "කල් ඉකුත් වී ඇත", ta: "காலாவதியானது" },
  guest: { si: "ආගන්තුක මගියා", ta: "விருந்தினர் பயணி" },
  admin: { si: "පරිපාලක", ta: "நிர்வாகி" },
  "seat.blocked": {
    si: "ආසන අවහිරය වෙනස් කෙරිණි",
    ta: "இருக்கைத் தடை மாற்றப்பட்டது",
  },
  "demo.bookings_reset": {
    si: "ආදර්ශ වෙන්කිරීම් යළි සකස් කෙරිණි",
    ta: "மாதிரி முன்பதிவுகள் மீட்டமைக்கப்பட்டன",
  },
  your: { si: "ඔබේ", ta: "உங்கள்" },
  "booking.confirmed": {
    si: "වෙන්කිරීම තහවුරු කෙරිණි",
    ta: "முன்பதிவு உறுதிசெய்யப்பட்டது",
  },
  "booking.cancelled": {
    si: "වෙන්කිරීම අවලංගු කෙරිණි",
    ta: "முன்பதிவு ரத்துசெய்யப்பட்டது",
  },
  "ticket.checked_in": {
    si: "ටිකට් ඇතුළුවීම සටහන් කෙරිණි",
    ta: "பயணச்சீட்டு வருகை பதிவு செய்யப்பட்டது",
  },
  "trip.saved": { si: "පිටත්වීම සුරැකිණි", ta: "புறப்பாடு சேமிக்கப்பட்டது" },
  "bus.saved": { si: "වාහනය සුරැකිණි", ta: "வாகனம் சேமிக்கப்பட்டது" },
  "route.saved": { si: "මාර්ගය සුරැකිණි", ta: "வழித்தடம் சேமிக்கப்பட்டது" },
  "policy.updated": {
    si: "ප්‍රතිපත්තිය යාවත්කාලීන කෙරිණි",
    ta: "கொள்கை புதுப்பிக்கப்பட்டது",
  },
  "demo.reset": {
    si: "ආදර්ශ දත්ත යළි සකස් කෙරිණි",
    ta: "மாதிரித் தரவு மீட்டமைக்கப்பட்டது",
  },
  "Check-in": { si: "ඇතුළුවීම", ta: "வருகைப் பதிவு" },
  "Zoom in": { si: "විශාල කරන්න", ta: "பெரிதாக்கவும்" },
  "Zoom out": { si: "කුඩා කරන්න", ta: "சிறிதாக்கவும்" },
  contributors: { si: "දායකයන්", ta: "பங்களிப்பாளர்கள்" },
  "No payment collected": {
    si: "ගෙවීමක් අය නොකෙරිණි",
    ta: "கட்டணம் வசூலிக்கப்படவில்லை",
  },
  CANCELLED: { si: "අවලංගුය", ta: "ரத்துசெய்யப்பட்டது" },
  "Your journey, thoughtfully connected.": {
    si: "සැලකිල්ලෙන් එක්කළ ඔබේ ගමන.",
    ta: "அக்கறையுடன் இணைந்த உங்கள் பயணம்.",
  },
  "DEMO TICKET - NOT VALID FOR TRAVEL": {
    si: "ආදර්ශ ටිකට්පත - ගමන් සඳහා වලංගු නැත",
    ta: "மாதிரிப் பயணச்சீட்டு - பயணத்திற்கு செல்லுபடியாகாது",
  },
  "Seat / vehicle": { si: "ආසනය / වාහනය", ta: "இருக்கை / வாகனம்" },
  "Ticket fare including service fee": {
    si: "සේවා ගාස්තුව ඇතුළත් ටිකට් ගාස්තුව",
    ta: "சேவைக் கட்டணம் உட்பட பயணச்சீட்டுக் கட்டணம்",
  },
  "Scan to verify this demo ticket": {
    si: "ආදර්ශ ටිකට්පත පරීක්ෂා කිරීමට ස්කෑන් කරන්න",
    ta: "மாதிரிப் பயணச்சீட்டைச் சரிபார்க்க ஸ்கேன் செய்யவும்",
  },
  Hotline: { si: "ඇමතුම් අංක", ta: "உதவி எண்" },
  "Please complete this field.": {
    si: "මෙම කොටස පුරවන්න.",
    ta: "இந்தப் புலத்தை நிரப்பவும்.",
  },
  "Please enter a valid email address.": {
    si: "වලංගු ඊමේල් ලිපිනයක් ඇතුළත් කරන්න.",
    ta: "சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.",
  },
  "Please use the requested format.": {
    si: "දක්වා ඇති ආකෘතිය භාවිතා කරන්න.",
    ta: "கோரப்பட்ட வடிவத்தைப் பயன்படுத்தவும்.",
  },
  "Please check the length of this value.": {
    si: "මෙම අගයේ දිග පරීක්ෂා කරන්න.",
    ta: "இந்த மதிப்பின் நீளத்தைச் சரிபார்க்கவும்.",
  },
  "Please enter a value within the allowed range.": {
    si: "අවසර ඇති සීමාව තුළ අගයක් ඇතුළත් කරන්න.",
    ta: "அனுமதிக்கப்பட்ட வரம்பிற்குள் மதிப்பை உள்ளிடவும்.",
  },
  "Please enter a valid value.": {
    si: "වලංගු අගයක් ඇතුළත් කරන්න.",
    ta: "சரியான மதிப்பை உள்ளிடவும்.",
  },
  "A better way to journey": {
    si: "ගමනට වඩා හොඳ මඟක්",
    ta: "பயணத்திற்கு ஒரு சிறந்த வழி",
  },
  confirmed: { si: "තහවුරු කර ඇත", ta: "உறுதிசெய்யப்பட்டது" },
  cancelled: { si: "අවලංගුය", ta: "ரத்துசெய்யப்பட்டது" },
  "checked in": { si: "ඇතුළුවීම සටහන් කළ", ta: "வருகை பதிவு செய்யப்பட்டது" },
  checked_in: { si: "ඇතුළුවීම සටහන් කළ", ta: "வருகை பதிவு செய்யப்பட்டது" },
  valid: { si: "වලංගුයි", ta: "செல்லுபடியாகும்" },
  active: { si: "සක්‍රියයි", ta: "செயலில்" },
  open: { si: "විවෘතයි", ta: "திறந்துள்ளது" },
  closed: { si: "වසා ඇත", ta: "மூடப்பட்டது" },
  demo: { si: "ආදර්ශය", ta: "மாதிரி" },
  available: { si: "ලබාගත හැක", ta: "கிடைக்கிறது" },
  unavailable: { si: "ලබාගත නොහැක", ta: "கிடைக்கவில்லை" },
  selected: { si: "තෝරා ඇත", ta: "தேர்ந்தெடுக்கப்பட்டது" },
  "Holding…": { si: "රඳවා තබමින්…", ta: "ஒதுக்கப்படுகிறது…" },
  "Preparing…": { si: "සූදානම් කරමින්…", ta: "தயாராகிறது…" },
  carousel: { si: "ඡායාරූප පෙළ", ta: "படத் தொடர்" },
  "Our help": { si: "උදව්", ta: "உதவி" },
  "Our routes": messages["Our routes"],
  "Our fleet": messages["Our fleet"],
  "Southern Expressway": {
    si: "දක්ෂිණ අධිවේගී මාර්ගය",
    ta: "தெற்கு அதிவேக நெடுஞ்சாலை",
  },
  corridors: { si: "ගමන් මාර්ග", ta: "வழித்தடங்கள்" },
  "The coastal connection": { si: "වෙරළබඩ සම්බන්ධතාව", ta: "கடற்கரை இணைப்பு" },
};
/** Translate presentation text only. Canonical IDs, form values, URLs and passenger input stay untouched. */
export function translate(value: string, lang: Language): string {
  if (lang === "en" || !/[A-Za-z]/.test(value)) return value;
  const text = value.replace(/\s+/g, " ").trim();
  const message = catalog[text] || extras[text];
  let result = message?.[lang];
  if (!result)
    for (const [pattern, si, ta] of patterns) {
      const match = text.match(pattern);
      if (!match) continue;
      const template = lang === "si" ? si : ta;
      result = template.replace(/\$(\d+)/g, (_, index) =>
        translate(match[Number(index)], lang),
      );
      break;
    }
  if (!result && /^\d{1,2} [A-Z][a-z]{2} \d{4}$/.test(text)) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const translated =
      lang === "si"
        ? [
            "ජන",
            "පෙබ",
            "මාර්තු",
            "අප්‍රේල්",
            "මැයි",
            "ජූනි",
            "ජූලි",
            "අගෝ",
            "සැප්",
            "ඔක්",
            "නොවැ",
            "දෙසැ",
          ]
        : [
            "ஜன",
            "பிப்",
            "மார்",
            "ஏப்",
            "மே",
            "ஜூன்",
            "ஜூலை",
            "ஆக",
            "செப்",
            "அக்",
            "நவ",
            "டிச",
          ];
    result = text.replace(
      /[A-Z][a-z]{2}/,
      (m) => translated[months.indexOf(m)] || m,
    );
  }
  if (!result && /^\d{1,2}:\d{2}\s?[ap]m$/i.test(text))
    result = text
      .replace(/am/i, lang === "si" ? "පෙ.ව." : "மு.ப.")
      .replace(/pm/i, lang === "si" ? "ප.ව." : "பி.ப.");
  if (!result && /^(?:LKR|Rs\.?)\s*[\d,.]+$/.test(text))
    result = text.replace(/^(?:LKR|Rs\.?)/, lang === "si" ? "රු." : "ரூ.");
  if (!result && /^\d+h(?: \d+m)?$/.test(text))
    result = text
      .replace(/h/, lang === "si" ? " පැය" : " மணி")
      .replace(/m/, lang === "si" ? " විනාඩි" : " நிமிடம்");
  if (!result && /^\d+m$/.test(text))
    result = text.replace(/m/, lang === "si" ? " විනාඩි" : " நிமிடம்");
  if (!result && text.includes(" · ")) {
    const parts = text.split(" · ");
    const localized = parts.map((p) => translate(p, lang));
    if (localized.some((p, i) => p !== parts[i]))
      result = localized.join(" · ");
  }
  if (!result && /^[A-Za-z ]+ to [A-Za-z ]+$/.test(text)) {
    const [from, to] = text.split(" to ");
    if (catalog[from] && catalog[to])
      result =
        lang === "si"
          ? `${translate(from, lang)} සිට ${translate(to, lang)} දක්වා`
          : `${translate(from, lang)} முதல் ${translate(to, lang)} வரை`;
  }
  if (!result && text.includes(", ")) {
    const parts = text.split(", ");
    if (parts.every((p) => catalog[p]))
      result = parts.map((p) => translate(p, lang)).join(", ");
  }
  if (!result) return value;
  return (
    (value.startsWith(" ") ? " " : "") +
    result +
    (value.endsWith(" ") ? " " : "")
  );
}
