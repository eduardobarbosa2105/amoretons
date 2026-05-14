import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Music, Mic, Sparkles, Star, ChevronLeft, ChevronRight,
  ArrowRight, MessageCircle, Instagram, Mail, Heart, Send,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Amor e Tons — A trilha sonora do seu amor" },
      { name: "description", content: "Trio vocal especializado em casamentos. Construa com a banda a trilha sonora perfeita para cada momento da sua cerimônia." },
      { property: "og:title", content: "Amor e Tons — A trilha sonora do seu amor" },
      { property: "og:description", content: "Banda de casamentos com três vozes harmonizadas. Mais de 200 sonhos realizados." },
    ],
  }),
  component: LandingPage,
});

const NAV_LINKS = [
  { href: "#inicio", label: "Início" },
  { href: "#sobre", label: "A Banda" },
  { href: "#momentos", label: "Momentos" },
  { href: "#fotos", label: "Fotos" },
  { href: "#portal", label: "Portal" },
  { href: "#contato", label: "Contato" },
];

const MOMENTS = [
  { n: "01", title: "Entrada dos Padrinhos", desc: "O início que anuncia: algo sagrado está prestes a acontecer." },
  { n: "02", title: "Entrada do Noivo", desc: "Passos firmes, coração acelerado. A espera mais doce da vida." },
  { n: "03", title: "Entrada da Noiva", desc: "O instante em que o tempo para. Uma melodia eterna." },
  { n: "04", title: "Troca de Alianças", desc: "O sim que ecoa em harmonia. Um pacto cantado em três vozes." },
  { n: "05", title: "Primeira Dança", desc: "O primeiro abraço de casados, embalado pela canção de vocês." },
  { n: "06", title: "Corte do Bolo", desc: "Doçura, sorrisos e a trilha que celebra a união." },
  { n: "07", title: "Saída do Casal", desc: "O grand finale: aplausos, lágrimas e a música que ficará para sempre." },
];

const VOCALS = [
  { name: "Voz Soprano", desc: "A linha mais alta — a que arrepia e brilha sobre as outras." },
  { name: "Voz Mezzo", desc: "A cor central — quente, presente, que segura toda a emoção." },
  { name: "Voz Grave", desc: "A base que sustenta — profunda, firme, fundadora da harmonia." },
];

const TESTIMONIALS = [
  { text: "A Amor e Tons transformou nosso casamento. Cada música escolhida com tanto cuidado e emoção. Choramos e dançamos muito!", name: "Ana & Pedro", date: "Março 2025" },
  { text: "Três vozes que se completam de forma inexplicável. A harmonia deles deixou toda a Igreja em silêncio durante a entrada da noiva.", name: "Camila & Rafael", date: "Janeiro 2025" },
  { text: "Usamos o portal para montar toda a playlist e foi incrível participar desse processo. O resultado superou tudo que imaginamos.", name: "Juliana & Marcos", date: "Dezembro 2024" },
];

