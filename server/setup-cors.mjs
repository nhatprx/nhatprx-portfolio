#!/usr/bin/env node
// Ensures the resume bucket allows browser uploads.
//
// The admin dashboard uploads resumes by PUT-ing the file straight to S3 with a
// presigned URL. The browser sends an OPTIONS preflight first; without PUT in
// the bucket's CORS rule that preflight fails with 403 and the upload never
// leaves the browser.
//
//   node setup-cors.mjs                 -> uses the default bucket
//   node setup-cors.mjs <bucket>        -> explicit bucket
//
// Credentials come from the standard AWS environment (AWS_ACCESS_KEY_ID /
// AWS_SECRET_ACCESS_KEY / AWS_REGION) or the local AWS profile.
import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3'

const REGION = process.env.AWS_REGION || 'ap-southeast-1'
const BUCKET =
  process.argv[2] || process.env.PORTFOLIO_BUCKET || 'nhatprx-portfolio-resumes-815802019553'

const s3 = new S3Client({ region: REGION })

const rule = {
  AllowedMethods: ['GET', 'HEAD', 'PUT'],
  AllowedOrigins: ['*'],
  AllowedHeaders: ['*'],
  ExposeHeaders: ['ETag', 'Content-Disposition'],
  MaxAgeSeconds: 3600,
}

try {
  const current = await s3.send(new GetBucketCorsCommand({ Bucket: BUCKET }))
  console.log('current rules:', JSON.stringify(current.CORSRules, null, 2))
} catch (err) {
  console.log('could not read current CORS (it may not exist yet):', err.name)
}

await s3.send(
  new PutBucketCorsCommand({
    Bucket: BUCKET,
    CORSConfiguration: { CORSRules: [rule] },
  })
)

console.log(`CORS updated for ${BUCKET}: GET, HEAD, PUT`)
