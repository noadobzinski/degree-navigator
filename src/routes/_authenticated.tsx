import { createFileRoute, redirect, Outlet, Link, useRouter, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, LayoutDashboard, BookOpen, Map, Settings, LogOut, BookOpenCheck, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrefetchCourseTableCatalog, useCourseTableCatalogMeta } from "@/hooks/use-coursetable-catalog";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: AuthLayout,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "My Courses", icon: BookOpen },
  { to: "/majors", label: "Majors", icon: BookOpenCheck },
  { to: "/roadmap", label: "Roadmap", icon: Map },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function AuthLayout() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  usePrefetchCourseTableCatalog();
  const catalogMeta = useCourseTableCatalogMeta();

  async function signOut() {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  }
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <Link to="/dashboard" className="flex items-center gap-2 px-6 py-5">
          <GraduationCap className="h-6 w-6" />
          <span className="font-serif text-lg font-bold">Decree</span>
        </Link>
        {catalogMeta.data ? (
          <div className="mx-3 mb-3 flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/40 px-3 py-2 text-xs text-sidebar-foreground">
            <Database className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              CourseTable · {catalogMeta.data.courseCount.toLocaleString()} courses
            </span>
          </div>
        ) : catalogMeta.isLoading ? (
          <p className="mx-6 mb-3 text-xs text-muted-foreground">Loading Yale catalog…</p>
        ) : null}
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((n) => {
            const active = pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent"}`}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Button variant="ghost" onClick={signOut} className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-serif font-bold text-primary">Decree</span>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card px-2 py-2 md:hidden">
          {NAV.map((n) => {
            const active = pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                <n.icon className="h-3.5 w-3.5" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
