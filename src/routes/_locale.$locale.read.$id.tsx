import { createFileRoute, Link, notFound, useRouter, useCanGoBack, reactUse } from "@tanstack/react-router";
import { useEffect, useState, Suspense, useRef } from "react";
// import { getBook, sampleChapter } from "@/lib/books";
import logo from "@/assets/litn-logo.asset.json";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import PdfViewer from "@/components/pdf-viewer";
import { ArrowLeft, Type, Sun, Palette } from 'lucide-react';
import { HTMLViewer } from "@/components/html-viewer";
import html from "@/assets/html.txt"

export const Route = createFileRoute("/_locale/$locale/read/$id")({
  ssr: false,
  loader: ({ params }) => {
   return true
  },
  // head: ({ loaderData }) => ({
  //   meta: loaderData ? [{ title: `Reading — ${loaderData.book.title}` }] : [],
  // }),
  notFoundComponent: () => <div className="p-10">Not found</div>,
  errorComponent: ({ reset }) => <button onClick={reset}>retry</button>,
  component: Reader,
});

function BackButton({ bookId,readerContainer }: { bookId: string, readerContainer: any }) {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const handleBack = () => {
    if (canGoBack) {
      router.history.back();
    } else {
      router.navigate({ to: "/book/$id", params: { id: bookId } });
    }
  };
 const [isOpen, setIsOpen] = useState<boolean>(false);
const [fontSize, setFontSize] = useState<number>(16);
const [fontFamily, setFontFamily] = useState<string>('serif');
const [textColor, setTextColor] = useState<string>('#000000');
const [bgColor, setBgColor] = useState<string>('#f5f5dc'); // Default beige

const updateSetting = (key: string, value: any) => {
  // Update local state first
  if (key === 'fontSize') setFontSize(value);
  if (key === 'fontFamily') setFontFamily(value);
  if (key === 'textColor') setTextColor(value);
  if (key === 'bgColor') setBgColor(value);

  // Construct updated object with the new value override
  const updated = {
    fontSize,
    fontFamily,
    textColor,
    bgColor,
    [key]: value
  };

  // Pass updated settings back to parent reader component
  if (onSettingsChange) {
    onSettingsChange(updated);
  }
};

  useEffect(() => {
    if (readerContainer.current) {
      const cont = readerContainer.current;
      
      // Assign properties directly to prevent invalid strings from silently failing
      cont.style.fontSize = `${fontSize}px`;
      cont.style.color = textColor;
      cont.style.backgroundColor = bgColor;

      // Handle generic font family fallback
      cont.style.fontFamily = fontFamily.replace('font-', ''); 
    }
  }, [fontFamily, fontSize, textColor, bgColor]);

  return (
    <button
      onClick={handleBack}
      aria-label="Back"
      className="fixed left-4 top-4 z-50 flex items-center cursor-pointer gap-2 rounded-full bg-background/80 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur transition hover:bg-background"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}

function AccessGate({ bookId, children }: { bookId: string; children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const [state, setState] = useState<"checking" | "granted" | "denied">("checking");

  useEffect(() => {
    setState("granted")
  }, [user, isAdmin, loading, bookId]);

  if (loading || state === "checking") {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Checking access…</div>;
  }
  if (state === "denied") {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-3xl">Access required</h1>
        <p className="text-muted-foreground">
          {user
            ? "Your purchase request must be approved before you can read this book."
            : "Sign in and request access to read this book."}
        </p>
        <Link
          to="/book/$id"
          params={{ id: bookId }}
          className="rounded-full bg-gradient-teal px-5 py-3 text-sm font-medium text-primary-foreground"
        >
          Back to book
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}

function Reader() {
  const [book, setBook] = useState(null);
  const [pageStoppedAt, setPageStoppedAt] = useState(0);
  const { id } = Route.useParams();
  const { chapter } = Route.useSearch()
  const { user, loading, backendUrl } = useAuth();
  const readerContainer = useRef<any>(null);
 
  const fetchBook = async (bookId: string) => {
    try {
      const base = backendUrl;
      const res = await fetch(`${base}/read_book/${bookId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch book " + res.statusText);
      }
      
      const bookData = await res.json();
      setBook({...bookData, "pdf_file_url": JSON.parse(bookData.pdf_file_url)});
      console.log(bookData)

      const readerId = user?.user_id
      const res2 = await fetch(`${base}/reading_progress?book_id=${bookId}&reader_id=${readerId}`);
      if (res2.ok) {
        const data = await res2.json();
        // let chapPage = chapter? JSON.parse(bookData.book_divisions).find((book:any) => book.start_page == chapter):0
        let page = chapter? Number(chapter): data.current_page !== undefined? Number(data.current_page):1
        console.log("page",page)
        setPageStoppedAt(page)
      }
    } catch (e) {
      console.error("Error fetching book:", e);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchBook(id);
    }
  }, [id, loading, user?.user_id, backendUrl]);
  return (
    <AccessGate bookId={"d"}>
      <BackButton bookId={id} readerContainer={readerContainer} />
      <ReaderInner book={book} pageStoppedAt={pageStoppedAt} book_id={id} container={readerContainer} />
      
    </AccessGate>
  );
}

function ReaderInner({ book, pageStoppedAt, book_id, container }: { book: any; pageStoppedAt: number; book_id: string; container: React.RefObject<any> }) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState('');
  // const  = useRef();

  useEffect(() => {
    setMounted(true);
    fetch(html)
      .then((res) => res.text())
      .then((data) => setContent(data));
  }, []);

  if (!mounted) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading reader…</div>;
  }

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading book…</div>}>
      {!pageStoppedAt? <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading book…</div>: (
        <PdfViewer
          initialPage={pageStoppedAt}
          file={book?.pdf_file_url[user?.prefferedLanguage || 'english']} 
          book_id={book_id}
        />
      )}
    </Suspense>
  

  );
}