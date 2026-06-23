import { CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import type { PlanAuditResult } from "@/lib/plan-audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type PlanRequirementsPanelProps = {
  audit: PlanAuditResult;
  majorName: string;
  secondMajorName?: string | null;
};

export function PlanRequirementsPanel({
  audit,
  majorName,
  secondMajorName,
}: PlanRequirementsPanelProps) {
  const distDone = audit.distributional.filter((d) => d.satisfied).length;
  const creditPct = Math.min(100, (audit.credits / audit.graduationCredits) * 100);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-serif text-lg">Degree progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Total credits</span>
              <span>
                {audit.credits.toFixed(1)} / {audit.graduationCredits}
                {audit.creditsSatisfied ? (
                  <CheckCircle2 className="ml-1 inline h-4 w-4 text-success" />
                ) : null}
              </span>
            </div>
            <Progress value={creditPct} className="mt-2" />
          </div>

          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Distributional & skills</span>
              <span>
                {distDone} / {audit.distributional.length}
                {audit.distributionalSatisfied ? (
                  <CheckCircle2 className="ml-1 inline h-4 w-4 text-success" />
                ) : null}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Writing (WR): 2 credits required</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>{majorName}</span>
              <Badge variant={audit.majorSatisfied ? "default" : "secondary"}>{audit.majorSummary}</Badge>
            </div>
            {secondMajorName && audit.secondMajorSummary ? (
              <div className="flex items-center justify-between">
                <span>{secondMajorName}</span>
                <Badge variant={audit.secondMajorSatisfied ? "default" : "secondary"}>
                  {audit.secondMajorSummary}
                </Badge>
              </div>
            ) : null}
            {audit.trackSummary ? (
              <div className="flex items-center justify-between">
                <span>Track</span>
                <Badge variant={audit.trackSatisfied ? "default" : "secondary"}>{audit.trackSummary}</Badge>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-serif text-lg">Distributional detail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {audit.distributional.map((d) => (
            <div key={d.req.id} className="flex items-start gap-2 rounded-md border border-border p-2 text-sm">
              {d.satisfied ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="font-medium">{d.req.label}</span>
                  <Badge variant={d.satisfied ? "default" : "secondary"} className="text-xs">
                    {d.count}/{d.req.count}
                  </Badge>
                </div>
                {d.matched.length > 0 ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {d.matched.map((c) => c.course_code).join(", ")}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {audit.implicationNotes.length > 0 ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Prerequisite assumptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-muted-foreground">
            {audit.implicationNotes.map((note) => (
              <p key={note}>· {note}</p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {audit.warnings.length > 0 ? (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              Schedule warnings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {audit.warnings.map((w) => (
              <p key={`${w.kind}-${w.courseId}`} className="text-muted-foreground">
                <span className="font-medium text-foreground">{w.courseCode}:</span> {w.message}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
