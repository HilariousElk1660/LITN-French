import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./use-auth";

type BookRequest = {
  id?: string;
  book_id?: string;
  status?: string;
  [key: string]: unknown;
};

type ReadingSettings = {
  theme: "Sepia" | "Light" | "Dark";
  bgColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
};

type BooksCtx = {
  bookRequests: BookRequest[];
  setBookRequests: React.Dispatch<React.SetStateAction<BookRequest[]>>;
  readersBooks: never[];
  setReadersBooks: React.Dispatch<React.SetStateAction<never[]>>;
  allBooks: never[];
  setAllBooks: React.Dispatch<React.SetStateAction<never[]>>;
  fetchAllBooks: () => void;
  setReadingSettings: React.Dispatch<React.SetStateAction<ReadingSettings | {}>>;
  readingSettings: ReadingSettings | {};
};

const Ctx = createContext<BooksCtx>({
  bookRequests: [],
  setBookRequests: () => {},
  readersBooks: [],
  setReadersBooks: () => {},
  allBooks: [],
  setAllBooks: () => {},
  fetchAllBooks: () => {},
  setReadingSettings: () => {},
  readingSettings: {},
});

export function BooksProvider({ children }: { children: ReactNode }) {
  const [bookRequests, setBookRequests] = useState<BookRequest[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("litn_book_requests");
        return cached ? JSON.parse(cached) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [readersBooks, setReadersBooks] = useState<never[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("litn_readers_books");
        return cached ? JSON.parse(cached) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [allBooks, setAllBooks] = useState<never[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("litn_all_books");
        return cached ? JSON.parse(cached) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [readingSettings, setReadingSettings] = useState<ReadingSettings | {}>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("litn_reading_settings");
        return cached ? JSON.parse(cached) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

  const { user, backendUrl } = useAuth();
  const base = backendUrl;

  const fetchBookRequests = async () => {
    try {
      const token = api.getToken();
      const res = await fetch(`${base}/readers_requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBookRequests(data);
        localStorage.setItem("litn_book_requests", JSON.stringify(data));
      }
    } catch (e) {
      console.error("error fetching user book requests", e);
    }
  };

  const fetchReadersBooks = async () => {
    try {
      const token = api.getToken();
      const res = await fetch(`${base}/library/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReadersBooks(data);
        localStorage.setItem("litn_readers_books", JSON.stringify(data));
      }
    } catch (e) {
      console.error("error fetching readers books", e);
    }
  };

  const fetchAllBooks = async () => {
    try {
      const token = api.getToken();
      const res = await fetch(`${base}/all_books`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        console.log("ALL BOOKS", data);
        setAllBooks(data);
        localStorage.setItem("litn_all_books", JSON.stringify(data));
      }
    } catch (e) {
      console.error("error fetching all books", e);
    }
  };

  const fetchReadingSettings = async () => {
    try {
      const token = api.getToken();
      const res = await fetch(`${base}/library/reading_settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const settings = JSON.parse(data[0]?.reading_settings || "{}");
        const initialSettings = {
          theme: settings?.theme || "Light",
          bgColor: settings?.theme === "Dark" ? "#1c1917" : settings?.theme === "Sepia" ? "#fbf0d9" : "#ffffff",
          textColor: settings?.theme === "Dark" ? "#f5f5f4" : settings?.theme === "Sepia" ? "#5f4b32" : "#171717",
          fontFamily: settings?.fontFamily || "serif",
          fontSize: settings?.fontSize || 16,
        };
        setReadingSettings(initialSettings);
        localStorage.setItem("litn_reading_settings", JSON.stringify(initialSettings));
      }
    } catch (e) {
      console.error("error fetching reader settings", e);
    }
  };

  useEffect(() => {
    if (!user) {
      setBookRequests([]);
      setReadersBooks([]);
      setAllBooks([]);
      setReadingSettings({});
      localStorage.removeItem("litn_book_requests");
      localStorage.removeItem("litn_readers_books");
      localStorage.removeItem("litn_all_books");
      localStorage.removeItem("litn_reading_settings");
      return;
    }
    fetchBookRequests();
    fetchReadersBooks();
    fetchAllBooks();
    fetchReadingSettings();
  }, [user?.user_id]);

  return (
    <Ctx.Provider value={{ bookRequests, setBookRequests, readersBooks, setReadersBooks, setAllBooks, allBooks, fetchAllBooks, readingSettings, setReadingSettings }}>
      {children}
    </Ctx.Provider>
  );
}

export const useBooks = () => useContext(Ctx);