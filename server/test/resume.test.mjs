import test from 'node:test'
import assert from 'node:assert/strict'
import { safeResumeName, resumeContentDisposition } from '../resume.mjs'

test('the resume file name is stripped of anything unsafe', () => {
  assert.strictEqual(safeResumeName('cv.pdf'), 'cv.pdf')
  assert.strictEqual(safeResumeName('my resume (final).pdf'), 'my-resume--final-.pdf')
  // A path separator must not survive, or the key could point elsewhere.
  assert.strictEqual(safeResumeName('../../etc/passwd.pdf'), '..-..-etc-passwd.pdf')
  assert.ok(!safeResumeName('a"b.pdf').includes('"'))
  assert.ok(!safeResumeName('a\r\nX-Injected: 1.pdf').includes('\n'))
})

test('the content disposition makes the file download', () => {
  assert.strictEqual(
    resumeContentDisposition('cv.pdf'),
    'attachment; filename="cv.pdf"'
  )
  // The value goes into a signed header, so a quote in it would end the
  // header value early.
  const value = resumeContentDisposition(safeResumeName('a"b.pdf'))
  assert.strictEqual(value, 'attachment; filename="a-b.pdf"')
  assert.strictEqual(value.split('"').length, 3)
})
