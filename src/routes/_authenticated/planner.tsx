import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  getProfile,
  getMyCourses,
  addCourse,
  updateCourse,
  deleteCourse,
} from "@/lib/audit.functions";
import {
  useCourseTableCatalogSearch,
  useClientQueryEnabled,
} from "@/hooks/use-coursetable-catalog";
import { useCrosslistLookup } from "@/hooks/use-crosslist";
import { useAuditCatalog } from "@/hooks/use-audit-catalog";
import { auditDegreePlan } from "@/lib/plan-audit";
import { PlanRequirementsPanel } from "@/components/plan-requirements-panel";
import { MAJORS_BY_ID } from "@/data/majors";
import type { UserCourse } from "@/lib/audit";
import { currentSeasonCode } from "@/lib/coursetable";
import {
  compareSeasonCodes,
  futureSeasonsUntilGraduation,
  type CatalogSeason,
} from "@/lib/coursetable-seasons";
import { studentYearLabel, yearRestrictionsInTitle } from "@/lib/schedule-year-rules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Plus, Search, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { skillsForNewCourse } from "@/lib/course-codes";
import { formatCourseCredits } from "@/lib/course-credits";
import type { CatalogCourse } from "@/data/courses";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({ meta: [{ title: "Schedule Planner — Decree" }] }),
  component: PlannerPage,
});

function coursesInSeason(courses: UserCourse[], season: CatalogSeason): UserCourse[] {
  return courses.filter(
    (c) => !c.implied_prerequisite && c.term === season.term && c.year === season.calendarYear,
  );
}

function unassignedPlanned(courses: UserCourse[]): UserCourse[] {
  return courses.filter(
    (c) =>
      !c.implied_prerequisite &&
      (c.status === "planned" || c.status === "in_progress") &&
      (!c.term || c.year == null),
  );
}

