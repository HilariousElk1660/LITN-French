import Link from '@/components/route-link'
import { useLocation, useParams } from 'react-router-dom'
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PurchaseRequestButton } from "@/components/purchase-request-button";
import { getBook } from "@/lib/books";
import { useEffect, useState } from "react";
import { useBooks } from "@/hooks/use-books";
import { Book } from "lucide-react";
import { LocaleLink } from "@/components/locale-link";
import { useAuth } from "@/hooks/use-auth";
import { getLocaleFromPath } from "@/lib/i18n";
import { getAsset, getBook as getIDBBook } from "@/lib/idb";

type BookDivision = {
  title: string;
  start_page: number;
};

type BookDetail = {
  book_id: string;
  book_name: string;
  book_cover_url: string;
  category: string;
  status: string;
  currency: string;
  subscription_price: number;
  published_date: string;
  chapters: number;
  admin_id: string;
  book_divisions: BookDivision[];
};

export default function BookPage() {
  const { isSuperAdmin, backendUrl } = useAuth();
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const [book, setBook] = useState<Partial<BookDetail>>({});
  const [access, setAccess] = useState(false);
  const { id: book_id } = useParams<{ id: string }>();
  const { bookRequests } = useBooks();

  const [isOfflineAvailable, setIsOfflineAvailable] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);
    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  useEffect(() => {
    if (!book_id) return;
    const checkOffline = async () => {
      try {
        const assetRecord = await getAsset(book_id, "pdf");
        const bookRecord = await getIDBBook(book_id);
        const isAvailable = Boolean(
          (assetRecord && assetRecord.blob) || (bookRecord && bookRecord.blob)
        );
        setIsOfflineAvailable(isAvailable);
      } catch {
        setIsOfflineAvailable(false);
      }
    };
    checkOffline();
  }, [book_id]);

  const fetchBook = async () => {
    const bookData = await fetch(`${backendUrl}/book/${book_id}`);
    const bookJson = await bookData.json();
    console.log("BOOK", bookJson);

    setBook({ ...bookJson, book_divisions: JSON.parse(bookJson["book_divisions"]) });
  };
  useEffect(() => {
    if (isSuperAdmin) {
      console.log("CHECK", isSuperAdmin);
      return setAccess(true);
    }
    if (!bookRequests.length) return;
    setAccess(bookRequests?.find((req: any) => req.book_id === book_id)?.status == "paid");
  }, [bookRequests, book, isSuperAdmin]);

  useEffect(() => {
    fetchBook();
  }, []);
  console.log("book", book);
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {!book.book_name ? (
        <div style={{ height: "80vh" }} className="mt-16 text-center text-muted-foreground">
          Loading book details …
        </div>
      ) : (
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-12 sm:pb-20">
          <div className="grid gap-12 md:grid-cols-[280px_1fr]">
            <div>
              <div className="overflow-hidden rounded-2xl shadow-glow">
                <img src={book.book_cover_url} alt={book.book_name} className="w-full" />
              </div>
              {access && (
                <Link
                  to="/$locale/read/$id"
                  params={{ locale, id: book.book_id! }}
                  search={isOffline && isOfflineAvailable ? { offline: "true" } : undefined}
                  className="mt-6 flex w-full justify-center rounded-full bg-gradient-teal px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
                >
                  Read
                </Link>
              )}
              <PurchaseRequestButton
                bookId={book.book_id}
                adminId={book.admin_id}
                bookTitle={book.book_name}
                price={book.subscription_price}
                currency={book.currency || "R"}
              />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-teal-bright">
                {book.category}
              </div>
              <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl">
                {book.book_name}
              </h1>
              <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted-foreground">
                <span className="font-display text-foreground">
                  {book.currency || "R"} {book.subscription_price}
                </span>
                <span>{book.published_date}</span>
                <span>{book.chapters} chapters</span>
              </div>
              <div className="mt-12">
                <h2 className="font-display text-2xl">Chapters</h2>
                <ol className="mt-4 divide-y divide-border/60 rounded-2xl border border-border/60 bg-surface">
                  {book.book_divisions &&
                    book.book_divisions.map((name, i) => (
                      <li key={i} className="flex items-center justify-between px-5 py-3 text-sm">
                        <span>
                          <span className="text-muted-foreground">
                            {String(i + 1).padStart(2, "0")}
                          </span>{" "}
                          <span className="ml-3">{name.title}</span>
                        </span>
                        {access && (
                          <Link
                            to="/$locale/read/$id"
                            params={{ locale, id: book.book_id! }}
                            search={
                              isOffline && isOfflineAvailable
                                ? { chapter: name.start_page, offline: "true" }
                                : { chapter: name.start_page }
                            }
                            className="text-teal-bright hover:underline"
                          >
                            Read
                          </Link>
                        )}
                      </li>
                    ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
      <SiteFooter />
    </div>
  );
}
