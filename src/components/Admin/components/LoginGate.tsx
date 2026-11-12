interface LoginGateProps {
  inputPass: string
  setInputPass: (val: string) => void
  loginError: string
  setLoginError: (val: string) => void
  onLogin: (e: React.FormEvent) => void
  onClose: () => void
}

export default function LoginGate({
  inputPass,
  setInputPass,
  loginError,
  setLoginError,
  onLogin,
  onClose,
}: LoginGateProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md select-none font-mono">
      <div className="w-full max-w-md p-6 sm:p-8 border border-white/20 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.9)] animate-modal-pop text-left">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-white uppercase">
              AUTH · PORTAL
            </span>
          </div>
        </div>

        <form onSubmit={onLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] text-white/50 tracking-widest uppercase mb-1.5">
              ADMIN ACCESS PASSKEY
            </label>
            <input
              type="password"
              value={inputPass}
              onChange={(e) => {
                setInputPass(e.target.value)
                setLoginError('')
              }}
              autoFocus
              placeholder="Enter passkey..."
              className="w-full bg-white/[0.04] border border-white/20 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-white focus:outline-none transition-colors"
            />
            {loginError && <p className="text-red-400 text-[11px] mt-2 font-mono">{loginError}</p>}
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs border border-white/15 text-white/60 hover:text-white hover:border-white/40 transition-colors cursor-pointer"
            >
              Return to Site
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-white text-black hover:bg-white/80 transition-colors cursor-pointer"
            >
              AUTHENTICATE →
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

