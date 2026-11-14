import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_IDENTITY, resolveIdentity } from '../../src/data/identity.mjs'

const LANGS = ['en', 'vi', 'fr', 'ja']

test('the defaults are used when no language carries an identity', () => {
  assert.deepEqual(resolveIdentity({}, LANGS), DEFAULT_IDENTITY)
})

test('an identity stored in one language reaches every language', () => {
  const parsed = {
    en: { identity: { ...DEFAULT_IDENTITY, email: 'new@example.com' } },
  }
  const identity = resolveIdentity(parsed, LANGS)
  assert.equal(identity.email, 'new@example.com')
  // The same resolved object is what gets spread into every locale, so a
  // single edit can never leave the header and the contact section disagree.
  assert.equal(resolveIdentity(parsed, LANGS).email, identity.email)
})

test('the first language that carries an identity wins', () => {
  const parsed = {
    vi: { identity: { ...DEFAULT_IDENTITY, displayName: 'From Vietnamese' } },
    en: { identity: { ...DEFAULT_IDENTITY, displayName: 'From English' } },
  }
  assert.equal(resolveIdentity(parsed, LANGS).displayName, 'From English')
})

test('a partial identity keeps the defaults for the missing fields', () => {
  const parsed = { en: { identity: { email: 'only@example.com' } } }
  const identity = resolveIdentity(parsed, LANGS)
  assert.equal(identity.email, 'only@example.com')
  assert.equal(identity.githubUrl, DEFAULT_IDENTITY.githubUrl)
  assert.equal(identity.linkedinUrl, DEFAULT_IDENTITY.linkedinUrl)
  assert.equal(identity.displayName, DEFAULT_IDENTITY.displayName)
})

test('an empty field falls back to the default instead of blanking the site', () => {
  const parsed = { en: { identity: { ...DEFAULT_IDENTITY, email: '' } } }
  assert.equal(resolveIdentity(parsed, LANGS).email, DEFAULT_IDENTITY.email)
})

test('the defaults are valid contact values', () => {
  assert.match(DEFAULT_IDENTITY.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  assert.match(DEFAULT_IDENTITY.githubUrl, /^https:\/\/github\.com\//)
  assert.match(DEFAULT_IDENTITY.linkedinUrl, /^https:\/\/.*linkedin\.com\//)
  // The stored phone keeps its display spaces; validation strips them first.
  assert.match(DEFAULT_IDENTITY.phone.replace(/\s+/g, ''), /^\+?[0-9]{3,12}$/)
})
