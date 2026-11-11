import { useState, useEffect } from 'react'

interface ServiceStatus {
  name: string
  port: string
  status: 'UP' | 'SYNC' | 'IDLE'
  latency: string
}

const INITIAL_SERVICES: ServiceStatus[] = [
  { name: 'nginx-proxy', port: ':443/tls', status: 'UP', latency: '1.1ms' },
  { name: 'go-backend', port: ':8080/api', status: 'UP', latency: '4.8ms' },
  { name: 'redis-cache', port: ':6379/lru', status: 'UP', latency: '0.6ms' },
  { name: 'postgres-pool', port: ':5432/tcp', status: 'SYNC', latency: '8.2ms' },
  { name: 'docker-daemon', port: 'unix:///sock', status: 'UP', latency: '0.4ms' },
]

export default function ServerTelemetry() {
  const [cpu, setCpu] = useState(18)
  const [ram, setRam] = useState(784)
  const [uptimeSeconds, setUptimeSeconds] = useState(418320)
  const [netRx, setNetRx] = useState(1420)
  const [netTx, setNetTx] = useState(680)

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
      <div className="flex items-center justify-between px-3.5 sm:px-4 py-2 bg-white/[0.03] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs sm:text-sm text-white/90 font-bold tracking-wider uppercase">
            LIVE METRICS
          </span>
        </div>
        <span className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">
          WSS: CONNECTED
        </span>
      </div>

      {/* Main Telemetry Body */}
      <div className="flex-1 p-3 sm:p-3.5 overflow-y-auto flex flex-col justify-between gap-2.5 text-xs leading-relaxed min-h-0">
        {/* Top Group: CPU, RAM, Network */}
        <div className="space-y-2 sm:space-y-2.5 shrink-0">
          {/* Metric 1 & 2: CPU & RAM Side-by-Side */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            <div className="p-2 sm:p-2.5 border border-white/10 bg-white/[0.02] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70 uppercase tracking-wider font-medium text-[10px] sm:text-[11px]">CPU LOAD</span>
                <span className="text-emerald-400 font-bold text-xs sm:text-sm">{cpu}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-700 ease-out"
                  style={{ width: `${cpu}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] sm:text-[10px] text-white/40">
                <span>2 vCPU @ 3.4G</span>
                <span>L: 0.18</span>
              </div>
            </div>

            <div className="p-2 sm:p-2.5 border border-white/10 bg-white/[0.02] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70 uppercase tracking-wider font-medium text-[10px] sm:text-[11px]">RAM (MEM)</span>
                <span className="text-white/95 font-bold text-xs sm:text-sm">{ramPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-white/80 transition-all duration-700 ease-out"
                  style={{ width: `${ramPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] sm:text-[10px] text-white/40">
                <span>{ram} / 2048M</span>
                <span>SWAP 12%</span>
              </div>
            </div>
          </div>

          {/* Metric 3: Network Throughput Side-by-Side */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            <div className="p-2 sm:p-2.5 border border-white/10 bg-white/[0.02]">
              <div className="flex items-center justify-between text-[10px] text-white/50 font-medium tracking-wider">
                <span>NET RX (IN)</span>
                <span className="text-[9px] text-white/30 font-mono">14.8k/s</span>
              </div>
              <span className="text-xs sm:text-sm text-emerald-400 font-bold block mt-0.5">
                {(netRx / 1024).toFixed(2)} MB/s
              </span>
            </div>
            <div className="p-2 sm:p-2.5 border border-white/10 bg-white/[0.02]">
              <div className="flex items-center justify-between text-[10px] text-white/50 font-medium tracking-wider">
                <span>NET TX (OUT)</span>
                <span className="text-[9px] text-white/30 font-mono">8.2k/s</span>
              </div>
              <span className="text-xs sm:text-sm text-white/90 font-bold block mt-0.5">
                {(netTx / 1024).toFixed(2)} MB/s
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: Microservices Health (Service Daemons) - Expands to fill available vertical space */}
        <div className="flex-1 flex flex-col justify-between pt-2 border-t border-white/10 min-h-0 gap-1.5">
          <div className="flex items-center justify-between text-xs text-white/60 shrink-0">
            <span className="uppercase tracking-wider font-medium text-[11px] sm:text-xs">SERVICE DAEMONS</span>
            <span className="text-[10px] text-emerald-400 font-mono font-medium">5/5 ACTIVE</span>
          </div>
          <div className="flex-1 flex flex-col justify-between gap-1.5 min-h-0">
            {INITIAL_SERVICES.map((srv) => (
              <div
                key={srv.name}
                className="flex-1 min-h-[30px] flex items-center justify-between gap-2 py-1 px-2.5 sm:px-3 bg-white/[0.02] border border-white/5 min-w-0"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      srv.status === 'UP' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <span
                    title={srv.name}
                    className="text-white/90 font-medium truncate text-xs"
                  >
                    {srv.name}
                  </span>
                  <span className="text-[10px] text-white/30 font-mono hidden xl:inline shrink-0">
                    {srv.port}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 whitespace-nowrap text-right">
                  <span className="text-white/40 text-[10px] sm:text-[11px] font-mono">
                    {srv.latency}
                  </span>
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold tracking-wider px-1.5 py-0.5 border ${
                      srv.status === 'UP'
                        ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                        : 'text-amber-400 border-amber-500/20 bg-amber-500/10'
                    }`}
                  >
                    {srv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="px-3.5 sm:px-4 py-2 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-xs text-white/50 shrink-0">
        <span>UP: {formatUptime(uptimeSeconds)}</span>
        <span className="text-emerald-400 font-bold">100% HEALTH</span>
      </div>
    </div>
  )
}
