"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { ArrowUpRight, Menu, X, Phone, MapPin, ArrowRight } from "lucide-react";
type Lang = "en" | "si" | "ta";
const words = {
  en: {
    home: "Home",
    routes: "Our routes",
    fleet: "Our fleet",
    about: "Our story",
    contact: "Contact",
    book: "Book a journey",
    find: "Find my ticket",
    from: "From",
    to: "To",
    date: "Travel date",
    search: "Find your journey",
    seats: "Choose your seats",
    continue: "Continue",
    passenger: "Passenger details",
    review: "Review booking",
    confirm: "Confirm demo booking",
  },
  si: {
    home: "මුල් පිටුව",
    routes: "ගමන් මාර්ග",
    fleet: "බස් රථ",
    about: "අප ගැන",
    contact: "අමතන්න",
    book: "ආසන වෙන් කරන්න",
    find: "මගේ ටිකට්පත",
    from: "පිටත්වීම",
    to: "ගමනාන්තය",
    date: "ගමන් දිනය",
    search: "ගමන සොයන්න",
    seats: "ආසන තෝරන්න",
    continue: "ඉදිරියට",
    passenger: "මගී විස්තර",
    review: "වෙන්කිරීම පරීක්ෂා කරන්න",
    confirm: "ආදර්ශ වෙන්කිරීම තහවුරු කරන්න",
  },
  ta: {
    home: "முகப்பு",
    routes: "வழித்தடங்கள்",
    fleet: "பேருந்துகள்",
    about: "எங்களைப் பற்றி",
    contact: "தொடர்பு",
    book: "பயணத்தை முன்பதிவு செய்",
    find: "எனது பயணச்சீட்டு",
    from: "புறப்படும் இடம்",
    to: "செல்லும் இடம்",
    date: "பயணத் தேதி",
    search: "பயணத்தைத் தேடு",
    seats: "இருக்கைகளைத் தேர்வு செய்",
    continue: "தொடரவும்",
    passenger: "பயணிகள் விவரங்கள்",
    review: "முன்பதிவை சரிபார்",
    confirm: "மாதிரி முன்பதிவை உறுதிசெய்",
  },
};
const Locale = createContext({ lang: "en" as Lang, t: words.en });
export const useLocale = () => useContext(Locale);
export function Site({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en"),
    [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const saved = localStorage.getItem("de-language") as Lang;
    if (saved && saved in words) setLang(saved);
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const t = words[lang];
  return (
    <Locale.Provider value={{ lang, t }}>
      <div className="demo-strip">
        <span className="demo-dot" /> CLIENT PREVIEW{" "}
        <span className="strip-divider">/</span> Explore freely. All bookings
        are demonstrations.
      </div>
      <header className={pathname === "/" ? "header header-home" : "header"}>
        <div className="container nav">
          <Link href="/" className="brand" aria-label="Dilanka Express home">
            <img src="/images/logo.jpg" alt="DE" />
            <span>
              DILANKA<span className="brand-sub">EXPRESS · SRI LANKA</span>
            </span>
          </Link>
          <nav
            className={open ? "nav-links open" : "nav-links"}
            aria-label="Main navigation"
          >
            <Link
              className={pathname === "/routes" ? "active" : ""}
              href="/routes"
            >
              {t.routes}
            </Link>
            <Link
              className={pathname === "/fleet" ? "active" : ""}
              href="/fleet"
            >
              {t.fleet}
            </Link>
            <Link
              className={pathname === "/about" ? "active" : ""}
              href="/about"
            >
              {t.about}
            </Link>
            <Link
              className={pathname === "/contact" ? "active" : ""}
              href="/contact"
            >
              {t.contact}
            </Link>
          </nav>
          <div className="nav-actions">
            <select
              aria-label="Interface language"
              value={lang}
              onChange={(e) => {
                setLang(e.target.value as Lang);
                localStorage.setItem("de-language", e.target.value);
              }}
            >
              <option value="en">EN</option>
              <option value="si">සිං</option>
              <option value="ta">தமிழ்</option>
            </select>
            <Link href="/find-ticket" className="ticket-link">
              {t.find}
            </Link>
            <Link href="/search" className="button button-dark nav-book">
              {t.book}
              <ArrowUpRight size={16} />
            </Link>
            <button
              className="menu-button icon-button"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main
        className={
          pathname === "/"
            ? "home-content"
            : `interior-content interior-${pathname.split("/")[1] || "page"}`
        }
      >
        {children}
      </main>
      <footer>
        <div className="container footer-top">
          <div>
            <Link href="/" className="brand footer-brand">
              <img src="/images/logo.jpg" alt="DE" />
              <span>
                DILANKA<span className="brand-sub">EXPRESS · SRI LANKA</span>
              </span>
            </Link>
            <h3>
              A better journey begins
              <br />
              with a little care.
            </h3>
            <p>
              Connecting people and places,
              <br />
              from Ampara to the road ahead.
            </p>
          </div>
          <div>
            <span className="eyebrow">EXPLORE</span>
            <Link href="/routes">Routes & schedules</Link>
            <Link href="/fleet">Our fleet</Link>
            <Link href="/about">Our story</Link>
            <Link href="/help">Help & booking policies</Link>
          </div>
          <div>
            <span className="eyebrow">LET’S TALK</span>
            <a href="tel:+94777914680">
              0777 914680 <ArrowUpRight size={14} />
            </a>
            <a href="tel:+94777205634">0777 205634</a>
            <a href="mailto:dilankaexpress@gmail.com">
              dilankaexpress@gmail.com
            </a>
            <p>
              BL-26, 3rd Lane, Ampara
              <br />
              Sri Lanka
            </p>
          </div>
          <div className="footer-cta">
            <span className="eyebrow">YOUR NEXT CHAPTER</span>
            <p>
              Somewhere to be?
              <br />
              We’ll help you get there.
            </p>
            <Link href="/search" className="text-link">
              Find a journey <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} Dilanka Express · Demonstration website
          </span>
          <div>
            <Link href="/help#privacy">Privacy</Link>
            <Link href="/staff">Staff portal</Link>
            <a
              href="https://www.facebook.com/people/Dilanka-Express/100090241902532/"
              target="_blank"
              rel="noreferrer"
            >
              Facebook <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </footer>
    </Locale.Provider>
  );
}
export function Notice({
  children,
  type = "info",
}: {
  children: React.ReactNode;
  type?: "info" | "error" | "success";
}) {
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`notice ${type}`}
    >
      {children}
    </div>
  );
}
export function Loading() {
  return (
    <div className="container loading">
      <span className="spinner" />
      <p>Getting your journey ready…</p>
    </div>
  );
}
export async function api<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const r = await fetch(`/api/${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const result = await r.json();
  if (!r.ok) throw new Error(result.error || "Please try again.");
  return result;
}
export const post = <T = any,>(path: string, body: unknown) =>
  api<T>(path, { method: "POST", body: JSON.stringify(body) });
export function PageTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-title container">
      <div className="breadcrumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>
          {eyebrow.includes("TICKET") || title.includes("ticket")
            ? "Your ticket"
            : "Your journey"}
        </span>
      </div>
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