function PlannerPage() {
  const clientReady = useClientQueryEnabled();
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getProfile);
  const fetchCourses = useServerFn(getMyCourses);
  const addFn = useServerFn(addCourse);
  const updateFn = useServerFn(updateCourse);
  const deleteFn = useServerFn(deleteCourse);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [addToSeason, setAddToSeason] = useState<string | null>(null);

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

  const profile = profileQ.data;
  const courses = (coursesQ.data ?? []) as UserCourse[];
  const { lookup: crosslistLookup } = useCrosslistLookup(clientReady && !!profile?.major_id);
  const { catalogByCode } = useAuditCatalog(clientReady && !!profile?.major_id);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const catalogQ = useCourseTableCatalogSearch(debouncedSearch, 30);
  const browseCourses: CatalogCourse[] = catalogQ.data?.courses ?? [];

  const seasons = useMemo(
    () => futureSeasonsUntilGraduation(profile?.class_year ?? null),
    [profile?.class_year],
  );

  const planAudit = useMemo(() => {
    if (!profile?.major_id || !profile.degree_type) return null;
    return auditDegreePlan({
      courses,
      majorId: profile.major_id,
      degree: (profile.degree_type ?? "BA") as "BA" | "BS",
      secondMajorId: profile.second_major_id,
      secondDegree: (profile.second_degree_type ?? profile.degree_type) as "BA" | "BS",
      trackId: profile.track_id,
      concentrationId: profile.concentration_id,
      certificateIds: profile.certificate_ids ?? [],
      classYear: profile.class_year,
      crosslistLookup,
      catalogByCode,
    });
  }, [courses, profile, crosslistLookup, catalogByCode]);

  const addM = useMutation({
    mutationFn: ({ course, season }: { course: CatalogCourse; season: CatalogSeason }) => {
      const { skills, counts_as_wr } = skillsForNewCourse(course.skills, course.code);
      const isCurrent = season.code === currentSeasonCode();
      return addFn({
        data: {
          course_code: course.code,
          course_title: course.title,
          credits: course.credits,
          distributional: course.distributional,
          skills,
          counts_as_wr,
          term: season.term,
          year: season.calendarYear,
          status: isCurrent ? "in_progress" : "planned",
        },
      });
    },
    onSuccess: () => {
      toast.success("Course added to plan");
      qc.invalidateQueries({ queryKey: ["courses"] });
      setSearch("");
      setAddToSeason(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to add"),
  });

  const moveM = useMutation({
    mutationFn: ({ id, season }: { id: string; season: CatalogSeason }) =>
      updateFn({
        data: {
          id,
          term: season.term,
          year: season.calendarYear,
          status: season.code === currentSeasonCode() ? "in_progress" : "planned",
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });

  const delM = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });

  if (!clientReady || profileQ.isLoading || coursesQ.isLoading) {
    return <p className="text-muted-foreground">Loading planner…</p>;
  }

  if (!profile?.major_id) {
    return (
      <p className="text-muted-foreground">
        Set your major in{" "}
        <Link className="text-primary underline" to="/settings">
          Settings
        </Link>{" "}
        to use the schedule planner.
      </p>
    );
  }

  const major = MAJORS_BY_ID[profile.major_id];
  const secondMajor = profile.second_major_id ? MAJORS_BY_ID[profile.second_major_id] : null;
  const unassigned = unassignedPlanned(courses);
  const allSatisfied =
    planAudit?.creditsSatisfied &&
    planAudit.distributionalSatisfied &&
    planAudit.majorSatisfied &&
    (planAudit.secondMajorSatisfied ?? true) &&
    (planAudit.trackSatisfied ?? true);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          <h1 className="font-serif text-3xl font-bold">Schedule planner</h1>
          {allSatisfied ? (
            <Badge className="font-normal">Plan satisfies requirements</Badge>
          ) : (
            <Badge variant="secondary" className="font-normal">
              Gaps remain — keep planning
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Add courses to upcoming semesters and see whether your full plan meets Yale credits,
          distributional requirements (including 2 WR), and major requirements.
        </p>
        {!profile.class_year ? (
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
            <Link className="underline" to="/settings">
              Set your class year
            </Link>{" "}
            for junior/senior course timing checks.
          </p>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4 min-w-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg">Add a course</CardTitle>
              <p className="text-sm text-muted-foreground">
                Search CourseTable, pick a semester, and add to your plan.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {seasons.map((s) => (
                  <Button
                    key={s.code}
                    size="sm"
                    variant={addToSeason === s.code ? "default" : "outline"}
                    onClick={() => setAddToSeason(s.code)}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
              {!addToSeason ? (
                <p className="text-xs text-muted-foreground">Select a semester above first.</p>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search courses (e.g. CPSC 323, organic chemistry)"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {browseCourses.map((c) => (
                      <div
                        key={c.code}
                        className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-sm"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold">{c.code}</span>
                          <span className="ml-2 truncate text-muted-foreground">{c.title}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={addM.isPending}
                          onClick={() => {
                            const season = seasons.find((s) => s.code === addToSeason);
                            if (season) addM.mutate({ course: c, season });
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {unassigned.length > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Unassigned planned courses</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {unassigned.map((c) => (
                  <Badge key={c.id} variant="outline" className="gap-1 py-1.5 pl-2 pr-1">
                    {c.course_code}
                    <select
                      className="ml-1 rounded border-0 bg-transparent text-xs"
                      defaultValue=""
                      onChange={(e) => {
                        const season = seasons.find((s) => s.code === e.target.value);
                        if (season) moveM.mutate({ id: c.id, season });
                      }}
                    >
                      <option value="">Move to…</option>
                      {seasons.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </Badge>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {seasons.map((season) => {
              const termCourses = coursesInSeason(courses, season);
              const credits = termCourses.reduce((s, c) => s + (c.credits || 1), 0);
              const yearLabel =
                profile.class_year != null
                  ? studentYearLabel(profile.class_year, season.code)
                  : null;
              const isPast = compareSeasonCodes(season.code, currentSeasonCode()) < 0;

              return (
                <Card key={season.code} className={isPast ? "opacity-60" : undefined}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="font-serif text-base">{season.label}</CardTitle>
                        {yearLabel ? (
                          <p className="text-xs text-muted-foreground">{yearLabel} year</p>
                        ) : null}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {termCourses.length} · ~{credits} cr
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {termCourses.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No courses yet</p>
                    ) : (
                      termCourses.map((c) => {
                        const title = c.course_title ?? c.course_code;
                        const yearTags = yearRestrictionsInTitle(title);
                        const warn = planAudit?.warnings.find((w) => w.courseId === c.id);
                        return (
                          <div
                            key={c.id}
                            className={`rounded-md border p-2 text-sm ${warn ? "border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20" : "border-border"}`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div className="min-w-0">
                                <div className="font-semibold">{c.course_code}</div>
                                <div className="truncate text-xs text-muted-foreground">
                                  {title}
                                </div>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  <Badge variant="outline" className="text-[10px]">
                                    {c.status}
                                  </Badge>
                                  {yearTags.map((t) => (
                                    <Badge
                                      key={t}
                                      variant="secondary"
                                      className="text-[10px] capitalize"
                                    >
                                      {t}
                                    </Badge>
                                  ))}
                                  <span className="text-[10px] text-muted-foreground">
                                    {formatCourseCredits(c.credits ?? 1)}
                                  </span>
                                </div>
                                {warn ? (
                                  <p className="mt-1 flex items-start gap-1 text-[10px] text-amber-800 dark:text-amber-300">
                                    <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                                    {warn.message}
                                  </p>
                                ) : null}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                onClick={() => delM.mutate(c.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setAddToSeason(season.code)}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add course
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          {planAudit ? (
            <PlanRequirementsPanel
              audit={planAudit}
              majorName={major?.name ?? "Major"}
              secondMajorName={secondMajor?.name}
            />
          ) : null}
        </aside>
      </div>
    </div>
  );
}
