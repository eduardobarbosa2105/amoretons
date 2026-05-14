import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dev/visao-musico")({
  component: () => (
    <div>
      <h2 className="font-display text-2xl text-foreground mb-2">Visão do Músico</h2>
      <p className="text-muted-foreground">Modo apresentação em tempo real do dia do evento.</p>
      
      <div className="mt-8 p-8 rounded-2xl border border-dashed border-border">
        <div className="max-w-2xl">
          <h3 className="font-display text-lg text-foreground mb-3">🎵 Funcionalidades Planejadas:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Modo apresentação em tela cheia</li>
            <li>✓ Checklist de músicas do evento</li>
            <li>✓ Próxima música a tocar em destaque</li>
            <li>✓ Cronômetro de duração</li>
            <li>✓ Notas para cada momento</li>
            <li>✓ Tonalidades (original vs banda)</li>
            <li>✓ Sincronização com playlist</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 p-6 rounded-2xl bg-yellow-50 border border-yellow-200">
        <p className="text-sm text-yellow-800">
          💡 <strong>Dica:</strong> Esta será a interface usada pelos músicos durante os casamentos para acompanhar a sequência de músicas.
        </p>
      </div>
    </div>
  ),
});
