import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/_authenticated/analises")({
  component: () => (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="font-display text-3xl">Análises</h1>
      <p className="mt-2 text-muted-foreground">Gráficos, ranking e templates de repertório virão na próxima fase.</p>
    </div>
  ),
});
