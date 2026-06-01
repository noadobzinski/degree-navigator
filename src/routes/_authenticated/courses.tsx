import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { getMyCourses, addCourse, updateCourse, deleteCourse } from "@/lib/audit.functions";
import { CATALOG, CATALOG_BY_CODE } from "@/data/courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/courses")({
  head: () => ({ meta: [{ title: "My Courses — BluePath" }] }),
  component: CoursesPage,
});

function CoursesPage() {
  const fetchCourses = useServerFn(getMyCourses);
  const addFn = useServerFn(addCourse);
  const updateFn = useServerFn(updateCourse);
  const deleteFn = useServerFn(deleteCourse);
  const qc = useQueryClient();
  const coursesQ = useQuery({ queryKey: ["courses"], queryFn: () => fetchCourses() });
  const [search, setSearch] = useState("");

  const addM = useMutation({
    mutationFn: (code: string) => {
      const c = CATALOG_BY_CODE[code];
      return addFn({
        data: {
          course_code: c.code, course_title: c.title, credits: c.credits,
          distributional: c.distributional, skills: c.skills, status: "completed",
        },
      });
    },
    onSuccess: () => { toast.success("Course added"); qc.invalidateQueries({ queryKey: ["courses"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const updateM = useMutation({
    mutationFn: (vars: { id: string; status: "planned" | "in_progress" | "completed" }) => updateFn({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
  const delM = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["courses"] }); },
  });

  const taken = new Set((coursesQ.data ?? []).map((c) => c.course_code));
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CATALOG.slice(0, 30);
    return CATALOG.filter((c) => c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q)).slice(0, 50);
  }, [search]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground">Add courses you've taken, are taking, or plan to take.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="font-serif">Browse catalog</CardTitle></CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by code, title, or subject (e.g. CPSC, biology)" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="grid gap-2 max-h-[420px] overflow-y-auto">
            {filtered.map((c) => (
              <div key={c.code} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{c.code}</span>
                    <span className="truncate text-sm text-muted-foreground">{c.title}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.distributional.map((d) => <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>)}
                    {c.skills.map((s) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                    <span className="text-[10px] text-muted-foreground">{c.credits} cr</span>
                  </div>
                </div>
                <Button size="sm" disabled={taken.has(c.code) || addM.isPending} onClick={() => addM.mutate(c.code)}>
                  {taken.has(c.code) ? "Added" : <><Plus className="mr-1 h-3 w-3" /> Add</>}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="font-serif">My course list ({coursesQ.data?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          {coursesQ.isLoading ? <p className="text-muted-foreground">Loading…</p> : null}
          {coursesQ.data?.length === 0 ? <p className="text-muted-foreground">You haven't added any courses yet — browse above.</p> : null}
          <div className="space-y-2">
            {coursesQ.data?.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{c.course_code}</span>
                    <span className="truncate text-sm text-muted-foreground">{c.course_title}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.distributional?.map((d: string) => <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>)}
                    {c.skills?.map((s: string) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                  </div>
                </div>
                <Select value={c.status} onValueChange={(v) => updateM.mutate({ id: c.id, status: v as "planned" | "in_progress" | "completed" })}>
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => delM.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
