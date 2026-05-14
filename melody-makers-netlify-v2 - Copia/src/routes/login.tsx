import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Music, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Amor e Tons" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading, signIn } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = signIn(password);
    setSubmitting(false);
    if (ok) {
      toast.success("Bem-vindo!");
      navigate({ to: "/dashboard" });
    } else {
      toast.error("Senha incorreta");
      setPassword("");
    }
  };

  if (loading) return null;

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
          Acesso restrito aos músicos da banda
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 pr-12 rounded-xl bg-surface border border-border focus:border-gold focus:outline-none text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting || !password}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-gold text-primary-foreground text-sm font-medium tracking-wider uppercase btn-shimmer disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
