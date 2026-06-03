import type { Major, MajorConcentration, MajorRequirements } from "./types";

export function concentrationsForMajor(
  major: Major | undefined,
  degree: "BA" | "BS",
): MajorConcentration[] {
  if (!major?.concentrations?.length) return [];
  return major.concentrations.filter(
    (c) => !c.degrees?.length || c.degrees.includes(degree),
  );
}

export function resolveMajorRequirements(
  major: Major | undefined,
  degree: "BA" | "BS",
  concentrationId?: string | null,
): MajorRequirements | null {
  if (!major) return null;
  const base = major.requirements[degree] ?? Object.values(major.requirements)[0];
  if (!base) return null;
  if (!concentrationId) return base;
  const conc = major.concentrations?.find((c) => c.id === concentrationId);
  if (!conc) return base;
  if (conc.degrees?.length && !conc.degrees.includes(degree)) return base;
  return conc.requirements[degree] ?? conc.requirements[major.defaultDegree] ?? base;
}
