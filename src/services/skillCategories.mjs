// Skill category merging - plain JS core.
//
// Lives in .mjs so the Node test runner can import it directly, the same way
// fieldRules.mjs is shared between the Vite app and the test suite.
//
// Categories are matched by title, not by index. An admin can delete or
// reorder a group in the dashboard, and matching by index would hand every
// later group the wrong title and the wrong skills.

/**
 * Merges saved skill categories onto the factory defaults.
 *
 * @param {Array<{title: string, gridClass: string, fullWidth?: boolean, skills: string[]}>} baseCategories
 * @param {Array<{title: string, gridClass?: string, fullWidth?: boolean, skills: string[]}>} [customCategories]
 * @returns {Array<{title: string, gridClass: string, fullWidth?: boolean, skills: string[]}>}
 */
export function mergeSkillCategories(baseCategories, customCategories) {
  if (!Array.isArray(customCategories)) return baseCategories

  const customByTitle = new Map()
  for (const cat of customCategories) {
    if (cat && typeof cat.title === 'string') customByTitle.set(cat.title, cat)
  }

  const merged = baseCategories.map((baseCat) => {
    const customCat = customByTitle.get(baseCat.title)
    if (!customCat) return baseCat
    customByTitle.delete(baseCat.title)
    return {
      ...baseCat,
      ...customCat,
      title: baseCat.title,
      skills: Array.isArray(customCat.skills) ? customCat.skills : baseCat.skills,
      // Layout is owned by the shipped content, not by the editor.
      gridClass: baseCat.gridClass,
      fullWidth: baseCat.fullWidth,
    }
  })

  // Groups the admin added that have no default counterpart.
  return [
    ...merged,
    ...[...customByTitle.values()].map((cat) => ({ ...cat, gridClass: cat.gridClass ?? '' })),
  ]
}
