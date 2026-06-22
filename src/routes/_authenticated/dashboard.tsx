import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getProfile, getMyCourses } from "@/lib/audit.functions";
import { useCourseTableCatalogMeta, useClientQueryEnabled } from "@/hooks/use-coursetable-catalog";
import { useCrosslistLookup } from "@/hooks/use-crosslist";
import { useAuditCatalog } from "@/hooks/use-audit-catalog";
import { useRequirementExamples, getSlotExamples } from "@/hooks/use-requirement-examples";
import { FilledRequirementCourses } from "@/components/filled-requirement-courses";
import { RequirementExamples } from "@/components/requirement-examples";
import { CredentialSuggestionsCard } from "@/components/credential-suggestions-card";
import { CatalogLink, RequirementSlotRows } from "@/components/requirement-slot-rows";
import { slotResultsToRows } from "@/lib/credential-progress";
import { MajorAuditCard } from "@/components/major-audit-card";
import {
  auditCertificates,
  auditMajor,
  auditTrack,
  auditDistributional,
  computeDoubleMajorOverlap,
  totalCredits,
  graduationCredits,
  type UserCourse,
} from "@/lib/audit";
import { suggestReachableCredentials } from "@/lib/credential-suggestions";
import { MAJORS_BY_ID, YALE_DOUBLE_MAJOR_MAX_OVERLAP } from "@/data/majors";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, AlertCircle, GraduationCap, Database } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Decree" }] }),
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
  const profileForExamples = profileQ.data;
  const degreeForExamples = profileForExamples?.degree_type as "BA" | "BS" | undefined;
  const examplesQ = useRequirementExamples(
    profileForExamples?.major_id,
    degreeForExamples,
    profileForExamples?.track_id,
    profileForExamples?.class_year,
    profileForExamples?.concentration_id,
  );
  const secondMajorId = profileForExamples?.second_major_id;
  const secondDegree = (profileForExamples?.second_degree_type ??
    profileForExamples?.degree_type) as "BA" | "BS" | undefined;
  const examplesQ2 = useRequirementExamples(
    secondMajorId,
    secondDegree,
    null,
    profileForExamples?.class_year,
  );
  const { lookup: crosslistLookup } = useCrosslistLookup(
    clientReady && !!profileForExamples?.major_id,
  );
  const { catalogByCode: auditCatalog } = useAuditCatalog(
    clientReady && !!profileForExamples?.major_id,
  );

  if (!clientReady || profileQ.isLoading || coursesQ.isLoading) {
    return <div className="text-muted-foreground">Loading your audit…</div>;
  }
  const profile = profileQ.data;
  const courses = (coursesQ.data ?? []) as UserCourse[];

  if (!profile?.major_id || !profile?.degree_type) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-8 text-center">
        <GraduationCap className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 font-serif text-2xl font-bold">Welcome to Decree</h2>
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
  const majorAudit = auditMajor(
    courses,
    profile.major_id,
    degree,
    crosslistLookup,
    profile.concentration_id,
  );
  const secondMajor = secondMajorId ? MAJORS_BY_ID[secondMajorId] : null;
  const degree2 = (profile.second_degree_type ?? degree) as "BA" | "BS";
  const secondAudit =
    secondMajorId && secondMajorId !== profile.major_id
      ? auditMajor(courses, secondMajorId, degree2, crosslistLookup)
      : null;
  const overlap =
    majorAudit && secondAudit ? computeDoubleMajorOverlap(majorAudit, secondAudit) : null;

  const trackAudit = auditTrack(courses, profile.track_id, crosslistLookup);
  const certificateAudits = auditCertificates(
    courses,
    profile.certificate_ids,
    crosslistLookup,
    auditCatalog,
  );
  const distAudit = auditDistributional(courses);
  const credits = totalCredits(courses);
  const gradTotal = graduationCredits();

  const distSatisfied = distAudit.filter((d) => d.satisfied).length;
  const overallPct = Math.min(100, Math.round((credits / gradTotal) * 100));

  const majorUnits =
    (majorAudit?.satisfiedCount ?? 0) + (secondAudit?.satisfiedCount ?? 0);
  const majorTotal =
    (majorAudit?.totalCount ?? 0) + (secondAudit?.totalCount ?? 0);

  const titleParts = [
    `${major?.name}${majorAudit?.concentration ? ` · ${majorAudit.concentration.label}` : ""} · ${degree}`,
  ];
  if (secondAudit && secondMajor) titleParts.push(`${secondMajor.name} · ${degree2}`);

  const reachableCredentials = suggestReachableCredentials({
    courses,
    primaryMajorId: profile.major_id,
    primaryDegree: degree,
    primaryConcentrationId: profile.concentration_id,
    secondMajorId: profile.second_major_id,
    certificateIds: profile.certificate_ids,
    crosslistLookup,
    catalogByCode: auditCatalog,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</p>
          <h1 className="font-serif text-3xl font-bold">{titleParts.join(" & ")}</h1>
          {majorAudit?.concentration?.description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {majorAudit.concentration.description}
            </p>
          ) : null}
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

      {overlap ? (
        <Card className={overlap.withinLimit ? "border-border" : "border-warning bg-warning/5"}>
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-lg">Double major overlap</CardTitle>
            <p className="text-sm text-muted-foreground">
              Yale allows at most {YALE_DOUBLE_MAJOR_MAX_OVERLAP} term courses to count toward both majors. Each major is
              audited independently below.
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            {overlap.withinLimit ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <AlertCircle className="h-5 w-5 text-warning" />
            )}
            <div className="flex-1">
              <p className="font-medium">
                {overlap.count} overlapping {overlap.count === 1 ? "course" : "courses"}
                {overlap.withinLimit ? " (within limit)" : ` — exceeds limit of ${overlap.maxAllowed}`}
              </p>
              {overlap.courses.length > 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {overlap.courses.map((c) => c.course_code).join(", ")}
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">No courses currently assigned to both majors.</p>
              )}
            </div>
            <Badge variant={overlap.withinLimit ? "default" : "destructive"}>
              {overlap.count}/{overlap.maxAllowed}
            </Badge>
          </CardContent>
        </Card>
      ) : null}

      <CredentialSuggestionsCard
        suggestions={reachableCredentials}
        crosslistLookup={crosslistLookup}
      />

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
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {secondAudit ? "Major requirements (both)" : "Major requirements"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{majorUnits}<span className="text-lg text-muted-foreground"> / {majorTotal}</span></div>
            <Progress value={majorTotal ? (majorUnits / majorTotal) * 100 : 0} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Distributional & skills requirements</CardTitle>
          <p className="text-sm text-muted-foreground">
            Each course counts toward one credit only. Assignments are optimized automatically; override on My Courses.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {distAudit.map((d) => (
            <div key={d.req.id} className="flex items-start gap-3 rounded-md border border-border p-3">
              {d.satisfied ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" /> : <Circle className="mt-0.5 h-5 w-5 text-muted-foreground" />}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{d.req.label}</p>
                  <Badge variant={d.satisfied ? "default" : "secondary"}>{d.count}/{d.req.count}</Badge>
                </div>
                {d.matched.length > 0 ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Your courses: </span>
                    {d.matched.map((c) => c.course_code).join(", ")}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {majorAudit && (
        <MajorAuditCard audit={majorAudit} examplesQ={examplesQ} crosslistLookup={crosslistLookup} />
      )}

      {secondAudit && (
        <MajorAuditCard
          audit={secondAudit}
          title={`${secondMajor?.name} (${degree2}) — second major`}
          examplesQ={examplesQ2}
          crosslistLookup={crosslistLookup}
        />
      )}

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
                  <FilledRequirementCourses
                    courses={r.filled}
                    crosslistLookup={crosslistLookup}
                    complete={r.satisfied}
                  />
                  <RequirementExamples
                    examples={getSlotExamples(examplesQ.data?.bySlotId, r.slot.id)}
                    isLoading={examplesQ.isLoading}
                    isError={examplesQ.isError}
                    showSuggestions={!r.satisfied}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {certificateAudits.map((certAudit) => {
        const rows = [
          ...(certAudit.prerequisiteResult
            ? slotResultsToRows([certAudit.prerequisiteResult], "prereq-")
            : []),
          ...slotResultsToRows(certAudit.results),
        ];
        return (
          <Card key={certAudit.certificate.id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="font-serif">{certAudit.certificate.name} certificate</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{certAudit.certificate.description}</p>
                  <p className="mt-1">
                    <CatalogLink href={certAudit.certificate.catalogUrl} />
                  </p>
                </div>
                <Badge variant={certAudit.progress.remainingCourses === 0 ? "default" : "secondary"}>
                  {certAudit.progress.coursesFilled}/{certAudit.progress.coursesRequired} credits
                </Badge>
              </div>
              <Progress value={certAudit.progress.progressPct} className="mt-3 h-1.5" />
            </CardHeader>
            <CardContent>
              <RequirementSlotRows rows={rows} crosslistLookup={crosslistLookup} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
