import { resolveWorkTag as resolve } from './workTag.mjs'

/**
 * Typed wrapper around the shared Work-section tag resolver.
 *
 * The implementation lives in `workTag.mjs` so the Node test runner can
 * import it directly; this file only adds the TypeScript types.
 */
export function resolveWorkTag(
  custom: { experience?: { tag?: string }; projects?: { tag?: string } },
  fallback: string
): string {
  return resolve(custom, fallback)
}
