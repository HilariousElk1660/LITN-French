import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Lock, Mail, ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { LocaleLink } from "@/components/locale-link";
import { api } from "@/lib/api";
import { getLocaleFromPath, withLocalePath } from "@/lib/i18n";

export const Route = createFileRoute("/_locale/$locale/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — LITN" }] }),
  component: ForgotPasswordPage,
});

export function ForgotPasswordPage() {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sends a reset link to the user's email. The link should route to
      // a /reset-password page (token in query/hash) where they set a new password.
      await api.post("/auth/forgot_password", {
        email,
        redirect_url: `${window.location.origin}${withLocalePath("/reset-password", locale)}`,
      });
      setSubmitted(true);
      toast.success("Check your inbox for a reset link.");
    } catch (err: any) {
      // Avoid confirming whether an email exists in the system.
      setSubmitted(true);
      toast.success("If that email is registered, a reset link is on its way.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-5 w-5 text-primary" />
        </div>

        <h1 className="mt-4 font-display text-3xl sm:text-4xl">
          {translations["common.forgotPasswordHeading"] ?? "Forgot password?"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {translations["common.forgotPasswordSubtitle"] ??
            "Enter your details to receive a reset link"}
        </p>

        {submitted ? (
          <div className="mt-8 rounded-xl border border-border bg-surface px-4 py-4 text-sm text-muted-foreground">
            {translations["common.forgotPasswordSent"] ??
              "If that email is registered, we've sent a link to reset your password. It should arrive within a few minutes."}
          </div>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder={translations["common.emailPlaceholder"] ?? "Enter email address"}
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-border bg-surface py-3 pl-11 pr-5 text-sm outline-none focus:border-primary"
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-full bg-gradient-teal px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {loading
                ? translations["common.submitting"] ?? "Sending…"
                : translations["common.submit"] ?? "Submit"}
            </button>
          </form>
        )}

        <LocaleLink
          to="/login"
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          {translations["common.backToSignIn"] ?? "Back to Sign in"}
        </LocaleLink>
      </div>
    </div>
  );
}