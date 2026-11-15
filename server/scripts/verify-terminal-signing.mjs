// Verifies the browser signing path against the running API.
//
// The browser signs with Web Crypto HMAC over the token; the server verifies
// with node:crypto. This script reproduces the browser path and asserts the
// API accepts it, so a mismatch between the two cannot ship silently.
//
// Usage: node scripts/verify-terminal-signing.mjs [base-url]

import { createHmac, randomBytes } from 'node:crypto'

const BASE = process.argv[2] || 'http://127.0.0.1:8787'
const CLIENT_ID = 'verify_script_client'

function sign(secret, payload) {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

const tokenRes = await fetch(`${BASE}/api/terminal/token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ clientId: CLIENT_ID }),
})
if (!tokenRes.ok) throw new Error(`token request failed: ${tokenRes.status}`)
const { token } = await tokenRes.json()
if (!token) throw new Error('no token in response')

const command = 'hostname'
const timestamp = Date.now()
// A fresh nonce per request: the API rejects a nonce it has already seen.
const nonce = randomBytes(12).toString('hex')
const signature = sign(token, `${CLIENT_ID}|${timestamp}|${nonce}|${command}`)

const res = await fetch(`${BASE}/api/terminal/exec`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Request-Signature': signature,
    'X-Client-Id': CLIENT_ID,
    'X-Terminal-Token': token,
    'X-Timestamp': String(timestamp),
    'X-Request-Nonce': nonce,
  },
  body: JSON.stringify({ command }),
})

const body = await res.json()
console.log(`status=${res.status} ok=${body.ok} stdout=${JSON.stringify(body.stdout ?? body.error)}`)
if (!res.ok) process.exit(1)
