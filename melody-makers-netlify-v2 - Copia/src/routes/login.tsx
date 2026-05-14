import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Music, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Amor e Tons" }] }),
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});
const signupSchema = loginSchema.extend({
  full_name: z.string().trim().min(2, "Informe seu nome").max(100),
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const parsed = loginSchema.parse(form);
        const { error } = await supabase.auth.signInWithPassword(parsed);
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
        navigate({ to: "/dashboard" });
      } else {
        const parsed = signupSchema.parse(form);
        const { error } = await supabase.auth.signUp({
          email: parsed.email,
          password: parsed.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: parsed.full_name },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Entrando...");
        navigate({ to: "/dashboard" });
      }
    } catch (err: unknown) {
      const msg = err instanceof z.ZodError
        ? err.issues[0]?.message
        : err instanceof Error ? err.message : "Erro inesperado";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative">
      <div className="absolute inset-0 radial-gold opacity-50 pointer-events-none" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-widest text-muted-foreground hover:text-gold uppercase mb-10">
          <ArrowLeft className="w-3 h-3" /> Voltar ao site
        </Link>

        <div className="flex items-center justify-center gap-3 mb-8">
          <Music className="w-5 h-5 text-gold" />
          <span className="font-display tracking-[0.35em] text-foreground">AMOR E TONS</span>
        </div>

        <h1 className="font-display text-3xl text-center text-foreground">
          Área da <span className="italic gold-gradient-text">banda</span>
        </h1>
        <p className="text-center text-sm text-muted-foreground mt-2">
          {mode === "login" ? "Acesse o painel de gerenciamento" : "Crie sua conta de músico"}
        </p>

        <div className="mt-8 flex p-1 rounded-full bg-surface border border-border">
          <button onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-full text-xs uppercase tracking-widest transition ${mode === "login" ? "bg-gold text-primary-foreground" : "text-muted-foreground"}`}>
            Entrar
          </button>
          <button onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-full text-xs uppercase tracking-widest transition ${mode === "signup" ? "bg-gold text-primary-foreground" : "text-muted-foreground"}`}>
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <input
              required
              placeholder="Seu nome completo"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full px-5 py-4 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none text-foreground placeholder:text-muted-foreground"
            />
          )}
          <input
            required type="email" placeholder="E-mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-5 py-4 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none text-foreground placeholder:text-muted-foreground"
          />
          <input
            required type="password" placeholder="Senha (mín. 6 caracteres)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-5 py-4 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none text-foreground placeholder:text-muted-foreground"
          />

          <button type="submit" disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-gold text-primary-foreground text-sm font-medium tracking-wider uppercase btn-shimmer disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Acesso restrito aos músicos da banda.
        </p>
      </div>
    </div>
  );
}
