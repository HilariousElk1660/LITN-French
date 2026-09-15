import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  getLocaleFromPath,
  getTranslations,
  setStoredLocale,
  withLocalePath,
} from "@/lib/i18n";

type Role = "reader" | "admin" | "super-admin";

type StoredUser = {
  user_id: string;
  email: string;
  fullname: string;
  role: Role;
  prefferedLanguage: string;
};

type AuthCtx = {
  user: StoredUser | null;
  role: Role | null;
  isAdmin: boolean;       // true for 'admin' OR 'super-admin'
  isSuperAdmin: boolean;  // true only for 'super-admin'
  loading: boolean;
  signOut: () => void;
  refresh: () => void;
  setLocale: (locale: string) => void;
  backendUrl: String;
  translations: Record<string, string>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  role: null,
  isAdmin: false,
  isSuperAdmin: false,
  loading: true,
  signOut: () => {},
  refresh: () => {},
  setLocale: () => {},
  backendUrl: "",
  translations: {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_API_URL

  const refresh = () => {
    setUser(api.getUser());
  };

  useEffect(() => {
    refresh();
    setLoading(false);

    // keep in sync if another tab signs in/out
    const onStorage = (e: StorageEvent) => {
      if (e.key === "access_token" || e.key === "user") refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  
  const signOut = () => {
    api.clearSession();
    setUser(null);
  };
  
  const role = user?.role ?? null;
  const isSuperAdmin = role === "super-admin";
  const isAdmin = role === "admin" || isSuperAdmin;

  const [locale,setLocale] = useState<"en" | "fr" | "es"| "de">(getLocaleFromPath(location.pathname));
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    console.log("CHANGED")
    let active = true;
    getTranslations(locale).then((dictionary) => {
      if (active) {
        const flat: Record<string, string> = {};
        Object.entries(dictionary).forEach(([key, value]) => {
          if (value && typeof value === "object") {
            Object.entries(value as Record<string, unknown>).forEach(([nestedKey, nestedValue]) => {
              if (typeof nestedValue === "string") flat[`${key}.${nestedKey}`] = nestedValue;
            });
          }
        });
        setTranslations(flat);
      }
    });
    return () => {
      active = false;
    };
  }, [locale]);

  return (
    <Ctx.Provider value={{ user, role, isAdmin, isSuperAdmin, loading, signOut, refresh, backendUrl, translations,setLocale }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);