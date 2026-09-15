import { useNavigate, useLocation, useParams } from 'react-router-dom'
import Link from '@/components/route-link'
import { useState, useEffect } from 'react'
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { LocaleLink } from "@/components/locale-link";
import { api, type AuthResponse } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { getLocaleFromPath, getTranslations, withLocalePath } from "@/lib/i18n";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { locale } = useParams();
  const { refresh } = useAuth();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = await api.post<AuthResponse>("/auth/sign_in", { email, password });
      api.saveSession(auth);
      refresh();
      toast.success("Welcome back.");
      navigate(`/${locale}/home`);
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
        <h1 className="font-display text-4xl sm:text-5xl">
          {translations["common.loginHeading"] ?? "Log in"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {translations["common.newToLITN"] ?? "Don't have an account?"}{" "}
          <LocaleLink to="/signup" className="font-semibold text-foreground hover:underline">
            {translations["common.createAccountLink"] ?? "Create an Account"}
          </LocaleLink>
        </p>

        <form className="mt-10 space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {translations["common.emailLabel"] ?? "Email Address"}
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {translations["common.passwordLabel"] ?? "Password"}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 pr-11 text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex justify-end">
              <LocaleLink
                to={`/forgot-password`}
                className="text-sm font-medium text-teal-bright hover:underline"
              >
                {translations["common.forgotPassword"] ?? "Forgot Password?"}
              </LocaleLink>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full rounded-full bg-gradient-teal px-5 py-3.5 text-sm font-semibold text-background transition-opacity disabled:opacity-60"
          >
            {loading
              ? translations["common.signingIn"] ?? "Signing in…"
              : translations["common.signIn"] ?? "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}