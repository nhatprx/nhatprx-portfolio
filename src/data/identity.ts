import { DEFAULT_IDENTITY, resolveIdentity } from './identity.mjs'
import type { TranslationDict } from './translationTypes'

/**
 * Default identity - shared by every locale.
 *
 * The identity block is language independent (a name, an email, a phone
 * number and two profile links), so it is defined once here and referenced
 * by all four locale files instead of being copy-pasted per language.
 */
export { DEFAULT_IDENTITY, resolveIdentity }

export type Identity = TranslationDict['identity']
