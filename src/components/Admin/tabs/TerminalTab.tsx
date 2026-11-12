import { useState } from 'react'
import type { CustomTerminalCommands } from '../../../services/contentStorage'

interface TerminalTabProps {
  terminalCommands: CustomTerminalCommands
  setTerminalCommands: React.Dispatch<React.SetStateAction<CustomTerminalCommands>>
  showToast: (msg: string) => void
}

export default function TerminalTab({
  terminalCommands,
  setTerminalCommands,
  showToast,
}: TerminalTabProps) {
  const [isTerminalModalOpen, setIsTerminalModalOpen] = useState(false)
  const [editingCmdName, setEditingCmdName] = useState<string | null>(null)
  const [terminalDraft, setTerminalDraft] = useState({ name: '', output: '' })

  const handleSaveTerminalCommand = () => {
    const name = terminalDraft.name.toLowerCase().trim()
    if (!name) {
      showToast('Please enter a command name.')
      return
    }
    setTerminalCommands((prev) => {
      const copy = { ...prev }
      if (editingCmdName && editingCmdName !== name) {
        delete copy[editingCmdName]
      }
      copy[name] = terminalDraft.output
      return copy
    })
    setIsTerminalModalOpen(false)
    setEditingCmdName(null)
    setTerminalDraft({ name: '', output: '' })
    showToast(`Command '${name}' saved! Auto-sync active.`)
  }

  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Terminal Commands & Responses
          </h2>
          <p className="text-[10px] text-white/40">
            Custom terminal commands executable in the EC2 interactive console.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingCmdName(null)
            setTerminalDraft({ name: '', output: '' })
            setIsTerminalModalOpen(true)
          }}
          className="px-3 py-1.5 bg-white text-black text-xs font-semibold hover:bg-white/80 transition-colors cursor-pointer"
        >
          + ADD COMMAND
        </button>
      </div>

      {/* Existing Custom Commands */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">
            Registered Custom Commands ({Object.keys(terminalCommands).length})
          </h3>
        </div>
        {Object.keys(terminalCommands).length === 0 ? (
          <p className="text-xs text-white/30 italic font-mono">No custom commands registered yet.</p>
        ) : (
          Object.entries(terminalCommands).map(([cmd, out]) => (
            <div key={cmd} className="border border-white/10 p-3.5 bg-black flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <span className="text-emerald-400 font-bold text-xs font-mono">$ {cmd}</span>
                <pre className="text-xs text-white/60 font-mono whitespace-pre-wrap break-words">{out}</pre>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCmdName(cmd)
                    setTerminalDraft({ name: cmd, output: out })
                    setIsTerminalModalOpen(true)
                  }}
                  className="px-2.5 py-1 text-xs border border-white/20 text-white/80 hover:text-white hover:border-white transition-colors cursor-pointer"
                >
                  EDIT
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete command '$ ${cmd}'?`)) {
                      setTerminalCommands((prev) => {
                        const copy = { ...prev }
                        delete copy[cmd]
                        return copy
                      })
                      showToast(`Deleted command '${cmd}'`)
                    }
                  }}
                  className="px-2.5 py-1 text-xs border border-red-500/30 text-red-400 hover:border-red-500 transition-colors cursor-pointer"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Terminal Command Modal */}
      {isTerminalModalOpen && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div
            data-lenis-prevent
            className="bg-black border border-white/20 p-6 max-w-lg w-full space-y-4 shadow-2xl font-mono"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-xs font-bold tracking-wider uppercase text-white">
                {editingCmdName ? `EDIT COMMAND: $ ${editingCmdName}` : 'ADD TERMINAL COMMAND'}
              </h3>
              <button
                type="button"
                onClick={() => setIsTerminalModalOpen(false)}
                className="text-white/40 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-white/40 uppercase mb-1">
                  Command String (e.g. secret, certs, ping)
                </label>
                <input
                  type="text"
                  autoFocus
                  value={terminalDraft.name}
                  onChange={(e) =>
                    setTerminalDraft((prev) => ({
                      ...prev,
                      name: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                    }))
                  }
                  placeholder="my-command"
                  className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white font-mono focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-white/40 uppercase mb-1">
                  Terminal Response Text
                </label>
                <textarea
                  rows={5}
                  value={terminalDraft.output}
                  onChange={(e) => setTerminalDraft((prev) => ({ ...prev, output: e.target.value }))}
                  placeholder="Output displayed when this command is entered in EC2 interactive console..."
                  className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white font-mono focus:border-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsTerminalModalOpen(false)}
                className="px-3 py-1.5 text-xs border border-white/20 text-white/60 hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSaveTerminalCommand}
                className="px-4 py-1.5 text-xs bg-white text-black font-semibold hover:bg-white/80"
              >
                SAVE COMMAND
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

