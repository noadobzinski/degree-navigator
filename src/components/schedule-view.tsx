import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { courseTableSearchUrl } from "@/lib/coursetable";
import { courseIdentityKey } from "@/lib/course-codes";
import type { DegreeSchedule, ScheduledCourse } from "@/lib/schedule-planner";
import { Calendar, ExternalLink, Lock, Sparkles } from "lucide-react";

type ScheduleViewProps = {
  schedule: DegreeSchedule;
  highlightCodes?: Set<string>;
  emptyMessage?: string;
};

function CourseRow({
  course,
  highlighted,
}: {
  course: ScheduledCourse;
  highlighted?: boolean;
}) {
  if (course.flexible) {
    return (
      <div className="rounded-md border border-dashed border-border p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <span className="font-semibold">{course.title}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{course.reason}</p>
          </div>
          <Badge variant="secondary">Your choice</Badge>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-md border p-3 ${highlighted ? "border-primary/50 bg-primary/5" : "border-border"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{course.code}</span>
            <span className="text-sm text-muted-foreground">{course.title}</span>
            <a
              href={courseTableSearchUrl(course.code)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary"
              title="View on CourseTable"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            {course.source === "planned" ? (
              <Badge variant="outline" className="text-xs font-normal">
                On your list
              </Badge>
            ) : null}
            {highlighted ? (
              <Badge variant="default" className="text-xs font-normal">
                New in this scenario
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{course.reason}</p>
          {course.prereqNote ? (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-warning">
              <Lock className="h-3 w-3 shrink-0" />
              {course.prereqNote}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-muted-foreground">{course.credits} cr</span>
          <Badge variant={course.priority === "high" ? "default" : "secondary"}>
            {course.priority === "high" ? "Major" : course.priority === "med" ? "Other req" : "Elective"}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function FreeChoiceBanner() {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex items-start gap-3 py-4">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="space-y-1">
          <p className="font-medium">You&rsquo;ve completed all your specific degree requirements.</p>
          <p className="text-sm text-muted-foreground">
            Every major, track, and program requirement is accounted for. Any remaining terms are
            yours to fill — take whatever classes you&rsquo;re curious about. Any open slots below are
            just distributional areas you can satisfy with any qualifying course.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ScheduleView({ schedule, highlightCodes, emptyMessage }: ScheduleViewProps) {
  const termsWithCourses = schedule.terms.filter((t) => t.courses.length > 0);
  const hasContent = termsWithCourses.length > 0 || schedule.unscheduled.length > 0;
  const requirementsComplete = schedule.summary.requirementsComplete;

  if (!hasContent) {
    if (requirementsComplete) {
      return <FreeChoiceBanner />;
    }
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          {emptyMessage ??
            "You've satisfied all the requirements we can schedule. Talk to your DUS to confirm."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requirementsComplete ? <FreeChoiceBanner /> : null}
      {termsWithCourses.map((term) => (
        <Card key={term.seasonCode}>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 font-serif text-lg">
                <Calendar className="h-4 w-4 text-primary" />
                {term.label}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {term.courses.length} course{term.courses.length === 1 ? "" : "s"} · ~{term.credits} credits
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {term.courses.map((course) => (
              <CourseRow
                key={`${term.seasonCode}-${course.code}`}
                course={course}
                highlighted={highlightCodes?.has(courseIdentityKey(course.code))}
              />
            ))}
          </CardContent>
        </Card>
      ))}

      {schedule.unscheduled.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-lg">Beyond graduation window</CardTitle>
            <p className="text-sm text-muted-foreground">
              These courses still look required but may not fit before your expected graduation.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {schedule.unscheduled.map((course) => (
              <CourseRow
                key={course.code}
                course={course}
                highlighted={highlightCodes?.has(courseIdentityKey(course.code))}
              />
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
