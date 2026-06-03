/** Expand Yale roadmap codes to include CourseTable 4-digit variants. */
export function y(codes: string[]): string[] {
  const out = new Set<string>();
  for (const code of codes) {
    out.add(code);
    const m = code.match(/^([A-Z&]+)\s+(\d{3})$/);
    if (m) out.add(`${m[1]} ${m[2]}0`);
    const m4 = code.match(/^([A-Z&]+)\s+(\d{4})$/);
    if (m4) out.add(`${m4[1]} ${m4[2].slice(0, 3)}`);
  }
  return [...out];
}
