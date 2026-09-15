import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Outlet, Link, useLocation } from 'react-router-dom'
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
              // reload the page and attempt a reset
              reset();
              if (typeof window !== 'undefined') window.location.reload();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </Link>
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

// Root layout component used by React Router
export default function RootLayout() {
  // We no longer use TanStack route lifecycle here. The locale redirect
  // will be handled at the router level or in the entry route.
  return <RootComponent />
}

function RootComponent() {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BooksProvider>
          {/* Required: nested routes render here. */}
          <Outlet />
          <Toaster />
        </BooksProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}