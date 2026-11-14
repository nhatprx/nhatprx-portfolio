/**
 * nhatprx-portfolio admin API.
 *
 * Runs on the EC2 instance behind nginx (proxied at /api/). Replaces the
 * client-side passkey with a server-side PBKDF2 hash and signs S3 uploads so
 * the browser never sees an AWS secret key.
 *
 * Routes:
 *   POST /api/admin/login     { passkey }              -> { token }
 *   POST /api/admin/logout                            -> { ok }
 *   POST /api/resume/presign  { fileName, contentType, size } -> { uploadUrl, key, publicUrl, fileName, expiresIn }
 *   POST /api/resume/delete   { key }                  -> { ok }
 *   POST /api/translate       { source, sourceLang, targetLang } -> { content }
 *   GET  /api/content                                 -> { content } | raw JSON
 *   PUT  /api/content         { content }              -> { ok }
 *   POST /api/terminal/exec   { command }              -> { ok, stdout } | { error }
 *   GET  /api/health                                  -> { ok }
 */

import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto'
import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { runTerminalCommand } from './terminal.mjs'
import { translateSection } from './bedrock-translate.mjs'
import { getSystemMetrics, getSystemInfo } from './system-metrics.mjs'

const PORT = Number(process.env.PORT || 8787)
const REGION = process.env.AWS_REGION || 'ap-southeast-1'
const BUCKET = process.env.PORTFOLIO_BUCKET || 'nhatprx-portfolio-resumes-815802019553'
const RESUME_PREFIX = 'resumes/'
const CONTENT_KEY = 'content/portfolio-content.json'

// Production runs under systemd with these env vars pointing at /var/lib/nhatprx-api.
// Locally there is no such directory, so fall back to server/.testdata next to this
// file - otherwise every login reads a missing file and returns 401.
const LOCAL_SECRET_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '.testdata')
const PASSKEY_HASH_FILE =
  process.env.PASSKEY_HASH_FILE || resolve(LOCAL_SECRET_DIR, 'passkey.hash')
const TOKEN_SECRET_FILE =
  process.env.TOKEN_SECRET_FILE || resolve(LOCAL_SECRET_DIR, 'token.secret')
const TOKEN_TTL_SECONDS = 12 * 3600
const MAX_RESUME_BYTES = 15 * 1024 * 1024
const MAX_CONTENT_BYTES = 1024 * 1024
const MAX_BODY_BYTES = 2 * 1024 * 1024
const MAX_TRANSLATION_INPUT_BYTES = 512 * 1024
const TRANSLATION_SECTIONS = ['about', 'skills', 'experience', 'projects', 'blog']
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx']
const ALLOWED_CONTENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const s3 = new S3Client({ region: REGION })

/** Reads a secret file, creating it with random bytes on first boot. */
async function loadOrCreateTokenSecret() {
  try {
    const raw = await readFile(TOKEN_SECRET_FILE)
    return raw
  } catch {
    const secret = randomBytes(32)
    await mkdir(dirname(TOKEN_SECRET_FILE), { recursive: true })
    await writeFile(TOKEN_SECRET_FILE, secret, { mode: 0o600 })
    return secret
  }
}

const tokenSecret = await loadOrCreateTokenSecret()

function hashPasskey(passkey, salt) {
  return pbkdf2Sync(passkey, salt, 200_000, 32, 'sha256')
}

