import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { CatalogSeason } from "@/lib/coursetable-seasons";
import type { PlanSkeleton } from "@/lib/schedule-planner";
import { ChevronDown, PencilRuler, RotateCcw } from "lucide-react";

export const DEFAULT_COURSES_PER_TERM = 4;

const LOAD_OPTIONS = [3, 4, 5, 6];
const TERM_OPTIONS = [1, 2, 3, 4, 5, 6];
const TERM_OFF = "off";
const TERM_DEFAULT = "default";

type RoadmapSkeletonEditorProps = {
  seasons: CatalogSeason[];
  skeleton: PlanSkeleton;
  onChange: (next: PlanSkeleton) => void;
};

function termTargetValue(skeleton: PlanSkeleton, code: string): string {
  const target = skeleton.termTargets?.[code];
  if (target == null) return TERM_DEFAULT;
  if (target <= 0) return TERM_OFF;
  return String(target);
}

export function RoadmapSkeletonEditor({ seasons, skeleton, onChange }: RoadmapSkeletonEditorProps) {
  const defaultLoad = skeleton.coursesPerTerm ?? DEFAULT_COURSES_PER_TERM;

  const offCount = Object.values(skeleton.termTargets ?? {}).filter((v) => v <= 0).length;
  const customCount = Object.values(skeleton.termTargets ?? {}).filter((v) => v > 0).length;
  const isCustomized = defaultLoad !== DEFAULT_COURSES_PER_TERM || offCount > 0 || customCount > 0;

  function setDefaultLoad(value: string) {
    if (!value) return;
    onChange({ ...skeleton, coursesPerTerm: Number(value) });
  }

  function setTermTarget(code: string, value: string) {
    const next: Record<string, number> = { ...(skeleton.termTargets ?? {}) };
    if (value === TERM_DEFAULT) {
      delete next[code];
    } else if (value === TERM_OFF) {
      next[code] = 0;
    } else {
      next[code] = Number(value);
    }
    onChange({ ...skeleton, termTargets: next });
  }

  function reset() {
    onChange({ coursesPerTerm: DEFAULT_COURSES_PER_TERM, termTargets: {} });
  }

  return (
    <Collapsible defaultOpen={isCustomized}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 font-serif text-lg">
                <PencilRuler className="h-5 w-5 text-primary" />
                Plan skeleton
              </CardTitle>
              <CardDescription>
                Sketch a rough plan — set how many courses you want per term and mark terms off for
                study abroad or a lighter load. We&rsquo;ll fill in your requirements around it.
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                Customize
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Courses per term</p>
              <ToggleGroup
                type="single"
                variant="outline"
                value={String(defaultLoad)}
                onValueChange={setDefaultLoad}
                className="justify-start"
              >
                {LOAD_OPTIONS.map((n) => (
                  <ToggleGroupItem key={n} value={String(n)} className="px-3">
                    {n}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {seasons.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Per-term overrides</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {seasons.map((season) => (
                    <div
                      key={season.code}
                      className="flex items-center justify-between gap-2 rounded-md border p-2"
                    >
                      <span className="text-sm">{season.label}</span>
                      <Select
                        value={termTargetValue(skeleton, season.code)}
                        onValueChange={(value) => setTermTarget(season.code, value)}
                      >
                        <SelectTrigger className="h-8 w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TERM_DEFAULT}>Default ({defaultLoad})</SelectItem>
                          <SelectItem value={TERM_OFF}>Off / abroad</SelectItem>
                          {TERM_OPTIONS.map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n} course{n === 1 ? "" : "s"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {isCustomized ? (
              <Button variant="ghost" size="sm" className="gap-1" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
                Reset to default
              </Button>
            ) : null}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
