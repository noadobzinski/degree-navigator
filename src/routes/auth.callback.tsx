import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth/callback")({
  validateSearch: z.object({
    next: z.string().optional(),
    error: z.string().optional(),
    error_description: z.string().optional(),
  }),
  head: () => ({ meta: [{ title: "Signing in — Decree" }] }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const router = useRouter();
  const { next, error, error_description: errorDescription } = Route.useSearch();
  const [message, setMessage] = useState("Completing sign-in…");

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      if (error) {
        setMessage(errorDescription ?? error);
        return;
      }

      const destination =
        next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

      // PKCE / implicit: Supabase parses the URL when detectSessionInUrl is enabled.
      const { error: sessionError } = await supabase.auth.getSession();
      if (cancelled) return;

      if (sessionError) {
        setMessage(sessionError.message);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await router.navigate({ to: destination as "/dashboard" });
        return;
      }

      // Wait briefly for onAuthStateChange after code exchange.
      await new Promise((r) => setTimeout(r, 800));
      const { data: retry } = await supabase.auth.getSession();
      if (cancelled) return;

      if (retry.session) {
        await router.navigate({ to: destination as "/dashboard" });
      } else {
        setMessage("Sign-in did not complete. Try again from the login page.");
      }
    }

    finish();
    return () => {
      cancelled = true;
    };
  }, [error, errorDescription, next, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mb-4 flex items-center justify-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-serif text-xl font-bold text-primary">Decree</span>
        </div>
        {message === "Completing sign-in…" ? (
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        ) : null}
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
        {message !== "Completing sign-in…" ? (
          <Button asChild className="mt-6">
            <Link to="/login">Back to login</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
