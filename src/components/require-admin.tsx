import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { withLocalePath, resolvePreferredLocale } from "@/lib/i18n";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const locale = resolvePreferredLocale();
      navigate(withLocalePath("/login", locale));
    }
    else if (!isAdmin) {
      const locale = resolvePreferredLocale();
      navigate(withLocalePath("/", locale));
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Checking access…
      </div>
    );
  }
  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Redirecting…
      </div>
    );
  }
  return <>{children}</>;
}
