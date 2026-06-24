// Seed catalog of Yale courses. Curated subset; users can also add custom courses.
// Distributional tags: Hu | So | Sc.   Skill tags: QR | WR | L1..L5.

export type CatalogCourse = {
  code: string;
  title: string;
  credits: number; // Yale uses 1.0 per course typically
  distributional: ("Hu" | "So" | "Sc")[];
  skills: ("QR" | "WR" | "L1" | "L2" | "L3" | "L4" | "L5")[];
  subject: string;
  /** Other Yale course codes for the same offering (from CourseTable listings). */
  crosslistedCodes?: string[];
  /** YCPS course attributes from CourseTable (e.g. "YC Quantum Elective"). */
  ycAttributes?: string[];
  /**
   * Course prerequisites parsed from the CourseTable `requirements`/description
   * text. A list of AND-groups, each holding OR alternatives — satisfied when
   * at least one code in every group has been taken/planned. See
   * `@/lib/prerequisites`.
   */
  prerequisites?: string[][];
  /** Raw prerequisite/requirements text from CourseTable, for display. */
  requirementsText?: string;
};

export const CATALOG: CatalogCourse[] = [
  // ── Computer Science ──
  { code: "CPSC 100", title: "Introduction to Computing and Programming", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "CPSC" },
  { code: "CPSC 201", title: "Introduction to Computer Science", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "CPSC" },
  { code: "CPSC 202", title: "Mathematical Tools for Computer Science", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "CPSC" },
  { code: "CPSC 223", title: "Data Structures and Programming Techniques", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "CPSC" },
  { code: "CPSC 323", title: "Introduction to Systems Programming", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "CPSC" },
  { code: "CPSC 365", title: "Design and Analysis of Algorithms", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "CPSC" },
  { code: "CPSC 421", title: "Compilers and Interpreters", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "CPSC" },
  { code: "CPSC 437", title: "Database Systems", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "CPSC" },
  { code: "CPSC 470", title: "Artificial Intelligence", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "CPSC" },
  { code: "CPSC 477", title: "Natural Language Processing", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "CPSC" },
  { code: "CPSC 490", title: "Senior Project", credits: 1, distributional: ["Sc"], skills: ["QR", "WR"], subject: "CPSC" },

  // ── Math ──
  { code: "MATH 112", title: "Calculus of Functions of One Variable I", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "MATH" },
  { code: "MATH 115", title: "Calculus of Functions of One Variable II", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "MATH" },
  { code: "MATH 120", title: "Calculus of Functions of Several Variables", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "MATH" },
  { code: "MATH 222", title: "Linear Algebra with Applications", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "MATH" },
  { code: "MATH 225", title: "Linear Algebra", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "MATH" },
  { code: "MATH 230", title: "Vector Calculus and Linear Algebra", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "MATH" },
  { code: "MATH 244", title: "Discrete Mathematics", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "MATH" },
  { code: "MATH 250", title: "Vector Analysis", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "MATH" },
  { code: "MATH 305", title: "Real Analysis", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "MATH" },
  { code: "MATH 350", title: "Abstract Algebra", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "MATH" },

  // ── Statistics ──
  { code: "S&DS 100", title: "Introductory Statistics", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "S&DS" },
  { code: "S&DS 220", title: "Engineering Statistics", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "S&DS" },
  { code: "S&DS 230", title: "Data Exploration and Analysis", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "S&DS" },
  { code: "S&DS 241", title: "Probability Theory", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "S&DS" },
  { code: "S&DS 242", title: "Theory of Statistics", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "S&DS" },

  // ── Biology / MCDB / EEB ──
  { code: "BIOL 101", title: "Biochemistry & Biophysics", credits: 0.5, distributional: ["Sc"], skills: ["QR"], subject: "BIOL" },
  { code: "BIOL 102", title: "Principles of Cell Biology", credits: 0.5, distributional: ["Sc"], skills: ["QR"], subject: "BIOL" },
  { code: "BIOL 103", title: "Genetics and Development", credits: 0.5, distributional: ["Sc"], skills: ["QR"], subject: "BIOL" },
  { code: "BIOL 104", title: "Principles of Ecology and Evolutionary Biology", credits: 0.5, distributional: ["Sc"], skills: ["QR"], subject: "BIOL" },
  { code: "MCDB 200", title: "Molecular Biology", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "MCDB" },
  { code: "MCDB 202", title: "Genetics", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "MCDB" },
  { code: "MCDB 205", title: "Cellular and Developmental Biology", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "MCDB" },
  { code: "MCDB 310", title: "Biochemistry", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "MCDB" },
  { code: "EEB 220", title: "General Ecology", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "EEB" },
  { code: "EEB 225", title: "Biostatistics", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "EEB" },

  // ── Chemistry ──
  { code: "CHEM 161", title: "General Chemistry I", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "CHEM" },
  { code: "CHEM 165", title: "General Chemistry II", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "CHEM" },
  { code: "CHEM 174", title: "General Chemistry Lab I", credits: 0.5, distributional: ["Sc"], skills: [], subject: "CHEM" },
  { code: "CHEM 175", title: "General Chemistry Lab II", credits: 0.5, distributional: ["Sc"], skills: [], subject: "CHEM" },
  { code: "CHEM 220", title: "Organic Chemistry I", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "CHEM" },
  { code: "CHEM 221", title: "Organic Chemistry II", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "CHEM" },
  { code: "CHEM 222", title: "Organic Chemistry Lab", credits: 0.5, distributional: ["Sc"], skills: [], subject: "CHEM" },
  { code: "CHEM 332", title: "Physical Chemistry", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "CHEM" },

  // ── Physics ──
  { code: "PHYS 170", title: "University Physics for the Life Sciences I", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "PHYS" },
  { code: "PHYS 171", title: "University Physics for the Life Sciences II", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "PHYS" },
  { code: "PHYS 180", title: "University Physics I", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "PHYS" },
  { code: "PHYS 181", title: "University Physics II", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "PHYS" },
  { code: "PHYS 200", title: "Fundamentals of Physics I", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "PHYS" },
  { code: "PHYS 201", title: "Fundamentals of Physics II", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "PHYS" },

  // ── Economics ──
  { code: "ECON 108", title: "Introductory Microeconomics", credits: 1, distributional: ["So"], skills: ["QR"], subject: "ECON" },
  { code: "ECON 110", title: "An Introduction to Microeconomic Analysis", credits: 1, distributional: ["So"], skills: ["QR"], subject: "ECON" },
  { code: "ECON 111", title: "An Introduction to Macroeconomic Analysis", credits: 1, distributional: ["So"], skills: ["QR"], subject: "ECON" },
  { code: "ECON 121", title: "Intermediate Microeconomics", credits: 1, distributional: ["So"], skills: ["QR"], subject: "ECON" },
  { code: "ECON 122", title: "Intermediate Macroeconomics", credits: 1, distributional: ["So"], skills: ["QR"], subject: "ECON" },
  { code: "ECON 131", title: "Econometrics and Data Analysis I", credits: 1, distributional: ["So"], skills: ["QR"], subject: "ECON" },
  { code: "ECON 132", title: "Econometrics and Data Analysis II", credits: 1, distributional: ["So"], skills: ["QR"], subject: "ECON" },
  { code: "ECON 351", title: "Financial Markets", credits: 1, distributional: ["So"], skills: [], subject: "ECON" },
  { code: "ECON 365", title: "Game Theory", credits: 1, distributional: ["So"], skills: ["QR"], subject: "ECON" },
  { code: "ECON 467", title: "Senior Essay", credits: 1, distributional: ["So"], skills: ["WR"], subject: "ECON" },

  // ── Political Science ──
  { code: "PLSC 113", title: "Introduction to American Politics", credits: 1, distributional: ["So"], skills: ["WR"], subject: "PLSC" },
  { code: "PLSC 114", title: "Introduction to Political Philosophy", credits: 1, distributional: ["Hu"], skills: ["WR"], subject: "PLSC" },
  { code: "PLSC 118", title: "The Moral Foundations of Politics", credits: 1, distributional: ["Hu"], skills: ["WR"], subject: "PLSC" },
  { code: "PLSC 121", title: "International Relations", credits: 1, distributional: ["So"], skills: ["WR"], subject: "PLSC" },
  { code: "PLSC 215", title: "Constitutional Law", credits: 1, distributional: ["So"], skills: ["WR"], subject: "PLSC" },
  { code: "PLSC 271", title: "Political Theory", credits: 1, distributional: ["Hu"], skills: ["WR"], subject: "PLSC" },

  // ── English ──
  { code: "ENGL 114", title: "Writing Seminars", credits: 1, distributional: ["Hu"], skills: ["WR"], subject: "ENGL" },
  { code: "ENGL 115", title: "Reading & Writing the Modern Essay", credits: 1, distributional: ["Hu"], skills: ["WR"], subject: "ENGL" },
  { code: "ENGL 125", title: "Major English Poets I", credits: 1, distributional: ["Hu"], skills: ["WR"], subject: "ENGL" },
  { code: "ENGL 126", title: "Major English Poets II", credits: 1, distributional: ["Hu"], skills: ["WR"], subject: "ENGL" },
  { code: "ENGL 200", title: "Shakespeare", credits: 1, distributional: ["Hu"], skills: ["WR"], subject: "ENGL" },
  { code: "ENGL 220", title: "Literary Theory", credits: 1, distributional: ["Hu"], skills: ["WR"], subject: "ENGL" },
  { code: "ENGL 491", title: "Senior Essay", credits: 1, distributional: ["Hu"], skills: ["WR"], subject: "ENGL" },

  // ── History ──
  { code: "HIST 116", title: "The Early Middle Ages", credits: 1, distributional: ["Hu"], skills: ["WR"], subject: "HIST" },
  { code: "HIST 119", title: "The Civil War & Reconstruction Era", credits: 1, distributional: ["Hu"], skills: ["WR"], subject: "HIST" },
  { code: "HIST 136", title: "European Intellectual History", credits: 1, distributional: ["Hu"], skills: ["WR"], subject: "HIST" },
  { code: "HIST 220", title: "Modern China", credits: 1, distributional: ["Hu"], skills: ["WR"], subject: "HIST" },
  { code: "HIST 271", title: "Modern Latin America", credits: 1, distributional: ["Hu"], skills: ["WR"], subject: "HIST" },

  // ── Psychology ──
  { code: "PSYC 110", title: "Introduction to Psychology", credits: 1, distributional: ["So"], skills: [], subject: "PSYC" },
  { code: "PSYC 158", title: "Behavioral Neuroscience", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "PSYC" },
  { code: "PSYC 200", title: "Statistics", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "PSYC" },
  { code: "PSYC 230", title: "Developmental Psychology", credits: 1, distributional: ["So"], skills: [], subject: "PSYC" },
  { code: "PSYC 258", title: "Cognitive Neuroscience", credits: 1, distributional: ["Sc"], skills: ["QR"], subject: "PSYC" },

  // ── Languages (sample) ──
  { code: "SPAN 110", title: "Elementary Spanish I", credits: 1, distributional: [], skills: ["L1"], subject: "SPAN" },
  { code: "SPAN 120", title: "Elementary Spanish II", credits: 1, distributional: [], skills: ["L2"], subject: "SPAN" },
  { code: "SPAN 130", title: "Intermediate Spanish I", credits: 1, distributional: [], skills: ["L3"], subject: "SPAN" },
  { code: "SPAN 140", title: "Intermediate Spanish II", credits: 1, distributional: ["Hu"], skills: ["L4"], subject: "SPAN" },
  { code: "SPAN 150", title: "Advanced Spanish", credits: 1, distributional: ["Hu"], skills: ["L5"], subject: "SPAN" },
  { code: "FREN 110", title: "Elementary French I", credits: 1, distributional: [], skills: ["L1"], subject: "FREN" },
  { code: "FREN 130", title: "Intermediate French I", credits: 1, distributional: [], skills: ["L3"], subject: "FREN" },
  { code: "FREN 140", title: "Intermediate French II", credits: 1, distributional: ["Hu"], skills: ["L4"], subject: "FREN" },
  { code: "CHIN 110", title: "Elementary Modern Chinese", credits: 1, distributional: [], skills: ["L1"], subject: "CHIN" },
  { code: "CHIN 140", title: "Intermediate Modern Chinese II", credits: 1, distributional: ["Hu"], skills: ["L4"], subject: "CHIN" },
  { code: "LATN 110", title: "Elementary Latin", credits: 1, distributional: [], skills: ["L1"], subject: "LATN" },
  { code: "LATN 140", title: "Advanced Latin Prose", credits: 1, distributional: ["Hu"], skills: ["L4"], subject: "LATN" },

  // ── Philosophy ──
  { code: "PHIL 115", title: "First-Order Logic", credits: 1, distributional: ["Hu"], skills: ["QR"], subject: "PHIL" },
  { code: "PHIL 175", title: "Introduction to Ethics", credits: 1, distributional: ["Hu"], skills: ["WR"], subject: "PHIL" },
  { code: "PHIL 270", title: "Epistemology", credits: 1, distributional: ["Hu"], skills: ["WR"], subject: "PHIL" },

  // ── Sociology ──
  { code: "SOCY 126", title: "Foundations of Modern Social Theory", credits: 1, distributional: ["So"], skills: ["WR"], subject: "SOCY" },
  { code: "SOCY 151", title: "Foundations of Modern Social Thought", credits: 1, distributional: ["So"], skills: ["WR"], subject: "SOCY" },
];

export const CATALOG_BY_CODE: Record<string, CatalogCourse> = Object.fromEntries(
  CATALOG.map((c) => [c.code, c]),
);
