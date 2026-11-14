// Client for the public read-only terminal endpoint.
//
// The API runs on the same EC2 instance that serves the site, so the terminal
// commands are executed there and the real stdout comes back over HTTP.

export interface TerminalExecResult {
  stdout: string
}

export interface TerminalInfo {
  hostname: string
  kernel_version: string
  os_release: string
  is_ec2: boolean
}

/**
 * Runs a read-only command on the server node.
 * Throws ApiError(400) when the command is not on the allowlist.
 */
export async function execTerminalCommand(command: string): Promise<TerminalExecResult> {
  const res = await fetch('/api/terminal/exec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command }),
  })

  if (!res.ok) {
    let message = `Command failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      // non-JSON error body
    }
    throw new Error(message)
  }

  const body = await res.json()
  return { stdout: String(body?.stdout ?? '') }
}

/**
 * Fetches system info for the terminal welcome message.
 */
export async function fetchTerminalInfo(): Promise<TerminalInfo> {
  const res = await fetch('/api/system-info')
  if (!res.ok) {
    throw new Error(`Failed to fetch system info (${res.status})`)
  }
  const body = await res.json()
  return body.info
}
