import type { UserCourse } from "@/lib/audit";
import {
  allocationLabel,
  getEligibleCreditOptions,
  optimizeDistributionalAllocation,
  type CreditBucketId,
} from "@/lib/credit-allocation";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const AUTO_VALUE = "__auto__";

type CreditAllocationSelectProps = {
  course: UserCourse;
  allCourses: UserCourse[];
  onChange: (allocation: CreditBucketId | null) => void;
  disabled?: boolean;
  /** Tighter layout for catalog browse rows. */
  compact?: boolean;
};

export function CreditAllocationSelect({
  course,
  allCourses,
  onChange,
  disabled,
  compact,
}: CreditAllocationSelectProps) {
  const options = getEligibleCreditOptions(course);
  if (options.length < 2) return null;

  const autoMap = optimizeDistributionalAllocation(allCourses);
  const recommended = autoMap.get(course.id);
  const manual = course.credit_allocation != null;
  const currentValue = manual && course.credit_allocation ? course.credit_allocation : AUTO_VALUE;

  return (
    <div className={compact ? "mt-2 space-y-1.5" : "mt-2 space-y-1.5 rounded-md border border-dashed border-primary/30 bg-primary/5 p-2.5"}>
      <div className="flex flex-wrap items-center gap-1.5">
        <Label className={compact ? "text-xs text-muted-foreground" : "text-xs font-medium text-foreground"}>
          Counts as one credit only — choose:
        </Label>
        {!compact ? (
          <span className="flex flex-wrap gap-1">
            {options.map((o) => (
              <Badge key={o.id} variant="outline" className="text-[10px] font-normal">
                {o.label}
              </Badge>
            ))}
          </span>
        ) : null}
      </div>
      <Select
        value={currentValue}
        disabled={disabled}
        onValueChange={(v) => {
          if (v === AUTO_VALUE) onChange(null);
          else onChange(v as CreditBucketId);
        }}
      >
        <SelectTrigger className={compact ? "h-8 text-xs" : "h-9 text-sm"}>
          <SelectValue placeholder="Choose which credit this counts for" />
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
      {!compact ? (
        <p className="text-[10px] text-muted-foreground">
          Currently counting toward: <span className="font-medium text-foreground">{allocationLabel(course, autoMap)}</span>
          {!manual ? " — pick manually to override" : ""}
        </p>
      ) : null}
    </div>
  );
}
