export const APP_NAME = "Decree";

export const APP_TAGLINE = "A friendlier Yale degree audit";

export const APP_DEFAULT_TITLE = `${APP_NAME} — Yale Degree Audit`;

export function pageTitle(page: string): string {
  return `${page} — ${APP_NAME}`;
}
