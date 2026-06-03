import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getProfile, getMyCourses } from "@/lib/audit.functions";
import { getRoadmapSuggestions } from "@/lib/coursetable.functions";
import { useCourseTableCatalogMeta, useClientQueryEnabled } from "@/hooks/use-coursetable-catalog";
import { courseTableSearchUrl } from "@/lib/coursetable";
import type { UserCourse } from "@/lib/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/roadmap")({
  head: () => ({ meta: [{ title: "Roadmap — Decree" }] }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const fetchProfile = useServerFn(getProfile);
  const fetchCourses = useServerFn(getMyCourses);
  const clientReady = useClientQueryEnabled();
  const roadmapFn = useServerFn(getRoadmapSuggestions);
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

  const roadmapQ = useQuery({
    queryKey: [
      "roadmap",
      profileQ.data?.major_id,
      profileQ.data?.degree_type,
      profileQ.data?.second_major_id,
      profileQ.data?.second_degree_type,
      profileQ.data?.track_id,
      profileQ.data?.concentration_id,
      profileQ.data?.certificate_ids,
      coursesQ.data,
    ],
    enabled: clientReady && !!profileQ.data?.major_id && coursesQ.data !== undefined,
    queryFn: () =>
      roadmapFn({
        data: {
          courses: (coursesQ.data ?? []) as UserCourse[],
          majorId: profileQ.data!.major_id,
          degree: (profileQ.data!.degree_type ?? "BA") as "BA" | "BS",
          secondMajorId: profileQ.data!.second_major_id,
          secondDegree: (profileQ.data!.second_degree_type ??
            profileQ.data!.degree_type ??
            "BA") as "BA" | "BS",
          trackId: profileQ.data!.track_id,
          concentrationId: profileQ.data!.concentration_id,
          certificateIds: profileQ.data!.certificate_ids ?? [],
        },
      }),
  });

  if (!clientReady || profileQ.isLoading || coursesQ.isLoading) {
    return <p className="text-muted-foreground">Loading…</p>;
  }
  const profile = profileQ.data;
  if (!profile?.major_id) {
    return (
      <p className="text-muted-foreground">
        Set up your major in{" "}
        <a className="text-primary underline" href="/settings">
          Settings
        </a>{" "}
        first.
      </p>
    );
  }

  const suggestions = roadmapQ.data?.suggestions ?? [];
  const grouped = {
    high: suggestions.filter((s) => s.priority === "high"),
    med: suggestions.filter((s) => s.priority === "med"),
    low: suggestions.filter((s) => s.priority === "low"),
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <Map className="h-6 w-6 text-primary" />
          <h1 className="font-serif text-3xl font-bold">Your suggested roadmap</h1>
          {metaQ.data ? (
            <Badge variant="secondary" className="font-normal">
              CourseTable · {metaQ.data.courseCount.toLocaleString()} courses
            </Badge>
          ) : null}
        </div>
        <p className="text-muted-foreground">
          Suggestions pulled from the live Yale catalog via CourseTable.
        </p>
      </header>

      {roadmapQ.isLoading ? (
        <p className="text-muted-foreground">Building your roadmap from CourseTable…</p>
      ) : null}

      {roadmapQ.isError ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            Could not load suggestions from CourseTable. Try again later or browse courses manually.
          </CardContent>
        </Card>
      ) : null}

      {!roadmapQ.isLoading && suggestions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            You've satisfied all the requirements we can suggest. Talk to your DUS to confirm.
          </CardContent>
        </Card>
      )}

      {(["high", "med"] as const).map(
        (p) =>
          grouped[p].length > 0 && (
            <Card key={p}>
              <CardHeader>
                <CardTitle className="font-serif">
                  {p === "high" ? "Take soon — major & track gaps" : "Distributional gaps"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {grouped[p].map((s) => (
                  <div
                    key={s.code}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{s.code}</span>
                        <span className="text-sm text-muted-foreground">{s.title}</span>
                        <a
                          href={courseTableSearchUrl(s.code)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                          title="View on CourseTable"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{s.reason}</p>
                    </div>
                    <Badge variant={p === "high" ? "default" : "secondary"}>
                      {p === "high" ? "Priority" : "Suggested"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          ),
      )}
    </div>
  );
}
