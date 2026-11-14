// Global identity resolution - plain JS core.
//
// Lives in .mjs so it can be imported by the Vite app (via identity.ts) and
// by the Node test runner (server/test/identity.test.mjs) without a build step.
//
// The identity (name, email, phone, GitHub, LinkedIn) is not translated: it is
// stored once and shared by every language, so editing it in the admin updates
// the header, hero, footer and contact section on all locales at once.

/**
 * The factory defaults for the global identity.
 * One copy is referenced by every locale file.
 */
export const DEFAULT_IDENTITY = {
  displayName: 'Pham Minh Nhat',
  email: 'nhatprx@gmail.com',
  phone: '+84 879 888 965',
  githubUrl: 'https://github.com/nhatprx',
  linkedinUrl: 'https://www.linkedin.com/in/nhatprx/',
}

/**
 * Picks the single global identity out of a per-language override payload.
 *
 * Every language may carry a stale copy of the identity, so the first
 * language that has one wins and the rest are ignored. A missing field falls
 * back to the default, so a partial override never blanks the site.
 *
 * @param {Record<string, {identity?: Partial<typeof DEFAULT_IDENTITY>} | undefined>} parsed
 * @param {string[]} langOrder The languages to scan, in priority order.
 */
export function resolveIdentity(parsed, langOrder) {
  for (const code of langOrder) {
    const custom = parsed?.[code]?.identity
    if (!custom) continue
    // Only use S3 data, no fallback to defaults
    return {
      displayName: custom.displayName,
      email: custom.email,
      phone: custom.phone,
      githubUrl: custom.githubUrl,
      linkedinUrl: custom.linkedinUrl,
    }
  }
  // No custom data found in S3 - return empty object (debug mode)
  return {}
}
