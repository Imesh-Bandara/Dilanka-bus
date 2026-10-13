import type { Metadata } from "next";
import { Site } from "@/components/site";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import "./landing.css";
import "./interior.css";
import "./navigation.css";
import "./theme.css";
export const metadata: Metadata = {
  title: {
    default: "Dilanka Express — A better way to journey",
    template: "%s · Dilanka Express",
  },
  description:
    "Discover Sri Lanka with Dilanka Express. Explore routes and try our guest bus booking prototype with scannable QR tickets.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{let t;try{t=localStorage.getItem('de-theme')}catch{}document.documentElement.dataset.theme=t==='light'||t==='dark'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'})()`,
          }}
        />
      </head>
      <body>
        <Site>{children}</Site>
      </body>
    </html>
  );
}
