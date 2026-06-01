import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getProfile, getMyCourses } from "@/lib/audit.functions";
import { suggestRoadmap, type UserCourse } from "@/lib/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map } from "lucide-react";

export const Route = createFileRoute("/_authenticated/roadmap")({
  head: () => ({ meta: [{ title: "Roadmap — BluePath" }] }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const fetchProfile = useServerFn(getProfile);
  const fetchCourses = useServerFn(getMyCourses);
  const profileQ = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const coursesQ = useQuery({ queryKey: ["courses"], queryFn: () => fetchCourses() });

  if (profileQ.isLoading || coursesQ.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  const profile = profileQ.data;
  if (!profile?.major_id) {
    return <p className="text-muted-foreground">Set up your major in <a className="text-primary underline" href="/settings">Settings</a> first.</p>;
  }
  const suggestions = suggestRoadmap(
    (coursesQ.data ?? []) as UserCourse[],
    profile.major_id,
    (profile.degree_type ?? "BA") as "BA" | "BS",
    profile.track_id,
  );

  const grouped = {
    high: suggestions.filter((s) => s.priority === "high"),
    med: suggestions.filter((s) => s.priority === "med"),
    low: suggestions.filter((s) => s.priority === "low"),
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <div className="flex items-center gap-2">
          <Map className="h-6 w-6 text-primary" />
          <h1 className="font-serif text-3xl font-bold">Your suggested roadmap</h1>
        </div>
        <p className="text-muted-foreground">Courses ranked by how close they get you to graduation.</p>
      </header>

      {suggestions.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">You've satisfied all the requirements we can suggest. Talk to your DUS to confirm.</CardContent></Card>
      )}

      {(["high", "med"] as const).map((p) => grouped[p].length > 0 && (
        <Card key={p}>
          <CardHeader>
            <CardTitle className="font-serif">
              {p === "high" ? "Take soon — major & track gaps" : "Distributional gaps"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {grouped[p].map((s) => (
              <div key={s.code} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{s.code}</span>
                    <span className="text-sm text-muted-foreground">{s.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{s.reason}</p>
                </div>
                <Badge variant={p === "high" ? "default" : "secondary"}>{p === "high" ? "Priority" : "Suggested"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
