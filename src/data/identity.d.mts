export interface Identity {
  displayName: string
  email: string
  phone: string
  githubUrl: string
  linkedinUrl: string
}

export declare const DEFAULT_IDENTITY: Identity

export declare function resolveIdentity(
  parsed:
    | Record<string, { identity?: Partial<Identity> } | undefined>
    | undefined,
  langOrder: string[]
): Identity
