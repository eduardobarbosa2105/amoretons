import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Music2, Lightbulb, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

interface Stats {
  songs: number;
  activeSongs: number;
  upcoming: number;
  nextMonth: number;
  pendingSuggestions: number;
}
interface EventRow {
  id: string; couple_name: string; event_date: string; venue: string | null; city: string | null;
  total?: number; confirmed?: number; pct?: number;
}
const TARGET_SONGS = 15; // meta de músicas por evento para cálculo do %

function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [nextEvent, setNextEvent] = useState<EventRow | null>(null);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().split("T")[0];
      const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

      const [songs, activeSongs, upcoming, nextMonth, pending, evts] = await Promise.all([
        supabase.from("songs").select("*", { count: "exact", head: true }),
        supabase.from("songs").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("events").select("*", { count: "exact", head: true }).gte("event_date", today),
        supabase.from("events").select("*", { count: "exact", head: true }).gte("event_date", today).lte("event_date", in30),
        supabase.from("song_suggestions").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("events").select("id,couple_name,event_date,venue,city").gte("event_date", today).order("event_date").limit(5),
      ]);

      setStats({
        songs: songs.count ?? 0,
        activeSongs: activeSongs.count ?? 0,
        upcoming: upcoming.count ?? 0,
        nextMonth: nextMonth.count ?? 0,
        pendingSuggestions: pending.count ?? 0,
      });

      const evList = evts.data ?? [];
      // Buscar playlist de cada evento para calcular % preenchido
      const ids = evList.map((e) => e.id);
      let counts: Record<string, { total: number; confirmed: number }> = {};
      if (ids.length) {
        const { data: songsData } = await supabase
          .from("event_songs")
          .select("event_id,status")
          .in("event_id", ids);
        for (const r of songsData ?? []) {
          const k = r.event_id as string;
          counts[k] ||= { total: 0, confirmed: 0 };
          counts[k].total += 1;
          if (r.status === "played") counts[k].confirmed += 1;
        }
      }
      const enriched = evList.map((e) => {
        const c = counts[e.id] ?? { total: 0, confirmed: 0 };
        return { ...e, total: c.total, confirmed: c.confirmed, pct: Math.min(100, Math.round((c.total / TARGET_SONGS) * 100)) };
      });
      setEvents(enriched);
      setNextEvent(enriched[0] ?? null);
    })();
  }, []);

  if (!stats) {
    return <div className="p-10 flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</div>;
  }

  const cards = [
    { to: "/musicas", label: "Total de Músicas", value: stats.songs, sub: `${stats.activeSongs} ativas`, icon: Music2 },
    { to: "/eventos", label: "Próximos Eventos", value: stats.upcoming, sub: stats.upcoming === 0 ? "Nenhum hoje" : "Agendados", icon: CalendarDays },
    { to: "/eventos", label: "Próximo Mês", value: stats.nextMonth, sub: "Eventos agendados", icon: TrendingUp },
    { to: "/sugestoes", label: "Sugestões Pendentes", value: stats.pendingSuggestions, sub: "Pendentes dos casais", icon: Lightbulb },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <h1 className="font-display text-3xl text-foreground">Painel</h1>
      <p className="text-sm text-muted-foreground mt-1">Visão geral da banda Amor e Tons</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {cards.map((c) => (
          <Link key={c.label} to={c.to as never}
            className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition group">
            <div className="flex items-center justify-between">
              <c.icon className="w-5 h-5 text-primary" />
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
            </div>
            <div className="font-display text-3xl mt-4 text-foreground">{c.value}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{c.label}</div>
            <div className="text-xs text-muted-foreground/70 mt-1">{c.sub}</div>
          </Link>
        ))}
      </div>

      {nextEvent && (
        <div className="mt-8 rounded-2xl border-2 border-primary/40 bg-accent/40 p-6 lg:p-8">
          <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-medium">Próximo Evento</div>
          <h2 className="font-display text-3xl mt-2 text-foreground">{nextEvent.couple_name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {format(parseISO(nextEvent.event_date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            {nextEvent.venue && ` · ${nextEvent.venue}`}
            {nextEvent.city && `, ${nextEvent.city}`}
          </p>
          <div className="mt-3 text-sm text-foreground/80">
            <span className="font-medium text-primary">{differenceInDays(parseISO(nextEvent.event_date), new Date())} dias</span> restantes
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Playlist montada</span>
              <span className="text-foreground font-medium">{nextEvent.total ?? 0}/{TARGET_SONGS} músicas · {nextEvent.pct ?? 0}%</span>
            </div>
            <div className="h-2 rounded-full bg-background overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${nextEvent.pct ?? 0}%` }} />
            </div>
          </div>
          <Link to="/eventos/$id" params={{ id: nextEvent.id }}
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm hover:opacity-90">
            Ver Detalhes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-xl">Próximos Eventos</h3>
          <Link to="/eventos" className="text-xs uppercase tracking-widest text-primary">Ver todos →</Link>
        </div>
        {events.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-border text-center text-muted-foreground text-sm">
            Nenhum evento agendado. <Link to="/eventos" className="text-primary underline">Criar evento</Link>
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-2xl bg-card border border-border overflow-hidden">
            {events.map((ev) => (
              <li key={ev.id}>
                <Link to="/eventos/$id" params={{ id: ev.id }}
                  className="flex items-center justify-between gap-4 p-4 hover:bg-muted transition">
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-base text-foreground truncate">{ev.couple_name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {format(parseISO(ev.event_date), "d MMM yyyy", { locale: ptBR })}
                      {ev.venue && ` · ${ev.venue}`}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${ev.pct ?? 0}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{ev.total ?? 0}/{TARGET_SONGS} · {ev.pct ?? 0}%</span>
                    </div>
                  </div>
                  <div className="text-xs text-primary font-medium shrink-0">
                    {differenceInDays(parseISO(ev.event_date), new Date())}d
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
