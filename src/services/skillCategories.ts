import type { SkillGroup } from '../data/translations'
import { mergeSkillCategories as merge } from './skillCategories.mjs'

/** A saved category may be missing the layout fields; the merge owns those. */
export type SavedSkillCategory = Partial<SkillGroup> & { title: string }

/**
 * Typed wrapper around the shared skill-category merge.
 *
 * The implementation lives in `skillCategories.mjs` so the Node test runner
 * can import it directly; this file only adds the TypeScript types.
 */
export function mergeSkillCategories(
  baseCategories: SkillGroup[],
  customCategories?: SavedSkillCategory[]
): SkillGroup[] {
  return merge(baseCategories, customCategories as Parameters<typeof merge>[1]) as SkillGroup[]
}
