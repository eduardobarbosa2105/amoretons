import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

interface RouterContext {
  queryClient: QueryClient;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-foreground">404</h1>
        <p className="mt-4 text-muted-foreground">Página não encontrada</p>
        <Link to="/" className="mt-6 inline-flex items-center">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl text-foreground">Erro</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error?.message ?? "Algo deu errado"}
        </p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 inline-flex items-center justify-center"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
  component: () => (
    <QueryClientProvider client={new QueryClient()}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  ),
});