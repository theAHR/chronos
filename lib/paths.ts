/** Base path for GitHub Pages (e.g. `/chronos`). Empty for root deployments. */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** Prefix a public asset path with the configured base path. */
export function assetPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${basePath}${normalized}`
}
