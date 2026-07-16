import { Link } from "@tanstack/react-router";
import { CheckCircle2, CircleDot, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FilledRequirementCourses } from "@/components/filled-requirement-courses";
import type { CredentialRequirementRow } from "@/lib/credential-progress";
import type { CrosslistLookup } from "@/lib/crosslist";

type RequirementSlotRowsProps = {
  rows: CredentialRequirementRow[];
  crosslistLookup?: CrosslistLookup;
  /** Hide rows with no progress when true (default false). */
  hideEmpty?: boolean;
};

export function RequirementSlotRows({
  rows,
  crosslistLookup,
  hideEmpty = false,
}: RequirementSlotRowsProps) {
  const visible = hideEmpty
    ? rows.filter((r) => r.filled.length > 0 || r.satisfied)
    : rows;

  if (visible.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {visible.map((row) => (
        <div
          key={row.id}
          className="flex items-start gap-3 rounded-md border border-border bg-muted/20 p-3"
        >
          {row.satisfied ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          ) : row.filled.length > 0 ? (
            <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          ) : (
            <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{row.label}</p>
              <Badge variant={row.satisfied ? "default" : "secondary"} className="text-xs">
                {Math.min(row.filled.length, row.needCount)}/{row.needCount}
              </Badge>
            </div>
            {row.description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{row.description}</p>
            ) : null}
            <FilledRequirementCourses
              courses={row.filled}
              crosslistLookup={crosslistLookup}
              complete={row.satisfied}
            />
            {!row.satisfied && row.remaining > 0 && row.filled.length === 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">No matching courses yet.</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CatalogLink({ href, label }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-primary hover:underline"
    >
      {label ?? "YCPS requirements"}
    </a>
  );
}

export function SettingsCertificateLink({ certificateId }: { certificateId: string }) {
  return (
    <Link
      to="/settings"
      className="text-xs font-medium text-primary hover:underline"
    >
      Add in Settings
    </Link>
  );
}
