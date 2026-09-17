import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Zap, ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { LocaleLink } from "@/components/locale-link";
import { api } from "@/lib/api";
import { useParams, useSearchParams } from "react-router-dom";

export function ResetPasswordPage() {
  const { locale } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset_password", { token, password });
      toast.success("Password reset. You can now sign in.");
      setDone(true);
    } catch (err: any) {
      const message = err?.message || "Unable to reset password.";
      setError(message);
      if (message.toLowerCase().includes("invalid or expired")) {
        toast.error("This reset link is invalid or has expired. Please request a new one.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-5 w-5 text-primary" />
        </div>

        <h1 className="mt-4 font-display text-3xl sm:text-4xl">Set a new password</h1>

        {!token ? (
          <>
            <div className="mt-8 rounded-xl border border-border bg-surface px-4 py-4 text-sm text-muted-foreground">
              This reset link is missing its token and cannot be used. Please request a new
              password reset link.
            </div>
            <LocaleLink
              to="/forgot-password"
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
            >
              <ChevronLeft className="h-4 w-4" />
              Request a new reset link
            </LocaleLink>
          </>
        ) : done ? (
          <>
            <div className="mt-8 rounded-xl border border-border bg-surface px-4 py-4 text-sm text-muted-foreground">
              Your password has been reset. You can now sign in with your new password.
            </div>
            <LocaleLink
              to="/login"
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Sign in
            </LocaleLink>
          </>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                New password
              </label>
              <input
                id="password"
                type="password"
                placeholder="New password (min 6 chars)"
                minLength={6}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Repeat new password"
                minLength={6}
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-teal px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              <Zap className="h-4 w-4" />
              {loading ? "Saving…" : "Reset password"}
            </button>

            <LocaleLink
              to="/login"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Sign in
            </LocaleLink>
          </form>
        )}
      </div>
    </div>
  );
}