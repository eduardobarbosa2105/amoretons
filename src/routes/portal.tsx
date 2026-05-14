import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Music, Heart, Sparkles, Plus, ChevronDown, ChevronUp, X, Send, Check, ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Portal dos Noivos — Amor e Tons" },
      { name: "description", content: "Construa a trilha sonora do seu casamento com a banda Amor e Tons." },
    ],
  }),
  component: PortalPage,
});

const SECTIONS = [
  "Entrada dos Padrinhos", "Entrada do Noivo", "Entrada da Noiva",
  "Troca de Alianças", "Primeira Dança", "Corte do Bolo", "Saída do Casal",
];

const REPERTOIRE = [
  { title: "Canon in D", artist: "Pachelbel", key: "D" },
  { title: "A Thousand Years", artist: "Christina Perri", key: "Bb" },
  { title: "Marry You", artist: "Bruno Mars", key: "C" },
  { title: "Perfect", artist: "Ed Sheeran", key: "Ab" },
  { title: "All of Me", artist: "John Legend", key: "Ab" },
  { title: "Can't Help Falling in Love", artist: "Elvis Presley", key: "D" },
  { title: "At Last", artist: "Etta James", key: "Eb" },
  { title: "Évidemment", artist: "France Gall", key: "F" },
];

const INITIAL_PICKS: Record<string, { title: string; artist: string }[]> = {
  "Entrada dos Padrinhos": [{ title: "Marry You", artist: "Bruno Mars" }],
  "Entrada do Noivo": [{ title: "Canon in D", artist: "Pachelbel" }],
  "Entrada da Noiva": [{ title: "A Thousand Years", artist: "Christina Perri" }],
  "Troca de Alianças": [{ title: "Perfect", artist: "Ed Sheeran" }],
  "Primeira Dança": [{ title: "All of Me", artist: "John Legend" }, { title: "At Last", artist: "Etta James" }],
  "Corte do Bolo": [{ title: "Can't Help Falling in Love", artist: "Elvis Presley" }],
  "Saída do Casal": [{ title: "Évidemment", artist: "France Gall" }],
};

function PortalPage() {
  const [entered, setEntered] = useState(false);
  const [code, setCode] = useState("");

  if (!entered) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="absolute inset-0 radial-gold opacity-60 pointer-events-none" />
        <div className="relative w-full max-w-md text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-widest text-muted-foreground hover:text-gold uppercase mb-12">
            <ArrowLeft className="w-3 h-3" /> Voltar ao site
          </Link>
          <div className="flex items-center justify-center gap-3 mb-8">
            <Music className="w-5 h-5 text-gold" />
            <span className="font-display tracking-[0.35em] text-foreground">AMOR E TONS</span>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl text-foreground leading-tight">
            Bem-vindos ao seu <span className="italic gold-gradient-text">espaço exclusivo</span>
          </h1>
          <p className="mt-4 text-muted-foreground">Insira o código de acesso fornecido pela banda</p>

          <form onSubmit={(e) => { e.preventDefault(); setEntered(true); }} className="mt-10 space-y-4">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="EX: ABC123"
              className="w-full px-6 py-5 rounded-xl bg-surface border border-gold/40 focus:border-gold focus:outline-none text-center font-mono tracking-[0.4em] text-foreground placeholder:text-muted-foreground/50"
            />
            <button type="submit" className="w-full px-6 py-4 rounded-full bg-gold text-primary-foreground text-sm font-medium tracking-wider uppercase btn-shimmer">
              Acessar Nosso Casamento
            </button>
          </form>
          <button onClick={() => setEntered(true)} className="mt-6 text-xs text-gold/80 hover:text-gold tracking-widest uppercase">
            Não tenho código — Experimentar Demo →
          </button>
        </div>
      </div>
    );
  }

  return <PortalInterior />;
}

