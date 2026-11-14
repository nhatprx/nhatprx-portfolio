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
  'systemctl',
  'ls -la',
  'cat resume.txt',
  'help',
]

/**
 * Commands that the server actually executes on the EC2 node. The key is the
 * first token the user types; the value is the canonical command the server
 * allowlist expects. The server re-validates it against its own allowlist, so
 * this list is only about which commands get routed there.
 */
const REMOTE_COMMANDS: Record<string, string> = {
  uname: 'uname -a',
  uptime: 'uptime',
  free: 'free -h',
  df: 'df -h',
  whoami: 'whoami',
  hostname: 'hostname',
  ls: 'ls -1 -la',
  systemctl: 'systemctl-nhatprx',
  nginx: 'nginx-status',
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

  // Detect space-separated multiple commands (e.g. "whoami hostname uptime")
  // and suggest the correct chaining syntax
  if (tokens.length > 1 && Object.keys(REMOTE_COMMANDS).includes(tokens[1])) {
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
        text: `Production Node Guest Terminal - Available Read-Only Commands:
  • uname -a           - Print Linux kernel & AWS architecture
  • free -h            - Display available physical & swap memory
  • df -h              - Show the root EBS partition usage
  • uptime             - Show EC2 instance uptime & load average
  • hostname           - Print the instance hostname
  • systemctl          - Check the portfolio API daemon health
  • nginx              - Check the nginx daemon health
  • ls -la             - List the deployed projects on the node
  • whoami             - Print current shell user permissions
  • cat resume.txt     - View your resume
  • clear              - Clear the terminal screen

Chain commands with && (stop on error) or ; (always continue):
  e.g.  whoami && hostname && uptime
        free -h ; df -h ; uptime

Live commands above are executed on the real EC2 node and stream back actual
system output. Everything else is served from the local guest sandbox.`,
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
• Languages: Java, Python, JavaScript, TypeScript
• Backend: Spring Boot, REST APIs, WebSocket, OAuth2
• Cloud/DevOps: AWS (EC2, S3, Lambda, CloudFront), Docker, Jenkins, GCP
• Data: PostgreSQL, MySQL, Redis
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
          text: `cat: ${arg}: Permission denied or file not found in demo sandbox.`,
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
      entries.push({
        type: 'error',
        text: `bash: ${cmd}: Permission denied (guest shell is restricted to read-only inspection commands).`,
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
  // Split on && or ; but keep the delimiter so we know how to chain.
  const parts = raw.split(/(&&|;)/)
  const result: { cmd: string; op: '&&' | ';' | null }[] = []
  for (let i = 0; i < parts.length; i += 2) {
    const cmd = parts[i].trim()
    const op = (parts[i + 1]?.trim() as '&&' | ';') ?? null
    if (cmd) result.push({ cmd, op })
  }
  return result
}

/** Check if every sub-command in a chain is a known remote command. */
export function isFullyRemote(raw: string): boolean {
  const chain = parseChain(raw)
  if (chain.length === 0) return false
  return chain.every(({ cmd }) => {
    const key = cmd.split(/\s+/)[0].toLowerCase()
    return key in REMOTE_COMMANDS
  })
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
    const key = cmd.split(/\s+/)[0].toLowerCase()
    const remote = REMOTE_COMMANDS[key]!
    try {
      const { stdout } = await execTerminalCommand(remote)
      outputs.push(stdout)
      // Write to console for debugging
      console.log(`[terminal] executed "${remote}" on EC2`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'command failed'
      outputs.push(`bash: ${key}: ${msg}`)
      // && stops on failure; ; continues
      if (op === '&&' || op === null) break
    }
  }

  return outputs.join('\n')
}
