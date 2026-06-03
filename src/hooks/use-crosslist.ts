import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { getCrosslistMap } from "@/lib/coursetable.functions";
import { deserializeCrosslistLookup, type CrosslistLookup } from "@/lib/crosslist";

export function useCrosslistLookup(enabled: boolean): {
  lookup: CrosslistLookup | undefined;
  isLoading: boolean;
} {
  const fn = useServerFn(getCrosslistMap);
  const q = useQuery({
    queryKey: ["crosslist-map"],
    queryFn: () => fn(),
    enabled: enabled && typeof window !== "undefined",
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  const lookup = useMemo(
    () => (q.data ? deserializeCrosslistLookup(q.data) : undefined),
    [q.data],
  );

  return { lookup, isLoading: q.isLoading };
}
