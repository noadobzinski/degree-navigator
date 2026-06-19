import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Sign in — Decree" }] }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const { redirect: redirectTo } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const afterSignIn = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard";

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}${afterSignIn}` },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await router.navigate({ to: afterSignIn as "/dashboard" });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
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
        <h1 className="text-center font-serif text-2xl font-semibold">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Sign in with email to track your Yale degree. Courses load automatically from CourseTable.
        </p>

        <form onSubmit={handleEmail} className="mt-6 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {mode === "signin" ? "New here? " : "Already have an account? "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="font-medium text-primary hover:underline">
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
