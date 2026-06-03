import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { GraduationCap, CheckCircle2, Map, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "BluePath — A friendlier Yale degree audit" },
      { name: "description", content: "Plan your Yale College degree. Track major, distributional, and prehealth/prelaw requirements." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-serif text-xl font-bold text-primary">BluePath</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/catalog" className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent">
              Browse courses
            </Link>
            <Link to="/login" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3 w-3" /> For Yale College students
          </div>
          <h1 className="font-serif text-5xl font-bold tracking-tight text-foreground md:text-6xl">
            Your degree, <span className="text-primary">finally</span> in one place.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Plan your major, track your distributional credits, and see exactly what's left for premed,
            prelaw, prevet, or just graduation — without a spreadsheet.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/catalog" className="rounded-md border border-border px-6 py-3 text-sm font-semibold hover:bg-accent">
              Browse Yale courses
            </Link>
            <Link to="/login" className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Start your audit
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Course catalog powered by{" "}
            <a href="https://coursetable.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              CourseTable
            </a>
            — no Yale NetID required to search.
          </p>
        </section>

        <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-24 md:grid-cols-3">
          {[
            { icon: CheckCircle2, title: "Real Yale requirements", body: "Modeled on Yale's distributional system (Hu, So, Sc, QR, WR, language) and 36-credit graduation rule." },
            { icon: GraduationCap, title: "Major + track", body: "Pick from CS, MCDB, Econ, Math, English, History and more — with BA/BS variants. Add a premed, prelaw, or prevet track on top." },
            { icon: Map, title: "Smart roadmap", body: "We suggest what to take next based on what's missing — prioritized by urgency." },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border border-border bg-card p-6">
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-serif text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border bg-muted">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center text-xs text-muted-foreground">
          Independent study tool. Not affiliated with Yale University. Always verify with your DUS.
        </div>
      </footer>
    </div>
  );
}
