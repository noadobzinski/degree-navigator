import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { getProfile, updateProfile } from "@/lib/audit.functions";
import { unlinkCourseTable } from "@/lib/coursetable.functions";
import { useCourseTableCatalogMeta } from "@/hooks/use-coursetable-catalog";
import { MAJORS_BY_ID } from "@/data/majors";
import { TRACKS } from "@/data/tracks";
import { MajorPicker } from "@/components/major-picker";
import { YaleNetIdButton } from "@/components/yale-netid-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Database } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  validateSearch: z.object({ major: z.string().optional() }),
  head: () => ({ meta: [{ title: "Settings — BluePath" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { major: majorFromUrl } = Route.useSearch();
  const fetchProfile = useServerFn(getProfile);
  const updateFn = useServerFn(updateProfile);
  const unlinkFn = useServerFn(unlinkCourseTable);
  const qc = useQueryClient();
  const profileQ = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const catalogMeta = useCourseTableCatalogMeta();

  const [name, setName] = useState("");
  const [majorId, setMajorId] = useState<string>("");
  const [degree, setDegree] = useState<"BA" | "BS">("BA");
  const [trackId, setTrackId] = useState<string>("none");
  const [year, setYear] = useState<string>("");

  useEffect(() => {
    const p = profileQ.data;
    if (!p) return;
    setName(p.full_name ?? "");
    setMajorId(p.major_id ?? "");
    setDegree(((p.degree_type as "BA" | "BS") ?? "BA"));
    setTrackId(p.track_id ?? "none");
    setYear(p.class_year ? String(p.class_year) : "");
  }, [profileQ.data]);

  useEffect(() => {
    if (!majorFromUrl || !MAJORS_BY_ID[majorFromUrl]) return;
    const m = MAJORS_BY_ID[majorFromUrl];
    setMajorId(majorFromUrl);
    setDegree(m.defaultDegree);
  }, [majorFromUrl]);

  const major = majorId ? MAJORS_BY_ID[majorId] : null;
  const availableDegrees = major?.degrees ?? ["BA", "BS"];

  const saveM = useMutation({
    mutationFn: () => updateFn({
      data: {
        full_name: name || null,
        major_id: majorId || null,
        degree_type: degree,
        track_id: trackId === "none" ? null : trackId,
        class_year: year ? parseInt(year, 10) : null,
      },
    }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["profile"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const unlinkM = useMutation({
    mutationFn: () => unlinkFn(),
    onSuccess: () => {
      toast.success("CourseTable disconnected");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const coursetableNetId = profileQ.data?.coursetable_netid;
  const coursetableConnectedAt = profileQ.data?.coursetable_connected_at;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Choose your major, degree type, and track.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="font-serif">Your degree</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          </div>

          <div className="space-y-1.5">
            <Label>Major</Label>
            <MajorPicker
              value={majorId}
              onChange={setMajorId}
              onDegreeDefault={setDegree}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Degree</Label>
            <Select value={degree} onValueChange={(v) => setDegree(v as "BA" | "BS")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {availableDegrees.map((d) => <SelectItem key={d} value={d}>{d === "BA" ? "Bachelor of Arts (B.A.)" : "Bachelor of Science (B.S.)"}</SelectItem>)}
              </SelectContent>
            </Select>
            {major && <p className="text-xs text-muted-foreground">{major.notes}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Track (optional)</Label>
            <Select value={trackId} onValueChange={setTrackId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TRACKS.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="year">Class year</Label>
            <Input id="year" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))} placeholder="2028" />
          </div>

          <Button onClick={() => saveM.mutate()} disabled={saveM.isPending || !majorId}>Save</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Yale course catalog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-4 text-sm">
            <Database className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              {catalogMeta.data ? (
                <>
                  <p className="font-medium">Connected to CourseTable</p>
                  <p className="mt-1 text-muted-foreground">
                    {catalogMeta.data.courseCount.toLocaleString()} Yale courses are available across My Courses,
                    Roadmap, and your degree audit. No extra sign-in required.
                  </p>
                </>
              ) : catalogMeta.isLoading ? (
                <p className="text-muted-foreground">Loading catalog from CourseTable…</p>
              ) : (
                <p className="text-muted-foreground">
                  CourseTable catalog is unavailable right now. Course search will retry automatically.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Yale NetID (optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Optionally link your Yale NetID to save it on your profile. The course catalog works without this step.
          </p>
          {coursetableNetId ? (
            <div className="rounded-md border border-border bg-muted/40 p-4 text-sm">
              <p className="font-medium">Connected as <span className="font-mono">{coursetableNetId}</span></p>
              {coursetableConnectedAt ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Linked {new Date(coursetableConnectedAt).toLocaleDateString()}
                </p>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => unlinkM.mutate()}
                disabled={unlinkM.isPending}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <YaleNetIdButton label="Connect Yale NetID" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
