import cover1 from "@/assets/cover-1.jpg";
import cover2 from "@/assets/cover-2.jpg";
import cover3 from "@/assets/cover-3.jpg";
import cover4 from "@/assets/cover-4.jpg";
import cover5 from "@/assets/cover-5.jpg";
import cover6 from "@/assets/cover-6.jpg";
import { useAuth } from "@/hooks/use-auth";

export type Book = {
  id: string;
  title: string;
  author: string;
  authorId: string;
  cover: string;
  genre: string;
  status: "Serialised" | "Complete";
  chapters: number;
  rating: number;
  price: number;
  currency: string;
  synopsis: string;
};

// Payment details shown to buyers during checkout.
// The app is wired for Airtel payments and keeps a small list of supported currencies so
// buyers can still override the browser-detected default if needed.
export const PAYMENT_INFO = {
  provider: "Airtel Money",
  number: "+250 78 000 0000",
  accountName: "LITN Digital Library",
  reviewWindow: "within 24 hours",
};

// These are the currencies a buyer may choose from when sending an Airtel payment.
// We keep the list intentionally small but practical for different regions.
export const CURRENCY_OPTIONS = [
  "USD",
  "GHS",
  "KES",
  "NGN",
  "UGX",
  "TZS",
  "ZMW",
  "RWF",
  "XAF",
  "EUR",
  "GBP",
  "ZAR",
  "R",
] as const;

// Approximate FX rates keyed to USD so we can convert a book's original price into the
// buyer's preferred payment currency while they are on the checkout modal.
// The rates are intentionally lightweight and intentionally not used for accounting: they are
// display-only conversion values for the app UI.
export const CURRENCY_RATES: Record<string, number> = {
  USD: 1,
  GHS: 13.5,
  KES: 150,
  NGN: 1500,
  UGX: 3600,
  TZS: 2500,
  ZMW: 28,
  RWF: 1370,
  XAF: 610,
  EUR: 0.92,
  GBP: 0.78,
  ZAR: 18.5,
  R: 18.5,
};

export function normalizeCurrency(currency?: string): (typeof CURRENCY_OPTIONS)[number] {
  const code = (currency ?? "USD").trim().toUpperCase();
  if (code === "RAND" || code === "R") return "R";
  return (CURRENCY_OPTIONS as readonly string[]).includes(code)
    ? (code as (typeof CURRENCY_OPTIONS)[number])
    : "USD";
}

export function convertCurrency(
  amount: number,
  fromCurrency?: string,
  toCurrency?: string,
): number {
  const baseCurrency = normalizeCurrency(fromCurrency || "USD");
  const targetCurrency = normalizeCurrency(toCurrency || "USD");

  if (baseCurrency === targetCurrency) return amount;

  const usdValue = amount / (CURRENCY_RATES[baseCurrency] ?? 1);
  return usdValue * (CURRENCY_RATES[targetCurrency] ?? 1);
}

