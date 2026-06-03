import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getMyCourses, getProfile, addCourse, updateCourse, deleteCourse } from "@/lib/audit.functions";
import {
  useCourseTableCatalogMeta,
  useCourseTableCatalogSearch,
  useClientQueryEnabled,
} from "@/hooks/use-coursetable-catalog";
import { CATALOG, CATALOG_BY_CODE, type CatalogCourse } from "@/data/courses";
import { currentSeasonCode } from "@/lib/coursetable";
import {
  catalogSeasonsForClassYear,
  courseTakenKey,
  firstFallYearForClass,
  recentCatalogSeasons,
  seasonToTermFields,
  type CatalogSeason,
} from "@/lib/coursetable-seasons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Search, Database, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { courseTableSearchUrl } from "@/lib/coursetable";
import { skillsForNewCourse, effectiveSkills, isOptionalWritingOffered } from "@/lib/course-codes";
import { formatCourseCredits, isHalfCreditCourse } from "@/lib/course-credits";
import { wrCreditOffered, type UserCourse } from "@/lib/audit";
import { formatCrosslistNote } from "@/lib/crosslist";
import {
  countsAsWrForAllocation,
  courseHasExclusiveCreditChoice,
  type CreditBucketId,
} from "@/lib/credit-allocation";
import { CreditAllocationSelect } from "@/components/credit-allocation-select";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_authenticated/courses")({
  head: () => ({ meta: [{ title: "My Courses — BluePath" }] }),
  component: CoursesPage,
});

