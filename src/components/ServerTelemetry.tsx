import { useState, useEffect } from 'react'

interface SystemMetrics {
  cpu_cores: number
  cpu_percent: number
  memory_total_mb: number
  memory_used_mb: number
  memory_percent: number
  load_average_5m: string
  uptime_seconds: number
  net_rx_mb_s: number
}

interface SystemInfo {
  hostname: string
  kernel_version: string
  os_release: string
  is_ec2: boolean
}

export default function ServerTelemetry() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [info, setInfo] = useState<SystemInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch system info once on mount
  useEffect(() => {
    fetch('/api/system-info')
      .then(r => r.json())
      .then(data => {
        if (data.ok) setInfo(data.info)
      })
      .catch(err => setError(err.message))
  }, [])

  // Poll metrics every 3 seconds
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/metrics')
        if (!res.ok) return
        const data = await res.json()
        if (data.ok) {
          setMetrics(data.metrics)
          setError(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'unknown error')
      }
    }

    fetchMetrics()
    const timer = setInterval(fetchMetrics, 3000)
    return () => clearInterval(timer)
  }, [])

  const formatUptime = (totalSecs: number) => {
    const days = Math.floor(totalSecs / 86400)
    const hours = Math.floor((totalSecs % 86400) / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    return `${days}d ${hours}h ${mins}m`
  }

  const hostname = info?.hostname || 'loading...'
  const isEc2 = info?.is_ec2
  const status = error ? '✗ ERROR' : metrics ? '✓ LIVE' : '⟳ LOADING'
  const statusColor = error ? 'text-rose-400' : metrics ? 'text-emerald-400' : 'text-amber-400'

  return (
    <div className="w-full bg-black/90 border border-white/15 p-3 sm:p-3.5 font-mono text-left shadow-xl backdrop-blur-md select-none">
      <div className="flex items-center justify-between text-[11px] pb-2 mb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${metrics ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
          <span className="text-white/80 font-bold uppercase tracking-wider text-[11px]">
            {hostname} TELEMETRY
          </span>
        </div>
        <span className={`text-[10px] font-semibold tracking-widest uppercase ${statusColor}`}>
          {status}
        </span>
      </div>

      {error && (
        <div className="text-rose-400/90 text-xs mb-2 p-2 border border-rose-400/30 bg-rose-400/5">
          {error}
        </div>
      )}

      {metrics ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
          {/* CPU */}
          <div className="p-2 border border-white/10 bg-white/[0.02]">
            <span className="text-[10px] text-white/40 tracking-wider uppercase block mb-1">CPU</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-bold text-white font-mono">{metrics.cpu_percent}%</span>
              <span className="text-[10px] text-white/40 font-mono">{metrics.cpu_cores} cores</span>
            </div>
          </div>

          {/* RAM */}
          <div className="p-2 border border-white/10 bg-white/[0.02]">
            <span className="text-[10px] text-white/40 tracking-wider uppercase block mb-1">RAM</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-bold text-white font-mono">{metrics.memory_percent}%</span>
              <span className="text-[10px] text-white/40 font-mono">{metrics.memory_used_mb}/{metrics.memory_total_mb}MB</span>
            </div>
          </div>

          {/* Load */}
          <div className="p-2 border border-white/10 bg-white/[0.02]">
            <span className="text-[10px] text-white/40 tracking-wider uppercase block mb-1">LOAD (5m)</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-bold text-emerald-400 font-mono">{metrics.load_average_5m}</span>
              <span className="text-[10px] text-white/40 font-mono">per core</span>
            </div>
          </div>

          {/* Uptime */}
          <div className="p-2 border border-white/10 bg-white/[0.02]">
            <span className="text-[10px] text-white/40 tracking-wider uppercase block mb-1">UPTIME</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-white font-mono truncate">
                {formatUptime(metrics.uptime_seconds)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-white/40 text-xs">
          Loading metrics...
        </div>
      )}

      {isEc2 && (
        <div className="text-[9px] text-white/30 mt-2 pt-2 border-t border-white/10">
          AWS EC2 · ap-southeast-1 · Real-time /proc metrics
        </div>
      )}
    </div>
  )
}
