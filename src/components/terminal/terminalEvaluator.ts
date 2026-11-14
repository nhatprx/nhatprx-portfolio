import { getStoredTerminalCommands } from '../../services/contentStorage'
import { execTerminalCommand, fetchTerminalInfo } from '../../services/terminalApi'
import { DEFAULT_IDENTITY, type Identity } from '../../data/identity'
import type { HistoryEntry } from './types'

let cachedGreeting: HistoryEntry[] | null = null

export async function INITIAL_GREETING(): Promise<HistoryEntry[]> {
  if (cachedGreeting) return cachedGreeting

  try {
    const info = await fetchTerminalInfo()
    cachedGreeting = [
      {
        type: 'system',
        text: `Welcome to ${info.os_release} (GNU/Linux ${info.kernel_version} ${info.is_ec2 ? 'x86_64-aws' : 'x86_64'})`,
      },
      {
        type: 'system',
        text: ` * Documentation:  https://help.ubuntu.com\n * Management:     ${info.is_ec2 ? 'AWS EC2 Console' : 'Local System'}\n * Security:       Read-only inspection shell (allowlist-based)\n * Live:           All commands execute on ${info.hostname} and return real-time output`,
      },
      {
        type: 'system',
        text: 'Type "help" or click command pills to see available monitoring tools.',
      },
    ]
  } catch {
    // Fallback to static greeting on error
    cachedGreeting = [
      {
        type: 'system',
        text: 'Welcome to Ubuntu (GNU/Linux AWS)',
      },
      {
        type: 'system',
        text: ' * Security: Read-only inspection shell (allowlist-based)\n * Live: All commands execute on the real EC2 node',
      },
      {
        type: 'system',
        text: 'Type "help" to see available commands.',
      },
    ]
  }

  return cachedGreeting
}

export const QUICK_COMMANDS = [
  'uname -a',
  'free -h',
  'df -h',
  'uptime',
  'git log',
  'health',
  'api-log',
  'help',
]

// Keys are what the visitor types. Values are the exact strings the server
// allowlist accepts. Do not add a command here unless terminal.mjs can run it.
const REMOTE_COMMANDS: Record<string, string> = {
  uname: 'uname -a',
  uptime: 'uptime',
  free: 'free -h',
  df: 'df -h',
  whoami: 'whoami',
  hostname: 'hostname',
  id: 'id',
  nproc: 'nproc',
  'git log': 'git log',
  'git branch': 'git branch',
  'git status': 'git status',
  'git show': 'git show',
  health: 'health',
  'health-detailed': 'health-detailed',
  metrics: 'metrics',
  'metrics-cpu': 'metrics-cpu',
  ps: 'ps aux',
  'api-log': 'api-log',
  'nginx-access': 'nginx-access',
  'nginx-error': 'nginx-error',
  ls: 'ls -la',
  'systemctl-nhatprx': 'systemctl-nhatprx',
  'nginx-status': 'nginx-status',
  'proc-cpuinfo': 'proc-cpuinfo',
  'proc-meminfo': 'proc-meminfo',
  'proc-loadavg': 'proc-loadavg',
  'proc-net-dev': 'proc-net-dev',
}

