/**
 * Real-time system metrics from EC2 node.
 * Parses /proc filesystem for actual CPU, memory, network, and load data.
 */

import { readFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

/**
 * Get system metrics from /proc for accurate real-time data.
 * Returns { cpu_cores, cpu_percent, memory_mb, memory_percent, load_average, uptime_seconds, net_rx_mb_s }
 */
export async function getSystemMetrics() {
  try {
    const [cpuInfo, memInfo, loadAvg, uptime] = await Promise.all([
      readFile('/proc/cpuinfo', 'utf8'),
      readFile('/proc/meminfo', 'utf8'),
      readFile('/proc/loadavg', 'utf8'),
      readFile('/proc/uptime', 'utf8'),
    ])

    // CPU cores
    const cpuCores = (cpuInfo.match(/^processor/gm) || []).length

    // Memory
    const memLines = memInfo.split('\n')
    const memTotal = parseInt(memLines.find(l => l.startsWith('MemTotal'))?.split(/\s+/)[1]) || 0
    const memAvail = parseInt(memLines.find(l => l.startsWith('MemAvailable'))?.split(/\s+/)[1]) || 0
    const memUsed = memTotal - memAvail
    const memPercent = memTotal > 0 ? Math.round((memUsed / memTotal) * 100) : 0

    // Load average (5-minute average, converted to percentage of available cores)
    const [loadAvg1, loadAvg5] = loadAvg.split(' ').map(Number)
    const cpuPercent = Math.round(Math.min(100, (loadAvg5 / cpuCores) * 100))

    // Uptime
    const uptimeSeconds = Math.floor(parseFloat(uptime.split(' ')[0]))

    // Try to get network metrics from /proc/net/dev
    let netRxMbS = 0
    try {
      const netDev = await readFile('/proc/net/dev', 'utf8')
      // This is a simplified estimate; real production would sample twice
      const rxBytes = netDev
        .split('\n')
        .filter(l => !l.includes('lo') && l.includes(':'))
        .reduce((sum, line) => {
          const parts = line.split(/\s+/)
          return sum + (parseInt(parts[2]) || 0)
        }, 0)
      netRxMbS = Math.round((rxBytes / 1024 / 1024) * 100) / 100
    } catch {
      // Network data unavailable
    }

    return {
      cpu_cores: cpuCores,
      cpu_percent: cpuPercent,
      memory_total_mb: Math.round(memTotal / 1024),
      memory_used_mb: Math.round(memUsed / 1024),
      memory_percent: memPercent,
      load_average_5m: loadAvg5.toFixed(2),
      uptime_seconds: uptimeSeconds,
      net_rx_mb_s: netRxMbS,
    }
  } catch (err) {
    console.error('[metrics] failed to read /proc:', err.message)
    // Return zeros on error so the endpoint still responds
    return {
      cpu_cores: 0,
      cpu_percent: 0,
      memory_total_mb: 0,
      memory_used_mb: 0,
      memory_percent: 0,
      load_average_5m: '0.00',
      uptime_seconds: 0,
      net_rx_mb_s: 0,
    }
  }
}

/**
 * Get system info (one-time read at startup to avoid overhead).
 * Returns { hostname, kernel_version, os_release, is_ec2 }
 */
export async function getSystemInfo() {
  try {
    const [{ stdout: hostname }, { stdout: uname }, osReleaseContent] = await Promise.all([
      execFileAsync('hostname'),
      execFileAsync('uname', ['-r']),
      readFile('/etc/os-release', 'utf8').catch(() => ''),
    ])

    // Check if running on EC2
    const isEc2 = await checkIfEc2()

    // Parse /etc/os-release to get a human-readable OS name
    let osRelease = 'unknown'
    if (osReleaseContent) {
      const lines = osReleaseContent.split('\n')
      // Try PRETTY_NAME first (e.g., "Ubuntu 20.04 LTS"), fall back to NAME
      const prettyName = lines.find(l => l.startsWith('PRETTY_NAME'))?.split('=')[1]?.trim().replaceAll('"', '')
      const name = lines.find(l => l.startsWith('NAME='))?.split('=')[1]?.trim().replaceAll('"', '')
      osRelease = prettyName || name || 'unknown'
    }

    return {
      hostname: hostname.trim(),
      kernel_version: uname.trim(),
      os_release: osRelease,
      is_ec2: isEc2,
    }
  } catch (err) {
    console.error('[metrics] failed to read system info:', err.message)
    return {
      hostname: 'unknown',
      kernel_version: 'unknown',
      os_release: 'unknown',
      is_ec2: false,
    }
  }
}

/**
 * Check if running on AWS EC2 by probing the instance metadata service.
 */
async function checkIfEc2() {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1000)
    await fetch('http://169.254.169.254/latest/meta-data/', { signal: controller.signal })
    clearTimeout(timeout)
    return true
  } catch {
    return false
  }
}
