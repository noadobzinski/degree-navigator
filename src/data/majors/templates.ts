import type { Major, MajorRequirements, RequirementSlot } from "./types";

function seniorSlot(prefix: string): RequirementSlot {
  return {
    id: "senior",
    label: "Senior requirement",
    codePrefix: [prefix],
    minLevel: 490,
    needCount: 1,
  };
}

function deptElectives(prefix: string, count: number, label?: string): RequirementSlot {
  return {
    id: "electives",
    label: label ?? `${prefix} electives`,
    codePrefix: [prefix],
    needCount: count,
  };
}

function buildBaReqs(
  prefix: string,
  totalCourses: number,
  core: RequirementSlot[],
  opts?: { prerequisites?: RequirementSlot[]; senior?: RequirementSlot[] },
): MajorRequirements {
  const coreCount = core.reduce((n, s) => n + s.needCount, 0);
  const seniorCount = (opts?.senior ?? [seniorSlot(prefix)]).reduce((n, s) => n + s.needCount, 0);
  const prereqCount = (opts?.prerequisites ?? []).reduce((n, s) => n + s.needCount, 0);
  const electiveCount = Math.max(0, totalCourses - coreCount - seniorCount - prereqCount);
  if (electiveCount > 0) {
    core.push(deptElectives(prefix, electiveCount));
  }
  return {
    totalCourses,
    prerequisites: opts?.prerequisites,
    core,
    senior: opts?.senior ?? [seniorSlot(prefix)],
  };
}

export function standardBaMajor(opts: {
  id: string;
  roadmapCode: string;
  name: string;
  department: string;
  totalCourses: number;
  codePrefix: string;
  introCount?: number;
  advancedCount?: number;
  notes?: string;
  prerequisites?: RequirementSlot[];
}): Major {
  const intro = opts.introCount ?? 2;
  const advanced = opts.advancedCount ?? 2;
  const core: RequirementSlot[] = [
    {
      id: "intro",
      label: `Introductory ${opts.roadmapCode} courses`,
      codePrefix: [opts.codePrefix],
      maxLevel: 1999,
      needCount: intro,
    },
    {
      id: "advanced",
      label: `Advanced ${opts.roadmapCode} courses (2000+)`,
      codePrefix: [opts.codePrefix],
      minLevel: 200,
      needCount: advanced,
    },
  ];
  return {
    id: opts.id,
    roadmapCode: opts.roadmapCode,
    name: opts.name,
    department: opts.department,
    degrees: ["BA"],
    defaultDegree: "BA",
    notes: opts.notes,
    requirements: {
      BA: buildBaReqs(opts.codePrefix, opts.totalCourses, core, {
        prerequisites: opts.prerequisites,
      }),
    },
  };
}

export function standardBaBsMajor(opts: {
  id: string;
  roadmapCode: string;
  name: string;
  department: string;
  codePrefix: string;
  baTotal: number;
  bsTotal: number;
  baIntro?: number;
  bsIntro?: number;
  notes?: string;
  baPrerequisites?: RequirementSlot[];
  bsPrerequisites?: RequirementSlot[];
  defaultDegree?: "BA" | "BS";
}): Major {
  const baIntro = opts.baIntro ?? 2;
  const bsIntro = opts.bsIntro ?? 3;
  const baCore: RequirementSlot[] = [
    {
      id: "intro",
      label: `Introductory ${opts.roadmapCode} courses`,
      codePrefix: [opts.codePrefix],
      maxLevel: 1999,
      needCount: baIntro,
    },
    {
      id: "advanced",
      label: `Advanced ${opts.roadmapCode} courses`,
      codePrefix: [opts.codePrefix],
      minLevel: 200,
      needCount: 2,
    },
  ];
  const bsCore: RequirementSlot[] = [
    {
      id: "intro",
      label: `Core ${opts.roadmapCode} courses`,
      codePrefix: [opts.codePrefix],
      needCount: bsIntro,
    },
    {
      id: "advanced",
      label: `Advanced ${opts.roadmapCode} courses (300+)`,
      codePrefix: [opts.codePrefix],
      minLevel: 300,
      needCount: 3,
    },
  ];
  const baElectives = Math.max(0, opts.baTotal - baCore.reduce((n, s) => n + s.needCount, 0) - 1);
  const bsElectives = Math.max(0, opts.bsTotal - bsCore.reduce((n, s) => n + s.needCount, 0) - 1);
  return {
    id: opts.id,
    roadmapCode: opts.roadmapCode,
    name: opts.name,
    department: opts.department,
    degrees: ["BA", "BS"],
    defaultDegree: opts.defaultDegree ?? "BA",
    notes: opts.notes,
    requirements: {
      BA: {
        totalCourses: opts.baTotal,
        prerequisites: opts.baPrerequisites,
        core: baElectives > 0 ? [...baCore, deptElectives(opts.codePrefix, baElectives)] : baCore,
        senior: [seniorSlot(opts.codePrefix)],
      },
      BS: {
        totalCourses: opts.bsTotal,
        prerequisites: opts.bsPrerequisites,
        core:
          bsElectives > 0
            ? [
                ...bsCore,
                deptElectives(opts.codePrefix, bsElectives, `${opts.codePrefix} electives (300+)`),
              ]
            : bsCore,
        senior: [seniorSlot(opts.codePrefix)],
      },
    },
  };
}

