import type { CourseExample } from "@/lib/requirement-examples";
import { courseTableSearchUrl } from "@/lib/coursetable";
import { formatCourseCredits } from "@/lib/course-credits";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

type RequirementExamplesProps = {
  examples: CourseExample[];
  isLoading?: boolean;
  isError?: boolean;
  /** When true, only show suggestions (filled courses shown separately). */
  showSuggestions?: boolean;
};

export function RequirementExamples({
  examples,
  isLoading,
  isError,
  showSuggestions = true,
}: RequirementExamplesProps) {
  if (!showSuggestions) return null;

  if (isLoading) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        Loading course examples from CourseTable…
      </p>
    );
  }

  if (isError) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        Could not load CourseTable examples — try refreshing the page.
      </p>
    );
  }

  if (examples.length === 0) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        No recent catalog matches — check CourseTable or the Yale roadmap for typical courses.
      </p>
    );
  }

  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Examples (CourseTable · recent terms)
      </p>
      <ul className="space-y-1">
        {examples.map((ex) => (
          <li key={ex.code} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs">
            <a
              href={courseTableSearchUrl(ex.code)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline"
            >
              {ex.code}
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
            <span className="truncate text-muted-foreground">{ex.title}</span>
            <span className="text-muted-foreground">{formatCourseCredits(ex.credits)}</span>
            {ex.offeredNow ? (
              <Badge variant="secondary" className="h-4 px-1 text-[9px]">
                This term
              </Badge>
            ) : ex.recentSeasons.length > 0 ? (
              <span className="text-[10px] text-muted-foreground">
                Last seen {ex.recentSeasons[0]}
              </span>
            ) : null}
            {ex.crosslistedAs ? (
              <span className="w-full text-[10px] text-muted-foreground">{ex.crosslistedAs}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
