import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getRequirementExamples } from "@/lib/coursetable.functions";
import type { CourseExample } from "@/lib/requirement-examples";

export const requirementExamplesKey = (
  majorId: string,
  degree: string,
  trackId: string | null | undefined,
  classYear: number | null | undefined,
) => ["requirement-examples", majorId, degree, trackId ?? "none", classYear ?? ""] as const;

export function useRequirementExamples(
  majorId: string | null | undefined,
  degree: "BA" | "BS" | null | undefined,
  trackId: string | null | undefined,
  classYear: number | null | undefined,
) {
  const fn = useServerFn(getRequirementExamples);
  return useQuery({
    queryKey: requirementExamplesKey(majorId ?? "", degree ?? "BA", trackId, classYear),
    queryFn: () =>
      fn({
        data: {
          majorId: majorId!,
          degree: degree!,
          trackId: trackId ?? null,
          classYear: classYear ?? null,
        },
      }),
    enabled: !!majorId && !!degree && typeof window !== "undefined",
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });
}

export function getSlotExamples(
  bySlotId: Record<string, CourseExample[]> | undefined,
  slotId: string,
): CourseExample[] {
  return bySlotId?.[slotId] ?? [];
}
