import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { usePostHog } from "posthog-js/react";
import {
  MAJORS,
  MAJOR_DEPARTMENTS,
  YALE_ROADMAP_PDF,
  concentrationsForMajor,
  majorCourseCount,
  mergeElectivesIntoCore,
  resolveMajorRequirements,
  type Major,
} from "@/data/majors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, ExternalLink, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/majors")({
  head: () => ({ meta: [{ title: "Major Explorer — Decree" }] }),
  component: MajorsPage,
});

function RequirementSummary({
  major,
  degree,
  concentrationId,
}: {
  major: Major;
  degree: "BA" | "BS";
  concentrationId?: string;
}) {
  const raw = resolveMajorRequirements(major, degree, concentrationId || null);
  if (!raw) return null;
  const reqs = mergeElectivesIntoCore(raw);
  const sections = [
    { title: "Prerequisites", slots: reqs.prerequisites ?? [] },
    { title: "Major requirements", slots: reqs.core },
    { title: "Senior", slots: reqs.senior ?? [] },
  ].filter((s) => s.slots.length > 0);

  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted-foreground">
        {reqs.totalCourses} courses required for the {degree}.
      </p>
      {sections.map((section) => (
        <div key={section.title}>
          <p className="font-medium">{section.title}</p>
          <ul className="mt-1 space-y-1 text-muted-foreground">
            {section.slots.map((slot) => (
              <li key={slot.id}>
                {slot.label}
                {slot.needCount > 1 ? ` (${slot.needCount})` : ""}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function MajorsPage() {
  const posthog = usePostHog();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState<string>("all");
  const [degreeFilter, setDegreeFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewConcentrationId, setPreviewConcentrationId] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MAJORS.filter((m) => {
      if (department !== "all" && m.department !== department) return false;
      if (degreeFilter === "BA" && !m.degrees.includes("BA")) return false;
      if (degreeFilter === "BS" && !m.degrees.includes("BS")) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.roadmapCode.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q)
      );
    });
  }, [query, department, degreeFilter]);

  const selected = selectedId ? (MAJORS.find((m) => m.id === selectedId) ?? null) : null;
  const previewDegree = selected?.defaultDegree ?? "BA";
  const previewConcentrations = selected ? concentrationsForMajor(selected, previewDegree) : [];

  useEffect(() => {
    setPreviewConcentrationId("");
  }, [selectedId]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="font-serif text-3xl font-bold">Major Explorer</h1>
          </div>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Browse all {MAJORS.length} Yale College majors from the official{" "}
            <a
              href={YALE_ROADMAP_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Major Roadmaps
            </a>
            . Compare requirements and choose yours in Settings.
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href={YALE_ROADMAP_PDF} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Official PDF
          </a>
        </Button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, code, or department…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {MAJOR_DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={degreeFilter} onValueChange={setDegreeFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Degree" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All degrees</SelectItem>
            <SelectItem value="BA">B.A. only</SelectItem>
            <SelectItem value="BS">B.S. only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-2 lg:col-span-2 lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto">
          <p className="text-sm text-muted-foreground">{filtered.length} majors</p>
          {filtered.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setSelectedId(m.id);
                posthog.capture("major_previewed", {
                  major_id: m.id,
                  major_name: m.name,
                  department: m.department,
                });
              }}
              className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                selectedId === m.id ? "border-primary bg-accent" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.department}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 font-mono text-xs">
                  {m.roadmapCode}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {m.degrees.map((d) => (
                  <Badge key={d} variant="outline" className="text-xs">
                    {d} · {majorCourseCount(m, d)} cr
                  </Badge>
                ))}
                {concentrationsForMajor(m, m.defaultDegree).length > 0 ? (
                  <Badge variant="outline" className="text-xs">
                    {concentrationsForMajor(m, m.defaultDegree).length} concentrations
                  </Badge>
                ) : null}
              </div>
            </button>
          ))}
        </div>

        <Card className="lg:col-span-3 lg:sticky lg:top-6 lg:self-start">
          {selected ? (
            <>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="font-serif text-2xl">{selected.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selected.roadmapCode} · {selected.department}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selected.degrees.map((d) => (
                      <Badge key={d}>{d}</Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selected.notes && (
                  <p className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                    {selected.notes}
                  </p>
                )}
                {previewConcentrations.length > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium">Concentration (optional)</p>
                    <Select
                      value={previewConcentrationId || "__none__"}
                      onValueChange={(v) => setPreviewConcentrationId(v === "__none__" ? "" : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Standard major requirements" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Standard / no concentration</SelectItem>
                        {previewConcentrations.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {previewConcentrationId ? (
                      <p className="text-xs text-muted-foreground">
                        {previewConcentrations.find((c) => c.id === previewConcentrationId)
                          ?.description ?? "Requirements below reflect this concentration track."}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {previewConcentrations.length} concentration
                        {previewConcentrations.length === 1 ? "" : "s"} available — pick one to
                        preview requirements or leave as standard.
                      </p>
                    )}
                  </div>
                ) : null}
                <RequirementSummary
                  major={selected}
                  degree={previewDegree}
                  concentrationId={previewConcentrationId || undefined}
                />
                {selected.degrees.length > 1 &&
                  selected.degrees.includes("BS") &&
                  previewDegree === "BA" && (
                    <p className="text-xs text-muted-foreground">
                      B.S. track requires {majorCourseCount(selected, "BS")} courses — see official
                      roadmap for full details.
                    </p>
                  )}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button asChild>
                    <Link
                      to="/settings"
                      search={{
                        major: selected.id,
                        ...(previewConcentrationId
                          ? { concentration: previewConcentrationId }
                          : {}),
                      }}
                      onClick={() =>
                        posthog.capture("major_set_as_primary", {
                          major_id: selected.id,
                          major_name: selected.name,
                          concentration_id: previewConcentrationId || null,
                        })
                      }
                    >
                      Set as my major
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={YALE_ROADMAP_PDF} target="_blank" rel="noopener noreferrer">
                      View in Yale roadmaps
                    </a>
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="py-16 text-center text-muted-foreground">
              Select a major to see requirements and course counts.
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
