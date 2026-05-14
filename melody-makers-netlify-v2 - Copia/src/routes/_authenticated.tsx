import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard, Music2, CalendarDays, BarChart3, Lightbulb,
  Headphones, ExternalLink, LogOut, Loader2, Music,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

const NAV = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/musicas", label: "Músicas", icon: Music2 },
  { to: "/eventos", label: "Eventos", icon: CalendarDays },
  { to: "/analises", label: "Análises", icon: BarChart3 },
  { to: "/sugestoes", label: "Sugestões", icon: Lightbulb },
];
const VIEW_NAV = [
  { to: "/visao-musico", label: "Visão Músico", icon: Headphones },
];

function AuthenticatedLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Sessão encerrada");
    navigate({ to: "/login" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="theme-band min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-border bg-surface-2">
        <Link to="/dashboard" className="px-6 py-6 flex items-center gap-3 border-b border-border">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Music className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="font-display text-base text-foreground tracking-wider">Amor e Tons</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Painel da Banda</div>
          </div>
        </Link>

        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.to || pathname.startsWith(item.to + "/");
              return (
                <li key={item.to}>
                  <Link to={item.to as never}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"}`}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 px-3 text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            Visualizações
          </div>
          <ul className="mt-2 space-y-1">
            {VIEW_NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <li key={item.to}>
                  <Link to={item.to as never}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"}`}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link to="/portal"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/80 hover:bg-muted">
                <ExternalLink className="w-4 h-4" />
                Portal dos Noivos
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-3 border-t border-border">
          <div className="px-3 py-2 text-xs">
            <div className="text-foreground truncate">{user.email}</div>
          </div>
          <button onClick={handleSignOut}
            className="w-full mt-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/80 hover:bg-muted">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 bg-surface border-b border-border px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Music className="w-4 h-4 text-primary" />
          <span className="font-display tracking-wider text-sm">Amor e Tons</span>
        </Link>
        <button onClick={handleSignOut} className="text-muted-foreground"><LogOut className="w-4 h-4" /></button>
      </header>

      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <Outlet />
        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border grid grid-cols-5">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link key={item.to} to={item.to as never}
                className={`flex flex-col items-center justify-center py-2 text-[10px] gap-0.5 ${active ? "text-primary" : "text-muted-foreground"}`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="md:hidden h-14" />
      </main>
    </div>
  );
}
