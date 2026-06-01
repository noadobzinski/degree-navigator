import { COURSETABLE_API, type CourseTableAuthCheck } from "@/lib/coursetable";

/** Check Yale NetID session on CourseTable (browser must have completed CAS login). */
export async function checkCourseTableAuth(): Promise<CourseTableAuthCheck> {
  const res = await fetch(`${COURSETABLE_API}/api/auth/check`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Could not verify CourseTable session");
  return res.json() as Promise<CourseTableAuthCheck>;
}

export function startYaleNetIdLogin(callbackPath = "/coursetable/callback"): void {
  const redirect = `${window.location.origin}${callbackPath}`;
  window.location.href = `${COURSETABLE_API}/api/auth/cas?redirect=${encodeURIComponent(redirect)}`;
}
