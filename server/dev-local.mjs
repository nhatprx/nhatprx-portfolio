#!/usr/bin/env node
/**
 * Starts local dev against the real EC2 node.
 *
 * The terminal and the live metrics are only meaningful on the EC2 instance:
 * the allowlist commands (uname, free, df, ...) and the /proc metrics do not
 * exist on Windows. So this script opens an SSH tunnel to the node and points
 * the local API at it.
 *
 *   Terminal + metrics : the EC2 node (via the tunnel)
 *   Admin / S3: the local API, using the local AWS credentials
 *
 * Usage:
 *   npm run dev:local
 *   EC2_HOST=1.2.3.4 EC2_USER=ubuntu npm run dev:local
 *
 * Environment overrides: EC2_HOST, EC2_USER, SSH_KEY, TUNNEL_PORT, API_PORT.
 */

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const EC2_HOST = process.env.EC2_HOST || '13.250.247.238'
const EC2_USER = process.env.EC2_USER || 'ubuntu'
const SSH_KEY = process.env.SSH_KEY || resolve(ROOT, 'nhatprx-portfolio-key.pem')

// The tunnel binds the node's API to TUNNEL_PORT; the local API then listens
// on API_PORT and relays terminal/metric calls through the tunnel.
const TUNNEL_PORT = process.env.TUNNEL_PORT || '8899'
const API_PORT = process.env.API_PORT || '8788'

// The content bucket lives in ap-southeast-1. A shell that still exports
// AWS_REGION=us-east-1 makes every S3 call fail with a PermanentRedirect, so
// pin the region the bucket actually lives in.
const AWS_REGION = process.env.AWS_REGION_FOR_DEV || 'ap-southeast-1'

if (!existsSync(SSH_KEY)) {
  console.error(`SSH key not found: ${SSH_KEY}`)
  console.error('Set SSH_KEY=/path/to/key.pem and retry.')
  process.exit(1)
}

const children = []
function run(command, args, options = {}) {
  // On Windows, spawn through the shell only for bare commands like npm.
  // Passing an absolute path with spaces (node.exe under "C:\Program Files")
  // through the shell would break on the space.
  const needsShell = process.platform === 'win32' && !/^[a-z]:[\\/]/i.test(command) && !command.includes('\\')
  const child = spawn(command, args, { stdio: 'inherit', shell: needsShell, ...options })
  children.push(child)
  return child
}

function cleanup() {
  for (const child of children) {
    try {
      child.kill()
    } catch {
      // already gone
    }
  }
}
process.on('exit', cleanup)
process.on('SIGINT', () => {
  cleanup()
  process.exit(130)
})
process.on('SIGTERM', () => {
  cleanup()
  process.exit(143)
})

/** Polls the tunnel until the node's API answers, or the attempt times out. */
async function waitForTunnel() {
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${TUNNEL_PORT}/api/health`)
      if (res.ok) return true
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  return false
}

console.log(`==> Opening SSH tunnel ${EC2_USER}@${EC2_HOST}:${TUNNEL_PORT} -> 127.0.0.1:8787`)
// The host key is pinned when EC2_SSH_HOST_KEY is set. Without it the tunnel
// still works, but the host is not verified: a machine that can intercept the
// connection could present its own key and receive the deploy key.
const sshOptions = ['-i', SSH_KEY, '-o', 'ExitOnForwardFailure=yes', '-o', 'ServerAliveInterval=30']
if (process.env.EC2_SSH_HOST_KEY) {
  sshOptions.push('-o', 'StrictHostKeyChecking=yes')
} else {
  console.warn('    ! EC2_SSH_HOST_KEY not set - the SSH host key is not being verified')
}
run('ssh', [
  ...sshOptions,
  '-N',
  '-L', `${TUNNEL_PORT}:127.0.0.1:8787`,
  `${EC2_USER}@${EC2_HOST}`,
])
if (!(await waitForTunnel())) {
  console.error('Tunnel did not come up. Is the EC2 host reachable on port 22?')
  cleanup()
  process.exit(1)
}
console.log('==> Tunnel up')

console.log(`==> Starting local API on :${API_PORT} (upstream http://127.0.0.1:${TUNNEL_PORT})`)
run(process.execPath, [resolve(ROOT, 'server', 'index.mjs')], {
  cwd: resolve(ROOT, 'server'),
  env: {
    ...process.env,
    PORT: API_PORT,
    TERMINAL_UPSTREAM: `http://127.0.0.1:${TUNNEL_PORT}`,
    AWS_REGION,
  },
})

console.log(`==> Starting Vite on :5173 (proxies /api to :${API_PORT})`)
// npm is a .cmd shim on Windows, which spawn cannot execute directly.
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
run(npm, ['run', 'dev'], {
  cwd: ROOT,
  env: { ...process.env, API_PORT },
})
