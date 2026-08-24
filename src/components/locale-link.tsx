import { Link, useLocation } from "@tanstack/react-router";
import { forwardRef, type AnchorHTMLAttributes } from "react";
import { getLocaleFromPath, type SupportedLocale, withLocalePath } from "@/lib/i18n";

export type LocaleLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  locale?: SupportedLocale;
};

export const LocaleLink = forwardRef<HTMLAnchorElement, LocaleLinkProps>(function LocaleLink(
  { to, locale, ...props },
  ref,
) {
  const location = useLocation();
  const currentLocale = locale ?? getLocaleFromPath(location.pathname);
  const target = to.startsWith("/") ? withLocalePath(to, currentLocale) : to;

  return <Link ref={ref} to={target as any} {...(props as any)} />;
});