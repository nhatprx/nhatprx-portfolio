// Checks the rejection paths of the terminal endpoint against a running API.
//
// The happy path is covered by verify-terminal-signing.mjs; this one asserts
// that unsigned, mis-signed and cross-client requests are all refused.
//
// Usage: node scripts/verify-terminal-rejections.mjs [base-url]

import { createHmac, randomBytes } from 'node:crypto'

const BASE = process.argv[2] || 'http://127.0.0.1:8787'

async function post(headers, body) {
  const res = await fetch(`${BASE}/api/terminal/exec`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  return { status: res.status, body: await res.json().catch(() => ({})) }
}

async function getToken(clientId) {
  const res = await fetch(`${BASE}/api/terminal/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId }),
  })
  return (await res.json()).token
}

const cases = []

// 1. No security headers at all.
cases.push(['unsigned request', await post({}, { command: 'hostname' }), 400])

// 2. A token for client A, but the request claims to be client B.
const tokenA = await getToken('verify_client_a')
const ts = Date.now()
const nonceA = randomBytes(12).toString('hex')
cases.push([
  'token bound to another client id',
  await post(
    {
      'X-Request-Signature': createHmac('sha256', tokenA).update(`verify_client_b|${ts}|${nonceA}|hostname`).digest('hex'),
      'X-Client-Id': 'verify_client_b',
      'X-Terminal-Token': tokenA,
      'X-Timestamp': String(ts),
      'X-Request-Nonce': nonceA,
    },
    { command: 'hostname' }
  ),
  400,
])

// 3. A valid signature, but the body asks for a different command.
const tokenC = await getToken('verify_client_c')
const ts3 = Date.now()
const nonceC = randomBytes(12).toString('hex')
cases.push([
  'signature reused for another command',
  await post(
    {
      'X-Request-Signature': createHmac('sha256', tokenC).update(`verify_client_c|${ts3}|${nonceC}|hostname`).digest('hex'),
      'X-Client-Id': 'verify_client_c',
      'X-Terminal-Token': tokenC,
      'X-Timestamp': String(ts3),
      'X-Request-Nonce': nonceC,
    },
    { command: 'uptime' }
  ),
  400,
])

// 4. A timestamp from long ago.
const tokenD = await getToken('verify_client_d')
const stale = Date.now() - 10 * 60 * 1000
const nonceD = randomBytes(12).toString('hex')
cases.push([
  'expired timestamp',
  await post(
    {
      'X-Request-Signature': createHmac('sha256', tokenD).update(`verify_client_d|${stale}|${nonceD}|hostname`).digest('hex'),
      'X-Client-Id': 'verify_client_d',
      'X-Terminal-Token': tokenD,
      'X-Timestamp': String(stale),
      'X-Request-Nonce': nonceD,
    },
    { command: 'hostname' }
  ),
  400,
])

// 5. A correctly signed request, replayed with the same nonce.
const tokenE = await getToken('verify_client_e')
const tsE = Date.now()
const nonceE = randomBytes(12).toString('hex')
const sigE = createHmac('sha256', tokenE).update(`verify_client_e|${tsE}|${nonceE}|hostname`).digest('hex')
const replayHeaders = {
  'X-Request-Signature': sigE,
  'X-Client-Id': 'verify_client_e',
  'X-Terminal-Token': tokenE,
  'X-Timestamp': String(tsE),
  'X-Request-Nonce': nonceE,
}
const first = await post(replayHeaders, { command: 'hostname' })
cases.push(['first use of a signed request', first, first.status === 429 ? 429 : 200])
const replayed = await post(replayHeaders, { command: 'hostname' })
cases.push(['replayed request with the same nonce', replayed, 400])

let failed = 0
for (const [name, result, expected] of cases) {
  const ok = result.status === expected
  if (!ok) failed++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: status=${result.status} (expected ${expected}) ${result.body.error ?? ''}`)
}

process.exit(failed ? 1 : 0)
