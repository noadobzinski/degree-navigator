import { useState } from "react";
import type { UserCourse } from "@/lib/audit";
import {
  courseHasExclusiveCreditChoice,
  creditAllocationFromSkills,
  isCreditBucketId,
  optimizeDistributionalAllocation,
  allocationLabel,
} from "@/lib/credit-allocation";
import { CreditAllocationSelect } from "@/components/credit-allocation-select";
import { useCourseCreditAllocation } from "@/hooks/use-course-credit-allocation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Split } from "lucide-react";

type MultiCreditCoursesCardProps = {
  courses: UserCourse[];
};

/** A course counts as "settled" once the student has explicitly chosen a credit. */
function isCreditAssigned(course: UserCourse): boolean {
  if (course.credit_allocation != null && isCreditBucketId(course.credit_allocation)) {
    return true;
  }
  return creditAllocationFromSkills(course.skills ?? []) != null;
}

export function MultiCreditCoursesCard({ courses }: MultiCreditCoursesCardProps) {
  const allocationM = useCourseCreditAllocation();
  const [showAssigned, setShowAssigned] = useState(false);
  const multiCredit = courses.filter(courseHasExclusiveCreditChoice);
  const autoMap = optimizeDistributionalAllocation(courses);

  if (multiCredit.length === 0) return null;

  const needsPick = multiCredit.filter((c) => !isCreditAssigned(c));
  const assigned = multiCredit.filter(isCreditAssigned);
  // Assigned courses don't need to be revisited on every visit, so keep them
  // collapsed by default and only surface the ones still on auto-assign.
  const visible = showAssigned ? multiCredit : needsPick;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-lg">
          <Split className="h-5 w-5 text-primary" />
          Multi-credit courses
        </CardTitle>
        <CardDescription>
          Some courses can satisfy more than one requirement (e.g. humanities and writing). Yale
          counts each course toward one distributional or skill credit — choose which you used it
          for.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {needsPick.length > 0 ? (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {needsPick.length} course{needsPick.length === 1 ? "" : "s"} still on auto-assign — pick
            a credit if you know how you counted {needsPick.length === 1 ? "it" : "them"}.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            All multi-credit courses have an assigned credit. Nothing to review right now.
          </p>
        )}
        {visible.map((course) => (
          <div key={course.id} className="rounded-md border border-border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{course.course_code}</span>
              <span className="truncate text-sm text-muted-foreground">{course.course_title}</span>
              <Badge variant="secondary" className="text-[10px] font-normal">
                {allocationLabel(course, autoMap)}
              </Badge>
            </div>
            <CreditAllocationSelect
              course={course}
              allCourses={courses}
              disabled={allocationM.isPending}
              onChange={(allocation) => allocationM.mutate({ course, allocation })}
            />
          </div>
        ))}
        {assigned.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setShowAssigned((v) => !v)}
          >
            <ChevronDown className={`transition-transform ${showAssigned ? "rotate-180" : ""}`} />
            {showAssigned
              ? "Hide assigned courses"
              : `Review ${assigned.length} assigned course${assigned.length === 1 ? "" : "s"}`}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
