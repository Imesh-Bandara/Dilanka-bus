"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { translate, type Language } from "@/lib/i18n";
import { usePathname } from "next/navigation";

const labelKeys = {
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
};
const LanguageContext = createContext({
  lang: "en" as Language,
  setLang: (_: Language) => {},
});
function saveLanguageCookie(lang: Language) {
  try {
    document.cookie = `de-language=${lang}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  } catch {}
}
export function LanguageProvider({
  children,
  initialLanguage = "en",
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const [lang, setLanguage] = useState<Language>(initialLanguage);
  const pathname = usePathname();
  useEffect(() => {
    try {
      const saved = localStorage.getItem("de-language");
      if (saved === "si" || saved === "ta" || saved === "en") {
        setLanguage(saved);
        saveLanguageCookie(saved);
      }
    } catch {}
    const sync = (event: StorageEvent) => {
      if (event.key === "de-language")
        setLanguage(
          event.newValue === "si" || event.newValue === "ta"
            ? event.newValue
            : "en",
        );
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    const labels: Record<string, string> = {
      routes: "Our routes",
      fleet: "Our fleet",
      about: "Our story",
      contact: "Contact",
      help: "Help & policies",
      search: "Find your journey",
      book: "Book a journey",
      ticket: "Your ticket",
      "find-ticket": "Find my ticket",
      verify: "DILANKA EXPRESS · QR VERIFICATION",
      staff: "Staff portal",
    };
    const title = `${translate(labels[pathname.split("/")[1]] || "A better way to journey", lang)} · ${translate("Dilanka Express", lang)}`;
    const syncTitle = () => {
      if (document.title !== title) document.title = title;
    };
    syncTitle();
    // Next may stream page metadata after the layout effect; retain the chosen language.
    const titleObserver = new MutationObserver(syncTitle);
    titleObserver.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    const invalid = (event: Event) => {
      const field = event.target;
      if (!(
        field instanceof HTMLInputElement ||
        field instanceof HTMLSelectElement ||
        field instanceof HTMLTextAreaElement
      ))
        return;
      const v = field.validity;
      const message = v.valueMissing
        ? "Please complete this field."
        : v.typeMismatch &&
            field instanceof HTMLInputElement &&
            field.type === "email"
          ? "Please enter a valid email address."
          : v.patternMismatch
            ? "Please use the requested format."
            : v.tooShort || v.tooLong
              ? "Please check the length of this value."
              : v.rangeUnderflow || v.rangeOverflow
                ? "Please enter a value within the allowed range."
                : "Please enter a valid value.";
      field.setCustomValidity(translate(message, lang));
    };
    const clear = (event: Event) => {
      const field = event.target;
      if (
        field instanceof HTMLInputElement ||
        field instanceof HTMLSelectElement ||
        field instanceof HTMLTextAreaElement
      )
        field.setCustomValidity("");
    };
    // Reset stale browser validation when switching languages, without touching input values.
    document
      .querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >("input,select,textarea")
      .forEach((field) => field.setCustomValidity(""));
    document.addEventListener("invalid", invalid, true);
    document.addEventListener("input", clear, true);
    document.addEventListener("change", clear, true);
    return () => {
      titleObserver.disconnect();
      document.removeEventListener("invalid", invalid, true);
      document.removeEventListener("input", clear, true);
      document.removeEventListener("change", clear, true);
    };
  }, [lang, pathname]);
  const setLang = useCallback((value: Language) => {
    setLanguage(value);
    saveLanguageCookie(value);
    try {
      localStorage.setItem("de-language", value);
    } catch {}
  }, []);
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
export function useTranslation() {
  const { lang } = useContext(LanguageContext);
  return useCallback(
    <T,>(value: T): T =>
      typeof value === "string"
        ? (translate(value, lang) as T)
        : Array.isArray(value)
          ? (value.map((item) =>
              typeof item === "string" ? translate(item, lang) : item,
            ) as T)
          : value,
    [lang],
  );
}
export function useLocale() {
  const context = useContext(LanguageContext);
  return {
    ...context,
    t: Object.fromEntries(
      Object.entries(labelKeys).map(([key, value]) => [
        key,
        translate(value, context.lang),
      ]),
    ) as typeof labelKeys,
  };
}
