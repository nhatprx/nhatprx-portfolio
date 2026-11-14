import { getStoredTerminalCommands } from '../../services/contentStorage'
import { DEFAULT_IDENTITY, type Identity } from '../../data/identity'
import type { HistoryEntry } from './types'

export const INITIAL_GREETING: HistoryEntry[] = [
  {
    type: 'system',
    text: 'Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-1018-generic x86_64)',
  },
  {
    type: 'system',
    text: ' * Documentation:  https://help.ubuntu.com\n * Management:     Cloud Node Console (ap-southeast-1)\n * System Load:    0.14, 0.08, 0.05 | Memory: 38% of 2.0GiB\n * Security:       Read-only inspection shell active (Guest)',
  },
  {
    type: 'system',
    text: 'Type "help" or click command pills below to inspect live instance metrics.',
  },
]

export const QUICK_COMMANDS = [
  'uname -a',
  'docker ps',
  'top -b -n 1',
  'free -h',
  'df -h',
  'uptime',
  'cat resume.txt',
  'help',
]

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
  • docker ps          - List running production containers
  • top / htop         - Inspect CPU, memory & process table
  • free -h            - Display available physical & swap memory
  • df -h              - Show NVMe/EBS disk partition usage
  • uptime             - Show EC2 instance uptime & load average
  • ls -la             - List deployed project repositories & files
  • cat <file>         - View file contents (e.g. cat resume.txt)
  • curl localhost     - Test HTTP response from internal reverse proxy
  • systemctl status   - Check systemd daemon health
  • whoami             - Print current shell user permissions
  • clear              - Clear the terminal screen`,
      })
      break

    case 'uname':
      entries.push({
        type: 'output',
        text: 'Linux ip-172-31-42-18 6.8.0-1018-aws #20-Ubuntu SMP Mon Oct 14 20:26:48 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux',
      })
      break

    case 'uptime': {
      const now = new Date()
      const timeStr = now.toTimeString().split(' ')[0]
      entries.push({
        type: 'output',
        text: ` ${timeStr} up 48 days, 14:22,  2 users,  load average: 0.12, 0.08, 0.05`,
      })
      break
    }

    case 'free':
      entries.push({
        type: 'output',
        text: `               total        used        free      shared  buff/cache   available
Mem:           2.0Gi       814Mi       1.1Gi        24Mi       112Mi       1.1Gi
Swap:          1.0Gi          0B       1.0Gi`,
      })
      break

    case 'df':
      entries.push({
        type: 'output',
        text: `Filesystem     Type      Size  Used Avail Use% Mounted on
/dev/root      ext4       30G  7.2G   22G  25% /
tmpfs          tmpfs     992M     0  992M   0% /dev/shm
/dev/xvda15    vfat      105M  6.2M   99M   6% /boot/efi`,
      })
      break

    case 'docker':
      if (arg === 'ps' || !arg) {
        entries.push({
          type: 'output',
          text: `CONTAINER ID   IMAGE                     COMMAND                  CREATED        STATUS          PORTS                    NAMES
a49f82d1c01e   nginx:1.26-alpine         "/docker-entrypoint.…"   2 weeks ago    Up 2 weeks      0.0.0.0:80->80/tcp       portfolio-nginx
b38e1194ac22   grevo-backend:3.3-jdk21   "java -jar app.jar"      2 weeks ago    Up 2 weeks      0.0.0.0:8080->8080/tcp   grevo-api-prod
7d91e4593bc1   redis:7.2-alpine          "docker-entrypoint.s…"   2 weeks ago    Up 2 weeks      6379/tcp                 redis-session-cache
5e20aa44901f   attenda-broker:latest     "python main.py"         3 weeks ago    Up 3 weeks      1883/tcp, 9001/tcp       attenda-mqtt`,
        })
      } else {
        entries.push({
          type: 'error',
          text: `docker: '${arg}' is restricted in guest session. Try 'docker ps'.`,
        })
      }
      break

    case 'top':
    case 'htop':
      entries.push({
        type: 'output',
        text: `top - 02:15:10 up 48 days,  2 users,  load average: 0.12, 0.08, 0.05
Tasks: 112 total,   1 running, 111 sleeping,   0 stopped,   0 zombie
%Cpu(s):  1.8 us,  0.5 sy,  0.0 ni, 97.4 id,  0.1 wa,  0.0 hi,  0.2 si
MiB Mem :   2048.0 total,   1132.4 free,    814.2 used,    101.4 buff/cache
MiB Swap:   1024.0 total,   1024.0 free,      0.0 used.   1182.2 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1420 ubuntu    20   0  742812 348120  24116 S   1.8  16.6  48:12.30 java (Spring Boot)
  980 root      20   0   48210  18420   9210 S   0.6   0.9  12:44.15 dockerd
 1590 redis     20   0   34120  14210   5120 S   0.2   0.7   4:18.90 redis-server
 1810 www-data  20   0   28410   8910   4110 S   0.1   0.4   1:20.12 nginx
 2410 ubuntu    20   0   14210   3820   2910 R   0.1   0.2   0:00.08 top`,
      })
      break

    case 'ls':
    case 'll':
      entries.push({
        type: 'output',
        text: `total 48
drwxr-xr-x 6 ubuntu ubuntu 4096 Nov 12 02:00 .
drwxr-xr-x 3 root   root   4096 Oct 14 20:20 ..
drwxr-xr-x 8 ubuntu ubuntu 4096 Nov 12 01:30 grevo-waste-platform
drwxr-xr-x 5 ubuntu ubuntu 4096 Nov 10 18:45 attenda-edge-ai
drwxr-xr-x 7 ubuntu ubuntu 4096 Nov 08 11:20 lordnine-automation
-rw-r--r-- 1 ubuntu ubuntu 1420 Nov 12 01:50 resume.txt
-rw-r--r-- 1 ubuntu ubuntu  982 Oct 24 16:30 docker-compose.yml
-rwxr-xr-x 1 ubuntu ubuntu  450 Oct 14 21:00 deploy.sh`,
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

    case 'curl':
      entries.push({
        type: 'output',
        text: `HTTP/1.1 200 OK
Server: nginx/1.26.0 (Ubuntu)
Date: ${new Date().toUTCString()}
Content-Type: application/json; charset=utf-8
X-Powered-By: Spring Boot & React
Status: 200 OK - Health check passed (Latency: 1.2ms)`,
      })
      break

    case 'systemctl':
      entries.push({
        type: 'output',
        text: `State: running
Jobs: 0 queued
Failed: 0 units
Since: Mon 2026-09-25 12:00:00 UTC; 48 days ago
CGroup: /
        ├─docker.service
        ├─nginx.service
        └─system.slice`,
      })
      break

    case 'whoami':
      entries.push({
        type: 'output',
        text: 'ubuntu (uid=1000, gid=1000, groups=1000(ubuntu),4(adm),27(sudo),998(docker)) [Read-Only Guest Mode]',
      })
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

