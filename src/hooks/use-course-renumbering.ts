import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { applyRenumberingGroups } from "@/lib/course-renumbering-client";
import { getRenumberingMap } from "@/lib/coursetable.functions";

export const renumberingMapKey = ["renumbering-map"] as const;

/** Load CourseTable-derived 3↔4 digit mappings and register for client-side audits. */
export function useCourseRenumbering(enabled = true) {
  const fn = useServerFn(getRenumberingMap);
  const q = useQuery({
    queryKey: renumberingMapKey,
    queryFn: () => fn(),
    enabled: enabled && typeof window !== "undefined",
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (q.data) applyRenumberingGroups(q.data);
  }, [q.data]);

  return { ready: !enabled || q.isSuccess, isLoading: q.isLoading };
}