export function evaluateTerminalCommand(
  raw: string,
  identity: Identity = DEFAULT_IDENTITY
): {
  entries: HistoryEntry[]
  isClear?: boolean
} {
  const trimmed = raw.trim()
  if (!trimmed) {
    return {
      entries: [{ type: 'input', text: 'ubuntu@nhatprx-server:~$ ' }],
    }
  }

  const tokens = trimmed.split(/\s+/)
  const cmd = tokens[0].toLowerCase()
  const arg = tokens[1]?.toLowerCase()

  const entries: HistoryEntry[] = [{ type: 'input', text: `ubuntu@nhatprx-server:~$ ${raw}` }]

  const customCommands = getStoredTerminalCommands()
  if (customCommands[cmd]) {
    entries.push({
      type: 'output',
      text: customCommands[cmd],
    })
    return { entries }
  }

  if (tokens.length > 1 && Object.keys(REMOTE_COMMANDS).includes(tokens[1].toLowerCase())) {
    entries.push({
      type: 'error',
      text: `bash: ${tokens[1]}: command not found.\n\nDid you mean to chain multiple commands? Try:\n  ${tokens.join(' && ')}   (stop on first error)\n  ${tokens.join(' ; ')}    (always continue)`,
    })
    return { entries }
  }

  switch (cmd) {
    case 'help':
      entries.push({
        type: 'output',
        text: `Production Node Guest Terminal - Read-Only Inspector
---------------------------------------------------------------

SYSTEM:
  uname -a             Kernel and architecture
  free -h              RAM and swap
  df -h                Disk usage
  uptime               Uptime and load average
  nproc                CPU count
  proc-cpuinfo         Processor count from /proc
  proc-meminfo         Memory details from /proc
  proc-loadavg         Load average from /proc
  proc-net-dev         Network interface counters

DEPLOYMENT:
  git log              Last 10 commits
  git branch           Branches
  git status           Working tree
  git show             HEAD commit
  ls -la               API directory

HEALTH:
  health               API health check
  health-detailed      Host info from the API
  systemctl-nhatprx    portfolio API service state
  nginx-status         nginx service state
  metrics              Process list
  metrics-cpu          One CPU snapshot
  ps aux               Process list

LOGS:
  api-log              Last 30 API log lines
  nginx-access         Last 30 nginx access lines
  nginx-error          Last 30 nginx error lines

IDENTITY:
  hostname             Instance hostname
  whoami               Current user
  id                   User and groups

LOCAL:
  cat resume.txt       Resume from site identity
  cat docker-compose.yml  Sample compose file
  clear                Clear the screen
  help                 This menu

CHAINING:
  git log && health && uptime     stop on the first error
  free -h ; df -h ; uptime        continue after an error

SECURITY:
  Read-only allowlist. No shell, pipes, or file changes.
  60 requests per minute. If the node is down, live
  commands fail instead of returning fake output.`,
      })
      break

    case 'cat':
      if (!arg || arg === 'resume.txt') {
        entries.push({
          type: 'output',
          text: `===========================================================
${identity.displayName.toUpperCase()} - Software Engineer
Location: Ho Chi Minh City, Vietnam
GitHub: ${identity.githubUrl}
LinkedIn: ${identity.linkedinUrl}
===========================================================
[PROFILE]
Software Engineer experienced in backend systems, cloud infra (AWS, GCP),
and full-stack delivery. Built systems at Grevo Solutions and AWS intern.

[STACK]
- Languages: Java, Python, JavaScript, TypeScript
- Backend: Spring Boot, REST APIs, WebSocket, OAuth2
- Cloud/DevOps: AWS (EC2, S3, Lambda, CloudFront), Docker, Jenkins, GCP
- Data: PostgreSQL, MySQL, Redis
===========================================================`,
        })
      } else if (arg === 'docker-compose.yml') {
        entries.push({
          type: 'output',
          text: `services:
  backend:
    image: grevo-backend:3.3
    ports: ["8080:8080"]
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - AWS_REGION=ap-southeast-1
  redis:
    image: redis:7.2-alpine
    restart: always`,
        })
      } else {
        entries.push({
          type: 'error',
          text: `cat: ${arg}: Permission denied or file not found.`,
        })
      }
      break

    case 'clear':
      return { entries: [], isClear: true }

    case 'sudo':
    case 'rm':
    case 'reboot':
    case 'shutdown':
    case 'kill':
    case 'chmod':
    case 'chown':
    case 'passwd':
    case 'useradd':
    case 'userdel':
    case 'mkfs':
    case 'dd':
    case 'service':
    case 'systemctl':
      entries.push({
        type: 'error',
        text: `bash: ${cmd}: Permission denied. This is a read-only inspection shell.`,
      })
      break

    default:
      entries.push({
        type: 'error',
        text: `bash: ${cmd}: command not found. Type "help" to see available inspection commands.`,
      })
      break
  }

  return { entries }
}

/** Split raw input on `&&` and `;` operators, preserving which operator joined each pair. */
function parseChain(raw: string): { cmd: string; op: '&&' | ';' | null }[] {
  const parts = raw.split(/(&&|;)/)
  const result: { cmd: string; op: '&&' | ';' | null }[] = []
  for (let i = 0; i < parts.length; i += 2) {
    const cmd = parts[i].trim()
    const op = (parts[i + 1]?.trim() as '&&' | ';') ?? null
    if (cmd) result.push({ cmd, op })
  }
  return result
}

function remoteFor(raw: string): string | undefined {
  const typed = raw.trim().replace(/\s+/g, ' ').toLowerCase()
  if (REMOTE_COMMANDS[typed]) return REMOTE_COMMANDS[typed]
  const key = typed.split(' ')[0]
  const canonical = REMOTE_COMMANDS[key]
  return canonical && canonical.split(' ')[0] === key && typed === canonical ? canonical : undefined
}

/** Check if every sub-command in a chain is a known remote command. */
export function isFullyRemote(raw: string): boolean {
  const chain = parseChain(raw)
  if (chain.length === 0) return false
  return chain.every(({ cmd }) => remoteFor(cmd) !== undefined)
}

/**
 * Runs one or more chained commands (`&&` / `;`) against the live EC2 node.
 * Returns null when ANY sub-command is not remote, so the caller can fall back
 * to the local guest sandbox.
 *
 * `&&` stops the chain on first failure (like bash).
 * `;` always continues to the next command.
 */
export async function runRemoteCommand(raw: string): Promise<string | null> {
  if (!isFullyRemote(raw)) return null

  const chain = parseChain(raw)
  const outputs: string[] = []

  for (const { cmd, op } of chain) {
    const remote = remoteFor(cmd)!
    try {
      const { stdout } = await execTerminalCommand(remote)
      outputs.push(stdout)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'command failed'
      outputs.push(`bash: ${cmd}: ${msg}`)
      // && stops on failure; ; continues
      if (op === '&&' || op === null) break
    }
  }

  return outputs.join('\n')
}
