import assert from 'node:assert/strict'
import test from 'node:test'
import {
  applyFieldRule,
  findForbiddenChars,
  sanitizeByKind,
  validateField,
  FIELD_RULES,
} from '../../src/components/Admin/utils/fieldRules.mjs'

test('free text strips characters that break layout', () => {
  assert.equal(sanitizeByKind('Hello_World!', 'text'), 'HelloWorld!')
  assert.equal(sanitizeByKind('a<b>c|d', 'text'), 'abcd')
  assert.equal(sanitizeByKind('a{b}c[d]e', 'text'), 'abcde')
  assert.equal(sanitizeByKind('cost@$100', 'text'), 'cost100')
})

test('free text keeps the symbols the shipped content actually uses', () => {
  // These appear in the real portfolio content and must stay editable.
  assert.equal(sanitizeByKind('C# & .NET', 'text'), 'C# & .NET')
  assert.equal(sanitizeByKind('contributing to ~17% cloud cost reduction', 'text'),
    'contributing to ~17% cloud cost reduction')
  assert.equal(sanitizeByKind('events with 1,000+ attendees', 'text'),
    'events with 1,000+ attendees')
  assert.equal(sanitizeByKind('C++ developer', 'text'), 'C++ developer')
  assert.equal(sanitizeByKind('What now? Yes!', 'text'), 'What now? Yes!')
})

test('free text keeps accented and unicode letters', () => {
  assert.equal(sanitizeByKind('Nguyễn Văn A', 'text'), 'Nguyễn Văn A')
  assert.equal(sanitizeByKind('ソフトウェアエンジニア', 'text'), 'ソフトウェアエンジニア')
})

test('tech names keep the characters they legitimately need', () => {
  assert.equal(sanitizeByKind('C++', 'tech'), 'C++')
  assert.equal(sanitizeByKind('C#', 'tech'), 'C#')
  assert.equal(sanitizeByKind('.NET', 'tech'), '.NET')
  assert.equal(sanitizeByKind('Node.js', 'tech'), 'Node.js')
  // But braces and pipes are still rejected.
  assert.equal(sanitizeByKind('a{b}c|d', 'tech'), 'abcd')
})

test('email only allows email characters', () => {
  assert.equal(sanitizeByKind('a b@c.com', 'email'), 'ab@c.com')
  assert.equal(sanitizeByKind('a<b>@c.com', 'email'), 'ab@c.com')
})

test('url keeps a valid link intact', () => {
  const url = 'https://github.com/nhatprx?tab=1'
  assert.equal(sanitizeByKind(url, 'url'), url)
})

test('phone keeps digits and a leading plus', () => {
  assert.equal(sanitizeByKind('+84 879 888 965', 'phone'), '+84 879 888 965')
  assert.equal(sanitizeByKind('09o1', 'phone'), '091')
})

test('applyFieldRule clamps to the maximum length', () => {
  const rule = { kind: 'text', max: 5 }
  assert.equal(applyFieldRule('abcdefgh', rule), 'abcde')
})

test('applyFieldRule strips then clamps', () => {
  const rule = { kind: 'text', max: 5 }
  assert.equal(applyFieldRule('a_b_c_d_e_f', rule), 'abcde')
})

test('findForbiddenChars reports the offending characters', () => {
  assert.deepEqual(findForbiddenChars('a_b', 'text'), ['_'])
  assert.deepEqual(findForbiddenChars('clean text', 'text'), [])
})

test('validateField requires a value unless allowEmpty', () => {
  const rule = FIELD_RULES.heroRole
  assert.ok(validateField('', rule, false))
  assert.equal(validateField('', rule, true), null)
})

test('validateField rejects text over the limit', () => {
  const rule = FIELD_RULES.heroRole
  const long = 'a'.repeat(rule.max + 1)
  const error = validateField(long, rule)
  assert.ok(error && error.includes('characters'))
})

test('validateField accepts a well-formed email', () => {
  assert.equal(validateField('nhatprx@gmail.com', FIELD_RULES.contactEmail), null)
  assert.ok(validateField('not-an-email', FIELD_RULES.contactEmail))
  assert.ok(validateField('a@b', FIELD_RULES.contactEmail))
})

