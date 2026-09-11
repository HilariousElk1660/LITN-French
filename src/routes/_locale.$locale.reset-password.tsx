import { createFileRoute, useNavigate, useLocation, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { LocaleLink } from "@/components/locale-link";
import { api } from "@/lib/api";
import { getLocaleFromPath, withLocalePath } from "@/lib/i18n";

type ResetPasswordSearch = { token?: string };

export const Route = createFileRoute("/_locale/$locale/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — LITN" }] }),
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: ResetPasswordPage,
});

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const { token } = useSearch({ from: "/_locale/$locale/reset-password" });
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const passwordTooShort = password.length > 0 && password.length < 8;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("This reset link is invalid or has expired.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset_password", { token, password });
      setDone(true);
      toast.success("Password updated.");
      setTimeout(() => {
        navigate({ to: withLocalePath("/login", locale) });
      }, 2000);
    } catch (err: any) {
      toast.error(err.message ?? "This reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
            <Lock className="h-5 w-5 text-destructive" />
          </div>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl">Invalid link</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This password reset link is missing or invalid. Request a new one below.
          </p>
          <LocaleLink
            to="/forgot-password"
            className="mt-6 inline-block text-sm font-semibold text-teal-bright hover:underline"
          >
            Request a new link
          </LocaleLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-5 w-5 text-primary" />
        </div>

        <h1 className="mt-4 font-display text-3xl sm:text-4xl">
          {translations["common.resetPasswordHeading"] ?? "Set a new password"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {translations["common.resetPasswordSubtitle"] ??
            "Choose a new password for your account"}
        </p>

        {done ? (
          <div className="mt-8 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-4 text-sm text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
            {translations["common.resetPasswordDone"] ??
              "Your password has been updated. Redirecting you to sign in…"}
          </div>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 pr-11 text-sm outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordTooShort && (
                <p className="text-xs text-destructive">Must be at least 8 characters.</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter new password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 pr-11 text-sm outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordsMismatch && (
                <p className="text-xs text-destructive">Passwords don't match.</p>
              )}
            </div>

            <button
              disabled={loading || passwordsMismatch || passwordTooShort}
              className="w-full rounded-full bg-gradient-teal px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {loading ? "Updating…" : "Reset password"}
            </button>
          </form>
        )}

        <LocaleLink
          to="/login"
          className="mt-6 inline-block text-sm font-medium text-muted-foreground hover:underline"
        >
          Back to Sign in
        </LocaleLink>
      </div>
    </div>
  );
}