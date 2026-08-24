import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_locale/$locale")({
  component: LocaleLayout,
});

function LocaleLayout() {
  return <Outlet />;
}
