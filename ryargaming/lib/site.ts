export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/gaming";

export function sitePath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${normalized}`;
}
