import {
  canonicalCourseCode,
  registerCatalogRenumberingGroups,
  type CatalogRenumberingGroups,
} from "@/lib/course-codes";

/** Wire serialized renumbering groups from the server into client-side matching. */
export function applyRenumberingGroups(groups: CatalogRenumberingGroups) {
  registerCatalogRenumberingGroups(groups);
}

export function deserializeRenumberingGroups(data: string[][]): CatalogRenumberingGroups {
  return data.map((group) => [...new Set(group.map((c) => c.trim().toUpperCase()))]);
}
