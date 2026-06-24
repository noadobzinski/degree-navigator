import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getProfile, getMyCourses } from "@/lib/audit.functions";
import { getDegreeSchedule } from "@/lib/coursetable.functions";
import { useCourseTableCatalogMeta, useClientQueryEnabled } from "@/hooks/use-coursetable-catalog";
import type { UserCourse } from "@/lib/audit";
import { MAJORS_BY_ID } from "@/data/majors";
import { scheduleDiffCodes } from "@/lib/schedule-planner";
import { futureSeasonsUntilGraduation } from "@/lib/coursetable-seasons";
import { courseIdentityKey } from "@/lib/course-codes";
import { MajorPicker } from "@/components/major-picker";
import { ScheduleView } from "@/components/schedule-view";
import {
  RoadmapSkeletonEditor,
  DEFAULT_COURSES_PER_TERM,
} from "@/components/roadmap-skeleton-editor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ExploreMode, PlanSkeleton } from "@/lib/schedule-planner";
import { Map, Sparkles } from "lucide-react";

const SKELETON_STORAGE_KEY = "decree:roadmap-skeleton:v1";

function emptySkeleton(): PlanSkeleton {
  return { coursesPerTerm: DEFAULT_COURSES_PER_TERM, termTargets: {} };
}

function loadStoredSkeleton(): PlanSkeleton {
  if (typeof window === "undefined") return emptySkeleton();
  try {
    const raw = window.localStorage.getItem(SKELETON_STORAGE_KEY);
    if (!raw) return emptySkeleton();
    const parsed = JSON.parse(raw) as PlanSkeleton;
    return {
      coursesPerTerm: parsed.coursesPerTerm ?? DEFAULT_COURSES_PER_TERM,
      termTargets: parsed.termTargets ?? {},
    };
  } catch {
    return emptySkeleton();
  }
}

/** Drop skeleton fields that match the defaults so we only send meaningful overrides. */
function normalizeSkeletonForRequest(skeleton: PlanSkeleton): PlanSkeleton | null {
  const termTargets = Object.fromEntries(
    Object.entries(skeleton.termTargets ?? {}).filter(([, v]) => Number.isFinite(v)),
  );
  const coursesPerTerm = skeleton.coursesPerTerm ?? DEFAULT_COURSES_PER_TERM;
  const hasOverrides = Object.keys(termTargets).length > 0;
  if (coursesPerTerm === DEFAULT_COURSES_PER_TERM && !hasOverrides) return null;
  return { coursesPerTerm, termTargets };
}

export const Route = createFileRoute("/_authenticated/roadmap")({
  head: () => ({ meta: [{ title: "Roadmap — Decree" }] }),
  component: RoadmapPage,
});

function profileScheduleInput(profile: NonNullable<Awaited<ReturnType<typeof getProfile>>>, courses: UserCourse[]) {
  return {
    courses,
    majorId: profile.major_id!,
    degree: (profile.degree_type ?? "BA") as "BA" | "BS",
    secondMajorId: profile.second_major_id,
    secondDegree: (profile.second_degree_type ?? profile.degree_type ?? "BA") as "BA" | "BS",
    trackId: profile.track_id,
    concentrationId: profile.concentration_id,
    certificateIds: profile.certificate_ids ?? [],
    classYear: profile.class_year,
  };
}

