interface ScreenLoaderProps {
  mounted: boolean
  isInitialLoading: boolean
  isLangSwitching: boolean
  loadingLabel: string
}

export default function ScreenLoader({
  mounted,
  isInitialLoading,
  isLangSwitching,
  loadingLabel,
}: ScreenLoaderProps) {
  if (!mounted && !isLangSwitching) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black font-mono text-white select-none transition-opacity duration-300 pointer-events-none ${
        isInitialLoading || isLangSwitching ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="w-64 space-y-4 text-center px-4">
        <div className="flex items-center justify-between text-[11px] text-white/60 tracking-wider">
          <span className="truncate">{loadingLabel}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-2 shrink-0" />
        </div>

        <div className="w-full h-[2px] bg-white/10 overflow-hidden relative">
          <div className="h-full w-full bg-white animate-loading-bar" />
        </div>

        <div className="flex items-center justify-between text-[10px] text-white/30 tracking-widest pt-1">
          <span>SYS · PORTFOLIO</span>
          <span>NHATPRX · 2026</span>
        </div>
      </div>
    </div>
  )
}

