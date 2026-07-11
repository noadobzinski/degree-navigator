import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCourseTableCatalogMeta, searchCourseTableCatalog } from "@/lib/coursetable.functions";
import { currentSeasonCode } from "@/lib/coursetable";
import { renumberingMapKey } from "@/hooks/use-course-renumbering";
import { getRenumberingMap } from "@/lib/coursetable.functions";

export const coursetableMetaKey = ["coursetable-meta"] as const;
export const coursetableCatalogKey = (query = "", season?: string) =>
  ["coursetable-catalog", season ?? "current", query] as const;

const isBrowser = typeof window !== "undefined";

/** Warm CourseTable catalog as soon as the user enters the app — no NetID step. */
export function usePrefetchCourseTableCatalog() {
  const qc = useQueryClient();
  const metaFn = useServerFn(getCourseTableCatalogMeta);
  const searchFn = useServerFn(searchCourseTableCatalog);
  const renumberingFn = useServerFn(getRenumberingMap);

  useEffect(() => {
    if (!isBrowser) return;
    void qc.prefetchQuery({
      queryKey: coursetableMetaKey,
      queryFn: () => metaFn(),
      staleTime: 60 * 60 * 1000,
    });
    void qc.prefetchQuery({
      queryKey: coursetableCatalogKey("", undefined),
      queryFn: () => searchFn({ data: { limit: 100 } }),
      staleTime: 5 * 60 * 1000,
    });
    void qc.prefetchQuery({
      queryKey: renumberingMapKey,
      queryFn: () => renumberingFn(),
      staleTime: 60 * 60 * 1000,
    });
  }, [qc, metaFn, searchFn, renumberingFn]);
}

export function useCourseTableCatalogMeta() {
  const metaFn = useServerFn(getCourseTableCatalogMeta);
  return useQuery({
    queryKey: coursetableMetaKey,
    queryFn: () => metaFn(),
    enabled: isBrowser,
    staleTime: 60 * 60 * 1000,
    retry: 2,
  });
}

export function useCourseTableCatalogSearch(query: string, limit = 50, season?: string) {
  const searchFn = useServerFn(searchCourseTableCatalog);
  const seasonCode = season ?? currentSeasonCode();
  return useQuery({
    queryKey: coursetableCatalogKey(query, seasonCode),
    queryFn: () =>
      searchFn({
        data: { query: query || undefined, limit, season: seasonCode },
      }),
    enabled: isBrowser,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/** Profile and course queries need a browser session token — skip during SSR. */
export function useClientQueryEnabled() {
  return isBrowser;
}
