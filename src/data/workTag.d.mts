export interface WorkTagSource {
  experience?: { tag?: string }
  projects?: { tag?: string }
}

export declare function resolveWorkTag(
  custom: WorkTagSource | undefined,
  fallback: string
): string
