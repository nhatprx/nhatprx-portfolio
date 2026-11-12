import { useState, useEffect } from 'react'

export default function ServerTelemetry() {
  const [cpu, setCpu] = useState(18)
  const [ram, setRam] = useState(784)
  const [uptimeSeconds, setUptimeSeconds] = useState(418320)
  const [netRx, setNetRx] = useState(1420)

  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1)

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
    }, 2000)

    return () => clearInterval(timer)
  }, [])

  const formatUptime = (totalSecs: number) => {
    const days = Math.floor(totalSecs / 86400)
    const hours = Math.floor((totalSecs % 86400) / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    return `${days}d ${hours}h ${mins}m`
  }

  const ramPct = Math.round((ram / 2048) * 100)

  return (
    <div className="w-full bg-black/90 border border-white/15 p-3 sm:p-3.5 font-mono text-left shadow-xl backdrop-blur-md select-none">
      <div className="flex items-center justify-between text-[11px] pb-2 mb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/80 font-bold uppercase tracking-wider text-[11px]">
            NODE TELEMETRY
          </span>
        </div>
        <span className="text-[10px] text-emerald-400 font-semibold tracking-widest uppercase">
          100% OPERATIONAL
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
        {/* Metric: CPU */}
        <div className="p-2 border border-white/10 bg-white/[0.02]">
          <span className="text-[10px] text-white/40 tracking-wider uppercase block mb-1">
            CPU LOAD
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-bold text-white font-mono">{cpu}%</span>
            <span className="text-[10px] text-emerald-400 font-mono">2 vCPU</span>
          </div>
        </div>

        {/* Metric: RAM */}
        <div className="p-2 border border-white/10 bg-white/[0.02]">
          <span className="text-[10px] text-white/40 tracking-wider uppercase block mb-1">
            MEMORY
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-bold text-white font-mono">{ramPct}%</span>
            <span className="text-[10px] text-white/40 font-mono">{ram}MB</span>
          </div>
        </div>

        {/* Metric: Bandwidth */}
        <div className="p-2 border border-white/10 bg-white/[0.02]">
          <span className="text-[10px] text-white/40 tracking-wider uppercase block mb-1">
            BANDWIDTH
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-bold text-emerald-400 font-mono">
              {(netRx / 1024).toFixed(1)}
            </span>
            <span className="text-[10px] text-white/40 font-mono">MB/s</span>
          </div>
        </div>

        {/* Metric: Uptime */}
        <div className="p-2 border border-white/10 bg-white/[0.02]">
          <span className="text-[10px] text-white/40 tracking-wider uppercase block mb-1">
            UPTIME
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-white font-mono truncate">
              {formatUptime(uptimeSeconds)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
