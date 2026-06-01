import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { checkCourseTableAuth } from "@/lib/coursetable.client";
import { linkCourseTableNetId } from "@/lib/coursetable.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Loader2 } from "lucide-react";

export const Route = createFileRoute("/coursetable/callback")({
  head: () => ({ meta: [{ title: "Yale NetID — BluePath" }] }),
  component: CourseTableCallbackPage,
});

function CourseTableCallbackPage() {
  const linkFn = useServerFn(linkCourseTableNetId);
  const [status, setStatus] = useState<"loading" | "success" | "partial" | "error">("loading");
  const [netId, setNetId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      try {
        const auth = await checkCourseTableAuth();
        if (cancelled) return;

        if (auth.auth && auth.netId) {
          setNetId(auth.netId);
          try {
            await linkFn({
              data: {
                netId: auth.netId,
                email: auth.user?.email ?? null,
              },
            });
            setStatus("success");
            setMessage("Your Yale NetID is linked. The full CourseTable catalog is now available.");
          } catch {
            setStatus("partial");
            setMessage(
              "Yale sign-in succeeded, but BluePath could not save your NetID. Sign in to BluePath first, then try again from Settings.",
            );
          }
          return;
        }

        setStatus("error");
        setMessage(
          "Yale sign-in did not complete. Make sure you finished the Yale CAS login, then try again.",
        );
      } catch {
        if (cancelled) return;
        setStatus("partial");
        setMessage(
          "Yale sign-in may have succeeded, but your browser blocked the session check. The full course catalog still loads via CourseTable — open Settings after signing in to BluePath to confirm your connection.",
        );
      }
    }

    finish();
    return () => {
      cancelled = true;
    };
  }, [linkFn]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {status === "loading" ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <GraduationCap className="h-6 w-6 text-primary" />
            )}
          </div>
          <CardTitle className="font-serif">
            {status === "loading" && "Connecting Yale NetID…"}
            {status === "success" && "Connected to CourseTable"}
            {status === "partial" && "Almost connected"}
            {status === "error" && "Connection failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm text-muted-foreground">
          {status === "loading" ? <p>Verifying your Yale NetID session with CourseTable…</p> : null}
          {status !== "loading" ? <p>{message}</p> : null}
          {netId ? (
            <p className="font-mono text-xs text-foreground">
              NetID: <span className="font-semibold">{netId}</span>
            </p>
          ) : null}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button asChild>
              <Link to="/courses">Browse courses</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/settings" search={{}}>Settings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
