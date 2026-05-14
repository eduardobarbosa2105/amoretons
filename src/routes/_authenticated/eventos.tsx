import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, MapPin, X, Loader2, Church, PartyPopper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/eventos")({
  component: EventsPage,
});

type Status = "confirmed" | "pending" | "cancelled" | "done";
type EventType = "religious" | "civil" | "mixed";
type CeremonyType = "missa" | "celebracao";
interface EventRow {
  id: string; couple_name: string; event_date: string; event_time: string | null;
  venue: string | null; city: string | null; status: Status; event_type: EventType | null;
  ceremony_type: CeremonyType | null; access_code: string;
}

const STATUS_LABEL: Record<Status, { label: string; cls: string }> = {
  confirmed: { label: "Confirmado", cls: "bg-green-100 text-green-700" },
  pending: { label: "Pendente", cls: "bg-amber-100 text-amber-700" },
  cancelled: { label: "Cancelado", cls: "bg-red-100 text-red-700" },
  done: { label: "Realizado", cls: "bg-stone-200 text-stone-700" },
};

function genCode(name: string) {
  const initials = name.replace(/[^a-zA-Z& ]/g, "").split(/[& ]+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  return `${initials || "EV"}${Math.floor(1000 + Math.random() * 9000)}`;
}

function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: true });
    if (error) toast.error(error.message);
    setEvents((data ?? []) as EventRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Eventos</h1>
          <p className="text-sm text-muted-foreground mt-1">{events.length} eventos no total</p>
        </div>
        <button onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm">
          <Plus className="w-4 h-4" /> Novo Evento
        </button>
      </div>

      {loading ? (
        <div className="mt-10 flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</div>
      ) : events.length === 0 ? (
        <div className="mt-10 p-12 rounded-2xl border border-dashed border-border text-center">
          <p className="text-muted-foreground">Nenhum evento ainda.</p>
          <button onClick={() => setOpen(true)} className="mt-4 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm">
            Criar primeiro evento
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          {events.map((ev) => {
            const s = STATUS_LABEL[ev.status];
            const days = differenceInDays(parseISO(ev.event_date), new Date());
            const Cer = ev.ceremony_type === "missa" ? Church : PartyPopper;
            return (
              <Link key={ev.id} to="/eventos/$id" params={{ id: ev.id }}
                className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition cursor-pointer block">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-xl text-foreground">{ev.couple_name}</h3>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${s.cls}`}>{s.label}</span>
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
                  <div className="flex items-center gap-2">
                    {ev.ceremony_type && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/40 text-foreground/80">
                        <Cer className="w-3 h-3" /> {ev.ceremony_type === "missa" ? "Missa" : "Celebração"}
                      </span>
                    )}
                    <span className="text-muted-foreground">Código: <span className="font-mono text-foreground">{ev.access_code}</span></span>
                  </div>
                  {days >= 0 && <span className="text-primary font-medium">{days}d</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {open && <EventModal onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />}
    </div>
  );
}

export interface EventFormData {
  id?: string;
  couple_name: string; event_date: string; event_time: string | null;
  venue: string | null; city: string | null; event_type: EventType;
  ceremony_type: CeremonyType | null; status: Status;
  contact_whatsapp: string | null; contact_email: string | null;
  selection_deadline: string | null; internal_notes: string | null;
}

export function EventModal({ onClose, onSaved, event }: { onClose: () => void; onSaved: () => void; event?: EventFormData }) {
  const isEdit = !!event?.id;
  const [form, setForm] = useState({
    couple_name: event?.couple_name ?? "",
    event_date: event?.event_date ?? "",
    event_time: event?.event_time ?? "",
    venue: event?.venue ?? "",
    city: event?.city ?? "",
    event_type: (event?.event_type ?? "religious") as EventType,
    ceremony_type: (event?.ceremony_type ?? "missa") as CeremonyType,
    status: (event?.status ?? "pending") as Status,
    contact_whatsapp: event?.contact_whatsapp ?? "",
    contact_email: event?.contact_email ?? "",
    selection_deadline: event?.selection_deadline ?? "",
    internal_notes: event?.internal_notes ?? "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.couple_name || !form.event_date) return toast.error("Nome do casal e data são obrigatórios");
    setSaving(true);
    const payload = {
      couple_name: form.couple_name.trim(),
      event_date: form.event_date,
      event_time: form.event_time || null,
      venue: form.venue || null,
      city: form.city || null,
      event_type: form.event_type,
      ceremony_type: form.ceremony_type,
      status: form.status,
      contact_whatsapp: form.contact_whatsapp || null,
      contact_email: form.contact_email || null,
      selection_deadline: form.selection_deadline || null,
      internal_notes: form.internal_notes || null,
    };
    const { error } = isEdit
      ? await supabase.from("events").update(payload).eq("id", event!.id!)
      : await supabase.from("events").insert({ ...payload, access_code: genCode(form.couple_name) });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(isEdit ? "Evento atualizado!" : "Evento criado!");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl bg-card border border-border p-6 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">{isEdit ? "Editar Evento" : "Novo Evento"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
          <input required placeholder="Nome do casal *" value={form.couple_name}
            onChange={(e) => setForm({ ...form, couple_name: e.target.value })}
            className="sm:col-span-2 px-4 py-3 rounded-lg border border-border bg-background text-foreground" />
          <input required type="date" value={form.event_date}
            onChange={(e) => setForm({ ...form, event_date: e.target.value })}
            className="px-4 py-3 rounded-lg border border-border bg-background text-foreground" />
          <input type="time" value={form.event_time}
            onChange={(e) => setForm({ ...form, event_time: e.target.value })}
            className="px-4 py-3 rounded-lg border border-border bg-background text-foreground" />
          <input placeholder="Local / Igreja" value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
            className="px-4 py-3 rounded-lg border border-border bg-background text-foreground" />
          <input placeholder="Cidade" value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="px-4 py-3 rounded-lg border border-border bg-background text-foreground" />

          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Tipo de Cerimônia</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {([
                ["missa", "Missa", Church],
                ["celebracao", "Celebração", PartyPopper],
              ] as [CeremonyType, string, typeof Church][]).map(([key, label, Icon]) => (
                <button type="button" key={key} onClick={() => setForm({ ...form, ceremony_type: key })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition ${
                    form.ceremony_type === key ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground/70 hover:border-primary/40"
                  }`}>
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>
          </div>

          <select value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value as EventType })}
            className="px-4 py-3 rounded-lg border border-border bg-background text-foreground">
            <option value="religious">Religioso</option>
            <option value="civil">Civil</option>
            <option value="mixed">Misto</option>
          </select>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
            className="px-4 py-3 rounded-lg border border-border bg-background text-foreground">
            <option value="pending">Pendente</option>
            <option value="confirmed">Confirmado</option>
            <option value="cancelled">Cancelado</option>
            <option value="done">Realizado</option>
          </select>
          <input placeholder="WhatsApp" value={form.contact_whatsapp}
            onChange={(e) => setForm({ ...form, contact_whatsapp: e.target.value })}
            className="px-4 py-3 rounded-lg border border-border bg-background text-foreground" />
          <input type="email" placeholder="E-mail do casal" value={form.contact_email}
            onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            className="px-4 py-3 rounded-lg border border-border bg-background text-foreground" />
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground">Prazo para o casal montar repertório</label>
            <input type="date" value={form.selection_deadline}
              onChange={(e) => setForm({ ...form, selection_deadline: e.target.value })}
              className="w-full mt-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground" />
          </div>
          <textarea placeholder="Notas internas" rows={3} value={form.internal_notes}
            onChange={(e) => setForm({ ...form, internal_notes: e.target.value })}
            className="sm:col-span-2 px-4 py-3 rounded-lg border border-border bg-background text-foreground" />
          <button type="submit" disabled={saving}
            className="sm:col-span-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? "Salvar Alterações" : "Criar Evento"}
          </button>
        </form>
      </div>
    </div>
  );
}
