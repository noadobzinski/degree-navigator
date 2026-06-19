import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCourse } from "@/lib/audit.functions";
import { countsAsWrForAllocation, type CreditBucketId } from "@/lib/credit-allocation";
import type { UserCourse } from "@/lib/audit";
import { toast } from "sonner";

export function useCourseCreditAllocation() {
  const updateFn = useServerFn(updateCourse);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      course,
      allocation,
    }: {
      course: UserCourse;
      allocation: CreditBucketId | null;
    }) => {
      const wrPatch = countsAsWrForAllocation(course, allocation);
      return updateFn({
        data: {
          id: course.id,
          credit_allocation: allocation,
          ...(wrPatch !== undefined ? { counts_as_wr: wrPatch } : {}),
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save credit choice"),
  });
}
