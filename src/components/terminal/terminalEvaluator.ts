import { getStoredTerminalCommands } from '../../services/contentStorage'
import { execTerminalCommand } from '../../services/terminalApi'
import { DEFAULT_IDENTITY, type Identity } from '../../data/identity'
import type { HistoryEntry } from './types'

export const INITIAL_GREETING: HistoryEntry[] = [
  {
    type: 'system',
    text: 'Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-1018-generic x86_64)',
  },
  {
    type: 'system',
    text:
      ' * Documentation:  https://help.ubuntu.com\n * Management:     Cloud Node Console (ap-southeast-1)\n * Security:       Read-only inspection shell active (Guest)\n * Live:           commands run on this instance and return live system output',
  },
  {
    type: 'system',
    text: 'Type "help" or click command pills below to inspect live instance metrics.',
  },
]

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

/**
 * Runs a command against the live EC2 node.
 * Returns null when the command is not one of the remote ones, so the caller
 * can fall back to the local guest sandbox.
 */
export async function runRemoteCommand(raw: string): Promise<string | null> {
  const tokens = raw.trim().split(/\s+/)
  const cmd = tokens[0].toLowerCase()
  const remote = REMOTE_COMMANDS[cmd]
  if (!remote) return null

  const { stdout } = await execTerminalCommand(remote)
  return stdout
}
