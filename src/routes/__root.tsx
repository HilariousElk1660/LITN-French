import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useLocation,
  useRouter,
  HeadContent,
  Scripts,
  redirect,
} from "@tanstack/react-router";
import favicon from "@/assets/favicon.ico";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "../hooks/use-auth";
import { BooksProvider } from "@/hooks/use-books";
import { Toaster } from "../components/ui/sonner";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  getLocaleFromPath,
  resolvePreferredLocale,
  stripLocaleFromPath,
  withLocalePath,
} from "@/lib/i18n";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function getCanonicalOrigin() {
  if (typeof window !== "undefined") return window.location.origin;
  return "https://website.com";
}

function getLocaleRedirectTarget(pathname: string) {
  const trimmed = pathname === "/" ? "/" : pathname.replace(/\/+$/, "") || "/";
  const segments = trimmed.split("/").filter(Boolean);

  if (segments.length === 0) {
    return withLocalePath("/", resolvePreferredLocale());
  }

  const first = segments[0];
  if (SUPPORTED_LOCALES.includes(first as (typeof SUPPORTED_LOCALES)[number])) {
    const locale = getLocaleFromPath(trimmed);
    const canonical = withLocalePath(stripLocaleFromPath(trimmed), locale);
    return canonical === trimmed ? null : canonical;
  }

  return withLocalePath(trimmed, resolvePreferredLocale());
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: ({ location }) => {
    const redirectTarget = getLocaleRedirectTarget(location.pathname);
    if (redirectTarget && redirectTarget !== location.pathname) {
      throw redirect({ to: redirectTarget, replace: true });
    }

    const locale = getLocaleFromPath(location.pathname);
    const canonicalPath = stripLocaleFromPath(location.pathname) || "/";

    // Expose what `head` needs, since `head` doesn't receive `location` itself.
    return {
      locale,
      canonicalPath,
    };
  },
  head: ({ match }) => {
    const { locale, canonicalPath } = match.context;
    const origin = getCanonicalOrigin();
    const canonicalHref = `${origin}${withLocalePath(canonicalPath, locale)}`;

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "LITN — Read together. Meet the authors." },
        {
          name: "description",
          content:
            "Community-first reading platform with serialised chapters, book rooms, and direct access to authors.",
        },
        { property: "og:title", content: "LITN" },
        { property: "og:description", content: "Read together. Meet the authors." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: favicon, type: "image/x-icon" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap",
        },
        ...SUPPORTED_LOCALES.map((supportedLocale) => ({
          rel: "alternate",
          hrefLang: supportedLocale,
          href: `${origin}${withLocalePath(canonicalPath, supportedLocale)}`,
        })),
        { rel: "alternate", hrefLang: "x-default", href: `${origin}${withLocalePath(canonicalPath, DEFAULT_LOCALE)}` },
        { rel: "canonical", href: canonicalHref },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);

  return (
    <html lang={locale}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BooksProvider>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
          <Toaster />
        </BooksProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}