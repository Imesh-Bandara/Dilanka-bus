import { LanguageProvider } from "@/components/locale";
import { cookies } from "next/headers";
import { translate } from "@/lib/i18n";
import type { Metadata } from "next";
import { Site } from "@/components/site";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import "./landing.css";
import "./interior.css";
import "./navigation.css";
import "./theme.css";
import "./locale.css";
export async function generateMetadata(): Promise<Metadata> {
  const stored = (await cookies()).get("de-language")?.value;
  const lang = stored === "si" || stored === "ta" ? stored : "en";
  const brand = translate("Dilanka Express", lang);
  return {
    title: {
      default: `${brand} — ${translate("A better way to journey", lang)}`,
      template: `%s · ${brand}`,
    },
    description: translate(
      "Discover Sri Lanka with Dilanka Express. Explore routes and try our guest bus booking prototype with scannable QR tickets.",
      lang,
    ),
    robots: { index: false, follow: false },
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const stored = (await cookies()).get("de-language")?.value;
  const initialLanguage = stored === "si" || stored === "ta" ? stored : "en";
  return (
    <html
      lang={initialLanguage}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{let t;try{t=localStorage.getItem('de-theme')}catch{}document.documentElement.dataset.theme=t==='light'||t==='dark'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'})()`,
          }}
        />
      </head>
      <body>
        <LanguageProvider initialLanguage={initialLanguage}>
          <Site>{children}</Site>
        </LanguageProvider>
      </body>
    </html>
  );
}
