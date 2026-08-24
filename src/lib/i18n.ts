export const SUPPORTED_LOCALES = ["en", "fr", "es", "de"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = "en";

const rawMessages = {
  en: () => import("@/../locales/en.json"),
  fr: () => import("@/../locales/fr.json"),
  es: () => import("@/../locales/es.json"),
  de: () => import("@/../locales/de.json"),
} as const;

export type TranslationDictionary = Record<string, string | Record<string, unknown>>;

export function isSupportedLocale(value: string): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale);
}

export function normalizeLocale(value?: string | null): SupportedLocale {
  const locale = (value ?? DEFAULT_LOCALE).toLowerCase();
  return isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
}

export function getLocaleFromPath(pathname: string): SupportedLocale {
  const trimmed = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const first = trimmed.split("/").filter(Boolean)[0];
  return isSupportedLocale(first) ? first : DEFAULT_LOCALE;
}

export function stripLocaleFromPath(pathname: string): string {
  const trimmed = pathname === "/" ? "/" : pathname.replace(/^\/+/, "/");
  const segments = trimmed.split("/").filter(Boolean);

  if (segments.length === 0) return "/";
  if (isSupportedLocale(segments[0])) {
    const rest = segments.slice(1);
    return rest.length === 0 ? "/" : `/${rest.join("/")}`;
  }

  return trimmed;
}

export function withLocalePath(pathname: string, locale: SupportedLocale = DEFAULT_LOCALE): string {
  const clean = pathname === "/" ? "/" : pathname.replace(/\/+$/, "") || "/";
  const stripped = stripLocaleFromPath(clean);
  const normalized = stripped === "/" ? "/" : stripped.replace(/\/+$/, "");

  if (locale === DEFAULT_LOCALE) {
    return normalized === "/" ? "/en" : `/en${normalized}`;
  }

  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

export function getStoredLocale(): SupportedLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const value = window.localStorage.getItem("litn-locale");
  return value && isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}

export function setStoredLocale(locale: SupportedLocale) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("litn-locale", locale);
}

export function resolvePreferredLocale(): SupportedLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = getStoredLocale();
  if (stored && isSupportedLocale(stored)) return stored;

  const nav = window.navigator?.language?.toLowerCase() ?? "";
  const candidate = nav.split("-")[0];
  return isSupportedLocale(candidate) ? candidate : DEFAULT_LOCALE;
}

export async function getTranslations(locale: SupportedLocale): Promise<TranslationDictionary> {
  const loader = rawMessages[locale];
  const module = await loader();
  return (module.default ?? module) as TranslationDictionary;
}

export function useTranslations(locale: SupportedLocale) {
  return {
    t: (path: string, fallback = "") => {
      const dictionary = (window as typeof window & { __litnTranslations?: TranslationDictionary })
        .__litnTranslations;
      return dictionary ? getTranslationValue(dictionary, path, fallback) : fallback;
    },
    locale,
  };
}

export function getTranslationValue(
  dictionary: TranslationDictionary,
  path: string,
  fallback = "",
): string {
  const segments = path.split(".");
  let current: unknown = dictionary;

  for (const segment of segments) {
    if (!current || typeof current !== "object" || !(segment in current)) {
      return fallback;
    }
    current = (current as Record<string, unknown>)[segment];
  }

  return typeof current === "string" ? current : fallback;
}
