import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  useCourseTableCatalogMeta,
  useCourseTableCatalogSearch,
} from "@/hooks/use-coursetable-catalog";
import { courseTableSearchUrl, currentSeasonCode } from "@/lib/coursetable";
import { recentCatalogSeasons } from "@/lib/coursetable-seasons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Database,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  GraduationCap,
} from "lucide-react";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Yale Course Catalog — Decree" },
      {
        name: "description",
        content:
          "Browse the public Yale course catalog from CourseTable. No Yale NetID or CAS sign-in required.",
      },
    ],
  }),
  component: PublicCatalogPage,
});

function PublicCatalogPage() {
  const metaQ = useCourseTableCatalogMeta();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [catalogSeason, setCatalogSeason] = useState(() => currentSeasonCode());
  const catalogSeasons = useMemo(() => recentCatalogSeasons(12), []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const catalogQ = useCourseTableCatalogSearch(debouncedSearch, 80, catalogSeason);
  const courses = catalogQ.data?.courses ?? [];
  const selectedSeasonLabel =
    catalogSeasons.find((s) => s.code === catalogSeason)?.label ?? catalogSeason;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-serif text-xl font-bold text-primary">Decree</span>
          </Link>
          <Link
            to="/login"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Sign in to track your degree
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <div>
          <h1 className="font-serif text-3xl font-bold">Yale course catalog</h1>
          <p className="mt-2 text-muted-foreground">
            Live data from{" "}
            <a
              href="https://coursetable.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              CourseTable
            </a>
            . Public catalog only — no Yale NetID or CAS sign-in.
          </p>
        </div>

        {catalogQ.isError ? (
          <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div className="flex items-start gap-2 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <p>Could not reach CourseTable right now. Check your connection and try again.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => catalogQ.refetch()}
                disabled={catalogQ.isFetching}
              >
                <RefreshCw
                  className={`mr-1 h-3.5 w-3.5 ${catalogQ.isFetching ? "animate-spin" : ""}`}
                />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
            <CardTitle className="font-serif">Search courses</CardTitle>
            {catalogQ.data ? (
              <Badge variant="secondary" className="gap-1 font-normal">
                <Database className="h-3 w-3" />
                {selectedSeasonLabel} · {(catalogQ.data.total ?? courses.length).toLocaleString()}{" "}
                courses
              </Badge>
            ) : metaQ.isLoading ? (
              <Badge variant="outline" className="font-normal">
                Loading catalog…
              </Badge>
            ) : null}
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="public-catalog-season">Semester</Label>
                <Select value={catalogSeason} onValueChange={setCatalogSeason}>
                  <SelectTrigger id="public-catalog-season">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...catalogSeasons].reverse().map((s) => (
                      <SelectItem key={s.code} value={s.code}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative space-y-1.5">
                <Label htmlFor="public-course-search">Search</Label>
                <Search className="absolute left-3 top-[2.15rem] h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="public-course-search"
                  placeholder="Code, title, or subject (e.g. CPSC 323)"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            {catalogQ.isLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Loading {selectedSeasonLabel} catalog…
              </p>
            ) : null}
            <div className="grid max-h-[min(70vh,560px)] gap-2 overflow-y-auto">
              {courses.map((c) => (
                <div
                  key={c.code}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{c.code}</span>
                      <span className="truncate text-sm text-muted-foreground">{c.title}</span>
                      <a
                        href={courseTableSearchUrl(c.code)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                        title="View on CourseTable"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {c.distributional.map((d) => (
                        <Badge key={d} variant="secondary" className="text-[10px]">
                          {d}
                        </Badge>
                      ))}
                      {c.skills.map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px]">
                          {s}
                        </Badge>
                      ))}
                      <span className="text-[10px] text-muted-foreground">{c.credits} cr</span>
                    </div>
                  </div>
                </div>
              ))}
              {!catalogQ.isLoading && courses.length === 0 && !catalogQ.isError ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No courses match your search.
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-primary hover:underline">
            Create a free account
          </Link>{" "}
          to add courses to your degree audit and roadmap.
        </p>
      </main>
    </div>
  );
}
