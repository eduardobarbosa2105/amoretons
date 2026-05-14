import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus, Search, X, Music as MusicIcon, Loader2, Play, Upload,
  Heart, Bell, BookOpen, Sparkles, Crown, PenLine, DoorOpen, Users,
  ListMusic, Trash2, Pencil,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/musicas")({
  component: SongsPage,
});

// ---------- Catálogo de momentos & gêneros ----------
type Genre = "catholic" | "classical" | "pop" | "gospel" | "mpb" | "jazz" | "soul";
const GENRE_LABEL: Record<Genre, string> = {
  catholic: "Católico", classical: "Clássico", pop: "Pop",
  gospel: "Gospel", mpb: "MPB", jazz: "Jazz", soul: "Soul",
};

const MOMENTS = [
  { id: "padrinhos",   label: "Entrada Padrinhos", icon: Users },
  { id: "noivo",       label: "Entrada Noivo",     icon: DoorOpen },
  { id: "noiva",       label: "Entrada Noiva",     icon: Crown },
  { id: "aliancas",    label: "Alianças",          icon: Sparkles },
  { id: "liturgia",    label: "Liturgia",          icon: BookOpen },
  { id: "comunhao",    label: "Comunhão",          icon: Heart },
  { id: "assinaturas", label: "Assinaturas",       icon: PenLine },
  { id: "saida",       label: "Saída",             icon: Bell },
] as const;
type MomentId = typeof MOMENTS[number]["id"];

// gradientes únicos por momento
const MOMENT_GRAD: Record<MomentId, string> = {
  padrinhos:   "from-amber-200 to-orange-300",
  noivo:       "from-orange-200 to-rose-300",
  noiva:       "from-rose-200 to-amber-200",
  aliancas:    "from-yellow-200 to-amber-300",
  liturgia:    "from-stone-200 to-amber-200",
  comunhao:    "from-rose-200 to-orange-200",
  assinaturas: "from-amber-100 to-stone-300",
  saida:       "from-orange-300 to-amber-400",
};

interface Song {
  id: string;
  title: string;
  artist: string | null;
  genre: Genre | null;
  original_key: string | null;
  band_key: string | null;
  youtube_url: string | null;
  sheet_url: string | null;
  moments: string[] | null;
  is_active: boolean;
  times_played: number;
  created_at: string;
}

// ---------- Helpers ----------
const ytId = (url: string | null) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
};
const ytThumb = (url: string | null) => {
  const id = ytId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
};

// ---------- Página ----------
type Tab = "todas" | "momento" | "ranking";

