// Yale-style distributional & skills tags.
export const DISTRIBUTIONAL = {
  Hu: { code: "Hu", label: "Humanities & Arts", color: "#a23a3a" },
  So: { code: "So", label: "Social Sciences", color: "#3a7a4f" },
  Sc: { code: "Sc", label: "Sciences", color: "#00356b" },
} as const;

export const SKILLS = {
  QR: { code: "QR", label: "Quantitative Reasoning" },
  WR: { code: "WR", label: "Writing" },
  L1: { code: "L1", label: "Foreign Language L1" },
  L2: { code: "L2", label: "Foreign Language L2" },
  L3: { code: "L3", label: "Foreign Language L3" },
  L4: { code: "L4", label: "Foreign Language L4" },
  L5: { code: "L5", label: "Foreign Language L5" },
} as const;

export type DistributionalCode = keyof typeof DISTRIBUTIONAL;
export type SkillCode = keyof typeof SKILLS;

// Yale College graduation: 36 credits, plus distributional reqs.
export const GRADUATION_CREDITS = 36;

export const DISTRIBUTIONAL_REQUIREMENTS = [
  { id: "hu", label: "Humanities & Arts (Hu)", tag: "Hu", count: 2 },
  { id: "so", label: "Social Sciences (So)", tag: "So", count: 2 },
  { id: "sc", label: "Sciences (Sc)", tag: "Sc", count: 2 },
  { id: "qr", label: "Quantitative Reasoning (QR)", tag: "QR", count: 2 },
  { id: "wr", label: "Writing (WR)", tag: "WR", count: 2 },
  {
    id: "lang",
    label: "Foreign Language",
    tag: "L_ANY",
    count: 1,
    description:
      "Demonstrate proficiency through L4 or L5, or complete one course beyond L4.",
  },
] as const;
