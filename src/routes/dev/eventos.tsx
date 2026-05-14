import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/dev/eventos")({
  component: DevEventosPage,
});

type Status = "confirmed" | "pending" | "cancelled" | "done";
type EventType = "religious" | "civil" | "mixed";
type CeremonyType = "missa" | "celebracao";

interface EventRow {
  id: string;
  couple_name: string;
  event_date: string;
  event_time: string | null;
  venue: string | null;
  city: string | null;
  status: Status;
  event_type: EventType | null;
  ceremony_type: CeremonyType | null;
  access_code: string;
}

const STATUS_LABEL: Record<Status, { label: string; cls: string }> = {
  confirmed: { label: "Confirmado", cls: "bg-green-100 text-green-700" },
  pending: { label: "Pendente", cls: "bg-amber-100 text-amber-700" },
  cancelled: { label: "Cancelado", cls: "bg-red-100 text-red-700" },
  done: { label: "Realizado", cls: "bg-stone-200 text-stone-700" },
};

function DevEventosPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });
    if (error) toast.error(error.message);
    setEvents((data ?? []) as EventRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-2xl text-foreground">Eventos</h2>
        <p className="text-sm text-muted-foreground mt-1">{events.length} eventos no total</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-border text-center">
          <p className="text-muted-foreground">Nenhum evento cadastrado ainda.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => {
            const s = STATUS_LABEL[ev.status];
            const days = differenceInDays(parseISO(ev.event_date), new Date());
            return (
              <Link
                key={ev.id}
                to="/dev/eventos/$id"
                params={{ id: ev.id }}
                className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition cursor-pointer block"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg text-foreground">{ev.couple_name}</h3>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${s.cls}`}>
                    {s.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {format(parseISO(ev.event_date), "d 'de' MMMM, yyyy", { locale: ptBR })}
                  {ev.event_time && ` · ${ev.event_time.slice(0, 5)}`}
                </p>
                {(ev.venue || ev.city) && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {[ev.venue, ev.city].filter(Boolean).join(", ")}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Código: <span className="font-mono text-foreground">{ev.access_code}</span></span>
                  {days >= 0 && <span className="text-primary font-medium">{days}d</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
