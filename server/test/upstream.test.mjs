import test from 'node:test'
import assert from 'node:assert'
import { createServer } from 'node:http'
import { execOnUpstream, getFromUpstream } from '../upstream.mjs'

/** Starts a throwaway upstream API and returns its base URL. */
async function startUpstream(handler) {
  const server = createServer(handler)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  return {
    base: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  }
}

/**
 * Builds an upstream that speaks the token scheme: it issues a token and
 * verifies the HMAC signature over `clientId|timestamp|command`.
 */
function tokenUpstream(t = {}) {
  return async (req, res) => {
    if (req.url === '/api/terminal/token') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ token: 'upstream-token', expiresIn: 3600 }))
      return
    }
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      t.received = { headers: req.headers, body: JSON.parse(body) }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true, stdout: 'Linux ec2-node' }))
    })
  }
}

/** Builds an upstream that speaks the legacy scheme: no token endpoint. */
function legacyUpstream(t = {}) {
  return async (req, res) => {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      t.received = { headers: req.headers, body: JSON.parse(body) }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true, stdout: 'Linux legacy-node' }))
    })
  }
}

test('upstream - command execution', async t => {
  await t.test('returns stdout from a token-scheme upstream', async () => {
    const upstream = await startUpstream(tokenUpstream())
    try {
      const result = await execOnUpstream(upstream.base, 'uname -a')
      assert.strictEqual(result.ok, true)
      assert.strictEqual(result.stdout, 'Linux ec2-node')
    } finally {
      await upstream.close()
    }
  })

  await t.test('returns stdout from a legacy-scheme upstream', async () => {
    const upstream = await startUpstream(legacyUpstream())
    try {
      const result = await execOnUpstream(upstream.base, 'uname -a')
      assert.strictEqual(result.ok, true)
      assert.strictEqual(result.stdout, 'Linux legacy-node')
    } finally {
      await upstream.close()
    }
  })

  await t.test('sends the command and the security headers upstream', async () => {
    const state = {}
    const upstream = await startUpstream(tokenUpstream(state))
    try {
      await execOnUpstream(upstream.base, 'free -h')
      assert.strictEqual(state.received.body.command, 'free -h')
      assert.ok(state.received.headers['x-request-signature'])
      assert.ok(state.received.headers['x-client-id'])
      assert.ok(state.received.headers['x-timestamp'])
      assert.strictEqual(state.received.headers['x-terminal-token'], 'upstream-token')
    } finally {
      await upstream.close()
    }
  })

  await t.test('surfaces the upstream error message', async () => {
    const upstream = await startUpstream(async (req, res) => {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'command not allowed: rm' }))
    })
    try {
      const result = await execOnUpstream(upstream.base, 'rm -rf /')
      assert.strictEqual(result.ok, false)
      assert.match(result.error, /command not allowed/)
    } finally {
      await upstream.close()
    }
  })

  await t.test('reports an unreachable upstream instead of throwing', async () => {
    const result = await execOnUpstream('http://127.0.0.1:1', 'uname -a')
    assert.strictEqual(result.ok, false)
    assert.match(result.error, /upstream unreachable/)
  })
})

test('upstream - json GET', async t => {
  await t.test('returns the parsed body', async () => {
    const upstream = await startUpstream(async (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true, metrics: { cpu_cores: 2 } }))
    })
    try {
      const body = await getFromUpstream(upstream.base, '/api/metrics')
      assert.strictEqual(body.metrics.cpu_cores, 2)
    } finally {
      await upstream.close()
    }
  })

  await t.test('returns null when the upstream is unreachable', async () => {
    const body = await getFromUpstream('http://127.0.0.1:1', '/api/metrics')
    assert.strictEqual(body, null)
  })
})
