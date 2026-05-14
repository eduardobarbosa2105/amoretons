import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/sugestoes")({
  component: SuggestionsPage,
});

interface Sugg { id: string; song_title: string; artist: string | null; moment: string | null; couple_notes: string | null; status: string; event_id: string; events: { couple_name: string } | null; }

function SuggestionsPage() {
  const [items, setItems] = useState<Sugg[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("song_suggestions")
      .select("*, events(couple_name)").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data ?? []) as Sugg[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("song_suggestions").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "approved" ? "Aprovada" : "Rejeitada");
    load();
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <h1 className="font-display text-3xl">Sugestões dos Noivos</h1>
      {loading ? (
        <div className="mt-10 flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</div>
      ) : items.length === 0 ? (
        <p className="mt-10 text-muted-foreground">Nenhuma sugestão ainda.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((s) => (
            <li key={s.id} className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{s.song_title} {s.artist && <span className="text-muted-foreground font-normal">— {s.artist}</span>}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {s.events?.couple_name} {s.moment && `· ${s.moment}`}
                  </div>
                  {s.couple_notes && <p className="text-sm mt-2 italic text-foreground/80">"{s.couple_notes}"</p>}
                </div>
                {s.status === "pending" ? (
                  <div className="flex gap-2">
                    <button onClick={() => update(s.id, "approved")} className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200"><Check className="w-4 h-4" /></button>
                    <button onClick={() => update(s.id, "rejected")} className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${s.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{s.status === "approved" ? "Aprovada" : "Rejeitada"}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
