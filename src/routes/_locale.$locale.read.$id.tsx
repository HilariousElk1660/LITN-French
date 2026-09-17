import { useEffect, useState, Suspense, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import { getBook, sampleChapter } from "@/lib/books";
import logo from "@/assets/litn-logo.asset.json";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import PdfViewer from "@/components/pdf-viewer";
import { ArrowLeft, Type, Sun, Palette, AlignLeft, AlignJustify, Focus } from 'lucide-react';
import { HTMLViewer } from "@/components/html-viewer";
import html from "@/assets/html.txt"
import { useBooks } from "@/hooks/use-books";
import supported_languages from '@/assets/supported_languages.json'

const DEFAULT_SETTINGS = {
  theme: 'Light',
  fontSize: 16,
  fontFamily: 'serif',
  textColor: '#171717',
  bgColor: '#ffffff',
  lineHeight: 1.75,
  letterSpacing: 0,
  textAlign: 'justify',
  maxLineWidth: 72,
  focusMode: false,
};

function BackButton({ bookId }: { bookId: string, readerContainer?: any, initialStyling?: any }) {
  const navigate = useNavigate();
  const { locale, id } = useParams();
  const { readingSettings, setReadingSettings } = useBooks();
  const { backendUrl: api } = useAuth();

  const handleBack = () => {
    navigate(-1);
  };
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(16);
  const [fontFamily, setFontFamily] = useState<string>('serif');
  const [textColor, setTextColor] = useState<string>('#171717');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [theme, setTheme] = useState<string>('Light');
  const [lineHeight, setLineHeight] = useState<number>(1.75);
  const [letterSpacing, setLetterSpacing] = useState<number>(0);
  const [textAlign, setTextAlign] = useState<"left" | "justify">("justify");
  const [maxLineWidth, setMaxLineWidth] = useState<number>(72);
  const [focusMode, setFocusMode] = useState<boolean>(false);

  const hasHydrated = useRef(false);

  // One-way hydration: context (from the backend/localStorage) -> local controls.
  // Never writes back to context behind the user's back, so there is no sync loop.
  useEffect(() => {
    if (readingSettings && typeof readingSettings === "object" && "theme" in readingSettings) {
      const rs = readingSettings as any;
      setTheme(rs.theme || DEFAULT_SETTINGS.theme);
      setFontSize(rs.fontSize || DEFAULT_SETTINGS.fontSize);
      setFontFamily(rs.fontFamily || DEFAULT_SETTINGS.fontFamily);
      setTextColor(rs.textColor || DEFAULT_SETTINGS.textColor);
      setBgColor(rs.bgColor || DEFAULT_SETTINGS.bgColor);
      setLineHeight(rs.lineHeight ?? DEFAULT_SETTINGS.lineHeight);
      setLetterSpacing(rs.letterSpacing ?? DEFAULT_SETTINGS.letterSpacing);
      setTextAlign(rs.textAlign === 'left' ? 'left' : 'justify');
      setMaxLineWidth(rs.maxLineWidth ?? DEFAULT_SETTINGS.maxLineWidth);
      setFocusMode(!!rs.focusMode);
      hasHydrated.current = true;
    }
  }, [readingSettings]);

  // User intent -> local controls + context. The dispatch is one-way; the
  // hydration effect above only re-syncs when the *backend* changes settings.
  const apply = (patch: Record<string, unknown>) => {
    if (patch.fontSize !== undefined) setFontSize(patch.fontSize as number);
    if (patch.fontFamily !== undefined) setFontFamily(patch.fontFamily as string);
    if (patch.textColor !== undefined) setTextColor(patch.textColor as string);
    if (patch.bgColor !== undefined) setBgColor(patch.bgColor as string);
    if (patch.theme !== undefined) setTheme(patch.theme as string);
    if (patch.lineHeight !== undefined) setLineHeight(patch.lineHeight as number);
    if (patch.letterSpacing !== undefined) setLetterSpacing(patch.letterSpacing as number);
    if (patch.textAlign !== undefined) setTextAlign(patch.textAlign as "left" | "justify");
    if (patch.maxLineWidth !== undefined) setMaxLineWidth(patch.maxLineWidth as number);
    if (patch.focusMode !== undefined) setFocusMode(patch.focusMode as boolean);

    if (readingSettings && Object.keys(readingSettings).length > 0) {
      setReadingSettings({ ...readingSettings, ...patch });
    }
  };

  const applyTheme = (name: string, bg: string, text: string) => {
    apply({ theme: name, bgColor: bg, textColor: text });
  };

  const saveSettings = async () => {
    if (!hasHydrated.current) return;
    try {
      const res = await fetch(`${api}/library/reading_settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          theme,
          fontSize,
          fontFamily,
          textColor,
          bgColor,
          lineHeight,
          letterSpacing,
          textAlign,
          maxLineWidth,
          focusMode,
        })
      });
      if (!res.ok) console.error("Failed to save reading settings", res.status);
    } catch (e) {
      console.error("Failed to save reading settings", e);
    }
  }

  useEffect(() => {
    if (!isOpen && hasHydrated.current) saveSettings();
  }, [isOpen]);

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
          <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white p-4 shadow-xl ring-1 ring-black/10 z-50 flex flex-col gap-4 text-slate-800 max-h-[80vh] overflow-y-auto">
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
                    onClick={() => apply({ fontFamily: font.val })}
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
                  onChange={(e) => apply({ fontSize: Number(e.target.value) })}
                  className="w-full accent-amber-600 cursor-pointer"
                  aria-label="Font size slider"
                />
                <span className="text-base font-bold">A+</span>
              </div>
            </div>

            {/* Line Height */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span className="uppercase tracking-wider">Line Spacing</span>
                <span>{lineHeight.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold">Tight</span>
                <input
                  type="range"
                  min="1.2"
                  max="2.4"
                  step="0.05"
                  value={lineHeight}
                  onChange={(e) => apply({ lineHeight: Number(e.target.value) })}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <span className="text-xs font-bold">Airy</span>
              </div>
            </div>

            {/* Letter Spacing */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span className="uppercase tracking-wider">Letter Spacing</span>
                <span>{letterSpacing.toFixed(1)}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={letterSpacing}
                onChange={(e) => apply({ letterSpacing: Number(e.target.value) })}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Text Alignment */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Alignment</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => apply({ textAlign: 'left' })}
                  className={`py-1 px-2 text-xs rounded border flex items-center justify-center gap-1.5 ${
                    textAlign === 'left' ? 'border-amber-600 bg-amber-50 font-bold' : 'border-slate-200'
                  }`}
                >
                  <AlignLeft size={14} /> Left
                </button>
                <button
                  onClick={() => apply({ textAlign: 'justify' })}
                  className={`py-1 px-2 text-xs rounded border flex items-center justify-center gap-1.5 ${
                    textAlign === 'justify' ? 'border-amber-600 bg-amber-50 font-bold' : 'border-slate-200'
                  }`}
                >
                  <AlignJustify size={14} /> Justify
                </button>
              </div>
            </div>

            {/* Page Width */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span className="uppercase tracking-wider">Page Width</span>
                <span>{maxLineWidth}ch</span>
              </div>
              <input
                type="range"
                min="40"
                max="90"
                value={maxLineWidth}
                onChange={(e) => apply({ maxLineWidth: Number(e.target.value) })}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Focus Mode */}
            <button
              onClick={() => apply({ focusMode: !focusMode })}
              className={`py-1.5 px-2 text-xs rounded border flex items-center justify-center gap-1.5 ${
                focusMode ? 'border-amber-600 bg-amber-50 font-bold' : 'border-slate-200'
              }`}
            >
              <Focus size={14} /> {focusMode ? 'Focus Mode On' : 'Focus Mode (dim other pages)'}
            </button>

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
                    onClick={() => applyTheme(preset.name, preset.bg, preset.text)}
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
                  onChange={(e) => apply({ textColor: e.target.value })}
                  className="h-6 w-6 rounded border-none cursor-pointer bg-transparent"
                />
              </label>
              <label className="flex items-center justify-between text-xs font-medium text-slate-600 cursor-pointer">
                Page Color
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => apply({ bgColor: e.target.value })}
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
  const [bookFileType, setBookFileType] = useState<'pdf' | 'reflow'>('reflow');
  const { readingSettings } = useBooks();
  const { locale } = useParams();
  const lang = supported_languages[locale]

  // HTML page tracking (progress is saved the same way as the PDF reader)
  const [htmlPage, setHtmlPage] = useState<number>(pageStoppedAt > 0 ? pageStoppedAt : 1);
  const htmlPageRef = useRef(htmlPage);
  htmlPageRef.current = htmlPage;
  const [totalPages, setTotalPages] = useState(0);
  const hasJumped = useRef(false);

  const rs = (readingSettings && typeof readingSettings === 'object' && 'theme' in readingSettings)
    ? (readingSettings as any)
    : DEFAULT_SETTINGS;

  const urlMap = book?.pdf_file_url && typeof book.pdf_file_url === 'object' ? book.pdf_file_url : {};
  const allUrls: string[] = Object.values(urlMap).filter(Boolean).map(String) || [];
  const available = useMemo(() => {
    const pdfUrl = allUrls.find((u) => u.toLowerCase().endsWith('.pdf')) || null;
    const htmlUrl = allUrls.find((u) => !u.toLowerCase().endsWith('.pdf')) || null;
    return { pdfUrl, htmlUrl };
  }, [allUrls]);

  const styling = `<style>
  .page{
  border-bottom: 2px solid teal;
  padding: 48px 0;
  width: auto;
  text-align: ${rs.textAlign};
  overflow: visible;
  transition: opacity .25s ease;
  }
  img{
 filter: sepia(${rs.theme === "Sepia" ? "100%" : "0%"}) brightness(${rs.theme === "Dark" ? "60%" : "100%"});
  }
[data-page-id="0"] {
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center; /* Centers child elements horizontally within the grid */
  align-items: center;   /* Centers child elements vertically (if container has height) */
  text-align: center;    /* Centers inline text inside child elements */
}

  </style>`;

  // Load the book content once per book (never re-fetches on theme changes).
  useEffect(() => {
    if (!book || !book.pdf_file_url) return;
    setMounted(true);
    const current = urlMap[lang] || allUrls[0];
    if (!current) return;
    if (String(current).toLowerCase().endsWith('.pdf')) {
      setBookFileType('pdf');
      setContent(String(current));
    } else {
      setBookFileType('reflow');
      fetch(String(current))
        .then((res) => res.text())
        .then((data) => setContent(data));
    }
  }, [book, lang]);

  // User switched between PDF and reflow rendering.
  const switchView = (next: 'pdf' | 'reflow') => {
    if (next === bookFileType) return;
    setBookFileType(next);
    if (next === 'reflow' && available.htmlUrl) {
      setContent('');
      fetch(available.htmlUrl).then((r) => r.text()).then((data) => setContent(data));
    } else if (next === 'pdf' && available.pdfUrl) {
      setContent(available.pdfUrl);
    }
  };

  // Once the HTML content is in, count the pages and restore the saved page.
  useEffect(() => {
    if (bookFileType !== 'reflow' || !content || hasJumped.current) return;
    const pages = container.current?.querySelectorAll('.page') ?? [];
    setTotalPages(pages.length);
    if (pages.length > 0) {
      const target = pages[Math.min(Math.max(htmlPage - 1, 0), pages.length - 1)];
      target?.scrollIntoView({ block: 'start' });
    }
    hasJumped.current = true;
  }, [bookFileType, content, container, htmlPage, mounted]);

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
    if (rs.focusMode) {
      pages.forEach((el, i) => {
        if (!(el instanceof HTMLElement)) return;
        el.style.opacity = i === closestIndex ? '1' : '0.25';
      });
    }
  }, [container, rs.focusMode]);

  useEffect(() => {
    if (bookFileType !== 'reflow') return;
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
    if (bookFileType !== 'reflow') return;
    const flush = () => saveHtmlProgress(htmlPageRef.current);
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
      flush();
    };
  }, [bookFileType, saveHtmlProgress]);

  // Apply focus-mode dimming whenever the setting toggles (no scroll needed).
  useEffect(() => {
    if (bookFileType !== 'reflow' || !rs.focusMode) return;
    const pages = container.current?.querySelectorAll('.page');
    if (!pages || !pages.length) return;
    pages.forEach((el, i) => {
      if (el instanceof HTMLElement) el.style.opacity = i === htmlPageRef.current - 1 ? '1' : '0.25';
    });
  }, [rs.focusMode, bookFileType, container]);

  // Reflow page navigation
  const goToReflowPage = (n: number) => {
    const pages = container.current?.querySelectorAll('.page');
    if (!pages || !pages.length) return;
    const target = pages[Math.min(Math.max(n - 1, 0), pages.length - 1)];
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setHtmlPage(Math.min(Math.max(n, 1), pages.length));
  };

  const progressPct = totalPages > 0 ? Math.round((htmlPage / totalPages) * 100) : 0;
  const canToggleView = !!available.pdfUrl && !!available.htmlUrl;

  if (!mounted) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading reader…</div>;
  }

  if (bookFileType === 'pdf') {
    return (
      <div style={{ marginTop: '50px' }} className="flex flex-col items-center">
        {canToggleView && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 shadow-sm my-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">View:</span>
            <button
              onClick={() => switchView('pdf')}
              className={`px-2 py-0.5 rounded text-xs ${bookFileType === 'pdf' ? 'bg-amber-100 text-amber-800 font-bold' : 'text-slate-600 hover:bg-muted'}`}
            >
              PDF
            </button>
            <button
              onClick={() => switchView('reflow')}
              className={`px-2 py-0.5 rounded text-xs ${bookFileType === 'reflow' ? 'bg-amber-100 text-amber-800 font-bold' : 'text-slate-600 hover:bg-muted'}`}
            >
              Reflow
            </button>
          </div>
        )}
        <PdfViewer
          file={content}
          book_id={book.book_id}
          initialPage={pageStoppedAt > 0 ? pageStoppedAt : 1}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: '99vw',
        backgroundColor: rs.bgColor,
        color: rs.textColor,
        paddingTop: '50px',
      }}
    >
      {/* Sticky control bar */}
      <div className="sticky top-[6vh] z-10 flex items-center justify-center gap-2 px-4 py-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 shadow-sm text-sm">
          {canToggleView && (
            <>
              <button
                onClick={() => switchView('pdf')}
                className={`px-2 py-0.5 rounded text-xs ${bookFileType === 'pdf' ? 'bg-amber-100 text-amber-800 font-bold' : 'text-slate-600 hover:bg-muted'}`}
              >
                PDF
              </button>
              <button
                onClick={() => switchView('reflow')}
                className={`px-2 py-0.5 rounded text-xs ${bookFileType === 'reflow' ? 'bg-amber-100 text-amber-800 font-bold' : 'text-slate-600 hover:bg-muted'}`}
              >
                Reflow
              </button>
              <div className="w-px h-5 bg-border mx-1" />
            </>
          )}
          <button
            onClick={() => goToReflowPage(htmlPage - 1)}
            disabled={htmlPage <= 1}
            aria-label="Previous page"
            className="p-1 rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹
          </button>
          <span className="text-xs tabular-nums min-w-[80px] text-center">
            {totalPages > 0 ? `${htmlPage} / ${totalPages}` : '…'}
          </span>
          <button
            onClick={() => goToReflowPage(htmlPage + 1)}
            disabled={totalPages > 0 && htmlPage >= totalPages}
            aria-label="Next page"
            className="p-1 rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ›
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <span className="text-xs tabular-nums min-w-[42px] text-center">{progressPct}%</span>
        </div>
      </div>

      {/* Thin overall progress bar */}
      <div className="h-0.5 w-full bg-black/10" style={{ position: 'sticky', top: 'calc(6vh + 44px)', zIndex: 10 }}>
        <div className="h-full bg-amber-500 transition-all" style={{ width: `${progressPct}%` }} />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          paddingBottom: '80px',
        }}
      >
        <div
          ref={container}
          style={{
            width: '100%',
            maxWidth: `${rs.maxLineWidth}ch`,
            fontFamily: rs.fontFamily.replace('font-', ''),
            fontSize: `${rs.fontSize}px`,
            lineHeight: rs.lineHeight,
            letterSpacing: `${rs.letterSpacing}px`,
            textAlign: rs.textAlign as any,
            backgroundColor: rs.bgColor,
            color: rs.textColor,
          }}
        >
          {styling.trim() && <div dangerouslySetInnerHTML={{ __html: styling }} />}
          <HTMLViewer htmlString={content} />
        </div>
      </div>
    </div>
  )
}

export default Reader;