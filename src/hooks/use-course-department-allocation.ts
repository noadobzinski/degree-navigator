import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCourse } from "@/lib/audit.functions";
import type { UserCourse } from "@/lib/audit";
import { toast } from "sonner";

export function useCourseDepartmentAllocation() {
  const updateFn = useServerFn(updateCourse);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ course, department }: { course: UserCourse; department: string | null }) =>
      updateFn({
        data: {
          id: course.id,
          department_allocation: department,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not save department choice"),
  });
}
