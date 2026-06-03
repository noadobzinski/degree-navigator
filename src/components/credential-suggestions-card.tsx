import { Link } from "@tanstack/react-router";
import { Lightbulb, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { CredentialSuggestion } from "@/lib/credential-suggestions";

type CredentialSuggestionsCardProps = {
  suggestions: CredentialSuggestion[];
};

export function CredentialSuggestionsCard({ suggestions }: CredentialSuggestionsCardProps) {
  if (suggestions.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <CardTitle className="font-serif text-lg">Within reach</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Based on courses you've already added, these credentials look easy to finish before
              graduation. Add them in Settings to track them on your dashboard.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((s) => (
          <div
            key={`${s.kind}-${s.id}`}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{s.name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {s.kind === "certificate" ? "Certificate" : "Double major"}
                  </Badge>
                </div>
                {s.department ? (
                  <p className="text-xs text-muted-foreground">{s.department}</p>
                ) : null}
              </div>
              <Badge variant={s.remainingCount === 0 ? "default" : "outline"}>
                {s.satisfiedCount}/{s.totalCount} met
              </Badge>
            </div>
            <Progress value={s.progressPct} className="mt-3 h-1.5" />
            <p className="mt-2 text-sm text-muted-foreground">{s.summary}</p>
            {s.kind === "double_major" && s.overlapCount != null && s.overlapCount > 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {s.overlapCount} overlapping{" "}
                {s.overlapCount === 1 ? "course" : "courses"} with your primary major
                {s.overlapWithinLimit ? " (allowed)" : " — may exceed Yale's overlap limit"}.
              </p>
            ) : null}
          </div>
        ))}
        <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
          <Link to="/settings">
            Add in Settings
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
