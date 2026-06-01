import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getCourseTableCatalogMeta,
  searchCourseTableCatalog,
} from "@/lib/coursetable.functions";

export const coursetableMetaKey = ["coursetable-meta"] as const;
export const coursetableCatalogKey = (query = "") => ["coursetable-catalog", query] as const;

const isBrowser = typeof window !== "undefined";

/** Warm CourseTable catalog as soon as the user enters the app — no NetID step. */
export function usePrefetchCourseTableCatalog() {
  const qc = useQueryClient();
  const metaFn = useServerFn(getCourseTableCatalogMeta);
  const searchFn = useServerFn(searchCourseTableCatalog);

  useEffect(() => {
    if (!isBrowser) return;
    void qc.prefetchQuery({
      queryKey: coursetableMetaKey,
      queryFn: () => metaFn(),
      staleTime: 60 * 60 * 1000,
    });
    void qc.prefetchQuery({
      queryKey: coursetableCatalogKey(""),
      queryFn: () => searchFn({ data: { limit: 100 } }),
      staleTime: 5 * 60 * 1000,
    });
  }, [qc, metaFn, searchFn]);
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

export function useCourseTableCatalogSearch(query: string, limit = 50) {
  const searchFn = useServerFn(searchCourseTableCatalog);
  return useQuery({
    queryKey: coursetableCatalogKey(query),
    queryFn: () => searchFn({ data: { query: query || undefined, limit } }),
    enabled: isBrowser,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/** Profile and course queries need a browser session token — skip during SSR. */
export function useClientQueryEnabled() {
  return isBrowser;
}
