import type { CourseTableCourse } from "@/lib/coursetable";

export type SeasonCourseRecord = {
  season: string;
  code: string;
  title: string;
  subject: string;
  sameCourseId: number;
};

/** Normalize titles for cross-season matching (CourseTable catalog). */
export function normalizeCourseTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[''""]/g, "")
    .replace(/\s+/g, " ");
}

export function subjectFromCourseCode(code: string): string {
  return code.trim().split(/\s+/)[0]?.toUpperCase() ?? "";
}

export function seasonRecordsFromCourseTable(
  season: string,
  raw: CourseTableCourse[],
): SeasonCourseRecord[] {
  const records: SeasonCourseRecord[] = [];
  for (const entry of raw) {
    const title = entry.title?.trim();
    if (!title) continue;
    for (const listing of entry.listings ?? []) {
      const code = listing.course_code?.replace(/\s+/g, " ").trim().toUpperCase();
      if (!code) continue;
      records.push({
        season,
        code,
        title,
        subject: (listing.subject ?? subjectFromCourseCode(code)).toUpperCase(),
        sameCourseId: entry.same_course_id,
      });
    }
  }
  return records;
}

class UnionFind {
  private parent = new Map<string, string>();

  add(value: string) {
    if (!this.parent.has(value)) this.parent.set(value, value);
  }

  find(value: string): string {
    this.add(value);
    let root = value;
    while (this.parent.get(root) !== root) root = this.parent.get(root)!;
    let cur = value;
    while (this.parent.get(cur) !== root) {
      const next = this.parent.get(cur)!;
      this.parent.set(cur, root);
      cur = next;
    }
    return root;
  }

  union(a: string, b: string) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(rb, ra);
  }

  components(): string[][] {
    const groups = new Map<string, string[]>();
    for (const value of this.parent.keys()) {
      const root = this.find(value);
      const list = groups.get(root) ?? [];
      list.push(value);
      groups.set(root, list);
    }
    return [...groups.values()];
  }
}

const MIN_TITLE_LENGTH = 8;

/**
 * Infer Yale course renumbering (3-digit ↔ 4-digit and other catalog migrations)
 * by matching subject + title across semesters and CourseTable same_course_id.
 */
export function buildRenumberingGroups(records: SeasonCourseRecord[]): string[][] {
  const uf = new UnionFind();

  const bySameCourseId = new Map<number, Set<string>>();
  for (const rec of records) {
    uf.add(rec.code);
    const bucket = bySameCourseId.get(rec.sameCourseId) ?? new Set<string>();
    bucket.add(rec.code);
    bySameCourseId.set(rec.sameCourseId, bucket);
  }

  for (const codes of bySameCourseId.values()) {
    const list = [...codes];
    for (let i = 1; i < list.length; i++) uf.union(list[0], list[i]);
  }

  const byTitle = new Map<string, Map<string, Set<string>>>();
  for (const rec of records) {
    if (normalizeCourseTitle(rec.title).length < MIN_TITLE_LENGTH) continue;
    const titleKey = `${rec.subject}|${normalizeCourseTitle(rec.title)}`;
    if (!byTitle.has(titleKey)) byTitle.set(titleKey, new Map());
    const seasonMap = byTitle.get(titleKey)!;
    if (!seasonMap.has(rec.season)) seasonMap.set(rec.season, new Set());
    seasonMap.get(rec.season)!.add(rec.code);
  }

  for (const seasonMap of byTitle.values()) {
    const allCodes = new Set<string>();
    for (const codes of seasonMap.values()) {
      for (const code of codes) allCodes.add(code);
    }
    const codeList = [...allCodes];
    if (codeList.length < 2) continue;

    for (let i = 0; i < codeList.length; i++) {
      for (let j = i + 1; j < codeList.length; j++) {
        const a = codeList[i];
        const b = codeList[j];
        let sameSeason = false;
        for (const codes of seasonMap.values()) {
          if (codes.has(a) && codes.has(b)) {
            sameSeason = true;
            break;
          }
        }
        if (!sameSeason) uf.union(a, b);
      }
    }
  }

  return uf.components().filter((group) => group.length > 1);
}

export function serializeRenumberingGroups(groups: string[][]): string[][] {
  return groups.map((g) => [...new Set(g.map((c) => c.trim().toUpperCase()))].sort());
}
