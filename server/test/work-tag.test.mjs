import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveWorkTag } from '../../src/data/workTag.mjs'

const DEFAULT_TAG = '03 - EXPERIENCE & PROJECTS'

test('the factory default is used when neither tab carries a tag', () => {
  assert.equal(resolveWorkTag({}, DEFAULT_TAG), DEFAULT_TAG)
})

test('one shared tag reaches both the Experience and the Projects tab', () => {
  // The site renders one #work section and swaps the heading between the two
  // tabs, so a tag stored on either copy must be the one both tabs show.
  const custom = { experience: { tag: '03 - CAREER & PRODUCTS' } }
  const tag = resolveWorkTag(custom, DEFAULT_TAG)
  assert.equal(tag, '03 - CAREER & PRODUCTS')
  assert.equal(resolveWorkTag(custom, DEFAULT_TAG), tag)
})

test('a tag stored on the Projects copy is used too', () => {
  const custom = { projects: { tag: '03 - WORK' } }
  assert.equal(resolveWorkTag(custom, DEFAULT_TAG), '03 - WORK')
})

test('an empty tag falls back instead of blanking the section', () => {
  assert.equal(resolveWorkTag({ experience: { tag: '' } }, DEFAULT_TAG), DEFAULT_TAG)
})