function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [moment, setMoment] = useState<MomentId | "todos">("todos");
  const [tab, setTab] = useState<Tab>("todas");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Song | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [playing, setPlaying] = useState<Song | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("songs").select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setSongs((data ?? []) as Song[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => songs.filter((s) => {
    const matchQ = !q ||
      s.title.toLowerCase().includes(q.toLowerCase()) ||
      (s.artist ?? "").toLowerCase().includes(q.toLowerCase());
    const matchMoment = moment === "todos" || (s.moments ?? []).includes(moment);
    return matchQ && matchMoment;
  }), [songs, q, moment]);

  const ranking = useMemo(
    () => [...filtered].sort((a, b) => b.times_played - a.times_played).slice(0, 18),
    [filtered]
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta música?")) return;
    const { error } = await supabase.from("songs").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Música removida");
    setSongs((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="pb-32">
      {/* Topbar busca */}
      <div className="sticky top-0 md:top-0 z-30 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center gap-3">
          <h1 className="font-display text-xl md:text-2xl shrink-0">
            Biblioteca <span className="text-primary italic">Musical</span>
          </h1>
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Músicas, artistas, momentos..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-muted border border-transparent focus:border-primary focus:outline-none text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setImportOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-border text-sm hover:border-primary">
              <Upload className="w-4 h-4" /> Importar
            </button>
            <button onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm">
              <Plus className="w-4 h-4" /> Nova
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-6">
        {/* Círculos de momentos (Flow do Deezer) */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Momentos da Cerimônia</h2>
          <div className="flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <MomentBubble active={moment === "todos"} onClick={() => setMoment("todos")}
              label="Todos" gradient="from-amber-400 to-orange-500" Icon={ListMusic} primary />
            {MOMENTS.map((m) => (
              <MomentBubble key={m.id} active={moment === m.id} onClick={() => setMoment(m.id)}
                label={m.label} gradient={MOMENT_GRAD[m.id]} Icon={m.icon} />
            ))}
          </div>
        </section>

        {/* Tabs */}
        <nav className="mt-8 flex gap-1 border-b border-border">
          {([
            ["todas", "Todas as Músicas"],
            ["momento", "Por Momento"],
            ["ranking", "Ranking"],
          ] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm border-b-2 -mb-px transition ${
                tab === key
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              {label}
            </button>
          ))}
          <span className="ml-auto self-center text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "música" : "músicas"}
          </span>
        </nav>

        {/* Conteúdo */}
        <div className="mt-8">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState onAdd={() => setOpen(true)} onImport={() => setImportOpen(true)} />
          ) : tab === "todas" ? (
            <SongCardsGrid songs={filtered} onPlay={setPlaying} onDelete={handleDelete} onEdit={setEditing} />
          ) : tab === "momento" ? (
            <ByMomentGrid songs={filtered} onSelectMoment={setMoment} />
          ) : (
            <RankingCircles songs={ranking} onPlay={setPlaying} />
          )}
        </div>
      </div>

      {/* Modais */}
      {open && <NewSongModal onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />}
      {editing && <NewSongModal song={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {importOpen && <ImportModal onClose={() => setImportOpen(false)} onDone={() => { setImportOpen(false); load(); }} />}

      {/* Mini player */}
      {playing && <MiniPlayer song={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}

// ---------- Bolinhas de momento ----------
function MomentBubble({
  active, onClick, label, gradient, Icon, primary,
}: {
  active: boolean; onClick: () => void; label: string;
  gradient: string; Icon: React.ComponentType<{ className?: string }>; primary?: boolean;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 shrink-0 group">
      <div className={`w-[72px] h-[72px] md:w-[88px] md:h-[88px] rounded-full bg-gradient-to-br ${gradient}
        flex items-center justify-center transition transform group-hover:scale-105
        ring-offset-4 ring-offset-background ${active ? "ring-2 ring-primary" : "ring-0"}
        ${primary ? "shadow-lg shadow-primary/30" : ""}`}>
        <Icon className={`w-7 h-7 md:w-8 md:h-8 ${primary ? "text-white" : "text-stone-700"}`} />
      </div>
      <span className={`text-[11px] md:text-xs text-center max-w-[88px] leading-tight
        ${active ? "text-primary font-medium" : "text-foreground/80"}`}>
        {label}
      </span>
    </button>
  );
}

// ---------- Cards (estilo Deezer) ----------
function SongCardsGrid({
  songs, onPlay, onDelete, onEdit,
}: { songs: Song[]; onPlay: (s: Song) => void; onDelete: (id: string) => void; onEdit: (s: Song) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
      {songs.map((s) => {
        const thumb = ytThumb(s.youtube_url);
        return (
          <div key={s.id} className="group">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-amber-200 to-amber-400">
              {thumb ? (
                <img src={thumb} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MusicIcon className="w-10 h-10 text-white/80" />
                </div>
              )}
              {/* overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition flex items-end justify-end p-2">
                <button onClick={() => onPlay(s)}
                  className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition
                    w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg shadow-black/30
                    flex items-center justify-center hover:scale-105">
                  <Play className="w-5 h-5 fill-current" />
                </button>
              </div>
              {/* actions (hover) */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => onEdit(s)}
                  className="w-8 h-8 rounded-full bg-black/50 text-white hover:bg-primary flex items-center justify-center" title="Editar">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onDelete(s.id)}
                  className="w-8 h-8 rounded-full bg-black/50 text-white hover:bg-destructive flex items-center justify-center" title="Remover">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-2 px-0.5">
              <div className="font-medium text-sm text-foreground truncate">{s.title}</div>
              <div className="text-xs text-muted-foreground truncate">{s.artist || "—"}</div>
              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                {s.genre && (
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground">
                    {GENRE_LABEL[s.genre]}
                  </span>
                )}
                {(s.moments ?? []).slice(0, 1).map((m) => {
                  const lbl = MOMENTS.find((x) => x.id === m)?.label ?? m;
                  return (
                    <span key={m} className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {lbl}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Por Momento ----------
function ByMomentGrid({
  songs, onSelectMoment,
}: { songs: Song[]; onSelectMoment: (m: MomentId) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
      {MOMENTS.map((m) => {
        const count = songs.filter((s) => (s.moments ?? []).includes(m.id)).length;
        return (
          <button key={m.id} onClick={() => onSelectMoment(m.id)} className="group text-left">
            <div className={`relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br ${MOMENT_GRAD[m.id]}`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <m.icon className="w-12 h-12 text-stone-700/50" />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-end p-4">
                <span className="opacity-0 group-hover:opacity-100 transition text-white font-display text-xl drop-shadow">
                  {m.label}
                </span>
                <span className="ml-auto opacity-0 group-hover:opacity-100 transition w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                  <Play className="w-4 h-4 fill-current" />
                </span>
              </div>
            </div>
            <div className="mt-2">
              <div className="font-medium text-sm text-foreground">{m.label}</div>
              <div className="text-xs text-muted-foreground">{count} {count === 1 ? "música" : "músicas"}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ---------- Ranking circular ----------
function RankingCircles({ songs, onPlay }: { songs: Song[]; onPlay: (s: Song) => void }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-5 gap-y-7">
      {songs.map((s, i) => {
        const thumb = ytThumb(s.youtube_url);
        return (
          <button key={s.id} onClick={() => onPlay(s)} className="group flex flex-col items-center text-center">
            <div className="relative">
              <div className="w-[88px] h-[88px] rounded-full overflow-hidden bg-gradient-to-br from-amber-300 to-amber-500
                ring-2 ring-transparent group-hover:ring-primary transition transform group-hover:scale-105">
                {thumb ? (
                  <img src={thumb} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><MusicIcon className="w-7 h-7 text-white/90" /></div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 min-w-[26px] h-[26px] px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center shadow">
                {i + 1}º
              </span>
            </div>
            <div className="mt-3 text-xs font-medium text-foreground line-clamp-2">{s.title}</div>
            <div className="text-[11px] text-muted-foreground truncate w-full">{s.artist || "—"}</div>
          </button>
        );
      })}
    </div>
  );
}

// ---------- Empty ----------
function EmptyState({ onAdd, onImport }: { onAdd: () => void; onImport: () => void }) {
  return (
    <div className="p-12 rounded-2xl border border-dashed border-border text-center">
      <MusicIcon className="w-10 h-10 text-muted-foreground mx-auto" />
      <p className="text-muted-foreground mt-3">Nenhuma música no acervo ainda.</p>
      <div className="mt-4 flex items-center justify-center gap-3">
        <button onClick={onAdd} className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm">Adicionar manualmente</button>
        <button onClick={onImport} className="px-5 py-2 rounded-full border border-border text-sm">Importar arquivo</button>
      </div>
    </div>
  );
}

// ---------- Mini Player ----------
function MiniPlayer({ song, onClose }: { song: Song; onClose: () => void }) {
  const id = ytId(song.youtube_url);
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-md overflow-hidden bg-amber-200 shrink-0">
            {ytThumb(song.youtube_url) ? (
              <img src={ytThumb(song.youtube_url)!} className="w-full h-full object-cover" alt="" />
            ) : <div className="w-full h-full flex items-center justify-center"><MusicIcon className="w-5 h-5 text-amber-700" /></div>}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{song.title}</div>
            <div className="text-xs text-muted-foreground truncate">{song.artist || "—"}</div>
          </div>
        </div>
        {id ? (
          <iframe
            className="hidden md:block rounded-md"
            width="320" height="56"
            src={`https://www.youtube.com/embed/${id}?autoplay=1`}
            title={song.title} allow="autoplay; encrypted-media" />
        ) : (
          <span className="text-xs text-muted-foreground hidden md:inline">Sem link de YouTube</span>
        )}
        <button onClick={onClose} className="ml-auto w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-accent">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ---------- Modal Nova / Editar Música ----------
function NewSongModal({ onClose, onSaved, song }: { onClose: () => void; onSaved: () => void; song?: Song }) {
  const isEdit = !!song;
  const [form, setForm] = useState({
    title: song?.title ?? "",
    artist: song?.artist ?? "",
    genre: (song?.genre ?? "") as "" | Genre,
    original_key: song?.original_key ?? "",
    band_key: song?.band_key ?? "",
    youtube_url: song?.youtube_url ?? "",
    sheet_url: song?.sheet_url ?? "",
  });
  const [moments, setMoments] = useState<MomentId[]>((song?.moments ?? []) as MomentId[]);
  const [saving, setSaving] = useState(false);

  const toggleMoment = (m: MomentId) =>
    setMoments((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Título é obrigatório");
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      artist: form.artist || null,
      genre: form.genre || null,
      original_key: form.original_key || null,
      band_key: form.band_key || null,
      youtube_url: form.youtube_url || null,
      sheet_url: form.sheet_url || null,
      moments,
    };
    const { error } = isEdit
      ? await supabase.from("songs").update(payload).eq("id", song!.id)
      : await supabase.from("songs").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(isEdit ? "Música atualizada!" : "Música adicionada!");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl bg-card border border-border p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">{isEdit ? "Editar Música" : "Nova Música"}</h2>
          <button onClick={onClose} className="text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Título *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground" />
          <input placeholder="Artista" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground" />
          <select value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value as Genre })}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground">
            <option value="">Gênero...</option>
            {(Object.keys(GENRE_LABEL) as Genre[]).map((g) => <option key={g} value={g}>{GENRE_LABEL[g]}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Tom original" value={form.original_key} onChange={(e) => setForm({ ...form, original_key: e.target.value })}
              className="px-4 py-3 rounded-lg border border-border bg-background text-foreground" />
            <input placeholder="Tom da banda" value={form.band_key} onChange={(e) => setForm({ ...form, band_key: e.target.value })}
              className="px-4 py-3 rounded-lg border border-border bg-background text-foreground" />
          </div>
          <input placeholder="URL do YouTube (vídeo)" value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground" />
          <input placeholder="URL da partitura / áudio" value={form.sheet_url} onChange={(e) => setForm({ ...form, sheet_url: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground" />

          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Momentos</div>
            <div className="flex flex-wrap gap-2">
              {MOMENTS.map((m) => {
                const active = moments.includes(m.id);
                return (
                  <button key={m.id} type="button" onClick={() => toggleMoment(m.id)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition ${
                      active ? "bg-primary text-primary-foreground border-primary"
                             : "bg-background border-border text-foreground/80 hover:border-primary"
                    }`}>
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Salvar
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------- Modal Importar arquivo (CSV / JSON) ----------
type ParsedRow = {
  title: string; artist?: string; genre?: string;
  youtube_url?: string; sheet_url?: string;
  moments?: string[]; original_key?: string; band_key?: string;
};

function ImportModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const parseCsv = (text: string): ParsedRow[] => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) throw new Error("Arquivo vazio");
    const headers = lines[0].split(/[,;\t]/).map((h) => h.trim().toLowerCase());
    const idx = (k: string) => headers.findIndex((h) => h === k || h.includes(k));
    const ti = idx("titulo") >= 0 ? idx("titulo") : idx("title");
    if (ti < 0) throw new Error("Coluna 'titulo' não encontrada");
    const ai = idx("artista") >= 0 ? idx("artista") : idx("artist");
    const gi = idx("genero") >= 0 ? idx("genero") : idx("genre");
    const yi = idx("youtube") >= 0 ? idx("youtube") : idx("video");
    const si = idx("partitura") >= 0 ? idx("partitura") : idx("audio");
    const mi = idx("momento") >= 0 ? idx("momento") : idx("etapa");
    const ki = idx("tom");

    return lines.slice(1).map((line) => {
      const cols = line.split(/[,;\t]/).map((c) => c.trim().replace(/^"|"$/g, ""));
      const moments = mi >= 0 && cols[mi]
        ? cols[mi].split("|").map((s) => s.trim().toLowerCase())
            .map((s) => MOMENTS.find((m) => m.label.toLowerCase() === s || m.id === s)?.id)
            .filter(Boolean) as MomentId[]
        : [];
      return {
        title: cols[ti] ?? "",
        artist: ai >= 0 ? cols[ai] : undefined,
        genre: gi >= 0 ? cols[gi]?.toLowerCase() : undefined,
        youtube_url: yi >= 0 ? cols[yi] : undefined,
        sheet_url: si >= 0 ? cols[si] : undefined,
        original_key: ki >= 0 ? cols[ki] : undefined,
        moments,
      };
    }).filter((r) => r.title);
  };

  const handleFile = async (file: File) => {
    setError(null);
    try {
      const text = await file.text();
      const parsed = file.name.endsWith(".json")
        ? (JSON.parse(text) as ParsedRow[])
        : parseCsv(text);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Nenhum registro válido");
      setRows(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao ler arquivo");
      setRows([]);
    }
  };

  const importAll = async () => {
    setSaving(true);
    const validGenres = Object.keys(GENRE_LABEL) as Genre[];
    const payload = rows.map((r) => ({
      title: r.title.trim(),
      artist: r.artist || null,
      genre: (r.genre && (validGenres as string[]).includes(r.genre) ? r.genre : null) as Genre | null,
      original_key: r.original_key || null,
      band_key: r.band_key || null,
      youtube_url: r.youtube_url || null,
      sheet_url: r.sheet_url || null,
      moments: r.moments ?? [],
    }));
    const { error } = await supabase.from("songs").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`${payload.length} música(s) importada(s)!`);
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-card border border-border p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Importar Músicas</h2>
          <button onClick={onClose} className="text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>

        <p className="text-sm text-muted-foreground">
          Aceita <b>CSV</b> ou <b>JSON</b>. Colunas: <code>titulo, artista, genero, youtube, partitura, tom, momento</code>.
          Para múltiplos momentos use <code>|</code> (ex: <code>noiva|aliancas</code>).
        </p>

        <div className="mt-4 border-2 border-dashed border-border rounded-xl p-6 text-center">
          <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="text-sm mt-2">Arraste o arquivo ou</p>
          <button onClick={() => fileRef.current?.click()}
            className="mt-3 px-4 py-2 rounded-full border border-border hover:border-primary text-sm">
            Escolher arquivo
          </button>
          <input ref={fileRef} type="file" accept=".csv,.json,.txt" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>

        {error && <div className="mt-3 text-sm text-destructive">{error}</div>}

        {rows.length > 0 && (
          <>
            <div className="mt-4 text-xs text-muted-foreground">
              {rows.length} registro(s) prontos para importar:
            </div>
            <div className="mt-2 max-h-64 overflow-y-auto border border-border rounded-lg divide-y divide-border">
              {rows.slice(0, 50).map((r, i) => (
                <div key={i} className="px-3 py-2 text-sm flex items-center gap-2">
                  <MusicIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium truncate">{r.title}</span>
                  {r.artist && <span className="text-muted-foreground truncate">— {r.artist}</span>}
                  {r.moments && r.moments.length > 0 && (
                    <span className="ml-auto text-[10px] uppercase tracking-wider text-primary">
                      {r.moments.join(" · ")}
                    </span>
                  )}
                </div>
              ))}
              {rows.length > 50 && (
                <div className="px-3 py-2 text-xs text-muted-foreground">+ {rows.length - 50} mais...</div>
              )}
            </div>
            <button onClick={importAll} disabled={saving}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium disabled:opacity-60">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Importar {rows.length} música{rows.length === 1 ? "" : "s"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