export function formatCurrencyAmount(value: number, currency: string): string {
  const normalized = normalizeCurrency(currency);
  const rounded = Number(value.toFixed(2));
  const withCode = normalized === "R" ? "R" : normalized;
  return `${withCode} ${rounded.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function detectCurrencyFromLocale(): (typeof CURRENCY_OPTIONS)[number] {
  // Auto-detect the preferred currency using the browser locale so the payment flow feels
  // native for the user without making them choose a currency manually every time.
  if (typeof navigator !== "undefined") {
    const locale = navigator.language.toLowerCase();
    const localeToCurrency: Record<string, (typeof CURRENCY_OPTIONS)[number]> = {
      "en-ke": "KES",
      "en-gh": "GHS",
      "en-ng": "NGN",
      "en-ug": "UGX",
      "en-tz": "TZS",
      "en-zm": "ZMW",
      "fr-cm": "XAF",
      "fr-rw": "RWF",
      "en-us": "USD",
      "en-gb": "GBP",
      "en-eu": "EUR",
      "en-za": "ZAR",
    };

    for (const [key, value] of Object.entries(localeToCurrency)) {
      if (locale.startsWith(key)) return value;
    }
  }

  return "USD";
}

export const books: Book[] = [
  {
    id: "clinical-anatomy-essentials",
    title: "Clinical Anatomy Essentials",
    author: "Dr. M. Okafor",
    authorId: "m-okafor",
    cover: cover1,
    genre: "Anatomy",
    status: "Complete",
    chapters: 18,
    rating: 4.8,
    price: 15,
    currency: "USD",
    synopsis:
      "A concise, exam-oriented walkthrough of clinical anatomy — regional dissection, surface landmarks, and high-yield correlations for medical students and interns.",
  },
  {
    id: "pharmacology-in-practice",
    title: "Pharmacology in Practice",
    author: "Dr. D. Reyes",
    authorId: "d-reyes",
    cover: cover2,
    genre: "Pharmacology",
    status: "Complete",
    chapters: 22,
    rating: 4.6,
    price: 18,
    currency: "USD",
    synopsis:
      "Mechanisms, indications, contraindications, and prescribing pearls across the major drug classes, with case-based dosing scenarios.",
  },
  {
    id: "emergency-medicine-handbook",
    title: "Emergency Medicine Handbook",
    author: "Dr. V. Solenne",
    authorId: "v-solenne",
    cover: cover3,
    genre: "Emergency Medicine",
    status: "Serialised",
    chapters: 14,
    rating: 4.9,
    price: 20,
    currency: "USD",
    synopsis:
      "Structured, protocol-driven guidance for the first ten minutes of a resuscitation — airway, shock, trauma, toxicology and paediatric emergencies.",
  },
  {
    id: "clinical-ecg-mastery",
    title: "Clinical ECG Mastery",
    author: "Dr. I. Ang",
    authorId: "i-ang",
    cover: cover4,
    genre: "Cardiology",
    status: "Complete",
    chapters: 16,
    rating: 4.7,
    price: 16,
    currency: "USD",
    synopsis:
      "From axis and intervals to ischaemia, arrhythmia and pacing artefacts — read any ECG systematically, with 120 annotated tracings.",
  },
  {
    id: "surgical-skills-primer",
    title: "Surgical Skills Primer",
    author: "Dr. T. Brandt",
    authorId: "t-brandt",
    cover: cover5,
    genre: "Surgery",
    status: "Complete",
    chapters: 12,
    rating: 4.5,
    price: 17,
    currency: "USD",
    synopsis:
      "Suturing, knot-tying, scrubbing, and the ward-round etiquette every junior surgeon needs before their first theatre list.",
  },
  {
    id: "internal-medicine-review",
    title: "Internal Medicine Review",
    author: "Dr. A. Park",
    authorId: "a-park",
    cover: cover6,
    genre: "Internal Medicine",
    status: "Serialised",
    chapters: 24,
    rating: 4.8,
    price: 22,
    currency: "USD",
    synopsis:
      "A board-review companion covering cardiology, pulmonology, nephrology, endocrinology, and infectious disease with rapid-recall summaries.",
  },
];

export const getBook = (id: string) => books.find((b) => b.id === id);
export const genres = [
  "All",
  "Anatomy",
  "Pharmacology",
  "Emergency Medicine",
  "Cardiology",
  "Surgery",
  "Internal Medicine",
];

export const sampleChapter = `Clinical reasoning begins with the story the patient tells, and the story you tell yourself about what could kill them first.

Before you touch a stethoscope, ask three questions: what brought them in today, what has changed since it started, and what would happen if we did nothing. The answers frame every investigation that follows.

The novice orders a panel. The clinician orders a test. The difference is a hypothesis — a specific claim about what is happening in this body, at this moment, that a single result can confirm or refute.

Anchor your differential in anatomy and physiology, not in the last case you remember. Memory is a lazy diagnostician; the body is not. When the picture does not fit, do not force it — go back to the history and listen again.`;
