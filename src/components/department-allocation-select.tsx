import type { UserCourse } from "@/lib/audit";
import {
  getDepartmentOptions,
  getEffectiveDepartmentAllocation,
} from "@/lib/department-allocation";
import type { CrosslistLookup } from "@/lib/crosslist";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_VALUE = "__all__";

type DepartmentAllocationSelectProps = {
  course: UserCourse;
  onChange: (department: string | null) => void;
  lookup?: CrosslistLookup;
  disabled?: boolean;
  /** Tighter layout for catalog browse rows. */
  compact?: boolean;
};

export function DepartmentAllocationSelect({
  course,
  onChange,
  lookup,
  disabled,
  compact,
}: DepartmentAllocationSelectProps) {
  const options = getDepartmentOptions(course, lookup);
  if (options.length < 2) return null;

  const current = getEffectiveDepartmentAllocation(course, lookup);
  const currentValue = current ?? ALL_VALUE;

  return (
    <div
      className={
        compact
          ? "mt-2 space-y-1.5"
          : "mt-2 space-y-1.5 rounded-md border border-dashed border-primary/30 bg-primary/5 p-2.5"
      }
    >
      <Label
        className={
          compact ? "text-xs text-muted-foreground" : "text-xs font-medium text-foreground"
        }
      >
        Cross-listed — count toward which department?
      </Label>
      <Select
        value={currentValue}
        disabled={disabled}
        onValueChange={(v) => onChange(v === ALL_VALUE ? null : v)}
      >
        <SelectTrigger className={compact ? "h-8 text-xs" : "h-9 text-sm"}>
          <SelectValue placeholder="Choose a department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>All departments</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.subject} value={o.subject}>
              {o.subject} ({o.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!compact ? (
        <p className="text-[10px] text-muted-foreground">
          {current
            ? `Only counting toward ${current} requirements.`
            : "Counting toward every department it's listed in — pick one to restrict it."}
        </p>
      ) : null}
    </div>
  );
}
