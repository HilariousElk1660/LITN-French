import { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

function BackButton({ bookId, readerContainer }: { bookId: string, readerContainer: any, initialStyling: any }) {
  const navigate = useNavigate();
  const { locale, id } = useParams();
  const { readingSettings, setReadingSettings } = useBooks();
  const { backendUrl: api } = useAuth()

  const handleBack = () => {
    navigate(-1);
  };
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(16);
  const [fontFamily, setFontFamily] = useState<string>('serif');
  const [textColor, setTextColor] = useState<string>('#171717');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [theme, setTheme] = useState<string>('Light');

  const updateSetting = (key: string, value: any) => {
    // Update local state; a separate effect pushes changes into the shared
    // reading settings so the reader container re-renders deterministically.
    if (key === 'fontSize') setFontSize(value);
    if (key === 'fontFamily') setFontFamily(value);
    if (key === 'textColor') setTextColor(value);
    if (key === 'bgColor') setBgColor(value);
    if (key === 'theme') setTheme(value);
  };

  // Pull the latest saved settings into the local controls once they load.
  useEffect(() => {
    if (readingSettings && typeof readingSettings === "object" && "theme" in readingSettings) {
      const rs = readingSettings as { theme?: string; fontSize?: number; fontFamily?: string; textColor?: string; bgColor?: string };
      setTheme(rs.theme || 'Light');
      setFontSize(rs.fontSize || 16);
      setFontFamily(rs.fontFamily || 'serif');
      setTextColor(rs.textColor || '#171717');
      setBgColor(rs.bgColor || '#ffffff');
    }
  }, [readingSettings]);

  // Push local control changes into the shared settings (skips the loading
  // state when the settings object hasn't been hydrated yet).
  useEffect(() => {
    if (!readingSettings || Object.keys(readingSettings).length === 0) return;
    const rs = readingSettings as { theme?: string; fontSize?: number; fontFamily?: string; textColor?: string; bgColor?: string };
    if (
      rs.theme === theme &&
      rs.fontSize === fontSize &&
      rs.fontFamily === fontFamily &&
      rs.textColor === textColor &&
      rs.bgColor === bgColor
    ) return;
    setReadingSettings({ ...readingSettings, theme, fontSize, fontFamily, textColor, bgColor });
  }, [theme, fontSize, fontFamily, textColor, bgColor, readingSettings, setReadingSettings]);

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
  const [book, setBook] = useState(null);
  const [pageStoppedAt, setPageStoppedAt] = useState(0);
  const { id } = useParams();
  const { user, loading, backendUrl } = useAuth();
  const readerContainer = useRef<any>(null);



  
 
  const fetchBook = async (bookId: string) => {
    try {
      const base = backendUrl;

      //getting book
      const res = await fetch(`${base}/read_book/${bookId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch book " + res.statusText);
      }
      
      const bookData = await res.json();
      console.log("BOOK DATA", bookData);
      setBook({...bookData, "pdf_file_url": JSON.parse(bookData.pdf_file_url)});
      
      //getting reading progress
      const readerId = user?.user_id
      const res2 = await fetch(`${base}/reading_progress?book_id=${bookId}&reader_id=${readerId}`);
      if (res2.ok) {
        const data = await res2.json();
        // let chapPage = chapter? JSON.parse(bookData.book_divisions).find((book:any) => book.start_page == chapter):0
        let page = data.current_page !== undefined? Number(data.current_page):1
        console.log("page",page)
        setPageStoppedAt(page)
      }


    } catch (e) {
      console.error("Error fetching book:", e);
    }
  };

  useEffect(() => {
    if (!loading && id) {
      fetchBook(id);
    }
  }, [id, loading, user?.user_id, backendUrl]);
  return (
    <AccessGate bookId={id || ""}>
      <BackButton bookId={id || ""} readerContainer={readerContainer} />
      <ReaderInner book={book} pageStoppedAt={pageStoppedAt} book_id={id || ""} container={readerContainer} />
      
    </AccessGate>
  );
}

function ReaderInner({ book, pageStoppedAt, book_id, container }: { book: any; pageStoppedAt: number; book_id: string; container: React.RefObject<any> }) {
  const { user, backendUrl } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState('');
  const [bookFileType, setBookFileType] = useState('');
  const { readingSettings } = useBooks();
  const { locale } = useParams();
  const lang = supported_languages[locale]

  // HTML page tracking (progress is saved the same way as the PDF reader)
  const [htmlPage, setHtmlPage] = useState<number>(pageStoppedAt > 0 ? pageStoppedAt : 1);
  const htmlPageRef = useRef(htmlPage);
  htmlPageRef.current = htmlPage;
  const hasJumped = useRef(false);

  const styling = `<style>
  .page{
  border-bottom: 2px solid teal;
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
    if (!readingSettings.theme || !book || !book.pdf_file_url) return;
    setMounted(true);
    const url = book.pdf_file_url[lang];
    if (!url.endsWith(".pdf")) {
      setBookFileType('html');
      fetch(url)
        .then((res) => res.text())
        .then((data) => setContent(data + styling));
    } else {
      setContent(url)
      setBookFileType("pdf")
    }

  }, [readingSettings, book]);

  // Once the HTML content is in, count the pages and restore the saved page.
  useEffect(() => {
    if (!mounted || bookFileType !== 'html' || !content || hasJumped.current) return;
    const pages = container.current?.querySelectorAll('.page') ?? [];
    if (pages.length > 0) {
      const target = pages[Math.min(Math.max(htmlPage - 1, 0), pages.length - 1)];
      target?.scrollIntoView({ block: 'start' });
    }
    hasJumped.current = true;
  }, [mounted, bookFileType, content, container, htmlPage]);

  // Track the page nearest the top of the viewport while scrolling.
  const handleReaderScroll = useCallback(() => {
    const cont = container.current;
    if (!cont) return;
    const pages = cont.querySelectorAll('.page');
    if (!pages.length) return;
    const marker = cont.getBoundingClientRect().top;
    let closestIndex = 0;
    let minDist = Infinity;
    pages.forEach((el, i) => {
      if (!(el instanceof HTMLElement)) return;
      const dist = Math.abs(el.getBoundingClientRect().top - marker);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    });
    const next = closestIndex + 1;
    if (next !== htmlPageRef.current) setHtmlPage(next);
  }, [container]);

  useEffect(() => {
    if (bookFileType !== 'html') return;
    window.addEventListener('scroll', handleReaderScroll, { passive: true });
    window.addEventListener('resize', handleReaderScroll);
    return () => {
      window.removeEventListener('scroll', handleReaderScroll);
      window.removeEventListener('resize', handleReaderScroll);
    };
  }, [bookFileType, handleReaderScroll]);

  // Debounced save while reading HTML books (mirrors the PDF viewer).
  const saveHtmlProgress = useCallback((page: number) => {
    const readerId = user?.user_id;
    if (!readerId || !book_id) return;
    fetch(`${backendUrl}/save_reading_progress?reader_id=${readerId}&book_id=${book_id}&page_stopped_at=${page}`, {
      method: 'POST',
    }).catch((err) => console.error('Failed to save reading progress:', err));
  }, [backendUrl, book_id, user?.user_id]);

  // Flush progress on leave (pagehide/beforeunload + effect cleanup).
  useEffect(() => {
    if (bookFileType !== 'html') return;
    const flush = () => saveHtmlProgress(htmlPageRef.current);
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
      flush();
    };
  }, [bookFileType, saveHtmlProgress]);

  if (!mounted) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading reader…</div>;
  }

  return (
    
      bookFileType? bookFileType == "pdf" ? (
        <div style={{marginTop: "50px"}}>
          <PdfViewer file={content}  book_id={book.book_id}/>
        </div> 
      ) : (
        <div style={{width: "99vw", display: "flex", justifyContent: "center",fontFamily: readingSettings?.fontFamily,fontSize: `${readingSettings?.fontSize}px`, backgroundColor: readingSettings?.bgColor, color: readingSettings?.textColor}} ref={container}>
          <HTMLViewer htmlString={content}/>
        </div>
      ) : null
    
  )
}

export default Reader;