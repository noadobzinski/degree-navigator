import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Decree" }] }),
  component: ResetPasswordPage,
});

type Phase = "verifying" | "ready" | "invalid";

function readLinkParams() {
  if (typeof window === "undefined") return { hasToken: false, error: null as string | null };
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const error =
    search.get("error_description") ||
    hash.get("error_description") ||
    search.get("error") ||
    hash.get("error");
  const hasToken =
    Boolean(search.get("code")) ||
    Boolean(hash.get("access_token")) ||
    hash.get("type") === "recovery";
  return { hasToken, error: error ? error.replace(/\+/g, " ") : null };
}

function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>("verifying");
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const { hasToken, error } = readLinkParams();

    // Supabase appends error details to the redirect when a recovery link is
    // expired or already used. Surface it instead of spinning forever.
    if (error) {
      setLinkError(error);
      setPhase("invalid");
      return;
    }

    // Register the listener before touching getSession so we don't miss the
    // PASSWORD_RECOVERY / SIGNED_IN event fired while detectSessionInUrl runs.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || session) setPhase("ready");
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) {
        setPhase("ready");
      } else if (!hasToken) {
        // Opened directly, not from a recovery link — nothing to verify.
        setPhase("invalid");
      }
      // Otherwise keep verifying; the listener above flips us to "ready" once
      // the recovery session lands.
    });

    // Safety net: if the link carried a token but no session ever gets
    // established (expired link, or opened in a different browser than the one
    // that requested the reset), stop spinning and explain what to do.
    const timeout = window.setTimeout(async () => {
      if (!active) return;
      const { data } = await supabase.auth.getSession();
      if (active && !data.session) setPhase((p) => (p === "ready" ? p : "invalid"));
    }, 5000);

    return () => {
      active = false;
      sub.subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. You're all set.");
      await router.navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <GraduationCap className="h-7 w-7 text-primary" />
          <span className="font-serif text-2xl font-bold text-primary">Decree</span>
        </div>

        {phase === "verifying" ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verifying your reset link…</p>
          </div>
        ) : phase === "invalid" ? (
          <>
            <h1 className="text-center font-serif text-2xl font-semibold">Reset link expired</h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {linkError
                ? linkError
                : "This password reset link is invalid or has expired. Reset links must be opened in the same browser you requested them from."}
            </p>
            <Button asChild className="mt-6 w-full">
              <Link to="/login" search={{ mode: "forgot" }}>
                Request a new link
              </Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-center font-serif text-2xl font-semibold">Choose a new password</h1>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Enter a new password for your account.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input
                  id="confirm"
                  type="password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Updating…" : "Update password"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
