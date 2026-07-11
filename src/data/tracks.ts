import type { RequirementSlot } from "./majors";

export type Track = {
  id: string;
  name: string;
  description: string;
  requirements: RequirementSlot[];
};

export const TRACKS: Track[] = [
  {
    id: "premed",
    name: "Premed",
    description: "Coursework commonly required for U.S. medical school admission.",
    requirements: [
      {
        id: "bio",
        label: "Two terms of Biology w/ lab",
        codes: ["BIOL 101", "BIOL 102", "BIOL 103", "BIOL 104"],
        needCount: 2,
      },
      {
        id: "gchem",
        label: "General Chemistry I & II",
        codes: ["CHEM 161", "CHEM 1610", "CHEM 165", "CHEM 1650"],
        needCount: 2,
      },
      {
        id: "gchem_lab",
        label: "General Chemistry Lab",
        codes: [
          "CHEM 174",
          "CHEM 175",
          "CHEM 1340L",
          "CHEM 1360L",
          "CHEM 134L",
          "CHEM 136L",
          "CHEM 1710L",
        ],
        needCount: 1,
      },
      {
        id: "ochem",
        label: "Organic Chemistry I & II",
        codes: ["CHEM 220", "CHEM 2200", "CHEM 221", "CHEM 2210"],
        needCount: 2,
      },
      {
        id: "ochem_lab",
        label: "Organic Chemistry Lab",
        codes: ["CHEM 222", "CHEM 2220", "CHEM 2220L"],
        needCount: 1,
      },
      { id: "biochem", label: "Biochemistry (MCDB 310)", codes: ["MCDB 310"], needCount: 1 },
      {
        id: "phys",
        label: "Physics I & II",
        codes: ["PHYS 170", "PHYS 171", "PHYS 180", "PHYS 181", "PHYS 200", "PHYS 201"],
        needCount: 2,
      },
      {
        id: "math",
        label: "Calculus or Statistics",
        codes: [
          "MATH 112",
          "MATH 1120",
          "MATH 115",
          "MATH 1150",
          "MATH 120",
          "MATH 1200",
          "S&DS 100",
          "EEB 225",
        ],
        needCount: 1,
      },
      {
        id: "writing",
        label: "Two writing-intensive courses",
        requiredSkills: ["WR"],
        needCount: 2,
      },
      { id: "psyc", label: "Psychology (PSYC 110)", codes: ["PSYC 110"], needCount: 1 },
      { id: "soc", label: "Sociology", codes: ["SOCY 126", "SOCY 151"], needCount: 1 },
    ],
  },
  {
    id: "prelaw",
    name: "Prelaw",
    description:
      "There's no required prelaw major; this is an advising track of skill-building courses.",
    requirements: [
      {
        id: "writing",
        label: "Two writing-intensive courses",
        codePrefix: ["ENGL", "HIST", "PLSC"],
        requiredSkills: ["WR"],
        needCount: 2,
      },
      {
        id: "logic",
        label: "Logic or critical reasoning",
        codes: ["PHIL 115", "PHIL 175"],
        needCount: 1,
      },
      {
        id: "amgov",
        label: "American government / constitutional law",
        codes: ["PLSC 113", "PLSC 215"],
        needCount: 1,
      },
      { id: "history", label: "U.S. or world history", codePrefix: ["HIST"], needCount: 2 },
      {
        id: "philosophy",
        label: "Ethics / political theory",
        codes: ["PHIL 175", "PLSC 114", "PLSC 118", "PLSC 271"],
        needCount: 1,
      },
      { id: "econ", label: "Microeconomics", codes: ["ECON 108", "ECON 110"], needCount: 1 },
      {
        id: "speaking",
        label: "Public speaking / advanced seminar",
        codePrefix: ["PLSC", "ENGL"],
        minLevel: 300,
        needCount: 1,
      },
    ],
  },
  {
    id: "prevet",
    name: "Prevet",
    description: "Coursework commonly required for veterinary school admission.",
    requirements: [
      {
        id: "bio",
        label: "Two terms of Biology w/ lab",
        codes: ["BIOL 101", "BIOL 102", "BIOL 103", "BIOL 104"],
        needCount: 2,
      },
      {
        id: "gchem",
        label: "General Chemistry I & II",
        codes: ["CHEM 161", "CHEM 165"],
        needCount: 2,
      },
      {
        id: "ochem",
        label: "Organic Chemistry I & II",
        codes: ["CHEM 220", "CHEM 221"],
        needCount: 2,
      },
      { id: "biochem", label: "Biochemistry", codes: ["MCDB 310"], needCount: 1 },
      {
        id: "phys",
        label: "Physics I & II",
        codes: ["PHYS 170", "PHYS 171", "PHYS 180", "PHYS 181"],
        needCount: 2,
      },
      {
        id: "math",
        label: "Calculus or Statistics",
        codes: ["MATH 112", "MATH 115", "S&DS 100", "EEB 225"],
        needCount: 1,
      },
      {
        id: "ecology",
        label: "Ecology / Zoology elective",
        codes: ["EEB 220", "BIOL 104"],
        needCount: 1,
      },
      { id: "writing", label: "Writing course", codes: ["ENGL 114", "ENGL 115"], needCount: 1 },
    ],
  },
  {
    id: "none",
    name: "No track",
    description: "Just focus on major and distributional requirements.",
    requirements: [],
  },
];

export const TRACKS_BY_ID: Record<string, Track> = Object.fromEntries(TRACKS.map((t) => [t.id, t]));
