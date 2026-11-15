/**
 * Read-only command runner for the public terminal on the EC2 node.
 *
 * The API already runs on the same instance as the portfolio, so the terminal
 * does not tunnel SSH - it runs the inspection commands locally. That keeps the
 * SSH key off the box entirely and makes the attack surface the allowlist below.
 *
 * Only the commands in ALLOWED_COMMANDS may run. Arguments are validated
 * separately: a command like `ls` is safe, but `ls /etc/shadow` is not, so
 * each command declares which argument shapes it accepts.
 */

import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const EXEC_TIMEOUT_MS = 5_000
const MAX_OUTPUT_BYTES = 100 * 1024
const API_ROOT = existsSync('/home/ubuntu/nhatprx-api')
  ? '/home/ubuntu/nhatprx-api'
  : process.cwd()
// The API logs to journald under systemd, so `api-log` reads the journal
// rather than a file. There is no api.log on the node.
// CI writes a VERSION file with the deployed commit metadata. The node has no
// .git directory, so the git commands read this file instead of running git.
// `cat` on a missing file just prints an error, so the path is fixed.
const VERSION_FILE = `${API_ROOT}/VERSION`

/**
 * The public allowlist. Each entry is the exact argv tail that gets executed,
 * so no user text is ever interpolated into a shell string.
 *
 * `args` lists the accepted argument forms for that command. An empty array
 * means the command takes no arguments at all.
 *
 * The list is deliberately narrow and only covers what actually exists on the
 * node: the instance runs nginx + the portfolio API and has no docker daemon.
 */
export const ALLOWED_COMMANDS = {
  // System info
  uname: {
    args: ['-a'],
    exec: ['uname', '-a'],
  },
  uptime: {
    args: [],
    exec: ['uptime'],
  },
  free: {
    args: ['-h'],
    exec: ['free', '-h'],
  },
  df: {
    args: ['-h'],
    exec: ['df', '-h'],
  },
  whoami: {
    args: [],
    exec: ['whoami'],
  },
  hostname: {
    args: [],
    exec: ['hostname'],
  },
  id: {
    args: [],
    exec: ['id'],
  },
  nproc: {
    args: [],
    exec: ['nproc'],
  },
  
  // Deployment metadata - the node has no .git, so CI writes a VERSION file
  // with the deployed commit details and these commands read it.
  git: {
    forms: {
      log: ['cat', VERSION_FILE],
      branch: ['cat', VERSION_FILE],
      status: ['cat', VERSION_FILE],
      show: ['cat', VERSION_FILE],
    },
  },

  // Health & Metrics
  health: {
    args: [],
    exec: ['curl', '-s', 'http://localhost:8787/api/health'],
  },
  'health-detailed': {
    args: [],
    exec: ['curl', '-s', 'http://localhost:8787/api/system-info'],
  },
  metrics: {
    args: [],
    // `ps -eo pid,comm,rss` instead of `ps aux`: the full listing exposes
    // every process command line, which can carry secrets in argv. The
    // column set is kept to what procps and BusyBox both accept - `%cpu`
    // and `%mem` are not portable.
    exec: ['ps', '-eo', 'pid,comm,rss'],
  },
  'metrics-cpu': {
    args: [],
    // `top -bn1` is the portable form; `-b -n 1 -o ...` is not supported by
    // every `top` build and also prints command lines.
    exec: ['top', '-bn1'],
  },

  // Process & Services
  ps: {
    args: [],
    exec: ['ps', '-eo', 'pid,comm,rss'],
  },
  
  // Logs
  'api-log': {
    args: [],
    // The API runs under systemd, so its output is in the journal.
    exec: ['journalctl', '-u', 'nhatprx-api', '-n', '30', '--no-pager'],
  },  'nginx-access': {
    args: [],
    exec: ['tail', '-n', '30', '/var/log/nginx/access.log'],
  },
  'nginx-error': {
    args: [],
    exec: ['tail', '-n', '30', '/var/log/nginx/error.log'],
  },

  // Files & Directory listing
  ls: {
    // Only the project directory, not the whole home dir: the home folder
    // holds .ssh and other paths that should never be listed publicly.
    //
    // The listing is capped and excludes node_modules: the full listing
    // exposes the API source and takes a long time on a large tree.
    args: ['-la'],
    exec: ['ls', '-la', '--ignore=node_modules', API_ROOT],
  },

  // Services status
  'systemctl-nhatprx': {
    args: [],
    exec: ['systemctl', 'is-active', 'nhatprx-api'],
  },
  'nginx-status': {
    args: [],
    exec: ['systemctl', 'is-active', 'nginx'],
  },

  // Proc filesystem info
  'proc-cpuinfo': {
    args: [],
    exec: ['grep', '-c', '^processor', '/proc/cpuinfo'],
  },
  'proc-meminfo': {
    args: [],
    exec: ['cat', '/proc/meminfo'],
  },
  'proc-loadavg': {
    args: [],
    exec: ['cat', '/proc/loadavg'],
  },
  'proc-net-dev': {
    args: [],
    exec: ['cat', '/proc/net/dev'],
  },
}