function PortalInterior() {
  const [picks, setPicks] = useState(INITIAL_PICKS);
  const [open, setOpen] = useState<string | null>("Entrada da Noiva");
  const [adding, setAdding] = useState<string | null>(null);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestSent, setSuggestSent] = useState(false);

  const total = useMemo(() => Object.values(picks).reduce((s, arr) => s + arr.length, 0), [picks]);
  const target = 18;
  const pct = Math.min(100, (total / target) * 100);

  const addSong = (section: string, song: { title: string; artist: string }) => {
    setPicks((p) => ({ ...p, [section]: [...(p[section] ?? []), song] }));
    setAdding(null);
  };
  const removeSong = (section: string, idx: number) => {
    setPicks((p) => ({ ...p, [section]: p[section].filter((_, i) => i !== idx) }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap items-center gap-4 justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Music className="w-5 h-5 text-gold" />
            <span className="font-display tracking-[0.3em] text-sm text-foreground">AMOR E TONS</span>
          </Link>
          <div className="text-center">
            <div className="font-display text-lg text-foreground">Maria & João</div>
            <div className="text-[11px] tracking-widest text-gold uppercase">07 · Ago · 2025 · 87 dias</div>
          </div>
          <div className="hidden sm:block w-48">
            <div className="flex justify-between text-[10px] tracking-widest uppercase text-muted-foreground mb-1">
              <span>{total} de {target}</span><span>{Math.round(pct)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface overflow-hidden">
              <div className="h-full bg-gold transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-14 pb-32">
        <div className="text-center mb-14">
          <span className="text-[11px] tracking-[0.5em] text-gold uppercase">Curadoria</span>
          <h1 className="mt-3 font-display text-4xl lg:text-5xl text-foreground">
            A trilha sonora <span className="italic gold-gradient-text">do nosso amor</span>
          </h1>
          <p className="mt-4 text-sm text-muted-foreground italic">
            Vocês têm até 15/08/2025 para enviar sugestões.
          </p>
        </div>

        <div className="space-y-3">
          {SECTIONS.map((section) => {
            const isOpen = open === section;
            const songs = picks[section] ?? [];
            return (
              <div key={section} className="rounded-2xl border border-border bg-surface overflow-hidden">
                <button onClick={() => setOpen(isOpen ? null : section)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 hover:bg-surface-2 transition">
                  <div className="text-left">
                    <h3 className="font-display text-lg text-foreground uppercase tracking-wider">{section}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{songs.length} música{songs.length !== 1 ? "s" : ""} selecionada{songs.length !== 1 ? "s" : ""}</p>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gold" /> : <ChevronDown className="w-4 h-4 text-gold" />}
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 border-t border-border">
                    <ul className="mt-4 space-y-2">
                      {songs.map((s, i) => (
                        <li key={i} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-background border border-border">
                          <div>
                            <div className="text-sm text-foreground">{s.title}</div>
                            <div className="text-xs text-muted-foreground">{s.artist}</div>
                          </div>
                          <button onClick={() => removeSong(section, i)} className="text-muted-foreground hover:text-destructive transition">
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                      {songs.length === 0 && (
                        <li className="text-sm text-muted-foreground italic py-3">Nenhuma música ainda — escolha a partir do nosso repertório.</li>
                      )}
                    </ul>

                    <button onClick={() => setAdding(section)}
                      className="mt-4 inline-flex items-center gap-2 text-sm text-gold hover:text-[var(--gold-hover)] tracking-wider uppercase">
                      <Plus className="w-4 h-4" /> Adicionar Música
                    </button>

                    {adding === section && (
                      <div className="mt-4 rounded-xl border border-gold/40 bg-background p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs uppercase tracking-widest text-muted-foreground">Repertório da banda</span>
                          <button onClick={() => setAdding(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                        </div>
                        <ul className="space-y-2 max-h-72 overflow-auto pr-1">
                          {REPERTOIRE.map((r) => (
                            <li key={r.title} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface hover:border-gold border border-border transition">
                              <div>
                                <div className="text-sm text-foreground">{r.title}</div>
                                <div className="text-xs text-muted-foreground">{r.artist} · Tom {r.key}</div>
                              </div>
                              <button onClick={() => addSong(section, r)} className="w-8 h-8 rounded-full bg-gold text-primary-foreground flex items-center justify-center hover:bg-[var(--gold-hover)]">
                                <Plus className="w-4 h-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {suggestSent && (
          <div className="mt-8 p-4 rounded-xl border border-gold/50 bg-gold/5 text-sm text-foreground flex items-center gap-2">
            <Check className="w-4 h-4 text-gold" /> Sua sugestão foi enviada! A banda vai avaliar em breve <Heart className="w-3 h-3 text-gold" />
          </div>
        )}
      </main>

      {/* Floating suggest button */}
      <button onClick={() => setSuggestOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gold text-primary-foreground text-xs font-medium tracking-widest uppercase shadow-[var(--shadow-gold-lg)] btn-shimmer">
        <Sparkles className="w-4 h-4" /> Sugerir uma Música
      </button>

      {suggestOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSuggestOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-gold/40 p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-[10px] tracking-[0.4em] text-gold uppercase">Sugestão</span>
                <h2 className="font-display text-2xl text-foreground mt-1">Uma música especial</h2>
              </div>
              <button onClick={() => setSuggestOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setSuggestSent(true); setSuggestOpen(false); }} className="space-y-3">
              <input required placeholder="Título da música" className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:outline-none text-foreground placeholder:text-muted-foreground" />
              <input required placeholder="Artista" className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:outline-none text-foreground placeholder:text-muted-foreground" />
              <select className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:outline-none text-foreground">
                {SECTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
              <textarea rows={3} placeholder="Observações (opcional)" className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:outline-none text-foreground placeholder:text-muted-foreground" />
              <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gold text-primary-foreground text-sm tracking-widest uppercase btn-shimmer">
                <Send className="w-4 h-4" /> Enviar Sugestão
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
