import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getProfile, getMyCourses } from "@/lib/audit.functions";
import { useCourseTableCatalogMeta, useClientQueryEnabled } from "@/hooks/use-coursetable-catalog";
import { auditMajor, auditTrack, auditDistributional, totalCredits, graduationCredits, type UserCourse } from "@/lib/audit";
import { MAJORS_BY_ID } from "@/data/majors";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, AlertCircle, GraduationCap, Database } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — BluePath" }] }),
  component: Dashboard,
});

function Dashboard() {
  const fetchProfile = useServerFn(getProfile);
  const fetchCourses = useServerFn(getMyCourses);
  const clientReady = useClientQueryEnabled();
  const metaQ = useCourseTableCatalogMeta();
  const profileQ = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(),
    enabled: clientReady,
  });
  const coursesQ = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchCourses(),
    enabled: clientReady,
  });

  if (!clientReady || profileQ.isLoading || coursesQ.isLoading) {
    return <div className="text-muted-foreground">Loading your audit…</div>;
  }
  const profile = profileQ.data;
  const courses = (coursesQ.data ?? []) as UserCourse[];

  if (!profile?.major_id || !profile?.degree_type) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-8 text-center">
        <GraduationCap className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 font-serif text-2xl font-bold">Welcome to BluePath</h2>
        <p className="mt-2 text-muted-foreground">Let's set up your degree audit. Browse majors or pick one in Settings.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/majors" className="inline-block rounded-md border border-border px-5 py-2.5 text-sm font-semibold hover:bg-accent">
            Explore majors
          </Link>
          <Link to="/settings" className="inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Get started
          </Link>
        </div>
      </div>
    );
  }

  const major = MAJORS_BY_ID[profile.major_id];
  const degree = (profile.degree_type ?? major?.defaultDegree ?? "BA") as "BA" | "BS";
  const majorAudit = auditMajor(courses, profile.major_id, degree);
  const trackAudit = auditTrack(courses, profile.track_id);
  const distAudit = auditDistributional(courses);
  const credits = totalCredits(courses);
  const gradTotal = graduationCredits();

  const distSatisfied = distAudit.filter((d) => d.satisfied).length;
  const overallPct = Math.min(100, Math.round((credits / gradTotal) * 100));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</p>
          <h1 className="font-serif text-3xl font-bold">{major?.name} <span className="text-muted-foreground">· {degree}</span></h1>
          {profile.class_year && <p className="text-sm text-muted-foreground">Class of {profile.class_year}</p>}
        </div>
        <Link to="/settings" className="text-sm font-medium text-primary hover:underline">Edit profile</Link>
      </header>

      {metaQ.data ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
          <Database className="h-4 w-4 text-primary" />
          <span>
            Course catalog synced from CourseTable — {metaQ.data.courseCount.toLocaleString()} courses available.
          </span>
          <Link to="/courses" className="font-medium text-primary hover:underline">
            Search courses
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/roadmap" className="font-medium text-primary hover:underline">
            View roadmap
          </Link>
        </div>
      ) : null}

      {/* Top summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total credits</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{credits.toFixed(1)}<span className="text-lg text-muted-foreground"> / {gradTotal}</span></div>
            <Progress value={overallPct} className="mt-3" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Distributional</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{distSatisfied}<span className="text-lg text-muted-foreground"> / {distAudit.length}</span></div>
            <Progress value={(distSatisfied / distAudit.length) * 100} className="mt-3" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Major requirements</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{majorAudit?.satisfiedCount ?? 0}<span className="text-lg text-muted-foreground"> / {majorAudit?.totalCount ?? 0}</span></div>
            <Progress value={majorAudit ? (majorAudit.satisfiedCount / majorAudit.totalCount) * 100 : 0} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Distributional detail */}
      <Card>
        <CardHeader><CardTitle className="font-serif">Distributional & skills requirements</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {distAudit.map((d) => (
            <div key={d.req.id} className="flex items-start gap-3 rounded-md border border-border p-3">
              {d.satisfied ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" /> : <Circle className="mt-0.5 h-5 w-5 text-muted-foreground" />}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{d.req.label}</p>
                  <Badge variant={d.satisfied ? "default" : "secondary"}>{d.count}/{d.req.count}</Badge>
                </div>
                {d.matched.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">{d.matched.map((c) => c.course_code).join(", ")}</p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Major requirements detail */}
      {majorAudit && (
        <Card>
          <CardHeader><CardTitle className="font-serif">{major?.name} ({degree}) requirements</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {majorAudit.sections.map((s) => (
              <div key={s.title}>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{s.title}</h3>
                <div className="space-y-2">
                  {s.results.map((r) => (
                    <div key={r.slot.id} className="flex items-start gap-3 rounded-md border border-border p-3">
                      {r.satisfied ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" /> : <AlertCircle className="mt-0.5 h-5 w-5 text-warning" />}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium">{r.slot.label}</p>
                          <Badge variant={r.satisfied ? "default" : "secondary"}>{r.filled.length}/{r.slot.needCount}</Badge>
                        </div>
                        {r.filled.length > 0 && <p className="mt-1 text-xs text-muted-foreground">{r.filled.map((c) => c.course_code).join(", ")}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Track */}
      {trackAudit && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">{trackAudit.track.name} track</CardTitle>
            <p className="text-sm text-muted-foreground">{trackAudit.track.description}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {trackAudit.results.map((r) => (
              <div key={r.slot.id} className="flex items-start gap-3 rounded-md border border-border p-3">
                {r.satisfied ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" /> : <AlertCircle className="mt-0.5 h-5 w-5 text-warning" />}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{r.slot.label}</p>
                    <Badge variant={r.satisfied ? "default" : "secondary"}>{r.filled.length}/{r.slot.needCount}</Badge>
                  </div>
                  {r.filled.length > 0 && <p className="mt-1 text-xs text-muted-foreground">{r.filled.map((c) => c.course_code).join(", ")}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
