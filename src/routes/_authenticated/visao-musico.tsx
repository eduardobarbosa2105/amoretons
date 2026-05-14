import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/_authenticated/visao-musico")({
  component: () => (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="font-display text-3xl">Visão do Músico</h1>
      <p className="mt-2 text-muted-foreground">Modo apresentação e checklist do dia do evento virão na próxima fase.</p>
    </div>
  ),
});
