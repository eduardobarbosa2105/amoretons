import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dev/analises")({
  component: () => (
    <div>
      <h2 className="font-display text-2xl text-foreground mb-2">Análises</h2>
      <p className="text-muted-foreground">Gráficos, ranking e templates de repertório virão na próxima fase.</p>
      
      <div className="mt-8 p-8 rounded-2xl border border-dashed border-border">
        <div className="max-w-2xl">
          <h3 className="font-display text-lg text-foreground mb-3">📊 Planejado para esta área:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Gráficos de repertório por evento</li>
            <li>✓ Ranking de músicas mais tocadas</li>
            <li>✓ Templates de repertório sugeridos</li>
            <li>✓ Estatísticas por casal</li>
            <li>✓ Taxa de aprovação de sugestões</li>
          </ul>
        </div>
      </div>
    </div>
  ),
});
