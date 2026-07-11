import type { UserCourse } from "@/lib/audit";
import {
  courseHasExclusiveCreditChoice,
  optimizeDistributionalAllocation,
  allocationLabel,
} from "@/lib/credit-allocation";
import { CreditAllocationSelect } from "@/components/credit-allocation-select";
import { useCourseCreditAllocation } from "@/hooks/use-course-credit-allocation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Split } from "lucide-react";

type MultiCreditCoursesCardProps = {
  courses: UserCourse[];
};

export function MultiCreditCoursesCard({ courses }: MultiCreditCoursesCardProps) {
  const allocationM = useCourseCreditAllocation();
  const multiCredit = courses.filter(courseHasExclusiveCreditChoice);
  const autoMap = optimizeDistributionalAllocation(courses);
  const needsPick = multiCredit.filter((c) => c.credit_allocation == null);

  if (multiCredit.length === 0) return null;

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
        ) : null}
        {multiCredit.map((course) => (
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
      </CardContent>
    </Card>
  );
}
