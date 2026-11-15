#!/usr/bin/env node
// Sets Content-Disposition on the resumes that were uploaded before the
// presign endpoint started signing the header.
//
// S3 has no "update metadata" call, so each object is copied onto itself with
// the metadata attached. Copy-on-write keeps the bytes and the key.
//
//   node scripts/set-resume-disposition.mjs [bucket]

import { S3Client, ListObjectsV2Command, HeadObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3'

const REGION = process.env.AWS_REGION || 'ap-southeast-1'
const BUCKET =
  process.argv[2] || process.env.PORTFOLIO_BUCKET || 'nhatprx-portfolio-resumes-815802019553'

const s3 = new S3Client({ region: REGION })

const list = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: 'resumes/' }))
if (!list.Contents?.length) {
  console.log('no resume objects found')
  process.exit(0)
}

let updated = 0
for (const obj of list.Contents) {
  const head = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: obj.Key }))
  if (head.ContentDisposition) continue

  const fileName = obj.Key.slice(obj.Key.lastIndexOf('/') + 1)
  await s3.send(
    new CopyObjectCommand({
      Bucket: BUCKET,
      Key: obj.Key,
      CopySource: `${BUCKET}/${encodeURIComponent(obj.Key)}`,
      MetadataDirective: 'REPLACE',
      ContentType: head.ContentType || 'application/pdf',
      ContentDisposition: `attachment; filename="${fileName}"`,
      CacheControl: 'public, max-age=31536000',
    })
  )
  updated++
  console.log(`updated ${obj.Key}`)
}

console.log(`${updated} object(s) updated`)
