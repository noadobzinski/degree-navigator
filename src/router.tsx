import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export type AuthContext = {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
};

export const getRouter = () => {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: {
      queryClient,
      auth: { isAuthenticated: false, userId: null, email: null } as AuthContext,
    },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });
  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
