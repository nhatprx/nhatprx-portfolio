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
import { getSystemMetrics, getSystemInfo } from './system-metrics.mjs'
import { resolveClientIp, checkRateLimit, clearRateLimit } from './rate-limit.mjs'
import { NonceCache } from './terminal-signing.mjs'
import {
  sanitizeTerminalOutput,
  makeTerminalToken,
  validateTerminalRequest as verifyTerminalRequest,
} from './terminal-security.mjs'
import { execOnUpstream, getFromUpstream } from './upstream.mjs'
import { safeResumeName, resumeContentDisposition } from './resume.mjs'

const PORT = Number(process.env.PORT || 8787)
// Local dev on Windows has no /proc and no Linux tooling, so the terminal and
// the live metrics are relayed to the real node over an SSH tunnel. Unset in
// production, where the API runs on the node itself.
const TERMINAL_UPSTREAM = process.env.TERMINAL_UPSTREAM || ''
const REGION = process.env.AWS_REGION || 'ap-southeast-1'
const BUCKET = process.env.PORTFOLIO_BUCKET || 'nhatprx-portfolio-resumes-815802019553'
const RESUME_PREFIX = 'resumes/'
const CONTENT_KEY = 'content/portfolio-content.json'

// Rate limiting state for terminal
const terminalRateLimit = new Map()
// Token issuance is limited separately from execution: minting a token is
// cheap for the client but each token unlocks the exec budget, so the two
// budgets must not share a bucket.
const terminalTokenRateLimit = new Map()
// Login attempts are limited per IP so the passkey cannot be brute forced.
const loginRateLimit = new Map()
// Revoked admin tokens, so logout actually invalidates a stolen token.
const revokedTokens = new Set()
// Nonces that have already been used, so a captured signed request cannot be
// replayed.
const usedNonces = new NonceCache()

/**
 * Rate limit policies.
 *
 * Terminal exec: 60 commands per minute per IP.
 * Terminal token: 30 tokens per minute per IP. A browser needs one token per
 * hour, so this leaves plenty of headroom while stopping a mint flood.
 * Login: 5 attempts per 15 minutes per IP.
 */
const TERMINAL_EXEC_POLICY = { windowMs: 60_000, max: 60 }
const TERMINAL_TOKEN_POLICY = { windowMs: 60_000, max: 30 }
const LOGIN_POLICY = { windowMs: 15 * 60_000, max: 5 }
/** A constant delay on a failed login, so a wrong passkey costs the attacker
 * the same wall-clock time as a right one. */
const LOGIN_FAIL_DELAY_MS = 500

// Production runs under systemd with these env vars pointing at /var/lib/nhatprx-api.
// Locally there is no such directory, so fall back to server/.testdata next to this
// file - otherwise every login reads a missing file and returns 401.
const LOCAL_SECRET_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '.testdata')
const PASSKEY_HASH_FILE =
  process.env.PASSKEY_HASH_FILE || resolve(LOCAL_SECRET_DIR, 'passkey.hash')
const TOKEN_SECRET_FILE =
  process.env.TOKEN_SECRET_FILE || resolve(LOCAL_SECRET_DIR, 'token.secret')
// Admin tokens are short-lived: a leaked token should be useless quickly.
// The dashboard re-authenticates when it expires.
const TOKEN_TTL_SECONDS = 2 * 3600
// Terminal signing tokens are short-lived: the browser re-fetches one when it
// expires, so a leaked token is worthless for long.
const TERMINAL_TOKEN_TTL_SECONDS = 60 * 60
const MAX_RESUME_BYTES = 15 * 1024 * 1024
const MAX_CONTENT_BYTES = 1024 * 1024
const MAX_BODY_BYTES = 2 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx']
const ALLOWED_CONTENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const s3 = new S3Client({ region: REGION })

/**
 * Terminal security: verify the request signature and rate limit.
 *
 * The browser never holds the API secret. It asks /api/terminal/token for a
 * short-lived token that is bound to its client id, signs each command with
 * HMAC-SHA256 over `clientId|timestamp|nonce|command`, and the API verifies
 * that signature in constant time. A token issued for one client id cannot
 * sign requests for another one, and a command signed for one command cannot
 * be replayed for a different command.
 */
