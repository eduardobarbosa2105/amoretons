import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy, ExternalLink, Loader2, Calendar, MapPin, Mail, Phone, Clock, Navigation, Music2, Youtube, Pencil, FileDown, Play, X, Church, PartyPopper, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import { EventModal, type EventFormData } from "./eventos";

export const Route = createFileRoute("/_authenticated/eventos/$id")({
  component: EventDetail,
});

interface Ev {
  id: string; couple_name: string; event_date: string; event_time: string | null;
  venue: string | null; city: string | null; status: string; access_code: string;
  contact_email: string | null; contact_whatsapp: string | null; internal_notes: string | null;
  selection_deadline: string | null; event_type: "religious" | "civil" | "mixed" | null;
  ceremony_type: "missa" | "celebracao" | null;
}

interface PlaylistItem {
  id: string;
  moment: string;
  order_index: number;
  status: string;
  selected_by: string;
  custom_key: string | null;
  song: { id: string; title: string; artist: string | null; youtube_url: string | null; band_key: string | null; original_key: string | null } | null;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:   { label: "Pendente",   cls: "bg-amber-100 text-amber-800 border-amber-300" },
  confirmed: { label: "Confirmado", cls: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  cancelled: { label: "Cancelado",  cls: "bg-rose-100 text-rose-800 border-rose-300" },
  done:      { label: "Realizado",  cls: "bg-slate-200 text-slate-800 border-slate-300" },
};

const MOMENT_LABEL: Record<string, string> = {
  padrinhos: "Entrada Padrinhos", noivo: "Entrada Noivo", noiva: "Entrada Noiva",
  aliancas: "Alianças", liturgia: "Liturgia", comunhao: "Comunhão",
  assinaturas: "Assinaturas", saida: "Saída",
};

const ytId = (url: string | null) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
};

function EventDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [ev, setEv] = useState<Ev | null>(null);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [playing, setPlaying] = useState<PlaylistItem | null>(null);

  const load = async () => {
    const [{ data }, { data: songs }] = await Promise.all([
      supabase.from("events").select("*").eq("id", id).single(),
      supabase
        .from("event_songs")
        .select("id, moment, order_index, status, selected_by, custom_key, song:songs(id, title, artist, youtube_url, band_key, original_key)")
        .eq("event_id", id)
        .order("order_index"),
    ]);
    setEv(data as Ev);
    setPlaylist((songs ?? []) as unknown as PlaylistItem[]);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  // realtime: refresh when couple selects songs in portal
  useEffect(() => {
    const ch = supabase.channel(`ev-songs-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "event_songs", filter: `event_id=eq.${id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [id]);

  if (!ev) return <div className="p-10 flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</div>;

  const portalUrl = typeof window !== "undefined" ? `${window.location.origin}/portal?code=${ev.access_code}` : "";
  const copyCode = () => { navigator.clipboard.writeText(ev.access_code); toast.success("Código copiado"); };
  const copyUrl = () => { navigator.clipboard.writeText(portalUrl); toast.success("Link copiado"); };

  const fullAddress = [ev.venue, ev.city].filter(Boolean).join(", ");
  const mapsUrl = fullAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}` : null;
  const status = STATUS_LABEL[ev.status] ?? { label: ev.status, cls: "bg-muted text-foreground border-border" };
  const Cer = ev.ceremony_type === "missa" ? Church : PartyPopper;

  // group by moment preserving order
  const grouped = playlist.reduce<Record<string, PlaylistItem[]>>((acc, it) => {
    (acc[it.moment] ||= []).push(it);
    return acc;
  }, {});

  const exportPdf = () => {
    const doc = new jsPDF();
    const W = doc.internal.pageSize.getWidth();
    let y = 18;
    doc.setFont("helvetica", "bold"); doc.setFontSize(18);
    doc.text(ev.couple_name, W / 2, y, { align: "center" }); y += 7;
    doc.setFont("helvetica", "normal"); doc.setFontSize(11);
    doc.text(`${format(parseISO(ev.event_date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}${ev.event_time ? ` · ${ev.event_time.slice(0,5)}` : ""}`, W / 2, y, { align: "center" }); y += 6;
    if (fullAddress) { doc.text(fullAddress, W / 2, y, { align: "center" }); y += 6; }
    if (ev.ceremony_type) { doc.text(ev.ceremony_type === "missa" ? "Missa" : "Celebração", W / 2, y, { align: "center" }); y += 6; }
    y += 4;
    doc.setDrawColor(180); doc.line(15, y, W - 15, y); y += 8;

    Object.entries(grouped).forEach(([moment, items]) => {
      if (y > 270) { doc.addPage(); y = 18; }
      doc.setFont("helvetica", "bold"); doc.setFontSize(12);
      doc.text((MOMENT_LABEL[moment] ?? moment).toUpperCase(), 15, y); y += 6;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      items.forEach((it, i) => {
        if (y > 280) { doc.addPage(); y = 18; }
        const tom = it.custom_key || it.song?.band_key || it.song?.original_key;
        const line = `${i + 1}. ${it.song?.title ?? "—"}${it.song?.artist ? ` — ${it.song.artist}` : ""}${tom ? `   (Tom: ${tom})` : ""}`;
        doc.text(line, 18, y, { maxWidth: W - 33 }); y += 6;
      });
      y += 4;
    });

    doc.save(`playlist-${ev.couple_name.replace(/\s+/g, "-").toLowerCase()}.pdf`);
    toast.success("PDF gerado");
  };

  const removeSong = async (esId: string) => {
    if (!confirm("Remover esta música da playlist?")) return;
    const { error } = await supabase.from("event_songs").delete().eq("id", esId);
    if (error) return toast.error(error.message);
    toast.success("Removida");
    load();
  };

  const deleteEvent = async () => {
    if (!confirm(`Excluir o evento de ${ev.couple_name}? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from("events").delete().eq("id", ev.id);
    if (error) return toast.error(error.message);
    toast.success("Evento excluído");
    navigate({ to: "/eventos" });
  };

  const eventForEdit: EventFormData = {
    id: ev.id,
    couple_name: ev.couple_name,
    event_date: ev.event_date,
    event_time: ev.event_time,
    venue: ev.venue,
    city: ev.city,
    event_type: ev.event_type ?? "religious",
    ceremony_type: ev.ceremony_type,
    status: ev.status as EventFormData["status"],
    contact_whatsapp: ev.contact_whatsapp,
    contact_email: ev.contact_email,
    selection_deadline: ev.selection_deadline,
    internal_notes: ev.internal_notes,
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto pb-32">
      <Link to="/eventos" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary uppercase tracking-widest">
        <ArrowLeft className="w-3 h-3" /> Voltar para Eventos
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-foreground">{ev.couple_name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium ${status.cls}`}>{status.label}</span>
            {ev.ceremony_type && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/40 border border-border text-xs">
                <Cer className="w-3 h-3" /> {ev.ceremony_type === "missa" ? "Missa" : "Celebração"}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-primary text-sm">
            <Pencil className="w-4 h-4" /> Editar
          </button>
          <button onClick={exportPdf} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm">
            <FileDown className="w-4 h-4" /> PDF da Playlist
          </button>
          <button onClick={deleteEvent} className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-destructive/40 text-destructive hover:bg-destructive/10 text-sm">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {format(parseISO(ev.event_date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
        {ev.event_time && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {ev.event_time.slice(0, 5)}</span>}
        <span className="text-primary font-medium">{playlist.length} músicas</span>
      </div>

      {fullAddress && (
        <div className="mt-6 p-5 rounded-2xl bg-card border border-border flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Local da Cerimônia</div>
              {ev.venue && <div className="text-base text-foreground font-medium mt-1">{ev.venue}</div>}
              {ev.city && <div className="text-sm text-muted-foreground">{ev.city}</div>}
            </div>
          </div>
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm hover:opacity-90">
              <Navigation className="w-4 h-4" /> Ver no Google Maps
            </a>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="p-5 rounded-2xl bg-accent/40 border border-primary/30">
          <div className="text-[10px] uppercase tracking-widest text-primary font-medium">Portal dos Noivos</div>
          <div className="font-mono text-2xl tracking-widest mt-2 text-foreground">{ev.access_code}</div>
          <div className="flex flex-wrap gap-2 mt-3">
            <button onClick={copyCode} className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary"><Copy className="w-3 h-3" /> Copiar</button>
            <a href={portalUrl} target="_blank" rel="noreferrer" className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary"><ExternalLink className="w-3 h-3" /> Abrir</a>
            <button onClick={copyUrl} className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary"><Copy className="w-3 h-3" /> Link</button>
          </div>
        </div>
        {ev.contact_email && (
          <div className="p-5 rounded-2xl bg-card border border-border">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">E-mail</div>
            <div className="text-sm mt-2 flex items-center gap-2 break-all"><Mail className="w-4 h-4 text-muted-foreground shrink-0" /> {ev.contact_email}</div>
          </div>
        )}
        {ev.contact_whatsapp && (
          <div className="p-5 rounded-2xl bg-card border border-border">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">WhatsApp</div>
            <div className="text-sm mt-2 flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> {ev.contact_whatsapp}</div>
          </div>
        )}
      </div>

      {ev.internal_notes && (
        <div className="mt-6 p-5 rounded-2xl bg-card border border-border">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Notas Internas</div>
          <p className="text-sm whitespace-pre-line text-foreground/80">{ev.internal_notes}</p>
        </div>
      )}

      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-2xl text-foreground flex items-center gap-2">
            <Music2 className="w-5 h-5 text-primary" /> Playlist do Evento
          </h2>
          <Link to="/musicas" className="text-xs uppercase tracking-widest text-primary">Gerenciar →</Link>
        </div>

        {playlist.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-border text-center text-sm text-muted-foreground">
            Nenhuma música vinculada ainda. Aguardando seleção dos noivos no portal.
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([moment, items]) => (
              <div key={moment} className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="px-5 py-3 bg-muted/40 border-b border-border flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-primary font-medium">{MOMENT_LABEL[moment] ?? moment}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{items.length} {items.length === 1 ? "música" : "músicas"}</div>
                </div>
                <ul className="divide-y divide-border">
                  {items.map((it, i) => {
                    const tom = it.custom_key || it.song?.band_key || it.song?.original_key;
                    return (
                      <li key={it.id} className="flex items-center gap-3 px-5 py-3 group">
                        <div className="font-mono text-xs text-muted-foreground w-6 text-right">{i + 1}</div>
                        <button onClick={() => it.song?.youtube_url && setPlaying(it)}
                          disabled={!it.song?.youtube_url}
                          className="w-9 h-9 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-30 flex items-center justify-center shrink-0">
                          <Play className="w-4 h-4 fill-current" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-foreground truncate">{it.song?.title ?? "—"}</div>
                          {it.song?.artist && <div className="text-xs text-muted-foreground truncate">{it.song.artist}</div>}
                        </div>
                        {tom && (
                          <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-primary/30 bg-primary/5 text-primary font-medium">
                            Tom {tom}
                          </span>
                        )}
                        <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full hidden sm:inline ${
                          it.selected_by === "couple" ? "bg-rose-100 text-rose-700" : "bg-muted text-muted-foreground"
                        }`}>
                          {it.selected_by === "couple" ? "Noivos" : "Banda"}
                        </span>
                        {it.song?.youtube_url && (
                          <a href={it.song.youtube_url} target="_blank" rel="noreferrer"
                            className="text-muted-foreground hover:text-primary" title="Abrir no YouTube">
                            <Youtube className="w-4 h-4" />
                          </a>
                        )}
                        <button onClick={() => removeSong(it.id)}
                          className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {editOpen && <EventModal event={eventForEdit} onClose={() => setEditOpen(false)} onSaved={() => { setEditOpen(false); load(); }} />}

      {playing && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{playing.song?.title}</div>
              <div className="text-xs text-muted-foreground truncate">{playing.song?.artist || "—"}</div>
            </div>
            {ytId(playing.song?.youtube_url ?? null) && (
              <iframe className="hidden md:block rounded-md" width="320" height="56"
                src={`https://www.youtube.com/embed/${ytId(playing.song!.youtube_url)}?autoplay=1`}
                title={playing.song?.title} allow="autoplay; encrypted-media" />
            )}
            <button onClick={() => setPlaying(null)} className="w-9 h-9 rounded-full bg-muted hover:bg-accent flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
