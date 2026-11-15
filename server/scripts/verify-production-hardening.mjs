// Verifies the security fixes on the live production API.
//
// Usage: node scripts/verify-production-hardening.mjs [base-url]

import { createHmac, randomBytes } from 'node:crypto'

const BASE = process.argv[2] || 'https://nhatprx.com'
const CLIENT_ID = 'prod_verify_client'
let failures = 0

function report(name, passed, detail = '') {
  if (passed) {
    console.log(`PASS  ${name}${detail ? ` - ${detail}` : ''}`)
  } else {
    failures++
    console.log(`FAIL  ${name}${detail ? ` - ${detail}` : ''}`)
  }
}

// 1. A signed request cannot be replayed with the same nonce.
//
// This runs before the flood check on purpose: the flood consumes the whole
// per-IP token budget, which would leave no token for the replay test.
{
  const tokenRes = await fetch(`${BASE}/api/terminal/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: `${CLIENT_ID}_replay` }),
  })
  const { token } = await tokenRes.json()
  if (!token) {
    report('a signed request cannot be replayed', false, 'no token issued (rate limited)')
  } else {
    const timestamp = Date.now()
    const nonce = randomBytes(12).toString('hex')
    const signature = createHmac('sha256', token)
      .update(`${CLIENT_ID}_replay|${timestamp}|${nonce}|hostname`)
      .digest('hex')
    const headers = {
      'Content-Type': 'application/json',
      'X-Request-Signature': signature,
      'X-Client-Id': `${CLIENT_ID}_replay`,
      'X-Terminal-Token': token,
      'X-Timestamp': String(timestamp),
      'X-Request-Nonce': nonce,
    }
    const first = await fetch(`${BASE}/api/terminal/exec`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ command: 'hostname' }),
    })
    const replay = await fetch(`${BASE}/api/terminal/exec`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ command: 'hostname' }),
    })
    report(
      'a signed request cannot be replayed',
      first.status === 200 && replay.status === 400,
      `first=${first.status} replay=${replay.status}`
    )
  }
}

// 2. The token endpoint is rate limited per IP: rotating client ids must not
//    buy more budget.
{
  let allowed = 0
  let blocked = 0
  for (let i = 0; i < 45; i++) {
    const res = await fetch(`${BASE}/api/terminal/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: `rotate_${i}_${randomBytes(4).toString('hex')}` }),
    })
    if (res.status === 200) allowed++
    else if (res.status === 429) blocked++
  }
  report(
    'token issuance is rate limited per IP',
    blocked > 0 && allowed <= 35,
    `allowed=${allowed} blocked=${blocked}`
  )
}

// 3. The Bedrock translate endpoint is gone.
{
  const res = await fetch(`${BASE}/api/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: {}, sourceLang: 'en', targetLang: 'vi' }),
  })
  report('the Bedrock translate endpoint is removed', res.status === 404, `status=${res.status}`)
}

// 4. The security headers are present.
{
  const res = await fetch(BASE, { redirect: 'manual' })
  const csp = res.headers.get('content-security-policy') || ''
  report('CSP is set and blocks framing', csp.includes("frame-ancestors 'none'"))
  report('HSTS is set', !!res.headers.get('strict-transport-security'))
  report('X-Content-Type-Options is set', res.headers.get('x-content-type-options') === 'nosniff')
  report('X-Frame-Options is set', res.headers.get('x-frame-options') === 'DENY')
}

// 5. A forged X-Forwarded-For does not reset the rate limit.
{
  const res = await fetch(`${BASE}/api/terminal/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': '10.0.0.1',
    },
    body: JSON.stringify({ clientId: `xff_${randomBytes(4).toString('hex')}` }),
  })
  report(
    'a forged X-Forwarded-For does not bypass the limit',
    res.status === 429,
    `status=${res.status}`
  )
}

console.log(failures ? `\n${failures} check(s) failed` : '\nEvery check passed')
process.exit(failures ? 1 : 0)
