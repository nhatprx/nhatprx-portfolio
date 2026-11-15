// End-to-end check of the resume upload flow on the node.
//
// Runs on the EC2 host: it mints an admin token with the same secret the API
// uses, asks the API for a presigned URL, uploads a small PDF to S3 with the
// signed headers, and checks that the stored object downloads as an
// attachment.
//
//   node verify-upload-e2e.mjs [base-url]

import { createHmac, randomBytes } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const BASE = process.argv[2] || 'http://127.0.0.1:8787'
const SECRET_FILE = process.env.TOKEN_SECRET_FILE || '/var/lib/nhatprx-api/token.secret'
const BUCKET = process.env.PORTFOLIO_BUCKET || 'nhatprx-portfolio-resumes-815802019553'

let failures = 0
function report(name, passed, detail = '') {
  if (passed) console.log(`PASS  ${name}${detail ? ` - ${detail}` : ''}`)
  else {
    failures++
    console.log(`FAIL  ${name}${detail ? ` - ${detail}` : ''}`)
  }
}

// The API hashes the raw bytes of the secret file, not the trimmed text.
const secret = await readFile(SECRET_FILE)
const expiry = Math.floor(Date.now() / 1000) + 3600
const id = randomBytes(12).toString('hex')
const payload = `admin.${expiry}.${id}`
const sig = createHmac('sha256', secret).update(payload).digest('hex')
const token = `${payload}.${sig}`

// A minimal but valid one-page PDF.
const pdf = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\n' +
    'trailer<</Root 1 0 R>>\n%%EOF\n',
  'latin1'
)

const presignRes = await fetch(`${BASE}/api/resume/presign`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    fileName: 'upload-e2e-check.pdf',
    contentType: 'application/pdf',
    size: pdf.length,
  }),
})
report('presign succeeds', presignRes.status === 200, `status=${presignRes.status}`)
if (presignRes.status !== 200) {
  console.log(await presignRes.text())
  process.exit(1)
}

const presigned = await presignRes.json()
report(
  'presign returns a content-disposition',
  typeof presigned.contentDisposition === 'string' &&
    presigned.contentDisposition.startsWith('attachment;'),
  presigned.contentDisposition
)

const putRes = await fetch(presigned.uploadUrl, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': presigned.contentDisposition,
  },
  body: pdf,
})
report('the signed upload succeeds', putRes.ok, `status=${putRes.status}`)
if (!putRes.ok) console.log(await putRes.text())

const getRes = await fetch(presigned.publicUrl)
const disposition = getRes.headers.get('content-disposition') || ''
report(
  'the stored object downloads as an attachment',
  getRes.ok && disposition.includes('attachment'),
  disposition || '(no content-disposition)'
)

// Clean the check object up so the bucket does not accumulate test files.
const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3')
const s3 = new S3Client({ region: process.env.AWS_REGION || 'ap-southeast-1' })
await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: presigned.key }))
report('the check object is removed', true, presigned.key)

console.log(failures ? `\n${failures} check(s) failed` : '\nEvery check passed')
process.exit(failures ? 1 : 0)
