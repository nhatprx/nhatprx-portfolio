import { useState, useEffect, useRef } from 'react'
import type { HistoryEntry } from './terminal/types'
import {
  INITIAL_GREETING,
  QUICK_COMMANDS,
  evaluateTerminalCommand,
} from './terminal/terminalEvaluator'
import { DEFAULT_IDENTITY, type Identity } from '../data/identity'

interface Ec2TerminalProps {
  /** The global identity, so `cat resume.txt` shows the same contact info as the rest of the site. */
  identity?: Identity
}

export default function Ec2Terminal({ identity = DEFAULT_IDENTITY }: Ec2TerminalProps) {
  const [history, setHistory] = useState<HistoryEntry[]>(INITIAL_GREETING)
  const [inputVal, setInputVal] = useState('')
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const terminalRootRef = useRef<HTMLDivElement>(null)
  const outputContainerRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isScrollable, setIsScrollable] = useState(false)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (outputContainerRef.current) {
      outputContainerRef.current.scrollTop = outputContainerRef.current.scrollHeight
    }
  }, [history])

  // Monitor whether terminal output is overflowing and scrollable
  useEffect(() => {
    const el = outputContainerRef.current
    const root = terminalRootRef.current
    if (!el || !root) return

    const checkScrollable = () => {
      const scrollable = el.scrollHeight > el.clientHeight + 2
      setIsScrollable(scrollable)
      if (scrollable) {
        root.setAttribute('data-lenis-prevent', 'true')
      } else {
        root.removeAttribute('data-lenis-prevent')
      }
    }

    checkScrollable()

    const observer = new ResizeObserver(checkScrollable)
    observer.observe(el)
    window.addEventListener('resize', checkScrollable)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', checkScrollable)
    }
  }, [history])

  // Intercept wheel events when scrollable so Lenis doesn't hijack it
  useEffect(() => {
    const root = terminalRootRef.current
    const output = outputContainerRef.current
    if (!root || !output) return

    const handleWheel = (e: WheelEvent) => {
      const scrollable = output.scrollHeight > output.clientHeight + 2
      if (!scrollable) {
        root.removeAttribute('data-lenis-prevent')
        return
      }

      root.setAttribute('data-lenis-prevent', 'true')

      // If user wheels over terminal title bar, action buttons or status bar, route scroll to output
      if (!output.contains(e.target as Node)) {
        output.scrollTop += e.deltaY
        e.preventDefault()
      }
    }

    root.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      root.removeEventListener('wheel', handleWheel)
    }
  }, [])

  const executeCommand = (cmdStr: string) => {
    const raw = cmdStr.trim()
    if (!raw) return

    setCmdHistory((prev) => [...prev, raw])
    setHistoryIndex(-1)

    const result = evaluateTerminalCommand(raw, identity)
    if (result.isClear) {
      setHistory([])
      setInputVal('')
      return
    }

    setHistory((prev) => [...prev, ...result.entries])
    setInputVal('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      executeCommand(inputVal)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (cmdHistory.length === 0) return
      const nextIdx = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(nextIdx)
      setInputVal(cmdHistory[nextIdx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === -1) return
      const nextIdx = historyIndex + 1
      if (nextIdx >= cmdHistory.length) {
        setHistoryIndex(-1)
        setInputVal('')
      } else {
        setHistoryIndex(nextIdx)
        setInputVal(cmdHistory[nextIdx])
      }
    }
  }

  return (
    <div
      ref={terminalRootRef}
      data-lenis-prevent={isScrollable ? 'true' : undefined}
      onMouseEnter={() => {
        const el = outputContainerRef.current
        const root = terminalRootRef.current
        if (el && root) {
          const scrollable = el.scrollHeight > el.clientHeight + 2
          setIsScrollable(scrollable)
          if (scrollable) {
            root.setAttribute('data-lenis-prevent', 'true')
          } else {
            root.removeAttribute('data-lenis-prevent')
          }
        }
      }}
      onClick={() => inputRef.current?.focus()}
      className="w-full h-full flex flex-col justify-between bg-black/90 border border-white/15 rounded-none shadow-2xl backdrop-blur-md overflow-hidden text-left font-mono select-none"
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/70 font-semibold tracking-wide">
            ubuntu@nhatprx-server:~
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400/80 tracking-widest uppercase">
            ap-southeast-1 · linux-x86_64
          </span>
        </div>
      </div>

      {/* Quick Command Action Bar */}
      <div className="px-4 py-2 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
        <span className="text-[10px] text-white/30 mr-1 shrink-0">QUICK:</span>
        {QUICK_COMMANDS.map((qc) => (
          <button
            key={qc}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              executeCommand(qc)
            }}
            className="text-[11px] px-2 py-0.5 rounded-none border border-white/10 bg-white/[0.03] text-white/70 hover:text-white hover:border-white/30 hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          >
            {qc}
          </button>
        ))}
      </div>

      {/* Terminal Scrollable Output Area */}
      <div
        ref={outputContainerRef}
        data-lenis-prevent={isScrollable ? 'true' : undefined}
        className="flex-1 p-4 overflow-y-auto overscroll-contain terminal-scroll space-y-1.5 text-xs leading-relaxed select-text font-mono"
      >
        {history.map((entry, idx) => (
          <div key={idx} className="whitespace-pre-wrap break-all">
            {entry.type === 'input' && (
              <span className="text-white font-semibold">{entry.text}</span>
            )}
            {entry.type === 'output' && (
              <span className="text-white/80">{entry.text}</span>
            )}
            {entry.type === 'system' && (
              <span className="text-emerald-400/90">{entry.text}</span>
            )}
            {entry.type === 'error' && (
              <span className="text-amber-400/90">{entry.text}</span>
            )}
          </div>
        ))}

        {/* Live Input Line */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-emerald-400 font-semibold shrink-0">ubuntu@nhatprx-server:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            className="flex-1 bg-transparent text-white text-xs outline-none caret-emerald-400 font-mono"
            placeholder="type 'help' or any command..."
          />
        </div>
      </div>

      {/* Terminal Footer Status Bar */}
      <div className="px-4 py-2 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-[10px] text-white/30 shrink-0">
        <span>SSH: 22/TCP · TLS 1.3</span>
        <span>READ-ONLY SANDBOX · PRESS ENTER TO RUN</span>
      </div>
    </div>
  )
}