/**
 * Checks a command line against the allowlist.
 * Returns { ok: true, key } or { ok: false, reason }.
 */
export function resolveCommand(raw) {
  const trimmed = String(raw || '').trim()
  if (!trimmed) return { ok: false, reason: 'empty command' }
  // One argv token cannot contain shell syntax. Chaining is the client's job.
  if (/[;&|`$<>]/.test(trimmed)) {
    return { ok: false, reason: 'shell syntax not allowed' }
  }

  const tokens = trimmed.split(/\s+/)
  const key = tokens[0].toLowerCase()
  const args = tokens.slice(1)
  const spec = ALLOWED_COMMANDS[key]
  if (!spec) return { ok: false, reason: `command not allowed: ${key}` }

  if (spec.forms) {
    const form = spec.forms[args[0]]
    if (!form || args.length !== 1) {
      return { ok: false, reason: `argument not allowed for ${key}: ${args.join(' ') || '(none)'}` }
    }
    return { ok: true, key, spec: { exec: form } }
  }

  const accepted = spec.args.join('\0')
  if (args.join('\0') !== accepted) {
    return { ok: false, reason: `argument not allowed for ${key}: ${args.join(' ') || '(none)'}` }
  }
  return { ok: true, key, spec }
}

/**
 * Runs an allowlisted command and returns its real output.
 * Never throws for a rejected command - the caller turns it into a 400.
 * 
 * Error types returned:
 * - "not_allowed": command not in allowlist
 * - "permission_denied": Linux permission denied (exit code 1 + EACCES pattern)
 * - "not_found": file/command not found (exit code 127 or ENOENT pattern)
 * - "timeout": command execution timeout
 * - "error": other execution errors
 */
export async function runTerminalCommand(raw) {
  const resolved = resolveCommand(raw)
  if (!resolved.ok) {
    return { ok: false, error: resolved.reason, error_type: 'not_allowed' }
  }

  const { spec, key } = resolved

  try {
    const { stdout, stderr } = await execFileAsync(spec.exec[0], spec.exec.slice(1), {
      timeout: EXEC_TIMEOUT_MS,
      maxBuffer: MAX_OUTPUT_BYTES,
      // No shell: the argv is fixed by the allowlist, so nothing the user typed
      // can turn into a shell metacharacter.
      shell: false,
      env: {
        // PATH is inherited so the command resolves on the host OS too; the
        // EC2 box and the local dev machine have different layouts.
        PATH: process.env.PATH,
        HOME: process.env.HOME || '/home/ubuntu',
      },
    })

    const out = String(stdout || '').trimEnd()
    const err = String(stderr || '').trimEnd()
    const text = err && !out ? err : out || err

    return {
      ok: true,
      command: key,
      stdout: text,
    }
  } catch (err) {
    const message = err?.stderr || err?.message || 'command failed'
    const code = typeof err?.code === 'number' ? err.code : null
    
    // Classify error type based on exit code and message
    let error_type = 'error'
    if (err.code === 'ETIMEDOUT') {
      error_type = 'timeout'
    } else if (code === 127 || /command not found|ENOENT/.test(message)) {
      error_type = 'not_found'
    } else if (code === 1 && /Permission denied|EACCES/.test(message)) {
      error_type = 'permission_denied'
    } else if (code === 1 && /No such file or directory/.test(message)) {
      error_type = 'not_found'
    }

    return {
      ok: false,
      command: key,
      error: String(message).trimEnd(),
      error_type: error_type,
      exitCode: code,
    }
  }
}