test('validateField requires http(s) for urls', () => {
  assert.equal(validateField('https://github.com/nhatprx', FIELD_RULES.contactUrl), null)
  assert.ok(validateField('ftp://github.com', FIELD_RULES.contactUrl))
  assert.ok(validateField('github.com/nhatprx', FIELD_RULES.contactUrl))
})

test('validateField limits the phone number to 12 digits', () => {
  assert.equal(validateField('+84 879 888 965', FIELD_RULES.contactPhone), null)
  assert.ok(validateField('1234567890123', FIELD_RULES.contactPhone))
})

test('every registry rule has a max, a hint and a label', () => {
  for (const [name, rule] of Object.entries(FIELD_RULES)) {
    assert.ok(rule.max > 0, `${name} has no max length`)
    assert.ok(rule.hint && rule.hint.length > 0, `${name} has no hint`)
    assert.ok(rule.label && rule.label.length > 0, `${name} has no label`)
  }
})

test('the shipped default content passes validation', () => {
  // The locale defaults are what admins start from - they must be valid.
  const samples = [
    ['SOFTWARE ENGINEER', FIELD_RULES.heroRole],
    ['Building systems', FIELD_RULES.aboutTitle],
    ['that scale.', FIELD_RULES.aboutTitleSub],
    ['FPT University', FIELD_RULES.eduSchool],
    ['Ho Chi Minh City, VN', FIELD_RULES.eduLocation],
    ['BACHELOR OF ENGINEERING', FIELD_RULES.eduDegree],
    ['Computer Science', FIELD_RULES.eduMajor],
    ['Technical', FIELD_RULES.skillsTitle],
    ['stack.', FIELD_RULES.skillsTitleSub],
    ['Cloud Infrastructure Intern', FIELD_RULES.workTitle],
    ['AMAZON WEB SERVICES (AWS) · Ho Chi Minh City · On-site', FIELD_RULES.workCompany],
    ['JAN - AUG 2026', FIELD_RULES.workPeriod],
    ['LordNine Bot · Automation Framework', FIELD_RULES.workTitle],
    ['nhatprx@gmail.com', FIELD_RULES.contactEmail],
    ['+84 879 888 965', FIELD_RULES.contactPhone],
    ['https://github.com/nhatprx', FIELD_RULES.contactUrl],
    ['Ho Chi Minh City, Vietnam', FIELD_RULES.contactLocation],
    ['Pham Minh Nhat', FIELD_RULES.identityName],
  ]

  for (const [value, rule] of samples) {
    const error = validateField(value, rule, false)
    assert.equal(error, null, `"${value}" should be valid for ${rule.label}: ${error}`)
  }
})

test('the real shipped experience bullets stay valid', () => {
  // Verbatim from src/data/locales/en.ts - these were the strings that the
  // first blacklist wrongly rejected.
  const bullets = [
    'Optimized EC2 sizing, caching strategy, and storage configuration, contributing to ~17% cloud cost reduction',
    'Managed technical infrastructure (networking, sound, visual systems, livestreaming) for campus-wide events with 1,000+ attendees',
    'Built a React + TypeScript dashboard managing 1,000+ student records with real-time monitoring; designed Python/PostgreSQL backend handling 500+ daily attendance events',
  ]

  for (const bullet of bullets) {
    const error = validateField(bullet, FIELD_RULES.workBullet, true)
    assert.equal(error, null, `shipped bullet rejected: ${error}\n"${bullet}"`)
  }
})

test('the real shipped project bullets stay valid', () => {
  const bullets = [
    'Architected a concurrent event pipeline processing 10,000 msgs/sec with sub-100ms p99 latency',
    'Automated CI/CD deployment with Docker containers on Google Cloud Run',
  ]

  for (const bullet of bullets) {
    const error = validateField(bullet, FIELD_RULES.workBullet, true)
    assert.equal(error, null, `shipped bullet rejected: ${error}\n"${bullet}"`)
  }
})
