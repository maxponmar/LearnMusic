/**
 * cn — tiny className combiner. Filters falsy values and joins with spaces.
 * Avoids pulling in `clsx`/`tailwind-merge` for a single-user app.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
