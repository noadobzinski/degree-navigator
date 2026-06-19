import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

/** Yale CAS linking is disabled — CourseTable catalog is public without NetID. */
export const Route = createFileRoute("/coursetable/callback")({
  head: () => ({ meta: [{ title: "CourseTable — Decree" }] }),
  component: CourseTableCallbackPage,
});

function CourseTableCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="font-serif">Yale NetID not required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm text-muted-foreground">
          <p>
            Decree loads the full Yale course catalog from CourseTable automatically — no Yale CAS
            sign-in needed.
          </p>
          <p>Sign in with Google or email to save your degree audit.</p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/catalog">Browse courses</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