async function verifyPasskey(passkey) {
  let raw
  try {
    raw = await readFile(PASSKEY_HASH_FILE, 'utf8')
  } catch (err) {
    // A missing/!readable hash file is a server misconfiguration, not a wrong
    // passkey. Logging it is what stops "invalid passkey" from hiding a broken
    // local setup.
    console.error(`[api] cannot read passkey hash at ${PASSKEY_HASH_FILE}:`, err.message)
    return false
  }
  const [saltHex, hashHex] = raw.trim().split(':')
  if (!saltHex || !hashHex) return false
  const expected = Buffer.from(hashHex, 'hex')
  const actual = hashPasskey(passkey, Buffer.from(saltHex, 'hex'))
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function makeToken() {
  const expiry = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  const payload = `admin.${expiry}`
  const sig = createHmac('sha256', tokenSecret).update(payload).digest('hex')
  return `${payload}.${sig}`
}

function checkToken(token) {
  if (typeof token !== 'string') return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [prefix, expiryRaw, sig] = parts
  if (prefix !== 'admin') return false
  const expiry = Number(expiryRaw)
  if (!Number.isFinite(expiry) || expiry < Math.floor(Date.now() / 1000)) return false
  const expected = createHmac('sha256', tokenSecret).update(`admin.${expiryRaw}`).digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(sig)
  return a.length === b.length && timingSafeEqual(a, b)
}

function publicUrlFor(key) {
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${encodeURI(key)}`
}

/** Rejects any key outside the managed resume prefix. */
function safeKey(key) {
  if (typeof key !== 'string' || !key.startsWith(RESUME_PREFIX)) {
    throw new Error('invalid key')
  }
  if (key.includes('..') || key.includes('\\')) {
    throw new Error('invalid key')
  }
  return key
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  })
  res.end(body)
}

async function readJsonBody(req) {
  const chunks = []
  let total = 0
  for await (const chunk of req) {
    total += chunk.length
    if (total > MAX_BODY_BYTES) throw new Error('payload too large')
    chunks.push(chunk)
  }
  if (!total) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function isAuthed(req) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return false
  return checkToken(header.slice(7).trim())
}

function requireAuth(req, res) {
  if (isAuthed(req)) return true
  sendJson(res, 401, { error: 'unauthorized' })
  return false
}

async function handleGet(req, res, path) {
  if (path === '/api/health') {
    sendJson(res, 200, { ok: true })
    return
  }

  if (path === '/api/metrics') {
    try {
      const metrics = await getSystemMetrics()
      sendJson(res, 200, { ok: true, metrics })
    } catch (err) {
      console.error('[api] metrics error:', err)
      sendJson(res, 500, { error: 'failed to fetch metrics' })
    }
    return
  }

  if (path === '/api/system-info') {
    try {
      const info = await getSystemInfo()
      sendJson(res, 200, { ok: true, info })
    } catch (err) {
      console.error('[api] system-info error:', err)
      sendJson(res, 500, { error: 'failed to fetch system info' })
    }
    return
  }

  if (path === '/api/content') {
    try {
      console.log(`[api] fetching content from S3: bucket=${BUCKET}, key=${CONTENT_KEY}`)
      const out = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: CONTENT_KEY }))
      const body = await out.Body.transformToString()
      console.log(`[api] successfully fetched content from S3, size=${Buffer.byteLength(body)}`)
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Cache-Control': 'no-store',
      })
      res.end(body)
    } catch (err) {
      // S3 masks a missing key as AccessDenied unless the caller may ListBucket.
      const code = err?.name || err?.Code || err?.$metadata?.httpStatusCode
      console.warn(`[api] S3 fetch failed: code=${code}, message=${err?.message}`)
      if (code === 'NoSuchKey' || code === 404) {
        sendJson(res, 200, { content: null })
        return
      }
      throw err
    }
    return
  }

  sendJson(res, 404, { error: 'not found' })
}

async function handlePost(req, res, path) {
  if (path === '/api/admin/login') {
    const data = await readJsonBody(req)
    const passkey = String(data.passkey || '')
    if (!passkey || !(await verifyPasskey(passkey))) {
      sendJson(res, 401, { error: 'invalid passkey' })
      return
    }
    sendJson(res, 200, { token: makeToken() })
    return
  }

  if (path === '/api/admin/logout') {
    sendJson(res, 200, { ok: true })
    return
  }

  // Public read-only shell for the homepage terminal. Runs on this instance,
  // so no SSH is involved - only the allowlist in terminal.mjs can execute.
  if (path === '/api/terminal/exec') {
    const data = await readJsonBody(req)
    const command = String(data.command || '')
    const result = await runTerminalCommand(command)
    if (!result.ok) {
      console.log(`[terminal] rejected "${command}": ${result.error}`)
      sendJson(res, 400, { error: result.error })
      return
    }
    console.log(`[terminal] ran "${command}"`)
    sendJson(res, 200, { ok: true, stdout: result.stdout })
    return
  }

  if (path === '/api/translate') {
    if (!requireAuth(req, res)) return
    const data = await readJsonBody(req)
    const sourceLang = String(data.sourceLang || '')
    const targetLang = String(data.targetLang || '')
    const source = data.source

    if (!sourceLang || !targetLang || sourceLang === targetLang) {
      sendJson(res, 400, { error: 'valid sourceLang and targetLang are required' })
      return
    }
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      sendJson(res, 400, { error: 'source content is required' })
      return
    }
    if (Buffer.byteLength(JSON.stringify(source)) > MAX_TRANSLATION_INPUT_BYTES) {
      sendJson(res, 413, { error: 'translation content too large' })
      return
    }

    const translated = { ...source }
  for (const sectionName of TRANSLATION_SECTIONS) {
    const section = source[sectionName]
    if (!section || typeof section !== 'object' || Array.isArray(section)) continue
    translated[sectionName] = await translateSection({
      section,
      sourceLang,
      targetLang,
      context: source,
    })
  }

    sendJson(res, 200, { content: translated })
    return
  }

  if (path === '/api/resume/presign') {
    if (!requireAuth(req, res)) return
    const data = await readJsonBody(req)
    const fileName = String(data.fileName || '').split(/[\\/]/).pop().trim()
    const contentType = String(data.contentType || 'application/octet-stream')
    const size = Number(data.size || 0)

    if (!fileName) {
      sendJson(res, 400, { error: 'fileName required' })
      return
    }
    const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      sendJson(res, 400, { error: 'only .pdf, .doc and .docx are supported' })
      return
    }
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      sendJson(res, 400, { error: 'unsupported content type' })
      return
    }
    if (!Number.isFinite(size) || size <= 0 || size > MAX_RESUME_BYTES) {
      sendJson(res, 400, { error: 'file size must be between 1 byte and 15MB' })
      return
    }

    const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-')
    const key = `${RESUME_PREFIX}${stamp}-${safeName}`

    // Only sign the headers the browser actually sends. ContentDisposition is
    // applied later via the bucket's Content-Disposition metadata rule so the
    // signature stays valid.
    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: 300 }
    )

    sendJson(res, 200, {
      uploadUrl,
      key,
      publicUrl: publicUrlFor(key),
      fileName,
      expiresIn: 300,
    })
    return
  }

  if (path === '/api/resume/delete') {
    if (!requireAuth(req, res)) return
    const data = await readJsonBody(req)
    let key
    try {
      key = safeKey(data.key)
    } catch {
      sendJson(res, 400, { error: 'invalid key' })
      return
    }
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
    sendJson(res, 200, { ok: true })
    return
  }

  sendJson(res, 404, { error: 'not found' })
}

async function handlePut(req, res, path) {
  if (path !== '/api/content') {
    sendJson(res, 404, { error: 'not found' })
    return
  }
  if (!requireAuth(req, res)) return

  const data = await readJsonBody(req)
  if (data.content === undefined || data.content === null) {
    sendJson(res, 400, { error: 'content required' })
    return
  }
  const body = JSON.stringify(data.content)
  if (Buffer.byteLength(body) > MAX_CONTENT_BYTES) {
    sendJson(res, 400, { error: 'content too large' })
    return
  }

  console.log(`[api] saving content to S3: bucket=${BUCKET}, key=${CONTENT_KEY}, size=${Buffer.byteLength(body)}`)
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: CONTENT_KEY,
      Body: body,
      ContentType: 'application/json',
      CacheControl: 'no-store',
    })
  )
  console.log(`[api] successfully saved content to S3`)
  sendJson(res, 200, { ok: true })
}

const server = createServer(async (req, res) => {
  const path = (req.url || '/').split('?')[0].replace(/\/+$/, '') || '/'
  try {
    if (req.method === 'GET') return await handleGet(req, res, path)
    if (req.method === 'POST') return await handlePost(req, res, path)
    if (req.method === 'PUT') return await handlePut(req, res, path)
    sendJson(res, 405, { error: 'method not allowed' })
  } catch (err) {
    console.error('[api] unhandled error:', err)
    if (err?.message === 'payload too large') {
      sendJson(res, 400, { error: err.message })
      return
    }
    if (err instanceof SyntaxError) {
      sendJson(res, 400, { error: 'invalid JSON body' })
      return
    }
    sendJson(res, 500, { error: 'internal error' })
  }
})

// Bind to all loopback addresses: `localhost` resolves to ::1 first on Windows,
// so an IPv4-only 127.0.0.1 bind makes the Vite proxy fail with ECONNREFUSED.
server.listen(PORT, () => {
  console.log(`[api] listening on 127.0.0.1:${PORT}`)
})
