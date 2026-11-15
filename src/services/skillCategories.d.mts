export interface SkillCategory {
  title: string
  gridClass: string
  fullWidth?: boolean
  skills: string[]
}

export declare function mergeSkillCategories(
  baseCategories: SkillCategory[],
  customCategories?: SkillCategory[]
): SkillCategory[]