async function validateTerminalRequest(req, command) {
  const nonce = String(req.headers['x-request-nonce'] || '')
  const result = await verifyTerminalRequest(tokenSecret, {
    signature: req.headers['x-request-signature'],
    clientId: req.headers['x-client-id'],
    token: req.headers['x-terminal-token'],
    timestamp: parseInt(req.headers['x-timestamp'], 10),
    nonce,
    command,
  })
  if (!result.ok) return result

  // The rate-limit key must be the real client IP, not anything the client
  // chose. `X-Forwarded-For` is attacker-controlled (nginx appends to it), so
  // only `X-Real-IP` (which nginx overwrites with $remote_addr) is trusted.
  const clientIp = resolveClientIp(req)
  return { ok: true, clientId: result.clientId, clientIp }
}

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

/**
 * Mints an admin token.
 *
 * The token carries a random id so it can be revoked individually: logout
 * puts that id in the revocation set and the token stops working even
 * though it has not expired yet.
 */
function makeToken() {
  const expiry = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  const id = randomBytes(12).toString('hex')
  const payload = `admin.${expiry}.${id}`
  const sig = createHmac('sha256', tokenSecret).update(payload).digest('hex')
  return `${payload}.${sig}`
}

function checkToken(token) {
  if (typeof token !== 'string') return false
  const parts = token.split('.')
  if (parts.length !== 4) return false
  const [prefix, expiryRaw, id, sig] = parts
  if (prefix !== 'admin') return false
  if (revokedTokens.has(id)) return false
  const expiry = Number(expiryRaw)
  if (!Number.isFinite(expiry) || expiry < Math.floor(Date.now() / 1000)) return false
  const expected = createHmac('sha256', tokenSecret)
    .update(`admin.${expiryRaw}.${id}`)
    .digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(sig)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** Extracts the token id, used to revoke a token on logout. */
function tokenIdOf(token) {
  if (typeof token !== 'string') return null
  const parts = token.split('.')
  return parts.length === 4 ? parts[2] : null
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
      if (TERMINAL_UPSTREAM) {
        const body = await getFromUpstream(TERMINAL_UPSTREAM, '/api/metrics')
        if (body?.metrics) {
          sendJson(res, 200, body)
          return
        }
      }
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
      if (TERMINAL_UPSTREAM) {
        const body = await getFromUpstream(TERMINAL_UPSTREAM, '/api/system-info')
        if (body?.info) {
          sendJson(res, 200, body)
          return
        }
      }
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
      const out = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: CONTENT_KEY }))
      const body = await out.Body.transformToString()
      // Parse the JSON to wrap it in { content: ... } to match client expectations
      let parsed
      try {
        parsed = JSON.parse(body)
      } catch {
        sendJson(res, 500, { error: 'invalid JSON in S3 content' })
        return
      }
      const wrapped = JSON.stringify({ content: parsed })
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(wrapped),
        'Cache-Control': 'no-store',
      })
      res.end(wrapped)
    } catch (err) {
      // S3 masks a missing key as AccessDenied unless the caller may ListBucket.
      const code = err?.name || err?.Code || err?.$metadata?.httpStatusCode
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
    // Brute-force protection: the budget is keyed by the real client IP, so
    // rotating client ids or forging X-Forwarded-For does not help.
    const ip = resolveClientIp(req)
    const limit = checkRateLimit(loginRateLimit, ip, LOGIN_POLICY)
    if (!limit.allowed) {
      sendJson(res, 429, { error: 'Too many login attempts', retryAfter: Math.ceil(limit.resetIn / 1000) })
      return
    }

    const data = await readJsonBody(req)
    const passkey = String(data.passkey || '')
    if (!passkey || !(await verifyPasskey(passkey))) {
      // A constant delay makes a wrong passkey cost the attacker the same
      // wall-clock time as a right one.
      await new Promise((resolve) => setTimeout(resolve, LOGIN_FAIL_DELAY_MS))
      sendJson(res, 401, { error: 'invalid passkey' })
      return
    }
    // A correct passkey clears the budget, so a real admin is never locked out
    // by earlier typos.
    clearRateLimit(loginRateLimit, ip)
    sendJson(res, 200, { token: makeToken() })
    return
  }

  if (path === '/api/admin/logout') {
    // Revoke the token so a stolen token stops working immediately instead of
    // staying valid until it expires.
    const header = req.headers.authorization || ''
    if (header.startsWith('Bearer ')) {
      const id = tokenIdOf(header.slice(7).trim())
      if (id) revokedTokens.add(id)
    }
    sendJson(res, 200, { ok: true })
    return
  }

  /**
   * Issues a short-lived terminal signing token.
   *
   * The browser needs this to sign terminal commands. The token binds the
   * client id, so a token minted for one client cannot sign requests for
   * another one.
   */
  if (path === '/api/terminal/token') {
    // Token issuance has its own budget, keyed by the real client IP. Without
    // it an attacker can mint unlimited tokens (one per client id) and each
    // token unlocks the exec budget.
    const ip = resolveClientIp(req)
    const limit = checkRateLimit(terminalTokenRateLimit, ip, TERMINAL_TOKEN_POLICY)
    if (!limit.allowed) {
      sendJson(res, 429, { error: 'Rate limit exceeded', rateLimitReset: limit.resetIn })
      return
    }

    const data = await readJsonBody(req)
    const clientId = String(data.clientId || '').trim()
    if (!clientId || !/^[A-Za-z0-9_-]{4,64}$/.test(clientId)) {
      sendJson(res, 400, { error: 'invalid clientId' })
      return
    }
    const token = makeTerminalToken(clientId, tokenSecret, TERMINAL_TOKEN_TTL_SECONDS)
    sendJson(res, 200, { token, expiresIn: TERMINAL_TOKEN_TTL_SECONDS })
    return
  }

  // Public read-only shell for the homepage terminal. Runs on this instance,
  // so no SSH is involved - only the allowlist in terminal.mjs can execute.
  if (path === '/api/terminal/exec') {
    const data = await readJsonBody(req)
    const command = String(data.command || '')

    // Security validation: the signature must cover this exact command.
    const secCheck = await validateTerminalRequest(req, command)
    if (!secCheck.ok) {
      sendJson(res, 400, { error: secCheck.error })
      return
    }

    // A nonce may be used only once, so a captured request cannot be replayed
    // inside the signature window.
    const nonce = String(req.headers['x-request-nonce'] || '')
    if (!usedNonces.claim(nonce)) {
      sendJson(res, 400, { error: 'Request nonce already used' })
      return
    }

    // Rate limiting, keyed by the real client IP only. The client id is
    // attacker-controlled, so including it in the key would let one IP spread
    // its budget over thousands of client ids.
    const { allowed, resetIn } = checkRateLimit(terminalRateLimit, secCheck.clientIp, TERMINAL_EXEC_POLICY)
    if (!allowed) {
      sendJson(res, 429, { error: 'Rate limit exceeded', rateLimitReset: resetIn })
      return
    }

    // Execute command
    let result
    if (TERMINAL_UPSTREAM) {
      const upstreamResult = await execOnUpstream(TERMINAL_UPSTREAM, command)
      result = upstreamResult.ok
        ? { ok: true, stdout: upstreamResult.stdout }
        : { ok: false, error: upstreamResult.error }
    } else {
      result = await runTerminalCommand(command)
    }
    if (!result.ok) {
      sendJson(res, 400, { error: result.error })
      return
    }

    const output = sanitizeTerminalOutput(result.stdout)
    sendJson(res, 200, { ok: true, stdout: output, executedAt: new Date().toISOString() })
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
    const safeName = safeResumeName(fileName)
    const key = `${RESUME_PREFIX}${stamp}-${safeName}`

    // The resume must download rather than render in the browser: without
    // Content-Disposition a PDF would be displayed inline on the S3 domain,
    // which turns the bucket into a page that can host arbitrary content.
    // The header is signed, so the browser has to send exactly this value.
    const contentDisposition = resumeContentDisposition(safeName)
    //
    // ContentLengthRange makes S3 enforce the size limit itself: the size the
    // client declared above is untrusted, so the range is what actually stops
    // an oversized upload.
    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: contentType,
        ContentDisposition: contentDisposition,
      }),
      {
        expiresIn: 300,
        ContentLengthRange: [1, MAX_RESUME_BYTES],
      }
    )

    sendJson(res, 200, {
      uploadUrl,
      key,
      publicUrl: publicUrlFor(key),
      fileName,
      contentDisposition,
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

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: CONTENT_KEY,
      Body: body,
      ContentType: 'application/json',
      CacheControl: 'no-store',
    })
  )
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
