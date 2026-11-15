// Work section tag resolution - plain JS core.
//
// Lives in .mjs so it can be imported by the Vite app and by the Node test
// runner without a build step.
//
// Experience and Projects render as one #work section: the site swaps the
// heading between the two tabs, but the tag above it is shared. The admin
// writes both copies, so the resolver picks the first one that carries a value
// and hands the same tag to both tabs.

/**
 * Picks the single tag for the shared Work section.
 *
 * @param {{experience?: {tag?: string}, projects?: {tag?: string}}} custom
 * @param {string} fallback The factory default tag.
 * @returns {string}
 */
export function resolveWorkTag(custom, fallback) {
  return custom?.experience?.tag || custom?.projects?.tag || fallback
}
