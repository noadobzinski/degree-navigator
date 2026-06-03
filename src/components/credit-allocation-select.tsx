import type { UserCourse } from "@/lib/audit";
import {
  allocationLabel,
  getEligibleCreditOptions,
  optimizeDistributionalAllocation,
  type CreditBucketId,
} from "@/lib/credit-allocation";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AUTO_VALUE = "__auto__";

type CreditAllocationSelectProps = {
  course: UserCourse;
  allCourses: UserCourse[];
  onChange: (allocation: CreditBucketId | null) => void;
  disabled?: boolean;
};

export function CreditAllocationSelect({
  course,
  allCourses,
  onChange,
  disabled,
}: CreditAllocationSelectProps) {
  const options = getEligibleCreditOptions(course);
  if (options.length < 2) return null;

  const autoMap = optimizeDistributionalAllocation(allCourses);
  const recommended = autoMap.get(course.id);
  const manual = course.credit_allocation != null;
  const currentValue = manual && course.credit_allocation ? course.credit_allocation : AUTO_VALUE;

  return (
    <div className="mt-2 space-y-1">
      <Label className="text-xs text-muted-foreground">
        Counts toward (one credit only)
      </Label>
      <Select
        value={currentValue}
        disabled={disabled}
        onValueChange={(v) => {
          if (v === AUTO_VALUE) onChange(null);
          else onChange(v as CreditBucketId);
        }}
      >
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Choose credit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={AUTO_VALUE}>
            Auto
            {recommended
              ? ` — ${options.find((o) => o.id === recommended)?.label ?? recommended}`
              : ""}
          </SelectItem>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.label}
              {recommended === o.id && !manual ? " (recommended)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-[10px] text-muted-foreground">
        Currently: {allocationLabel(course, autoMap)}
      </p>
    </div>
  );
}
