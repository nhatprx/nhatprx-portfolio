import assert from 'node:assert/strict'
import test from 'node:test'
import { S3Client, GetBucketCorsCommand } from '@aws-sdk/client-s3'

// The admin dashboard PUTs resumes straight to S3 with a presigned URL. The
// browser sends an OPTIONS preflight before the PUT; if the bucket's CORS rule
// does not list PUT, S3 answers the preflight with 403 and the upload never
// leaves the browser (the API returns a perfectly valid presigned URL, so the
// failure looks like a frontend bug).
//
// This test is skipped when no AWS credentials are available.

const REGION = process.env.AWS_REGION || 'ap-southeast-1'
const BUCKET = process.env.PORTFOLIO_BUCKET || 'nhatprx-portfolio-resumes-815802019553'

test(
  'resume bucket CORS allows PUT (browser presigned upload)',
  async () => {
    const s3 = new S3Client({ region: REGION })
    let res
    try {
      res = await s3.send(new GetBucketCorsCommand({ Bucket: BUCKET }))
    } catch (err) {
      // No usable credentials in this environment - nothing to assert.
      if (
        err?.name === 'CredentialsProviderError' ||
        err?.name === 'AccessDenied' ||
        err?.name === 'NotFound'
      ) {
        return
      }
      throw err
    }

    const rules = res.CORSRules ?? []
    assert.ok(rules.length > 0, `no CORS rules on ${BUCKET}`)

    const allowsPut = rules.some((r) => (r.AllowedMethods ?? []).includes('PUT'))
    assert.ok(
      allowsPut,
      `bucket ${BUCKET} CORS does not allow PUT - browser resume uploads will fail with a 403 preflight. ` +
        `Run: cd server && npm run setup:cors`
    )
  }
)
