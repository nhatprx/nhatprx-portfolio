import assert from 'node:assert/strict'
import test from 'node:test'
import { mergeSkillCategories } from '../../src/services/skillCategories.mjs'

const BASE = [
  { title: 'LANGUAGES', gridClass: 'grid grid-cols-3 gap-2', skills: ['JavaScript', 'Java'] },
  { title: 'DATABASES', gridClass: 'grid grid-cols-2 gap-2', skills: ['PostgreSQL'] },
  { title: 'FRAMEWORKS', gridClass: 'grid grid-cols-3 gap-2', skills: ['React'] },
]

test('the defaults are returned when nothing was saved', () => {
  assert.equal(mergeSkillCategories(BASE, undefined), BASE)
  assert.deepEqual(mergeSkillCategories(BASE, []), BASE)
})

test('a saved category keeps its title and skills', () => {
  const merged = mergeSkillCategories(BASE, [
    { title: 'LANGUAGES', skills: ['TypeScript'] },
  ])
  assert.equal(merged[0].title, 'LANGUAGES')
  assert.deepEqual(merged[0].skills, ['TypeScript'])
})

test('deleting a category does not shift the title of the next one', () => {
  // The bug this guards: merging by index handed every later category the
  // title and skills of the category before it.
  const merged = mergeSkillCategories(BASE, [
    { title: 'DATABASES', skills: ['Redis'] },
    { title: 'FRAMEWORKS', skills: ['Node.js'] },
  ])

  assert.equal(merged.length, 3)
  assert.equal(merged[0].title, 'LANGUAGES')
  assert.deepEqual(merged[0].skills, ['JavaScript', 'Java'])
  assert.equal(merged[1].title, 'DATABASES')
  assert.deepEqual(merged[1].skills, ['Redis'])
  assert.equal(merged[2].title, 'FRAMEWORKS')
  assert.deepEqual(merged[2].skills, ['Node.js'])
})

test('reordering the saved categories does not reorder the result', () => {
  const merged = mergeSkillCategories(BASE, [
    { title: 'FRAMEWORKS', skills: ['Node.js'] },
    { title: 'LANGUAGES', skills: ['TypeScript'] },
  ])

  assert.deepEqual(
    merged.map((c) => c.title),
    ['LANGUAGES', 'DATABASES', 'FRAMEWORKS']
  )
  assert.deepEqual(merged[2].skills, ['Node.js'])
})

test('a category added in the admin is kept', () => {
  const merged = mergeSkillCategories(BASE, [
    { title: 'LANGUAGES', skills: ['TypeScript'] },
    { title: 'DEVOPS', skills: ['Docker'] },
  ])

  assert.equal(merged.length, 4)
  assert.equal(merged[3].title, 'DEVOPS')
  assert.deepEqual(merged[3].skills, ['Docker'])
})

test('the layout always comes from the shipped content', () => {
  const merged = mergeSkillCategories(BASE, [
    { title: 'LANGUAGES', gridClass: 'grid grid-cols-12', skills: ['TypeScript'] },
  ])
  assert.equal(merged[0].gridClass, 'grid grid-cols-3 gap-2')
})

test('a category with no saved skills keeps the default skills', () => {
  const merged = mergeSkillCategories(BASE, [{ title: 'LANGUAGES' }])
  assert.deepEqual(merged[0].skills, ['JavaScript', 'Java'])
})
