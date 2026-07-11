import { CalendarClock } from "lucide-react";
import type { Track } from "@/data/tracks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TrackMilestonesCardProps = {
  track: Track;
  className?: string;
};

/**
 * Lists the non-course milestones (clinical experience, shadowing, exam prep,
 * etc.) recommended for a pre-professional track. These can't be satisfied by
 * coursework, so they're shown as a checklist alongside the course audit.
 */
export function TrackMilestonesCard({ track, className }: TrackMilestonesCardProps) {
  if (!track.milestones || track.milestones.length === 0) return null;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 font-serif text-lg">
          <CalendarClock className="h-5 w-5 text-primary" />
          Beyond coursework — {track.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Experiences admissions committees look for. These aren&apos;t Yale courses, so plan them
          into your summers and free time.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {track.milestones.map((m) => (
          <div key={m.id} className="rounded-md border border-border p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{m.label}</span>
              {m.timing ? <span className="text-xs text-muted-foreground">{m.timing}</span> : null}
            </div>
            {m.description ? (
              <p className="mt-1 text-xs text-muted-foreground">{m.description}</p>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
