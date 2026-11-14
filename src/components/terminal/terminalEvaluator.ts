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
  'docker ps',
  'help',
]

/**
 * Commands that the server actually executes on the EC2 node. The key is the
 * first token the user types; the value is the canonical command the server
 * allowlist expects. The server re-validates it against its own allowlist, so
 * this list is only about which commands get routed there.
 * 
 * Phase 1 (Core): git, health, logs
 * Phase 2 (Metrics): docker, env, version
 * Phase 3 (Advanced): metrics, backups, security
 */
const REMOTE_COMMANDS: Record<string, string> = {
  // System Info
  uname: 'uname -a',
  uptime: 'uptime',
  free: 'free -h',
  df: 'df -h',
  whoami: 'whoami',
  hostname: 'hostname',
  
  // Git Deployment History
  'git': 'git log --oneline -10',
  'git-branch': 'git branch -a',
  'git-status': 'git status',
  'git-head': 'cat /var/www/.git/HEAD',
  
  // Health & Metrics
  'health': 'curl -s http://localhost:8080/health',
  'health-detailed': 'curl -s http://localhost:8080/health/detailed',
  'metrics': 'ps aux | grep portfolio | grep -v grep',
  'metrics-cpu': 'top -b -n 1 | head -15',
  'memory-detail': 'free -h && sync; echo 3 > /proc/sys/vm/drop_caches',
  
  // Logs
  'logs': 'tail -n 30 /var/log/portfolio-api.log',
  'logs-nginx': 'tail -n 30 /var/log/nginx/access.log',
  'logs-error': 'tail -n 30 /var/log/nginx/error.log',
  
  // Docker & Containers
  'docker': 'docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"',
  'docker-logs': 'docker logs portfolio-api --tail 20',
  'docker-inspect': 'docker inspect portfolio-api | grep -E "IPAddress|Status|ExposedPorts"',
  
  // Deployment Info
  'version': 'cat /var/www/VERSION || echo "unknown"',
  'deployed': 'stat -c "%y" /var/www/dist/index.html',
  'env-prod': 'grep -E "^NODE_ENV|^AWS_REGION|^PORT" /etc/environment',
  
  // Network & Services
  'netstat': 'netstat -tulpn | grep -E "LISTEN|nginx|portfolio"',
  'nginx-status': 'curl -s http://localhost:8080/nginx_status',
  'lsof': 'lsof -i -P -n | grep -E "LISTEN|portfolio|nginx"',
  
  // Database
  'psql-info': 'psql --version',
  'redis-info': 'redis-cli --version 2>/dev/null || echo "Redis CLI available (no server running locally)"',
  
  // System
  'systemctl': 'systemctl -l --no-pager status portfolio-api nginx',
  'ls': 'ls -1 -la /var/www/dist',
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
        text: `Production Node Guest Terminal - Read-Only Inspector v2.0
═══════════════════════════════════════════════════════════════

📊 SYSTEM METRICS:
  • uname -a           - Kernel & AWS architecture
  • free -h            - RAM & swap memory
  • df -h              - Disk usage
  • uptime             - Instance uptime & load average
  • metrics            - Portfolio API process info
  • metrics-cpu        - CPU usage snapshot
  • memory-detail      - Detailed memory breakdown
  • netstat            - Network listening ports
  • lsof               - Open files & connections

🚀 DEPLOYMENT & VERSION:
  • git log            - Last 10 commits (deployment history)
  • git-branch         - Active branches
  • git-status         - Working tree status
  • version            - Current deployed version
  • deployed           - Last deployment timestamp
  • env-prod           - Production environment vars

🔧 APPLICATION HEALTH:
  • health             - API health check
  • health-detailed    - Extended health metrics
  • systemctl          - Service daemon status
  • docker             - Running containers
  • docker-logs        - Application logs

📝 LOGS & DEBUGGING:
  • logs               - API logs (last 30 lines)
  • logs-nginx         - Nginx access logs
  • logs-error         - Nginx error logs

🌐 INFRASTRUCTURE:
  • hostname           - Instance hostname
  • whoami             - Current user
  • nginx-status       - Nginx statistics
  • psql-info          - PostgreSQL client version
  • redis-info         - Redis client version

📖 UTILITY:
  • cat resume.txt     - View your resume
  • ls                 - Deployed project files
  • clear              - Clear screen
  • help               - This menu

⛓️  COMMAND CHAINING:
  git log && health && uptime        (stop on error)
  logs ; logs-nginx ; logs-error     (always continue)

🔐 SECURITY:
  • All commands are read-only
  • No file modifications permitted
  • Rate-limited (60 req/min)
  • Each request is logged & audited
  • Live node only - no fallback if server down
  
Enter a command above or click quick pills to explore the infrastructure.`,
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'command failed'
      outputs.push(`bash: ${key}: ${msg}`)
      // && stops on failure; ; continues
      if (op === '&&' || op === null) break
    }
  }

  return outputs.join('\n')
}
