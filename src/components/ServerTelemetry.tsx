import { useState, useEffect } from 'react'

interface ServiceStatus {
  name: string
  status: 'UP' | 'SYNC' | 'IDLE'
  latency: string
}

interface LogEntry {
  id: number
  time: string
  method: string
  path: string
  status: number
  duration: string
}

const INITIAL_SERVICES: ServiceStatus[] = [
  { name: 'nginx-proxy', status: 'UP', latency: '1.1ms' },
  { name: 'go-backend', status: 'UP', latency: '4.8ms' },
  { name: 'redis-cache', status: 'UP', latency: '0.6ms' },
  { name: 'postgres-pool', status: 'SYNC', latency: '8.2ms' },
]

const SAMPLE_ENDPOINTS = [
  { method: 'GET', path: '/api/v1/health', status: 200 },
  { method: 'GET', path: '/v1/telemetry/stream', status: 101 },
  { method: 'POST', path: '/api/v1/auth/verify', status: 200 },
  { method: 'GET', path: '/metrics/prometheus', status: 200 },
  { method: 'GET', path: '/api/v1/projects', status: 304 },
  { method: 'HEAD', path: '/ping', status: 200 },
]

export default function ServerTelemetry() {
  const [cpu, setCpu] = useState(18)
  const [ram, setRam] = useState(784)
  const [uptimeSeconds, setUptimeSeconds] = useState(418320)
  const [netRx, setNetRx] = useState(1420)
  const [netTx, setNetTx] = useState(680)
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, time: '06:12:44', method: 'GET', path: '/v1/telemetry/stream', status: 101, duration: '0.8ms' },
    { id: 2, time: '06:13:02', method: 'GET', path: '/api/v1/projects', status: 200, duration: '2.1ms' },
    { id: 3, time: '06:13:28', method: 'POST', path: '/api/v1/auth/verify', status: 200, duration: '4.5ms' },
    { id: 4, time: '06:13:51', method: 'GET', path: '/metrics/prometheus', status: 200, duration: '1.4ms' },
  ])

  // Ticking metrics and fluctuating telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1)

      // Slight natural jitter
      setCpu((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3
        return Math.max(12, Math.min(48, prev + delta))
      })

      setRam((prev) => {
        const delta = Math.floor(Math.random() * 9) - 4
        return Math.max(760, Math.min(840, prev + delta))
      })

      setNetRx((prev) => {
        const delta = Math.floor(Math.random() * 120) - 60
        return Math.max(900, Math.min(2400, prev + delta))
      })

      setNetTx((prev) => {
        const delta = Math.floor(Math.random() * 80) - 40
        return Math.max(450, Math.min(1200, prev + delta))
      })
    }, 2000)

    return () => clearInterval(timer)
  }, [])

  // Influx of live request stream logs
  useEffect(() => {
    const logTimer = setInterval(() => {
      const now = new Date()
      const timeStr = now.toTimeString().split(' ')[0]
      const sample = SAMPLE_ENDPOINTS[Math.floor(Math.random() * SAMPLE_ENDPOINTS.length)]
      const duration = (Math.random() * 3 + 0.6).toFixed(1) + 'ms'

      setLogs((prev) => [
        {
          id: Date.now(),
          time: timeStr,
          method: sample.method,
          path: sample.path,
          status: sample.status,
          duration,
        },
        ...prev.slice(0, 5),
      ])
    }, 3800)

    return () => clearInterval(logTimer)
  }, [])

  const formatUptime = (totalSecs: number) => {
    const days = Math.floor(totalSecs / 86400)
    const hours = Math.floor((totalSecs % 86400) / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    const secs = totalSecs % 60
    return `${days}d ${hours}h ${mins}m ${secs}s`
  }

  const ramPct = Math.round((ram / 2048) * 100)

  return (
    <div className="relative flex flex-col h-full bg-black/90 border border-white/15 rounded-none font-mono text-left shadow-2xl backdrop-blur-md overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-white/[0.03] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-white/90 font-semibold tracking-wider uppercase">
            LIVE METRICS
          </span>
        </div>
        <span className="text-[10px] text-emerald-400/80 tracking-widest uppercase">
          WSS: CONNECTED
        </span>
      </div>

      {/* Main Telemetry Body */}
      <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4 text-xs leading-relaxed scrollbar-none">
        {/* Metric 1: CPU Load */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-white/60 uppercase tracking-wider">CPU UTILIZATION</span>
            <span className="text-emerald-400 font-bold">{cpu}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-700 ease-out"
              style={{ width: `${cpu}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-white/30">
            <span>2 vCPU @ 3.4GHz</span>
            <span>LOAD: 0.18 0.12 0.08</span>
          </div>
        </div>

        {/* Metric 2: Memory (RAM) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-white/60 uppercase tracking-wider">MEMORY (RAM)</span>
            <span className="text-white/90 font-bold">{ram} / 2048 MB</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 overflow-hidden">
            <div
              className="h-full bg-white/80 transition-all duration-700 ease-out"
              style={{ width: `${ramPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-white/30">
            <span>USAGE: {ramPct}%</span>
            <span>SWAP: 12% (128MB)</span>
          </div>
        </div>

        {/* Metric 3: Network Throughput */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
          <div className="p-2 border border-white/10 bg-white/[0.02]">
            <span className="text-[9px] text-white/40 block">NET RX (IN)</span>
            <span className="text-[11px] text-emerald-400 font-semibold block mt-0.5">
              {(netRx / 1024).toFixed(2)} MB/s
            </span>
            <span className="text-[8px] text-white/30 block mt-0.5">14.8k pkts/s</span>
          </div>
          <div className="p-2 border border-white/10 bg-white/[0.02]">
            <span className="text-[9px] text-white/40 block">NET TX (OUT)</span>
            <span className="text-[11px] text-white/80 font-semibold block mt-0.5">
              {(netTx / 1024).toFixed(2)} MB/s
            </span>
            <span className="text-[8px] text-white/30 block mt-0.5">8.2k pkts/s</span>
          </div>
        </div>

        {/* Metric 4: Microservices Health */}
        <div className="space-y-1.5 pt-1 border-t border-white/5">
          <span className="text-[10px] text-white/40 uppercase tracking-wider block">
            SERVICE DAEMONS
          </span>
          <div className="space-y-1 text-[10px]">
            {INITIAL_SERVICES.map((srv) => (
              <div
                key={srv.name}
                className="flex items-center justify-between py-0.5 px-1.5 bg-white/[0.015] border border-white/5"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1 h-1 rounded-full ${
                      srv.status === 'UP' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-white/80">{srv.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-[9px]">{srv.latency}</span>
                  <span
                    className={`text-[9px] font-semibold ${
                      srv.status === 'UP' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {srv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metric 5: Live Inbound Traffic Stream */}
        <div className="space-y-1.5 pt-1 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">
              REAL-TIME TRAFFIC
            </span>
            <span className="text-[9px] text-emerald-400/70 font-mono">LIVE FEED</span>
          </div>
          <div className="space-y-1 font-mono text-[9px]">
            {logs.slice(0, 4).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between text-white/50 hover:text-white/80 transition-colors py-0.5 border-b border-white/[0.03]"
              >
                <div className="flex items-center gap-1.5 truncate pr-2">
                  <span className="text-white/30">{entry.time}</span>
                  <span className="text-emerald-400 font-semibold">{entry.method}</span>
                  <span className="truncate text-white/70">{entry.path}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={
                      entry.status === 200
                        ? 'text-emerald-400'
                        : entry.status === 101
                        ? 'text-cyan-400'
                        : 'text-amber-400'
                    }
                  >
                    {entry.status}
                  </span>
                  <span className="text-white/30">{entry.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="px-3.5 py-2 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-[10px] text-white/40 shrink-0">
        <span className="text-white/50">UP: {formatUptime(uptimeSeconds)}</span>
        <span className="text-emerald-400/90 font-semibold">100% HEALTH</span>
      </div>
    </div>
  )
}
