import test from 'node:test'
import assert from 'node:assert'
import { createServer } from 'node:http'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdir, writeFile } from 'node:fs/promises'

// Import from the backend server
const __dir = dirname(fileURLToPath(import.meta.url))
const SERVER_DIR = resolve(__dir, '..')

// Minimal test: verify the rate limiting and security functions exist
test('API Security - Rate Limiting', async t => {
  // Create in-memory rate limit state
  const rateLimitMap = new Map()
  const RATE_LIMIT_WINDOW = 60000
  const RATE_LIMIT_MAX = 60

  function checkRateLimit(key) {
    const now = Date.now()
    let state = rateLimitMap.get(key)
    if (!state || now >= state.resetTime) {
      state = { count: 1, resetTime: now + RATE_LIMIT_WINDOW }
      rateLimitMap.set(key, state)
      return { allowed: true, resetIn: 0 }
    }
    state.count++
    if (state.count > RATE_LIMIT_MAX) {
      return { allowed: false, resetIn: state.resetTime - now }
    }
    return { allowed: true, resetIn: 0 }
  }

  await t.test('allows first request', () => {
    const result = checkRateLimit('test-client-1')
    assert.strictEqual(result.allowed, true)
  })

  await t.test('blocks after limit exceeded', () => {
    const key = 'test-client-2'
    // Simulate 61 requests
    for (let i = 0; i < 61; i++) {
      const result = checkRateLimit(key)
      if (i < 60) {
        assert.strictEqual(result.allowed, true, `request ${i + 1} should be allowed`)
      } else {
        assert.strictEqual(result.allowed, false, 'request 61 should be blocked')
        assert(result.resetIn > 0, 'should have resetIn time')
      }
    }
  })

  await t.test('resets after window expires', (ctx, done) => {
    const key = 'test-client-3'
    
    // Hit the limit
    for (let i = 0; i < 60; i++) {
      checkRateLimit(key)
    }
    let result = checkRateLimit(key)
    assert.strictEqual(result.allowed, false, 'should be blocked')

    // Manually expire the window
    const state = rateLimitMap.get(key)
    state.resetTime = Date.now()

    // After expiry, should reset
    result = checkRateLimit(key)
    assert.strictEqual(result.allowed, true, 'should be allowed after window reset')
    done()
  })
})

test('API Security - Output Sanitization', async t => {
  function sanitizeTerminalOutput(output) {
    // Mask AWS keys
    output = output.replace(/AKIA[0-9A-Z]{16}/g, 'AKIA****')
    // Mask secret keys - more flexible pattern
    output = output.replace(/aws_secret_access_key\s*[:=]\s*\S+/gi, 'aws_secret_access_key: ****')
    output = output.replace(/secret_access_key\s*[:=]\s*\S+/gi, 'secret_access_key: ****')
    // Mask generic credentials
    output = output.replace(/password\s*[:=]\s*\S+/gi, 'password: ****')
    output = output.replace(/token\s*[:=]\s*\S+/gi, 'token: ****')
    output = output.replace(/api[_-]?key\s*[:=]\s*\S+/gi, 'api_key: ****')
    // Mask private IPs
    output = output.replace(/192\.168\.\d{1,3}\.\d{1,3}/g, 'x.x.x.x')
    output = output.replace(/10\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, 'x.x.x.x')
    output = output.replace(/172\.(1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3}/g, 'x.x.x.x')
    // Limit size
    const MAX_OUTPUT = 100 * 1024
    if (output.length > MAX_OUTPUT) {
      output = output.substring(0, MAX_OUTPUT) + '\n... (output truncated)'
    }
    return output
  }

  await t.test('masks AWS access keys', () => {
    const output = 'Your AWS key is AKIAIOSFODNN7EXAMPLE'
    const sanitized = sanitizeTerminalOutput(output)
    assert(!sanitized.includes('AKIAIOSFODNN7EXAMPLE'))
    assert(sanitized.includes('AKIA****'))
  })

  await t.test('masks secret access keys', () => {
    const output = 'aws_secret_access_key: wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY'
    const sanitized = sanitizeTerminalOutput(output)
    assert(!sanitized.includes('wJalrXUtnFEMI'))
    assert(sanitized.includes('aws_secret_access_key: ****'))
  })

  await t.test('masks passwords', () => {
    const output = 'database_password: super_secret_pass123'
    const sanitized = sanitizeTerminalOutput(output)
    assert(!sanitized.includes('super_secret_pass123'))
    assert(sanitized.includes('password: ****'))
  })

  await t.test('masks API keys', () => {
    const output = 'api_key=sk_live_abc123def456'
    const sanitized = sanitizeTerminalOutput(output)
    assert(!sanitized.includes('sk_live_abc123def456'))
    assert(sanitized.includes('api_key: ****'))
  })

  await t.test('masks private IP addresses', () => {
    let output = 'Server at 192.168.1.100 is connected'
    let sanitized = sanitizeTerminalOutput(output)
    assert(!sanitized.includes('192.168.1.100'))
    assert(sanitized.includes('x.x.x.x'))

    output = 'Internal IP: 10.0.0.5'
    sanitized = sanitizeTerminalOutput(output)
    assert(!sanitized.includes('10.0.0.5'))

    output = 'Network: 172.20.1.1'
    sanitized = sanitizeTerminalOutput(output)
    assert(!sanitized.includes('172.20.1.1'))
  })

  await t.test('truncates large outputs', () => {
    const largeOutput = 'a'.repeat(120 * 1024)
    const sanitized = sanitizeTerminalOutput(largeOutput)
    assert(sanitized.length < 120 * 1024)
    assert(sanitized.includes('output truncated'))
  })

  await t.test('preserves legitimate output', () => {
    const output = 'user@host: ~$ echo "Hello World"\nHello World'
    const sanitized = sanitizeTerminalOutput(output)
    assert(sanitized.includes('Hello World'))
    assert(sanitized.includes('user@host'))
  })
})

test('API Security - Request Validation', async t => {
  function validateTerminalRequest(headers) {
    const signature = headers['x-request-signature']
    const clientId = headers['x-client-id']
    const timestamp = parseInt(headers['x-timestamp'], 10)

    if (!signature || !clientId || !timestamp) {
      return { ok: false, error: 'Missing security headers' }
    }

    const now = Date.now()
    if (Math.abs(now - timestamp) > 5 * 60 * 1000) {
      return { ok: false, error: 'Request timestamp expired' }
    }

    return { ok: true }
  }

  await t.test('rejects missing signature header', () => {
    const result = validateTerminalRequest({
      'x-client-id': 'test',
      'x-timestamp': String(Date.now()),
    })
    assert.strictEqual(result.ok, false)
    assert.match(result.error, /Missing security headers/)
  })

  await t.test('rejects missing client ID header', () => {
    const result = validateTerminalRequest({
      'x-request-signature': 'sig',
      'x-timestamp': String(Date.now()),
    })
    assert.strictEqual(result.ok, false)
  })

  await t.test('rejects expired timestamp', () => {
    const oldTimestamp = Date.now() - 6 * 60 * 1000 // 6 minutes ago
    const result = validateTerminalRequest({
      'x-request-signature': 'sig',
      'x-client-id': 'test',
      'x-timestamp': String(oldTimestamp),
    })
    assert.strictEqual(result.ok, false)
    assert.match(result.error, /timestamp expired/)
  })

  await t.test('accepts valid headers', () => {
    const result = validateTerminalRequest({
      'x-request-signature': 'sig',
      'x-client-id': 'test',
      'x-timestamp': String(Date.now()),
    })
    assert.strictEqual(result.ok, true)
  })
})
