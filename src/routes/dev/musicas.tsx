import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dev/musicas")({
  component: DevMusicasPage,
});

type Genre = "catholic" | "classical" | "pop" | "gospel" | "mpb" | "jazz" | "soul";

const GENRE_LABEL: Record<Genre, string> = {
  catholic: "Católico",
  classical: "Clássico",
  pop: "Pop",
  gospel: "Gospel",
  mpb: "MPB",
  jazz: "Jazz",
  soul: "Soul",
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

const ytId = (url: string | null) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
};

const ytThumb = (url: string | null) => {
  const id = ytId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
};

function DevMusicasPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .order("times_played", { ascending: false });
    if (error) toast.error(error.message);
    setSongs((data ?? []) as Song[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = songs.filter((s) => {
    const matchQ =
      !q || s.title.toLowerCase().includes(q.toLowerCase()) || (s.artist ?? "").toLowerCase().includes(q.toLowerCase());
    return matchQ;
  });

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-2xl text-foreground">Catálogo de Músicas</h2>
        <p className="text-sm text-muted-foreground mt-1">{songs.length} músicas disponíveis</p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por título ou artista..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-border text-center">
          <p className="text-muted-foreground">Nenhuma música encontrada.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((song) => {
            const thumb = ytThumb(song.youtube_url);
            return (
              <div
                key={song.id}
                className="rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/40 hover:shadow-md transition"
              >
                {thumb && (
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img src={thumb} alt={song.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-medium text-foreground line-clamp-2">{song.title}</h3>
                  {song.artist && <p className="text-sm text-muted-foreground mt-1">{song.artist}</p>}

                  <div className="mt-3 flex flex-wrap gap-1">
                    {song.genre && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent/40 text-foreground/70">
                        {GENRE_LABEL[song.genre]}
                      </span>
                    )}
                    {song.original_key && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-blue-100/60 text-blue-700">
                        Tom: {song.original_key}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    Tocada {song.times_played} {song.times_played === 1 ? "vez" : "vezes"}
                  </div>

                  {song.youtube_url && (
                    <a
                      href={song.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-xs text-primary hover:underline"
                    >
                      ▶️ Ouvir no YouTube
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
