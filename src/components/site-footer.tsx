import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/litn-logo.asset.json";
import { getLocaleFromPath, withLocalePath } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";

export function SiteFooter() {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const {translations} = useAuth()
  return (
    <footer className="mt-24 border-t border-border/60 bg-surface/40 sm:mt-32">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-3 md:gap-10">
        <div>
          <div className="flex items-center gap-2">
            <img src={logo.url} alt="" className="h-8 w-8 rounded-md" />
            <span className="font-display text-lg">LITN</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            {translations["common.tagline"] ?? "A quieter place to read — serialised chapters and complete novels in a beautifully focused reader."}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">{translations["common.libraryTitle"] ?? "Read"}</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to={withLocalePath("/catalogue", locale)} className="hover:text-foreground">{translations["common.catalogue"] ?? "Catalogue"}</Link></li>
            <li><Link to={withLocalePath("/catalogue", locale)} className="hover:text-foreground">{translations["common.serialised"] ?? "Serialised"}</Link></li>
            <li><Link to={withLocalePath("/catalogue", locale)} className="hover:text-foreground">{translations["common.newReleases"] ?? "New releases"}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">{translations["common.joinLITN"] ?? "Newsletter"}</h4>
          <p className="mt-3 text-sm text-muted-foreground">{translations["common.joinSubtitle"] ?? "Monthly chapter drops in your inbox."}</p>
          <form className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              placeholder={translations["common.email"] ?? "you@example.com"}
              className="w-full rounded-full border border-border bg-background/60 px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <button className="rounded-full bg-gradient-teal px-4 py-2 text-sm font-medium text-primary-foreground">{translations["common.createAccountButton"] ?? "Join"}</button>
          </form>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} LITN. {translations["common.alphaRelease"] ?? "Alpha release."}
      </div>
    </footer>
  );
}