const GALLERY = [
  { url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80", couple: "Ana & Pedro", date: "Mar 2025" },
  { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80", couple: "Camila & Rafael", date: "Jan 2025" },
  { url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=900&q=80", couple: "Juliana & Marcos", date: "Dez 2024" },
  { url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=80", couple: "Beatriz & Lucas", date: "Nov 2024" },
  { url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=80", couple: "Sofia & Henrique", date: "Out 2024" },
  { url: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?auto=format&fit=crop&w=900&q=80", couple: "Helena & Bruno", date: "Set 2024" },
];

function useCountUp(target: number, durationMs = 1600) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / durationMs, 1);
            setVal(Math.floor(p * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, durationMs]);
  return { ref, val };
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <a href="#inicio" className="flex items-center gap-3">
          <Music className="w-5 h-5 text-gold" />
          <span className="font-display text-base tracking-[0.35em] text-foreground">AMOR E TONS</span>
        </a>
        <ul className="hidden lg:flex items-center gap-9 text-[13px] tracking-wider text-muted-foreground">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="hover:text-gold transition-colors uppercase">{l.label}</a>
            </li>
          ))}
        </ul>
        <Link
          to="/portal"
          className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold text-gold text-xs uppercase tracking-[0.2em] hover:bg-gold hover:text-primary-foreground transition-all"
        >
          Área dos Noivos
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  const c1 = useCountUp(200);
  const c2 = useCountUp(98);
  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden pt-24">
      <div className="absolute inset-0 radial-gold opacity-80" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-10 text-center">
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="h-px w-10 bg-gold" />
          <span className="text-[11px] tracking-[0.5em] text-gold uppercase">Banda de Casamentos</span>
          <span className="h-px w-10 bg-gold" />
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-8xl leading-[1.05] font-bold">
          <span className="block text-foreground">A TRILHA SONORA</span>
          <span className="block italic font-medium gold-gradient-text">do seu amor</span>
        </h1>

        <p className="mt-8 max-w-2xl mx-auto text-base lg:text-lg text-muted-foreground leading-relaxed">
          Somos um trio de vozes extremamente harmonizadas, especializados em criar a trilha sonora
          perfeita para cada momento da sua cerimônia. Mais de 200 sonhos realizados.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#sobre" className="btn-shimmer inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gold text-primary-foreground text-sm font-medium tracking-wider uppercase transition-all hover:shadow-[var(--shadow-gold-lg)]">
            Conhecer a Banda <ArrowRight className="w-4 h-4" />
          </a>
          <Link to="/portal" className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-gold text-foreground text-sm font-medium tracking-wider uppercase hover:bg-gold/10 transition-all">
            Acessar Portal Demo
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-3 max-w-3xl mx-auto divide-x divide-gold/30">
          <div className="px-4">
            <div className="font-display text-4xl lg:text-5xl text-gold"><span ref={c1.ref}>{c1.val}</span>+</div>
            <div className="text-[11px] tracking-[0.3em] text-muted-foreground mt-2 uppercase">Sonhos Realizados</div>
          </div>
          <div className="px-4">
            <div className="font-display text-4xl lg:text-5xl text-gold"><span ref={c2.ref}>{c2.val}</span>%</div>
            <div className="text-[11px] tracking-[0.3em] text-muted-foreground mt-2 uppercase">Satisfação</div>
          </div>
          <div className="px-4">
            <div className="font-display text-4xl lg:text-5xl text-gold">∞</div>
            <div className="text-[11px] tracking-[0.3em] text-muted-foreground mt-2 uppercase">Para cada momento</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Sobre() {
  return (
    <section id="sobre" className="bg-surface py-28 lg:py-40">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-gold" />
            <span className="text-[11px] tracking-[0.5em] text-gold uppercase">A Banda</span>
          </div>
          <h2 className="font-display text-4xl lg:text-6xl text-foreground">
            Três vozes. <span className="italic gold-gradient-text">Uma emoção.</span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-muted-foreground leading-relaxed">
            A Amor e Tons é formada por três vozes extremamente harmonizadas, criando uma experiência
            musical única e envolvente. Nossa formação vocal é nossa assinatura — uma harmonia que
            transforma cada entrada, cada momento em cena, em uma lembrança para sempre.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {VOCALS.map((v) => (
            <div key={v.name} className="group p-8 rounded-2xl bg-background border border-border hover:border-gold transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-gold)]">
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-6">
                <Mic className="w-5 h-5 text-gold" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-2">{v.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <h3 className="font-display text-2xl text-gold tracking-wider uppercase mb-6">Nossa História</h3>
          <p className="text-muted-foreground leading-loose">
            Nascida do encontro de três vozes apaixonadas pela arte de emocionar, a Amor e Tons descobriu
            no universo dos casamentos sua vocação. Em mais de uma década dedicados exclusivamente a
            celebrações matrimoniais, transformamos cada cerimônia numa obra de arte sonora — feita à
            mão, à medida, e com o coração de quem entende que música é memória eterna.
          </p>
        </div>
      </div>
    </section>
  );
}

function Momentos() {
  return (
    <section id="momentos" className="bg-background py-28 lg:py-40">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl lg:text-6xl text-foreground">
            Uma música para <span className="italic gold-gradient-text">cada momento</span>
          </h2>
          <div className="mx-auto mt-6 h-px w-24 bg-gold" />
          <p className="mt-6 max-w-xl mx-auto text-muted-foreground">
            Entendemos a emoção de cada entrada, cada olhar, cada passo.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {MOMENTS.map((m) => (
            <div key={m.n} className="group relative p-8 rounded-2xl bg-surface border border-border hover:border-gold transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-gold)]">
              <div className="flex items-start gap-6">
                <span className="font-display text-5xl text-gold/70 group-hover:text-gold transition-colors">{m.n}</span>
                <div className="flex-1">
                  <h3 className="font-display text-xl text-foreground uppercase tracking-wider">{m.title}</h3>
                  <div className="mt-3 h-px w-12 bg-gold/40" />
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Galeria() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % GALLERY.length), 4000);
    return () => clearInterval(t);
  }, [paused]);
  const prev = () => setIdx((i) => (i - 1 + GALLERY.length) % GALLERY.length);
  const next = () => setIdx((i) => (i + 1) % GALLERY.length);

  return (
    <section id="fotos" className="bg-surface py-28 lg:py-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <span className="text-[11px] tracking-[0.5em] text-gold uppercase">Momentos Reais</span>
          <h2 className="mt-4 font-display text-4xl lg:text-6xl text-foreground">
            Cada cerimônia, <span className="italic gold-gradient-text">uma história única</span>
          </h2>
        </div>

        <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="overflow-hidden">
            <div className="flex transition-transform duration-700 ease-out gap-6"
                 style={{ transform: `translateX(calc(-${idx} * (clamp(260px, 32vw, 380px) + 1.5rem)))` }}>
              {GALLERY.map((g, i) => (
                <div key={i} className="relative shrink-0 w-[clamp(260px,32vw,380px)] aspect-[3/4] rounded-2xl overflow-hidden border border-border group">
                  <img src={g.url} alt={g.couple} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-5">
                    <div className="font-display text-lg text-foreground">{g.couple}</div>
                    <div className="text-xs tracking-widest text-gold/80 uppercase mt-1">{g.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={prev} aria-label="Anterior" className="absolute left-2 lg:-left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur border border-gold/40 text-gold hover:bg-gold hover:text-primary-foreground transition-all flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={next} aria-label="Próximo" className="absolute right-2 lg:-right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur border border-gold/40 text-gold hover:bg-gold hover:text-primary-foreground transition-all flex items-center justify-center">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {GALLERY.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} aria-label={`Foto ${i+1}`}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-gold" : "w-1.5 bg-border"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Portal() {
  const steps = [
    { n: "01", title: "Acesse com seu código", desc: "Receba seu código exclusivo após contratação." },
    { n: "02", title: "Explore o repertório", desc: "Escolha músicas por momento da cerimônia." },
    { n: "03", title: "Sugira favoritas", desc: "Envie suas músicas para a banda avaliar." },
  ];
  return (
    <section id="portal" className="relative bg-background py-28 lg:py-40 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent" />
      <div className="relative max-w-6xl mx-auto px-6 lg:px-10">
        <div className="rounded-3xl border border-gold/40 p-10 lg:p-16 bg-surface/50 backdrop-blur">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-[11px] tracking-[0.5em] text-gold uppercase">Exclusivo para Vocês</span>
            </div>
            <h2 className="font-display text-4xl lg:text-6xl text-foreground leading-tight">
              Construam juntos a <span className="italic gold-gradient-text">trilha sonora</span> do seu amor
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-muted-foreground leading-relaxed">
              Um portal exclusivo onde vocês participam ativamente da curadoria musical da cerimônia.
              Explore nosso repertório, selecione músicas por momento e sugira suas favoritas — tudo
              em um espaço pensado para vocês.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {steps.map((s) => (
              <div key={s.n} className="relative p-6 rounded-2xl bg-background border border-border">
                <div className="font-display text-3xl text-gold mb-3">{s.n}</div>
                <h3 className="font-display text-lg text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/portal" className="btn-shimmer px-8 py-4 rounded-full bg-gold text-primary-foreground text-sm font-medium tracking-wider uppercase">
              Acessar meu Portal
            </Link>
            <Link to="/portal" search={{ demo: "1" } as never} className="px-8 py-4 rounded-full border border-gold text-foreground text-sm font-medium tracking-wider uppercase hover:bg-gold/10">
              Experimentar Demo
            </Link>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6 italic">
            Código de acesso fornecido pela banda após contratação.
          </p>
        </div>
      </div>
    </section>
  );
}

function Depoimentos() {
  return (
    <section className="bg-surface py-28 lg:py-40">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl lg:text-6xl text-foreground">
            O que nossos <span className="italic gold-gradient-text">noivos dizem</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="relative p-8 rounded-2xl bg-background border border-border overflow-hidden hover:border-gold transition-all hover:-translate-y-1">
              <div className="absolute -top-6 -left-2 font-display text-[140px] leading-none text-gold/10 select-none">"</div>
              <div className="relative">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="italic text-foreground/90 leading-relaxed mb-6">"{t.text}"</p>
                <div className="font-display text-lg text-gold">{t.name}</div>
                <div className="text-xs tracking-widest text-muted-foreground uppercase mt-1">{t.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contato() {
  return (
    <section id="contato" className="bg-background py-28 lg:py-40">
      <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
        <div className="mx-auto h-px w-24 bg-gold mb-8" />
        <h2 className="font-display text-4xl lg:text-6xl text-foreground leading-tight">
          Vamos criar algo <span className="italic gold-gradient-text">inesquecível juntos?</span>
        </h2>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          Entre em contato pelo WhatsApp, Instagram ou preencha o formulário abaixo. Será um prazer
          fazer parte do dia mais especial da sua vida.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a href="https://wa.me/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gold text-foreground text-sm uppercase tracking-wider hover:bg-gold/10 transition-all">
            <MessageCircle className="w-4 h-4 text-gold" /> WhatsApp
          </a>
          <a href="https://instagram.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gold text-foreground text-sm uppercase tracking-wider hover:bg-gold/10 transition-all">
            <Instagram className="w-4 h-4 text-gold" /> Instagram
          </a>
          <a href="#form" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-primary-foreground text-sm uppercase tracking-wider btn-shimmer">
            <Mail className="w-4 h-4" /> Formulário
          </a>
        </div>

        <form id="form" className="mt-16 text-left grid sm:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); alert("Mensagem enviada! ♥"); }}>
          <input required placeholder="Nome do casal" className="sm:col-span-2 px-5 py-4 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none text-foreground placeholder:text-muted-foreground" />
          <input required type="email" placeholder="E-mail" className="px-5 py-4 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none text-foreground placeholder:text-muted-foreground" />
          <input required placeholder="WhatsApp" className="px-5 py-4 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none text-foreground placeholder:text-muted-foreground" />
          <input type="date" className="sm:col-span-2 px-5 py-4 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none text-foreground placeholder:text-muted-foreground" />
          <textarea rows={4} placeholder="Mensagem" className="sm:col-span-2 px-5 py-4 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none text-foreground placeholder:text-muted-foreground" />
          <button type="submit" className="sm:col-span-2 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gold text-primary-foreground text-sm font-medium tracking-wider uppercase btn-shimmer">
            <Send className="w-4 h-4" /> Enviar Mensagem
          </button>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[oklch(0.09_0_0)] border-t border-border py-14">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5 text-gold" />
            <span className="font-display tracking-[0.35em] text-foreground">AMOR E TONS</span>
          </div>
          <p className="italic text-muted-foreground text-sm flex items-center gap-2">
            <Heart className="w-3 h-3 text-gold" /> A trilha sonora do seu amor
          </p>
          <div className="h-px w-full max-w-md bg-border my-4" />
          <div className="flex gap-6 text-xs uppercase tracking-widest text-muted-foreground">
            <a href="https://instagram.com" className="hover:text-gold transition-colors">Instagram</a>
            <a href="https://wa.me" className="hover:text-gold transition-colors">WhatsApp</a>
            <a href="https://youtube.com" className="hover:text-gold transition-colors">YouTube</a>
          </div>
          <p className="text-xs text-muted-foreground mt-4">© 2025 Amor e Tons. Todos os direitos reservados.</p>
          <Link to="/portal" className="text-xs text-gold/70 hover:text-gold tracking-widest uppercase mt-2">
            Área da Banda →
          </Link>
        </div>
      </div>
    </footer>
  );
}

function LandingPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      <Hero />
      <Sobre />
      <Momentos />
      <Galeria />
      <Portal />
      <Depoimentos />
      <Contato />
      <Footer />
    </div>
  );
}
