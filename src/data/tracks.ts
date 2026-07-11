import type { RequirementSlot } from "./majors";

/**
 * Non-course milestone for a pre-professional track (clinical experience,
 * shadowing, admissions-exam prep, etc.). These can't be satisfied by Yale
 * coursework, so they're surfaced as a checklist rather than audited.
 */
export type TrackMilestone = {
  id: string;
  label: string;
  description?: string;
  /** When this is typically done, e.g. "Summer after sophomore year". */
  timing?: string;
};

export type Track = {
  id: string;
  name: string;
  description: string;
  requirements: RequirementSlot[];
  /** Summer / extracurricular milestones recommended for this track. */
  milestones?: TrackMilestone[];
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
    milestones: [
      {
        id: "clinical",
        label: "Clinical experience",
        description:
          "Hands-on patient-facing hours (scribe, EMT, CNA, medical assistant, hospital volunteer).",
        timing: "Summers / during term, year-round",
      },
      {
        id: "shadowing",
        label: "Physician shadowing",
        description:
          "Shadow physicians across specialties (aim for 40–100+ hours, ideally a mix of primary care and specialties).",
        timing: "Summer after first or sophomore year",
      },
      {
        id: "research",
        label: "Research experience",
        description:
          "Bench, clinical, or public-health research; many applicants pursue a summer or term-time lab position.",
        timing: "Summer after sophomore/junior year",
      },
      {
        id: "service",
        label: "Community service / volunteering",
        description: "Sustained non-clinical volunteering that shows commitment to service.",
        timing: "Ongoing",
      },
      {
        id: "mcat",
        label: "MCAT preparation & exam",
        description:
          "Dedicated MCAT study (commonly 300+ hours) and sit the exam, typically the year before applying.",
        timing: "Summer after junior year",
      },
    ],
  },
  {
    id: "predental",
    name: "Predental",
    description: "Coursework commonly required for U.S. dental school (AADSAS) admission.",
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
        label: "Physics I & II w/ lab",
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
        id: "english",
        label: "Two terms of English / writing",
        requiredSkills: ["WR"],
        needCount: 2,
      },
      { id: "psyc", label: "Psychology (PSYC 110)", codes: ["PSYC 110"], needCount: 1 },
    ],
    milestones: [
      {
        id: "shadowing",
        label: "Dentist shadowing",
        description:
          "Shadow general dentists and specialists (most schools expect ~100 hours across practice types).",
        timing: "Summer after first or sophomore year",
      },
      {
        id: "clinical",
        label: "Clinical / dental-office experience",
        description:
          "Work or volunteer in a dental or healthcare setting (dental assistant, hygiene clinic, hospital).",
        timing: "Summers / during term",
      },
      {
        id: "manual",
        label: "Manual dexterity activity",
        description:
          "Develop and document hand skills (drawing, sculpture, crafts, instruments) — valued in dental admissions.",
        timing: "Ongoing",
      },
      {
        id: "research",
        label: "Research experience",
        description:
          "Optional but strengthens an application; basic-science or clinical/dental research.",
        timing: "Summer after sophomore/junior year",
      },
      {
        id: "dat",
        label: "DAT preparation & exam",
        description:
          "Study for and take the Dental Admission Test (DAT), usually the year before applying.",
        timing: "Summer after junior year",
      },
    ],
  },
  {
    id: "prepa",
    name: "Pre-PA (Physician Assistant)",
    description: "Coursework commonly required for Physician Assistant (CASPA) programs.",
    requirements: [
      {
        id: "bio",
        label: "Two terms of Biology w/ lab",
        codes: ["BIOL 101", "BIOL 102", "BIOL 103", "BIOL 104"],
        needCount: 2,
      },
      {
        id: "anatphys",
        label: "Anatomy & Physiology",
        description:
          "Most PA programs require human anatomy and physiology (often two terms with lab).",
        codes: ["MCDB 205", "MCDB 200", "E&EB 222", "BIOL 104"],
        needCount: 1,
      },
      {
        id: "micro",
        label: "Microbiology",
        codes: ["MCDB 250", "MCDB 200", "MB&B 251"],
        needCount: 1,
      },
      {
        id: "gchem",
        label: "General Chemistry I & II",
        codes: ["CHEM 161", "CHEM 1610", "CHEM 165", "CHEM 1650"],
        needCount: 2,
      },
      {
        id: "ochem_biochem",
        label: "Organic Chemistry or Biochemistry",
        codes: ["CHEM 220", "CHEM 2200", "CHEM 221", "CHEM 2210", "MCDB 310"],
        needCount: 1,
      },
      {
        id: "stats",
        label: "Statistics",
        codes: ["S&DS 100", "S&DS 220", "S&DS 230", "PSYC 200", "EEB 225"],
        needCount: 1,
      },
      {
        id: "psyc",
        label: "Introductory Psychology (PSYC 110)",
        codes: ["PSYC 110"],
        needCount: 1,
      },
      {
        id: "psyc_upper",
        label: "Developmental or Abnormal Psychology",
        codes: ["PSYC 230"],
        codePrefix: ["PSYC"],
        minLevel: 200,
        needCount: 1,
      },
      {
        id: "english",
        label: "Two terms of English / writing",
        requiredSkills: ["WR"],
        needCount: 2,
      },
    ],
    milestones: [
      {
        id: "pce",
        label: "Patient care experience (PCE)",
        description:
          "Hands-on, direct patient-care hours are central to PA admissions (programs often expect 1,000–2,000+ hours as CNA, EMT, MA, scribe, etc.).",
        timing: "Summers & gap time, year-round",
      },
      {
        id: "shadowing",
        label: "PA shadowing",
        description:
          "Shadow certified PAs across settings to confirm fit and meet shadowing requirements.",
        timing: "Summer after sophomore/junior year",
      },
      {
        id: "service",
        label: "Community service / volunteering",
        description: "Sustained volunteering, ideally in healthcare or underserved settings.",
        timing: "Ongoing",
      },
      {
        id: "gre",
        label: "GRE preparation & exam (if required)",
        description:
          "Many PA programs require the GRE; prepare and take it before applying via CASPA.",
        timing: "Summer after junior year",
      },
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
    milestones: [
      {
        id: "internship",
        label: "Legal / policy internship",
        description:
          "Intern at a law firm, court, government office, nonprofit, or legal-aid clinic.",
        timing: "Summer after sophomore/junior year",
      },
      {
        id: "lsat",
        label: "LSAT preparation & exam",
        description: "Dedicated LSAT prep and exam, typically the year before applying.",
        timing: "Summer after junior year",
      },
      {
        id: "leadership",
        label: "Leadership & extracurriculars",
        description:
          "Debate, mock trial, student government, journalism, or other sustained leadership.",
        timing: "Ongoing",
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
    milestones: [
      {
        id: "vet_hours",
        label: "Veterinary experience",
        description:
          "Hours under a licensed veterinarian (small animal, large animal, exotics); many schools expect hundreds of hours across settings.",
        timing: "Summers / during term",
      },
      {
        id: "animal",
        label: "Animal experience",
        description:
          "Hands-on animal handling (farms, shelters, kennels, research) beyond direct vet supervision.",
        timing: "Summers / during term",
      },
      {
        id: "research",
        label: "Research experience",
        description: "Optional but valued; biological, animal, or clinical research.",
        timing: "Summer after sophomore/junior year",
      },
      {
        id: "gre",
        label: "GRE preparation & exam (if required)",
        description:
          "Some veterinary programs require the GRE; prepare and take it before applying via VMCAS.",
        timing: "Summer after junior year",
      },
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
