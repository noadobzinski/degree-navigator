import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { getProfile, updateProfile } from "@/lib/audit.functions";
import { useCourseTableCatalogMeta, useClientQueryEnabled } from "@/hooks/use-coursetable-catalog";
import { CERTIFICATE_CATEGORIES, CERTIFICATES, resolveCertificateId } from "@/data/certificates";
import { concentrationsForMajor, MAJORS_BY_ID } from "@/data/majors";
import { TRACKS } from "@/data/tracks";
import { MajorPicker } from "@/components/major-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Database } from "lucide-react";
import { YALE_DOUBLE_MAJOR_MAX_OVERLAP } from "@/data/majors";

export const Route = createFileRoute("/_authenticated/settings")({
  validateSearch: z.object({ major: z.string().optional() }),
  head: () => ({ meta: [{ title: "Settings — Decree" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { major: majorFromUrl } = Route.useSearch();
  const fetchProfile = useServerFn(getProfile);
  const updateFn = useServerFn(updateProfile);
  const qc = useQueryClient();
  const clientReady = useClientQueryEnabled();
  const profileQ = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(),
    enabled: clientReady,
  });
  const catalogMeta = useCourseTableCatalogMeta();

  const [name, setName] = useState("");
  const [majorId, setMajorId] = useState<string>("");
  const [degree, setDegree] = useState<"BA" | "BS">("BA");
  const [doubleMajor, setDoubleMajor] = useState(false);
  const [secondMajorId, setSecondMajorId] = useState<string>("");
  const [secondDegree, setSecondDegree] = useState<"BA" | "BS">("BA");
  const [concentrationId, setConcentrationId] = useState<string>("");
  const [certificateIds, setCertificateIds] = useState<string[]>([]);
  const [trackId, setTrackId] = useState<string>("none");
  const [year, setYear] = useState<string>("");

  useEffect(() => {
    const p = profileQ.data;
    if (!p) return;
    setName(p.full_name ?? "");
    setMajorId(p.major_id ?? "");
    setDegree(((p.degree_type as "BA" | "BS") ?? "BA"));
    const second = p.second_major_id ?? "";
    setDoubleMajor(!!second);
    setSecondMajorId(second);
    setSecondDegree(((p.second_degree_type as "BA" | "BS") ?? p.degree_type ?? "BA") as "BA" | "BS");
    setConcentrationId(p.concentration_id ?? "");
    setCertificateIds((p.certificate_ids ?? []).map(resolveCertificateId));
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
  const secondMajor = secondMajorId ? MAJORS_BY_ID[secondMajorId] : null;
  const availableDegrees = major?.degrees ?? ["BA", "BS"];
  const secondDegrees = secondMajor?.degrees ?? ["BA", "BS"];
  const concentrations = concentrationsForMajor(major ?? undefined, degree);

  useEffect(() => {
    if (!concentrationId) return;
    if (!concentrations.some((c) => c.id === concentrationId)) {
      setConcentrationId("");
    }
  }, [majorId, degree, concentrationId, concentrations]);

  const saveM = useMutation({
    mutationFn: () => {
      if (doubleMajor && secondMajorId && secondMajorId === majorId) {
        throw new Error("Second major must differ from your primary major.");
      }
      return updateFn({
        data: {
          full_name: name || null,
          major_id: majorId || null,
          degree_type: degree,
          second_major_id: doubleMajor && secondMajorId ? secondMajorId : null,
          second_degree_type:
            doubleMajor && secondMajorId ? secondDegree : null,
          concentration_id: concentrationId || null,
          certificate_ids: certificateIds,
          track_id: trackId === "none" ? null : trackId,
          class_year: year ? parseInt(year, 10) : null,
        },
      });
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["profile"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Choose your major, concentration, certificates, and track.</p>
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
              onChange={(id) => {
                setMajorId(id);
                setConcentrationId("");
              }}
              onDegreeDefault={setDegree}
            />
          </div>

          {concentrations.length > 0 ? (
            <div className="space-y-1.5">
              <Label>Concentration</Label>
              <Select
                value={concentrationId || "__none__"}
                onValueChange={(v) => setConcentrationId(v === "__none__" ? "" : v)}
              >
                <SelectTrigger><SelectValue placeholder="Standard major requirements" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Standard / no concentration selected</SelectItem>
                  {concentrations.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {concentrationId ? (
                <p className="text-xs text-muted-foreground">
                  {concentrations.find((c) => c.id === concentrationId)?.description ??
                    "Audit uses this concentration’s roadmap requirements."}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Optional. Select a concentration if your roadmap lists one (e.g. BENG, PHIL, CPLT Film).
                </p>
              )}
            </div>
          ) : null}

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

          <div className="flex items-start gap-3 rounded-md border border-border p-4">
            <Checkbox
              id="double-major"
              checked={doubleMajor}
              onCheckedChange={(v) => {
                const on = v === true;
                setDoubleMajor(on);
                if (!on) setSecondMajorId("");
              }}
            />
            <div className="space-y-1">
              <Label htmlFor="double-major" className="cursor-pointer font-medium">
                Double major
              </Label>
              <p className="text-xs text-muted-foreground">
                Each major is completed independently. Yale allows no more than{" "}
                {YALE_DOUBLE_MAJOR_MAX_OVERLAP} term courses to overlap between majors.
              </p>
            </div>
          </div>

          {doubleMajor ? (
            <div className="space-y-4 rounded-md border border-dashed border-border p-4">
              <div className="space-y-1.5">
                <Label>Second major</Label>
                <MajorPicker
                  value={secondMajorId}
                  onChange={(id) => {
                    setSecondMajorId(id);
                    const m = MAJORS_BY_ID[id];
                    if (m) setSecondDegree(m.defaultDegree);
                  }}
                  onDegreeDefault={setSecondDegree}
                  excludeId={majorId}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Second major degree</Label>
                <Select value={secondDegree} onValueChange={(v) => setSecondDegree(v as "BA" | "BS")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {secondDegrees.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d === "BA" ? "Bachelor of Arts (B.A.)" : "Bachelor of Science (B.S.)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {secondMajor && <p className="text-xs text-muted-foreground">{secondMajor.notes}</p>}
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Certificates (optional)</Label>
            <p className="text-xs text-muted-foreground">
              Structured credentials audited separately from your major (YCPS certificate programs).
            </p>
            <div className="space-y-4 rounded-md border border-border p-3">
              {CERTIFICATE_CATEGORIES.map((cat) => {
                const certs = CERTIFICATES.filter((c) => c.category === cat.id);
                if (certs.length === 0) return null;
                return (
                  <div key={cat.id} className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {cat.label}
                    </p>
                    {certs.map((cert) => {
                      const checked = certificateIds.some(
                        (id) => resolveCertificateId(id) === cert.id,
                      );
                      return (
                        <div key={cert.id} className="flex items-start gap-3">
                          <Checkbox
                            id={`cert-${cert.id}`}
                            checked={checked}
                            onCheckedChange={(v) => {
                              if (v === true) {
                                setCertificateIds((ids) => [
                                  ...new Set([...ids.map(resolveCertificateId), cert.id]),
                                ]);
                              } else {
                                setCertificateIds((ids) =>
                                  ids.filter((id) => resolveCertificateId(id) !== cert.id),
                                );
                              }
                            }}
                          />
                          <div className="space-y-0.5">
                            <Label htmlFor={`cert-${cert.id}`} className="cursor-pointer font-medium">
                              {cert.name}
                              {cert.requiresApplication ? (
                                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                  (application required)
                                </span>
                              ) : null}
                            </Label>
                            <p className="text-xs text-muted-foreground">{cert.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Track (optional)</Label>
            <Select value={trackId} onValueChange={setTrackId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {TRACKS.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="year">Class year</Label>
            <Input id="year" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))} placeholder="2028" />
          </div>

          <Button
            onClick={() => saveM.mutate()}
            disabled={saveM.isPending || !majorId || (doubleMajor && !secondMajorId)}
          >
            Save
          </Button>
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
    </div>
  );
}
