import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAuditCatalog } from "@/lib/coursetable.functions";
import type { AuditCatalogByCode } from "@/lib/catalog-cache";

export function useAuditCatalog(enabled: boolean): {
  catalogByCode: AuditCatalogByCode | undefined;
  isLoading: boolean;
} {
  const fn = useServerFn(getAuditCatalog);
  const q = useQuery({
    queryKey: ["audit-catalog"],
    queryFn: () => fn(),
    enabled: enabled && typeof window !== "undefined",
    staleTime: 60 * 60 * 1000,
    retry: 1,
    select: (data) => data.catalogByCode,
  });

  return { catalogByCode: q.data, isLoading: q.isLoading };
}
