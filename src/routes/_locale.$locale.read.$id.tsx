import { useEffect, useState, Suspense, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
// import { getBook, sampleChapter } from "@/lib/books";
import logo from "@/assets/litn-logo.asset.json";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import PdfViewer from "@/components/pdf-viewer";
import { ArrowLeft, Type, Sun, Palette } from 'lucide-react';
import { HTMLViewer } from "@/components/html-viewer";
import html from "@/assets/html.txt"
import { useBooks } from "@/hooks/use-books";
import supported_languages from '@/assets/supported_languages.json'
import { getAsset, getBook as getIDBBook } from "@/lib/idb";

function BackButton({ bookId,readerContainer }: { bookId: string, readerContainer: any, initialStyling: any }) {
  const navigate = useNavigate();
  const { locale, id } = useParams();
  const {readingSettings} = useBooks();
  const {backendUrl:api} = useAuth()

  const handleBack = () => {
    navigate(-1);
  };
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(readingSettings?.fontSize || 16);
  const [fontFamily, setFontFamily] = useState<string>(readingSettings?.fontFamily || 'serif');
  const [textColor, setTextColor] = useState<string>(readingSettings?.textColor || '#000000');
  const [bgColor, setBgColor] = useState<string>(readingSettings?.bgColor || '#f5f5dc'); 
  const [theme, setTheme] = useState<string>(readingSettings?.theme || 'light');

  const updateSetting = (key: string, value: any) => {


  // Update local state first
  if (key === 'fontSize') setFontSize(value);
  if (key === 'fontFamily') setFontFamily(value);
  if (key === 'textColor') setTextColor(value);
  if (key === 'bgColor') setBgColor(value);
  if (key === 'theme') setTheme(value);

  // Construct updated object with the new value override
  const updated = {
    fontSize,
    fontFamily,
    textColor,
    bgColor,
    [key]: value
  };
};


  useEffect(()=>{
  setFontSize(readingSettings?.fontSize || "16px");
  setFontFamily(readingSettings?.fontFamily || 'serif');
  setTextColor(readingSettings?.textColor || '#000000');
  setBgColor(readingSettings?.bgColor || '#f5f5dc');
  setTheme(readingSettings?.theme || 'light');

  },[readingSettings])

  const saveSettings = async ()=>{
    console.log({
      theme,
        fontSize,
        fontFamily,
        textColor,
        bgColor
      })
    const res = await fetch(`${api}/library/reading_settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({
        theme,
        fontSize: fontSize,
        fontFamily,
        textColor, 
        bgColor
      })
    });
  }

  useEffect(()=>{
    if (isOpen === false && readingSettings)
    saveSettings();

  },[isOpen]);


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
   <header className="fixed top-0 left-0 w-full h-[6vh] min-h-[48px] bg-background backdrop-blur border-b border-teal-200/50 z-50 flex items-center justify-between px-4">
      {/* Back Button */}
      <button
        onClick={handleBack}
        aria-label="Back"
        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition hover:bg-black/5 active:scale-95 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      {/* Settings Toggle & Dropdown Menu */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Reader Settings"
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition hover:bg-black/5 active:scale-95 cursor-pointer"
        >
          <Type className="h-4 w-4" />
          <span>Appearance</span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white p-4 shadow-xl ring-1 ring-black/10 z-50 flex flex-col gap-4 text-slate-800">
            {/* Font Family Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Font Family</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Serif', val: 'font-serif' },
                  { name: 'Sans', val: 'font-sans' },
                  { name: 'Mono', val: 'font-mono' }
                ].map((font) => (
                  <button
                    key={font.val}
                    onClick={() => updateSetting('fontFamily', font.val)}
                    className={`py-1 px-2 text-xs rounded border ${
                      fontFamily === font.val ? 'border-amber-600 bg-amber-50 font-bold' : 'border-slate-200'
                    }`}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Adjustment */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span className="uppercase tracking-wider">Font Size</span>
                <span>{fontSize}px</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold">A-</span>
                <input
                  type="range"
                  min="12"
                  max="28"
                  value={fontSize}
                  onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <span className="text-base font-bold">A+</span>
              </div>
            </div>

            {/* Background Color Shortcuts */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Theme Presets</label>
              <div className="flex gap-2">
                {[
                  { name: 'Light', bg: '#ffffff', text: '#171717' },
                  { name: 'Sepia', bg: '#fbf0d9', text: '#5f4b32' },
                  { name: 'Dark', bg: '#1c1917', text: '#f5f5f4' }
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      // updateSetting('bgColor', preset.bg);
                      // updateSetting('textColor', preset.text);
                      setBgColor(preset.bg) 
                      setTextColor(preset.text)
                      setTheme(preset.name)
                    }}
                    style={{ backgroundColor: preset.bg, color: preset.text }}
                    className="flex-1 py-1 text-xs rounded border border-slate-300 font-medium shadow-sm"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <label className="flex items-center justify-between text-xs font-medium text-slate-600 cursor-pointer">
                Text Color
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => updateSetting('textColor', e.target.value)}
                  className="h-6 w-6 rounded border-none cursor-pointer bg-transparent"
                />
              </label>
              <label className="flex items-center justify-between text-xs font-medium text-slate-600 cursor-pointer">
                Page Color
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => updateSetting('bgColor', e.target.value)}
                  className="h-6 w-6 rounded border-none cursor-pointer bg-transparent"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function AccessGate({ bookId, children }: { bookId: string; children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { locale } = useParams();
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
        <button
          onClick={() => navigate(`/${locale}/book/${bookId}`)}
          className="rounded-full bg-gradient-teal px-5 py-3 text-sm font-medium text-primary-foreground"
        >
          Back to book
        </button>
      </div>
    );
  }
  return <>{children}</>;
}

function Reader() {
  const [book, setBook] = useState<any>(null);
  const [pageStoppedAt, setPageStoppedAt] = useState(0);
  const { id,locale } = useParams();
  const { user, loading, backendUrl } = useAuth();
  const readerContainer = useRef<any>(null);
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const isOfflineParam = searchParams.get("offline") === "true";

  const [offlineBlobUrl, setOfflineBlobUrl] = useState<string | null>(null);
  const [isOfflineDisabled, setIsOfflineDisabled] = useState<boolean>(false);
  console.log("EHHHHHHHH");
  const {readersBooks} = useBooks()

  const fetchBook = async (bookId: string) => {
    // 1. If offline=true param exists and equals true: load from IndexedDB
    if (isOfflineParam) {
      try {
        const assetRecord = await getAsset(bookId, "pdf");
        const bookRecord = await getIDBBook(bookId);
        const blob = assetRecord?.blob || bookRecord?.blob;
        const lang = (supported_languages as Record<string, string>)[locale || ''] || 'english';
        if (blob) {
          const blobUrl = URL.createObjectURL(blob);
          setOfflineBlobUrl(blobUrl);
          const url = JSON.parse(readersBooks.find((book: any) => book.book_id === bookId)?.pdf_file_url);
          setBook({ book_id: bookId, isOffline: true, pdf_file_url: url });
          setIsOfflineDisabled(false);
          return;
        }
      } catch (err) {
        console.error("Error loading offline book from IndexedDB:", err);
      }
    }

    // 2. If user is offline, attempt IndexedDB fallback or disable block if not available
    if (!navigator.onLine) {
      try {
        const assetRecord = await getAsset(bookId, "pdf");
        const bookRecord = await getIDBBook(bookId);
        const blob = assetRecord?.blob || bookRecord?.blob;
        if (blob) {
          const blobUrl = URL.createObjectURL(blob);
          setOfflineBlobUrl(blobUrl);
          setBook({ book_id: bookId, isOffline: true });
          setIsOfflineDisabled(false);
          return;
        }
      } catch (err) {
        console.error("IndexedDB check failed while offline:", err);
      }
      setIsOfflineDisabled(true);
      return;
    }

    // 3. When online, load pdf_file_url from where it's stored
    if (isOfflineParam) return
    try {
      const base = backendUrl;
      const res = await fetch(`${base}/read_book/${bookId}`);
      if (!res.ok) {
        if (!navigator.onLine) {
          setIsOfflineDisabled(true);
          return;
        }
        throw new Error("Failed to fetch book " + res.statusText);
      }
      
      const bookData = await res.json();
      console.log("BOOK DATA", bookData);
      setBook({ ...bookData, "pdf_file_url": typeof bookData.pdf_file_url === "string" ? JSON.parse(bookData.pdf_file_url) : bookData.pdf_file_url });
      setIsOfflineDisabled(false);
      
      const readerId = user?.user_id;
      if (readerId) {
        const res2 = await fetch(`${base}/reading_progress?book_id=${bookId}&reader_id=${readerId}`);
        if (res2.ok) {
          const data = await res2.json();
          let page = data.current_page !== undefined ? Number(data.current_page) : 1;
          setPageStoppedAt(page);
        }
      }
    } catch (e) {
      console.error("Error fetching book:", e);
      if (!navigator.onLine) {
        setIsOfflineDisabled(true);
      }
    }
  };

  useEffect(() => {
    if (!loading && id) {
      fetchBook(id);
      console.log("fetched book!")
    }
  }, [id, loading, user?.user_id, backendUrl, location.search]);

  if (isOfflineDisabled) {
    return (
      <AccessGate bookId={id || ""}>
        <BackButton bookId={id || ""} readerContainer={readerContainer} />
        <div className="flex min-h-[80vh] items-center justify-center p-6 text-center">
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-8 max-w-md shadow-xl backdrop-blur">
            <h2 className="text-xl font-bold text-destructive mb-2">Book Unavailable Offline</h2>
            <p className="text-sm text-muted-foreground mb-6">
              You are currently offline and this book is not available offline. Please connect to the internet to download and read.
            </p>
            <button
              disabled
              className="w-full rounded-full bg-muted py-3 text-sm font-semibold text-muted-foreground cursor-not-allowed opacity-50 shadow-inner"
            >
              Book Block Disabled
            </button>
          </div>
        </div>
      </AccessGate>
    );
  }

  return (
    <AccessGate bookId={id || ""}>
      <BackButton bookId={id || ""} readerContainer={readerContainer} />
      <ReaderInner
        book={book}
        pageStoppedAt={pageStoppedAt}
        book_id={id || ""}
        container={readerContainer}
        offlineBlobUrl={offlineBlobUrl}
      />
    </AccessGate>
  );
}

function ReaderInner({
  book,
  pageStoppedAt,
  book_id,
  container,
  offlineBlobUrl,
}: {
  book: any;
  pageStoppedAt: number;
  book_id: string;
  container: React.RefObject<any>;
  offlineBlobUrl?: string | null;
}) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState('');
  const [bookFileType, setBookFileType] = useState('');
  const { readingSettings } = useBooks();
  const { locale } = useParams();
  const lang = (supported_languages as Record<string, string>)[locale || ''] || 'english';
  const styling = `<style>
  .page{
  border-bottom: 2px solid ${container.current?.style.color || 'teal'};
  padding: 60px 0;
  width:60vw;
  text-align:center
  overflow: visible;

  }
  img{
filter: sepia(${readingSettings?.theme === "Sepia" ? "100%" : "0%"}) brightness(${readingSettings?.theme === "Dark" ? "60%" : "100%"});
  }

[data-page-id="0"] {
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center; /* Centers child elements horizontally within the grid */
  align-items: center;   /* Centers child elements vertically (if container has height) */
  text-align: center;    /* Centers inline text inside child elements */
}

  </style>`;
  useEffect(() => {
    const getBook = async (bookId: string) => {
      const asset = await getAsset(bookId,"pdf")
      console.log('sighhhhhhhh',asset)
      const html = await asset.blob.text();
      setContent(html)
      return html
    }
    console.log("here??",book)
    if (!book) return;  
    let url = book.pdf_file_url[lang]
    

    if (!readingSettings?.theme || !book) return;
    setMounted(true);

   
 
    
    if (!url.endsWith(".pdf")) {
      setBookFileType('html');
      if (offlineBlobUrl) {
      getBook(book_id)
     
      // setBookFileType('pdf');
      setMounted(true);
      url=offlineBlobUrl.blob 
      return;
      }

      fetch(url)
        .then((res) => res.text())
        .then((data) => setContent(data ));
    } else {
      if (offlineBlobUrl) {
        url=offlineBlobUrl.blob 
      }
        setContent(url);
        setBookFileType("pdf");
    }
  }, [readingSettings, book, offlineBlobUrl, lang]);

  if (!mounted) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading reader…</div>;
  }

  return (
    bookFileType ? (
      bookFileType === "pdf" ? (
        <div style={{ marginTop: "50px" }}>
          <PdfViewer file={content} book_id={book?.book_id || book_id} />
        </div>
      ) : (
        <div style={{width: "99vw", display: "flex", justifyContent: "center",fontFamily: readingSettings?.fontFamily,fontSize: `${readingSettings?.fontSize}px`, backgroundColor:readingSettings?.bgColor, color:readingSettings?.textColor}}ref={container}>
          <HTMLViewer htmlString={content}/>
        </div>
      )
    ) : null
  );
}

export default Reader;