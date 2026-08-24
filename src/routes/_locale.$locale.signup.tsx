import { createFileRoute, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { LocaleLink } from "@/components/locale-link";
import { api, type AuthResponse } from "@/lib/api";
import { getLocaleFromPath, getTranslations, withLocalePath } from "@/lib/i18n";

export const Route = createFileRoute("/_locale/$locale/signup")({
  head: () => ({ meta: [{ title: "Sign up — LITN" }] }),
  component: SignupPage,
});

export function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = await api.post<AuthResponse>("/auth/sign_up", {
        fullname,
        email,
        password,
      });
      api.saveSession(auth);
      toast.success("Account created. Welcome to LITN.");
      navigate({ to: withLocalePath("/login", locale) });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-20">
        <h1 className="font-display text-3xl sm:text-4xl">{translations["common.joinLITN"] ?? "Join LITN."}</h1>
        <p className="mt-2 text-muted-foreground">
          {translations["common.joinSubtitle"] ?? "A community-first reading platform. Currently in Alpha."}
        </p>
        <form className="mt-10 space-y-4" onSubmit={onSubmit}>
          <input
            placeholder={translations["common.fullName"] ?? "Full name"}
            required
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm outline-none focus:border-primary"
          />
          <input
            type="email"
            placeholder={translations["common.email"] ?? "Email"}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm outline-none focus:border-primary"
          />
          <input
            type="password"
            placeholder={translations["common.newPassword"] ?? "Password (min 6 chars)"}
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            disabled={loading}
            className="w-full rounded-full bg-gradient-teal px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {loading ? translations["common.creatingAccount"] ?? "Creating account…" : translations["common.createAccountButton"] ?? "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {translations["common.alreadyOnLITN"] ?? "Already on LITN?"}{" "}
          <LocaleLink to="/login" className="text-teal-bright hover:underline">
            {translations["common.signIn"] ?? "Sign in"}
          </LocaleLink>
        </p>
      </div>
    </div>
  );
}