export function standardBsMajor(opts: {
  id: string;
  roadmapCode: string;
  name: string;
  department: string;
  totalCourses: number;
  codePrefix: string;
  coreCount?: number;
  notes?: string;
  prerequisites?: RequirementSlot[];
}): Major {
  const coreCount = opts.coreCount ?? 6;
  const electiveCount = Math.max(0, opts.totalCourses - coreCount - 1);
  return {
    id: opts.id,
    roadmapCode: opts.roadmapCode,
    name: opts.name,
    department: opts.department,
    degrees: ["BS"],
    defaultDegree: "BS",
    notes: opts.notes,
    requirements: {
      BS: {
        totalCourses: opts.totalCourses,
        prerequisites: opts.prerequisites,
        core: [
          {
            id: "core",
            label: `Core ${opts.roadmapCode} courses`,
            codePrefix: [opts.codePrefix],
            needCount: coreCount,
          },
          ...(electiveCount > 0 ? [deptElectives(opts.codePrefix, electiveCount)] : []),
        ],
        senior: [seniorSlot(opts.codePrefix)],
      },
    },
  };
}

export function dualDeptMajor(opts: {
  id: string;
  roadmapCode: string;
  name: string;
  department: string;
  degrees: ("BA" | "BS")[];
  defaultDegree: "BA" | "BS";
  totalCourses: number;
  prefixA: string;
  countA: number;
  prefixB: string;
  countB: number;
  notes?: string;
}): Major {
  const seniorCount = 1;
  const remaining = Math.max(0, opts.totalCourses - opts.countA - opts.countB - seniorCount);
  const core: RequirementSlot[] = [
    {
      id: "dept_a",
      label: `${opts.prefixA} courses`,
      codePrefix: [opts.prefixA],
      needCount: opts.countA,
    },
    {
      id: "dept_b",
      label: `${opts.prefixB} courses`,
      codePrefix: [opts.prefixB],
      needCount: opts.countB,
    },
  ];
  const reqs: MajorRequirements = {
    totalCourses: opts.totalCourses,
    core: [
      ...core,
      ...(remaining > 0
        ? [
            {
              id: "electives",
              label: "Additional courses (DUS approval)",
              codePrefix: [opts.prefixA, opts.prefixB],
              needCount: remaining,
            },
          ]
        : []),
    ],
    senior: [
      {
        id: "senior",
        label: "Senior requirement",
        codePrefix: [opts.prefixA, opts.prefixB],
        minLevel: 490,
        needCount: 1,
      },
    ],
  };
  return {
    id: opts.id,
    roadmapCode: opts.roadmapCode,
    name: opts.name,
    department: opts.department,
    degrees: opts.degrees,
    defaultDegree: opts.defaultDegree,
    notes: opts.notes,
    requirements: opts.degrees.includes("BS")
      ? { BS: reqs, ...(opts.degrees.includes("BA") ? { BA: reqs } : {}) }
      : { BA: reqs },
  };
}
