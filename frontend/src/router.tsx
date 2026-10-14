import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    // Erros da API (ex.: backend fora do ar) aparecem num único toast, sem novas tentativas.
    queryCache: new QueryCache({
      onError: (erro) => toast.error(erro.message, { id: erro.message }),
    }),
    defaultOptions: { queries: { retry: false } },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