function RoadmapPage() {
  const fetchProfile = useServerFn(getProfile);
  const fetchCourses = useServerFn(getMyCourses);
  const clientReady = useClientQueryEnabled();
  const scheduleFn = useServerFn(getDegreeSchedule);
  const metaQ = useCourseTableCatalogMeta();
  const [exploreMajorId, setExploreMajorId] = useState("");
  const [exploreMode, setExploreMode] = useState<ExploreMode>("second-major");
  const [skeleton, setSkeleton] = useState<PlanSkeleton>(loadStoredSkeleton);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(SKELETON_STORAGE_KEY, JSON.stringify(skeleton));
    } catch {
      /* ignore storage failures (private mode, quota) */
    }
  }, [skeleton]);

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
  const scheduleBase = profile?.major_id ? profileScheduleInput(profile, courses) : null;
  const requestSkeleton = useMemo(() => normalizeSkeletonForRequest(skeleton), [skeleton]);
  const upcomingSeasons = useMemo(
    () => futureSeasonsUntilGraduation(profile?.class_year ?? null),
    [profile?.class_year],
  );

  const baselineQ = useQuery({
    queryKey: [
      "degree-schedule",
      "baseline",
      profile?.major_id,
      profile?.degree_type,
      profile?.second_major_id,
      profile?.second_degree_type,
      profile?.track_id,
      profile?.concentration_id,
      profile?.certificate_ids,
      profile?.class_year,
      courses,
      requestSkeleton,
    ],
    enabled: clientReady && !!scheduleBase,
    queryFn: () => scheduleFn({ data: { ...scheduleBase!, skeleton: requestSkeleton } }),
  });

  const exploreQ = useQuery({
    queryKey: [
      "degree-schedule",
      "explore",
      exploreMajorId,
      exploreMode,
      profile?.major_id,
      profile?.degree_type,
      profile?.second_major_id,
      profile?.track_id,
      profile?.concentration_id,
      profile?.certificate_ids,
      profile?.class_year,
      courses,
      requestSkeleton,
    ],
    enabled: clientReady && !!scheduleBase && !!exploreMajorId,
    queryFn: () =>
      scheduleFn({
        data: {
          ...scheduleBase!,
          exploreMajorId,
          exploreMode,
          skeleton: requestSkeleton,
        },
      }),
  });

  const highlightCodes = useMemo(() => {
    const baseline = baselineQ.data?.schedule;
    const explore = exploreQ.data?.schedule;
    if (!baseline || !explore) return new Set<string>();
    return new Set(scheduleDiffCodes(baseline, explore).map((c) => courseIdentityKey(c)));
  }, [baselineQ.data?.schedule, exploreQ.data?.schedule]);

  if (!clientReady || profileQ.isLoading || coursesQ.isLoading) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  if (!profile?.major_id) {
    return (
      <p className="text-muted-foreground">
        Set up your major in{" "}
        <Link className="text-primary underline" to="/settings">
          Settings
        </Link>{" "}
        first.
      </p>
    );
  }

  const major = MAJORS_BY_ID[profile.major_id];
  const secondMajor = profile.second_major_id ? MAJORS_BY_ID[profile.second_major_id] : null;
  const baselineSchedule = baselineQ.data?.schedule;
  const exploreSchedule = exploreQ.data?.schedule;
  const isSwitchMode = exploreMode === "switch-major";
  const isRedundantSecond = !isSwitchMode && !!exploreMajorId && exploreMajorId === profile.second_major_id;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <Map className="h-6 w-6 text-primary" />
          <h1 className="font-serif text-3xl font-bold">Degree roadmap</h1>
          {metaQ.data ? (
            <Badge variant="secondary" className="font-normal">
              CourseTable · {metaQ.data.courseCount.toLocaleString()} courses
            </Badge>
          ) : null}
        </div>
        <p className="text-muted-foreground">
          Semester-by-semester plan based on your majors, certificates, and courses — pulled from the live Yale
          catalog.
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>
            {major?.name}
            {secondMajor ? ` + ${secondMajor.name}` : ""}
          </span>
          {profile.class_year ? <span>· Class of {profile.class_year}</span> : null}
          {!profile.class_year ? (
            <span>
              ·{" "}
              <Link className="text-primary underline" to="/settings">
                Add class year
              </Link>{" "}
              for a more accurate timeline
            </span>
          ) : null}
        </div>
      </header>

      <Tabs defaultValue="plan">
        <TabsList>
          <TabsTrigger value="plan">Your schedule</TabsTrigger>
          <TabsTrigger value="explore">Explore a major</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="space-y-4">
          <RoadmapSkeletonEditor
            seasons={upcomingSeasons}
            skeleton={skeleton}
            onChange={setSkeleton}
          />

          {baselineQ.isLoading ? (
            <p className="text-muted-foreground">Building your semester plan…</p>
          ) : null}

          {baselineQ.isError ? (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">
                Could not build your schedule from CourseTable. Try again later.
              </CardContent>
            </Card>
          ) : null}

          {baselineSchedule ? (
            <>
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="font-serif text-lg">{baselineSchedule.scenarioLabel}</CardTitle>
                  <CardDescription>
                    ~{baselineSchedule.summary.termsRemaining} semesters remaining ·{" "}
                    {baselineSchedule.summary.plannedCount} courses already on your list · up to{" "}
                    {baselineSchedule.summary.suggestedCount} still needed
                  </CardDescription>
                </CardHeader>
              </Card>
              <ScheduleView schedule={baselineSchedule} />
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="explore" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                {isSwitchMode ? "What if you switched majors?" : "What if you added another major?"}
              </CardTitle>
              <CardDescription>
                {isSwitchMode
                  ? "Preview a semester plan as if this major replaced your current one. This does not change your saved profile — use Settings to update your actual major."
                  : "Pick a major to preview a semester plan alongside your current one. This does not change your saved profile — use Settings to update your actual majors."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-sm font-medium">How do you want to explore?</p>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={exploreMode}
                  onValueChange={(value) => {
                    if (value) setExploreMode(value as ExploreMode);
                  }}
                  className="justify-start"
                >
                  <ToggleGroupItem value="second-major" className="px-3">
                    Add as second major
                  </ToggleGroupItem>
                  <ToggleGroupItem value="switch-major" className="px-3">
                    Switch to a new major
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <MajorPicker
                value={exploreMajorId}
                onChange={setExploreMajorId}
                excludeId={profile.major_id}
              />
              {isRedundantSecond ? (
                <p className="text-sm text-muted-foreground">
                  This is already your second major — switch to &ldquo;Your schedule&rdquo; to see your current plan.
                </p>
              ) : null}
            </CardContent>
          </Card>

          {exploreMajorId && !isRedundantSecond ? (
            exploreQ.isLoading ? (
              <p className="text-muted-foreground">Building what-if schedule…</p>
            ) : exploreQ.isError ? (
              <Card>
                <CardContent className="py-6 text-sm text-muted-foreground">
                  Could not build the what-if schedule. Try again later.
                </CardContent>
              </Card>
            ) : exploreSchedule && baselineSchedule ? (
              <>
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-serif text-lg">{exploreSchedule.scenarioLabel}</CardTitle>
                    <CardDescription>
                      {highlightCodes.size > 0
                        ? `${highlightCodes.size} additional course${highlightCodes.size === 1 ? "" : "s"} compared to your current plan`
                        : "No extra courses beyond your current plan — lots of overlap with courses you've taken or planned"}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {baselineSchedule && highlightCodes.size > 0 ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-2">
                      <h2 className="font-serif text-lg font-semibold">Your current plan</h2>
                      <ScheduleView schedule={baselineSchedule} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="font-serif text-lg font-semibold">
                        {isSwitchMode ? "With the new major" : "With the added major"}
                      </h2>
                      <ScheduleView schedule={exploreSchedule} highlightCodes={highlightCodes} />
                    </div>
                  </div>
                ) : (
                  <ScheduleView
                    schedule={exploreSchedule}
                    highlightCodes={highlightCodes}
                    emptyMessage="This major path looks fully covered by your current courses and requirements."
                  />
                )}
              </>
            ) : null
          ) : (
            <p className="text-sm text-muted-foreground">Choose a major above to see how your schedule would change.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
