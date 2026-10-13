"use client";
import { useTranslation, useLocale } from "./locale";
export { useLocale } from "./locale";
import type { Language } from "@/lib/i18n";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Menu,
  X,
  Phone,
  Globe2,
  Ticket,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
export function Site({ children }: { children: React.ReactNode }) {
  const tr = useTranslation();
  const { lang, setLang, t } = useLocale();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const header = useRef<HTMLElement>(null),
    menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    const closeOutside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    };
    const desktop = matchMedia("(min-width: 1200px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);

  const navigation = [
    ["/routes", t.routes],
    ["/fleet", t.fleet],
    ["/about", t.about],
    ["/contact", t.contact],
  ];
  return (
    <>
      <a className="skip-link" href="#main-content">
        {tr(" Skip to content ")}
      </a>
      <div className="demo-strip">
        <span className="demo-dot" /> <span>{tr(" CLIENT PREVIEW")}</span>
        {tr(" ")}
        <span className="strip-divider">/</span>{" "}
        <span className="demo-message">
          {tr(" Explore freely. All bookings are demonstrations. ")}
        </span>
      </div>
      <header ref={header} className="site-header">
        <div className="header-shell">
          <Link
            href="/"
            className="brand"
            aria-label={tr("Dilanka Express home")}
          >
            <img src="/images/logo.jpg" alt={tr("DE")} />
            <span>
              {tr(" DILANKA")}
              <span className="brand-sub">{tr("EXPRESS · SRI LANKA")}</span>
            </span>
          </Link>
          <nav
            id="primary-navigation"
            className={open ? "primary-nav is-open" : "primary-nav"}
            aria-label={tr("Main navigation")}
          >
            <span className="mobile-nav-heading eyebrow">
              {tr("EXPLORE DILANKA")}
            </span>
            <div className="primary-nav-rail">
              {navigation.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="primary-nav-link"
                  aria-current={pathname === href ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {tr(label)}
                  <ArrowUpRight className="mobile-link-arrow" size={17} />
                </Link>
              ))}
            </div>
            <div className="mobile-nav-actions">
              <Link
                href="/search"
                className="header-book"
                onClick={() => setOpen(false)}
              >
                {tr(t.book)}
                <ArrowUpRight size={18} />
              </Link>
              <Link
                href="/find-ticket"
                className="header-ticket"
                aria-current={
                  pathname.startsWith("/ticket/") || pathname === "/find-ticket"
                    ? "page"
                    : undefined
                }
                onClick={() => setOpen(false)}
              >
                <Ticket size={18} />
                {tr(t.find)}
                <ArrowRight size={16} />
              </Link>
              <div className="mobile-nav-support">
                <Link href="/help" onClick={() => setOpen(false)}>
                  {tr(" Help & policies ")}
                </Link>
                <a href="tel:+94777914680">
                  <Phone size={14} />
                  0777 914680
                </a>
              </div>
            </div>
          </nav>
          <div className="header-actions">
            <label className="header-language header-control">
              <Globe2 size={16} />
              <select
                aria-label={tr("Interface language")}
                value={lang}
                onChange={(e) => {
                  setLang(e.target.value as Language);
                }}
              >
                <option value="en">{tr("EN")}</option>
                <option value="si">සිං</option>
                <option value="ta">தமிழ்</option>
              </select>
              <ChevronDown size={12} />
            </label>
            <ThemeToggle />
            <span className="header-action-divider" aria-hidden="true" />
            <Link
              href="/find-ticket"
              className="header-ticket"
              aria-label={tr(t.find)}
              aria-current={
                pathname.startsWith("/ticket/") || pathname === "/find-ticket"
                  ? "page"
                  : undefined
              }
            >
              <Ticket size={17} />
              <span>{tr(t.find)}</span>
            </Link>
            <Link
              href="/search"
              className="header-book"
              aria-current={
                pathname === "/search" || pathname.startsWith("/book/")
                  ? "page"
                  : undefined
              }
            >
              {tr(t.book)}
              <ArrowUpRight size={16} />
            </Link>
            <button
              ref={menuButton}
              type="button"
              className="header-menu header-control"
              onClick={() => setOpen(!open)}
              aria-label={tr(open ? "Close menu" : "Open menu")}
              aria-expanded={open}
              aria-controls="primary-navigation"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className={
          pathname === "/"
            ? "home-content"
            : `interior-content interior-${pathname.split("/")[1] || "page"}`
        }
      >
        {tr(children)}
      </main>
      <footer>
        <div className="container footer-top">
          <div>
            <Link href="/" className="brand footer-brand">
              <img src="/images/logo.jpg" alt={tr("DE")} />
              <span>
                {tr(" DILANKA")}
                <span className="brand-sub">{tr("EXPRESS · SRI LANKA")}</span>
              </span>
            </Link>
            <h3>
              {tr(" A better journey begins ")}
              <br />
              {tr(" with a little care. ")}
            </h3>
            <p>
              {tr(" Connecting people and places, ")}
              <br />
              {tr(" from Ampara to the road ahead. ")}
            </p>
          </div>
          <div>
            <span className="eyebrow">{tr("EXPLORE")}</span>
            <Link href="/routes">{tr("Routes & schedules")}</Link>
            <Link href="/fleet">{tr("Our fleet")}</Link>
            <Link href="/about">{tr("Our story")}</Link>
            <Link href="/help">{tr("Help & booking policies")}</Link>
          </div>
          <div>
            <span className="eyebrow">{tr("LET’S TALK")}</span>
            <a href="tel:+94777914680">
              0777 914680 <ArrowUpRight size={14} />
            </a>
            <a href="tel:+94777205634">0777 205634</a>
            <a href="mailto:dilankaexpress@gmail.com">
              {tr(" dilankaexpress@gmail.com ")}
            </a>
            <p>
              {tr(" BL-26, 3rd Lane, Ampara ")}
              <br />
              {tr(" Sri Lanka ")}
            </p>
          </div>
          <div className="footer-cta">
            <span className="eyebrow">{tr("YOUR NEXT CHAPTER")}</span>
            <p>
              {tr(" Somewhere to be? ")}
              <br />
              {tr(" We’ll help you get there. ")}
            </p>
            <Link href="/search" className="text-link">
              {tr(" Find a journey ")}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {tr(new Date().getFullYear())}{" "}
            {tr(" Dilanka Express · Demonstration website ")}
          </span>
          <div>
            <Link href="/help#privacy">{tr("Privacy")}</Link>
            <Link href="/staff">{tr("Staff portal")}</Link>
            <a
              href="https://www.facebook.com/people/Dilanka-Express/100090241902532/"
              target="_blank"
              rel="noreferrer"
            >
              {tr(" Facebook ")}
              <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
export function Notice({
  children,
  type = "info",
}: {
  children: React.ReactNode;
  type?: "info" | "error" | "success";
}) {
  const tr = useTranslation();
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`notice ${type}`}
    >
      {tr(children)}
    </div>
  );
}
export function Loading() {
  const tr = useTranslation();
  return (
    <div className="container loading">
      <span className="spinner" />
      <p>{tr("Getting your journey ready…")}</p>
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
  const tr = useTranslation();
  return (
    <div className="page-title container">
      <div className="breadcrumbs">
        <Link href="/">{tr("Home")}</Link>
        <span>/</span>
        <span>
          {tr(
            eyebrow.includes("TICKET") || title.includes("ticket")
              ? "Your ticket"
              : "Your journey",
          )}
        </span>
      </div>
      <span className="eyebrow">{tr(eyebrow)}</span>
      <h1>{tr(title)}</h1>
      <p>{tr(description)}</p>
    </div>
  );
}
