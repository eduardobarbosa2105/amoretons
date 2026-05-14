import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Music2, CalendarDays, BarChart3, Headphones, ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/dev")({
  component: DevLayout,
});

const DEV_NAV = [
  { to: "/dev/eventos", label: "Eventos", icon: CalendarDays },
  { to: "/dev/musicas", label: "Músicas", icon: Music2 },
  { to: "/dev/analises", label: "Análises", icon: BarChart3 },
  { to: "/dev/visao-musico", label: "Visão Músico", icon: Headphones },
];

function DevLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="theme-band min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-40">
        <div className="px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-widest text-muted-foreground hover:text-gold uppercase">
              <ArrowLeft className="w-3 h-3" /> Voltar ao site
            </Link>
            <span className="text-[10px] uppercase tracking-widest bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
              Modo Desenvolvimento
            </span>
          </div>
          <h1 className="font-display text-2xl text-foreground">Amor e Tons — Demo</h1>
        </div>
      </header>

      {/* Nav */}
      <nav className="border-b border-border bg-surface-2">
        <div className="px-6 max-w-7xl mx-auto">
          <div className="flex gap-1 overflow-x-auto">
            {DEV_NAV.map((item) => {
              const active = pathname === item.to || pathname.startsWith(item.to + "/");
              return (
                <Link
                  key={item.to}
                  to={item.to as never}
                  className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition ${
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