function CoursesPage() {
  const fetchCourses = useServerFn(getMyCourses);
  const fetchProfile = useServerFn(getProfile);
  const addFn = useServerFn(addCourse);
  const updateFn = useServerFn(updateCourse);
  const deleteFn = useServerFn(deleteCourse);
  const clientReady = useClientQueryEnabled();
  const qc = useQueryClient();
  const coursesQ = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchCourses(),
    enabled: clientReady,
  });
  const profileQ = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(),
    enabled: clientReady,
  });
  const metaQ = useCourseTableCatalogMeta();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [catalogSeason, setCatalogSeason] = useState(() => currentSeasonCode());

  const classYear = profileQ.data?.class_year ?? null;
  const catalogSeasons: CatalogSeason[] = useMemo(() => {
    if (classYear) return catalogSeasonsForClassYear(classYear);
    return recentCatalogSeasons();
  }, [classYear]);

  useEffect(() => {
    if (!catalogSeasons.some((s) => s.code === catalogSeason)) {
      setCatalogSeason(catalogSeasons.at(-1)?.code ?? currentSeasonCode());
    }
  }, [catalogSeasons, catalogSeason]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const catalogQ = useCourseTableCatalogSearch(debouncedSearch, 50, catalogSeason);
  const selectedSeasonLabel =
    catalogSeasons.find((s) => s.code === catalogSeason)?.label ?? catalogSeason;

  const catalogCourses: CatalogCourse[] = catalogQ.data?.courses ?? [];
  const usingLiveCatalog = !catalogQ.isError && (catalogQ.isSuccess || !!metaQ.data);
  const fallbackCourses = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return CATALOG.slice(0, 30);
    return CATALOG.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q),
    ).slice(0, 50);
  }, [debouncedSearch]);
  const browseCourses = usingLiveCatalog ? catalogCourses : fallbackCourses;

  const { term: addTerm, year: addYear } = seasonToTermFields(catalogSeason);

  const addM = useMutation({
    mutationFn: (course: CatalogCourse) => {
      const { skills, counts_as_wr } = skillsForNewCourse(course.skills, course.code);
      return addFn({
        data: {
          course_code: course.code,
          course_title: course.title,
          credits: course.credits,
          distributional: course.distributional,
          skills,
          counts_as_wr,
          term: addTerm,
          year: addYear,
          status: catalogSeason === currentSeasonCode() ? "in_progress" : "completed",
        },
      });
    },
    onSuccess: () => {
      toast.success(`Added for ${selectedSeasonLabel}`);
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const updateM = useMutation({
    mutationFn: (vars: {
      id: string;
      status?: "planned" | "in_progress" | "completed";
      counts_as_wr?: boolean | null;
    }) => updateFn({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
  const delM = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  const myCourses = (coursesQ.data ?? []) as UserCourse[];

  const taken = new Set(myCourses.map((c) => courseTakenKey(c.course_code, c.term, c.year)));
  const takenThisSeason = (code: string) => taken.has(courseTakenKey(code, addTerm, addYear));

  const allocationM = useMutation({
    mutationFn: (vars: {
      id: string;
      credit_allocation: CreditBucketId | null;
      counts_as_wr?: boolean | null;
    }) => updateFn({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  function resolveCourse(code: string): CatalogCourse {
    const fromBrowse = browseCourses.find((c) => c.code === code);
    if (fromBrowse) return fromBrowse;
    return CATALOG_BY_CODE[code] ?? {
      code,
      title: code,
      credits: 1,
      distributional: [],
      skills: [],
      subject: code.split(" ")[0] ?? code,
    };
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground">
          Search CourseTable by semester — pick the term when you took (or plan to take) each course.
        </p>
        {classYear ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Class of {classYear} · catalogs from Fall {firstFallYearForClass(classYear)} through today
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">
            Set your{" "}
            <Link to="/settings" className="font-medium text-primary hover:underline">
              class year
            </Link>{" "}
            in Settings to see every semester since you started at Yale.
          </p>
        )}
      </div>

      {catalogQ.isError ? (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <p>
                Could not load the {selectedSeasonLabel} catalog — showing a small sample instead.
                Retry in a moment; no Yale NetID sign-in is required.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => catalogQ.refetch()} disabled={catalogQ.isFetching}>
              <RefreshCw className={`mr-1 h-3.5 w-3.5 ${catalogQ.isFetching ? "animate-spin" : ""}`} />
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="font-serif">Browse catalog</CardTitle>
          {usingLiveCatalog && catalogQ.data ? (
            <Badge variant="secondary" className="gap-1 font-normal">
              <Database className="h-3 w-3" />
              {selectedSeasonLabel} · {(catalogQ.data.total ?? browseCourses.length).toLocaleString()} courses
            </Badge>
          ) : (
            <Badge variant="outline" className="font-normal">Sample catalog</Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="catalog-season">Semester catalog</Label>
              <Select value={catalogSeason} onValueChange={setCatalogSeason}>
                <SelectTrigger id="catalog-season">
                  <SelectValue placeholder="Choose semester" />
                </SelectTrigger>
                <SelectContent>
                  {[...catalogSeasons].reverse().map((s) => (
                    <SelectItem key={s.code} value={s.code}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative space-y-1.5">
              <Label htmlFor="course-search">Search</Label>
              <Search className="absolute left-3 top-[2.15rem] h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="course-search"
                placeholder="Code, title, or subject (e.g. CPSC 323)"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          {catalogQ.isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Loading {selectedSeasonLabel} catalog…
            </p>
          ) : null}
          <div className="grid max-h-[420px] gap-2 overflow-y-auto">
            {browseCourses.map((c) => (
              <div
                key={c.code}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{c.code}</span>
                    <span className="truncate text-sm text-muted-foreground">{c.title}</span>
                    {usingLiveCatalog ? (
                      <a
                        href={courseTableSearchUrl(c.code)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                        title="View on CourseTable"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.distributional.map((d) => (
                      <Badge key={d} variant="secondary" className="text-[10px]">
                        {d}
                      </Badge>
                    ))}
                    {c.skills.map((s) => (
                      <Badge key={s} variant="outline" className="text-[10px]">
                        {s}
                      </Badge>
                    ))}
                    {isOptionalWritingOffered(c.skills, c.code) ? (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        WR optional
                      </Badge>
                    ) : null}
                    <span className="text-[10px] text-muted-foreground">{formatCourseCredits(c.credits)}</span>
                    {isHalfCreditCourse(c.credits) ? (
                      <Badge variant="outline" className="text-[10px]">
                        Half credit
                      </Badge>
                    ) : null}
                  </div>
                  {c.crosslistedCodes?.length ? (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {formatCrosslistNote(c.code, c.crosslistedCodes) ??
                        `Also listed as ${c.crosslistedCodes.join(", ")}`}
                    </p>
                  ) : null}
                </div>
                <Button
                  size="sm"
                  disabled={takenThisSeason(c.code) || addM.isPending}
                  onClick={() => addM.mutate(resolveCourse(c.code))}
                >
                  {takenThisSeason(c.code) ? (
                    "Added"
                  ) : (
                    <>
                      <Plus className="mr-1 h-3 w-3" /> Add
                    </>
                  )}
                </Button>
              </div>
            ))}
            {!catalogQ.isLoading && browseCourses.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No courses match your search.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">My course list ({coursesQ.data?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {coursesQ.isLoading ? <p className="text-muted-foreground">Loading…</p> : null}
          {coursesQ.data?.length === 0 ? (
            <p className="text-muted-foreground">You haven't added any courses yet — browse above.</p>
          ) : null}
          <div className="space-y-2">
            {myCourses.map((c) => {
              const row = c as UserCourse;
              const displaySkills = effectiveSkills(row);
              const wrOffered = wrCreditOffered(row);
              const wrOn = row.counts_as_wr === true || (row.counts_as_wr == null && row.skills?.includes("WR"));
              return (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{c.course_code}</span>
                    <span className="truncate text-sm text-muted-foreground">{c.course_title}</span>
                    {c.term && c.year ? (
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {c.term} {c.year}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.distributional?.map((d: string) => (
                      <Badge key={d} variant="secondary" className="text-[10px]">
                        {d}
                      </Badge>
                    ))}
                    {displaySkills.map((s: string) => (
                      <Badge key={s} variant="outline" className="text-[10px]">
                        {s}
                      </Badge>
                    ))}
                    {row.crosslisted_codes?.length ? (
                      <span className="w-full text-[10px] text-muted-foreground">
                        {formatCrosslistNote(row.course_code, row.crosslisted_codes) ??
                          `Also listed as ${row.crosslisted_codes.join(", ")}`}
                      </span>
                    ) : null}
                    <span className="text-[10px] text-muted-foreground">
                      {formatCourseCredits(c.credits ?? 1)}
                    </span>
                  </div>
                  <CreditAllocationSelect
                    course={row}
                    allCourses={myCourses}
                    disabled={allocationM.isPending}
                    onChange={(allocation) => {
                      const wrPatch = countsAsWrForAllocation(row, allocation);
                      allocationM.mutate({
                        id: c.id,
                        credit_allocation: allocation,
                        ...(wrPatch !== undefined ? { counts_as_wr: wrPatch } : {}),
                      });
                    }}
                  />
                  {wrOffered && !courseHasExclusiveCreditChoice(row) ? (
                    <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                      <Checkbox
                        checked={wrOn}
                        onCheckedChange={(checked) =>
                          updateM.mutate({
                            id: c.id,
                            counts_as_wr: checked === true,
                          })
                        }
                      />
                      Count as writing (WR) credit
                    </label>
                  ) : null}
                </div>
                <Select
                  value={c.status}
                  onValueChange={(v) =>
                    updateM.mutate({ id: c.id, status: v as "planned" | "in_progress" | "completed" })
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => delM.mutate(c.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
