import { CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilledRequirementCourses } from "@/components/filled-requirement-courses";
import { RequirementExamples } from "@/components/requirement-examples";
import { getSlotExamples } from "@/hooks/use-requirement-examples";
import type { CourseExample } from "@/lib/requirement-examples";
import type { MajorAudit } from "@/lib/audit";
import type { CrosslistLookup } from "@/lib/crosslist";

type ExamplesQuery = {
  data?: { bySlotId?: Record<string, CourseExample[]>; seasonsSearched: number };
  isLoading: boolean;
  isError?: boolean;
};

type MajorAuditCardProps = {
  audit: MajorAudit;
  title?: string;
  examplesQ: ExamplesQuery;
  crosslistLookup?: CrosslistLookup;
};

export function MajorAuditCard({ audit, title, examplesQ, crosslistLookup }: MajorAuditCardProps) {
  const conc = audit.concentration?.label;
  const heading =
    title ??
    `${audit.major.name}${conc ? ` · ${conc}` : ""} (${audit.degree}) requirements`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">{heading}</CardTitle>
        {examplesQ.data ? (
          <p className="text-sm text-muted-foreground">
            Examples from CourseTable across the last {examplesQ.data.seasonsSearched} terms
            {examplesQ.data.seasonsSearched > 0 ? " (includes current and historical offerings)" : ""}.
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-5">
        {audit.sections.map((s) => (
          <div key={s.title}>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{s.title}</h3>
            <div className="space-y-2">
              {s.groups?.map((g) => (
                <div key={g.group.id} className="rounded-md border border-border bg-muted/20 p-3 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{g.group.label}</p>
                      {g.group.description ? (
                        <p className="text-xs text-muted-foreground">{g.group.description}</p>
                      ) : null}
                    </div>
                    <Badge variant={g.satisfied ? "default" : "secondary"}>
                      {g.satisfiedCount}/{g.pickCount} subfields
                    </Badge>
                  </div>
                  {g.slotResults.map((r) => (
                    <SlotRow
                      key={r.slot.id}
                      result={r}
                      examplesQ={examplesQ}
                      crosslistLookup={crosslistLookup}
                      indent
                    />
                  ))}
                </div>
              ))}
              {s.results.map((r) => (
                <SlotRow
                  key={r.slot.id}
                  result={r}
                  examplesQ={examplesQ}
                  crosslistLookup={crosslistLookup}
                />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SlotRow({
  result: r,
  examplesQ,
  crosslistLookup,
  indent,
}: {
  result: import("@/lib/audit").SlotResult;
  examplesQ: MajorAuditCardProps["examplesQ"];
  crosslistLookup?: CrosslistLookup;
  indent?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-md border border-border p-3 ${indent ? "ml-2 bg-background" : ""}`}
    >
      {r.satisfied ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
      ) : (
        <AlertCircle className="mt-0.5 h-5 w-5 text-warning" />
      )}
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium">{r.slot.label}</p>
          <Badge variant={r.satisfied ? "default" : "secondary"}>
            {r.filled.length}/{r.slot.needCount}
          </Badge>
        </div>
        <FilledRequirementCourses
          courses={r.filled}
          crosslistLookup={crosslistLookup}
          complete={r.satisfied}
        />
        <RequirementExamples
          examples={getSlotExamples(examplesQ.data?.bySlotId, r.slot.id)}
          isLoading={examplesQ.isLoading}
          isError={examplesQ.isError}
          showSuggestions={!r.satisfied}
        />
      </div>
    </div>
  );
}
