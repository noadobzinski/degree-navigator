import { formatCrosslistNote, type CrosslistLookup } from "@/lib/crosslist";
import type { UserCourse } from "@/lib/audit";

type FilledRequirementCoursesProps = {
  courses: UserCourse[];
  crosslistLookup?: CrosslistLookup;
  /** Shown when the slot is fully satisfied. */
  complete?: boolean;
};

export function FilledRequirementCourses({
  courses,
  crosslistLookup,
  complete,
}: FilledRequirementCoursesProps) {
  if (!courses.length) return null;

  return (
    <div
      className={
        complete
          ? "mt-2 rounded-md border border-success/30 bg-success/10 px-2.5 py-2"
          : "mt-2 rounded-md border border-border bg-muted/30 px-2.5 py-2"
      }
    >
      <p
        className={
          complete ? "text-xs font-medium text-success" : "text-xs font-medium text-foreground"
        }
      >
        {complete ? "Fulfilled by your courses" : "Your courses counting here"}
      </p>
      <ul className="mt-1 space-y-0.5">
        {courses.map((c) => {
          const note = formatCrosslistNote(c.course_code, c.crosslisted_codes, crosslistLookup);
          return (
            <li key={c.id} className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{c.course_code}</span>
              {c.course_title ? <span> — {c.course_title}</span> : null}
              {note ? <span className="block text-[10px]">{note}</span> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
