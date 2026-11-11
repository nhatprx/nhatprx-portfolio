import { useState, useEffect, useRef } from 'react'

interface Preset {
  name: string
  code: string
  oledText: string
  ledColor: string
  log: string
}

const PRESETS: Preset[] = [
  {
    name: '👋 Welcome',
    code: `// ESP32-S3 Attenda Edge Controller\nvoid setup() {\n  oled.clear();\n  oled.print("WELCOME RECRUITER!");\n  led.setColor("#00f0ff");\n  wifi.connect("IoT-Gateway");\n}`,
    oledText: 'WELCOME RECRUITER!',
    ledColor: '#00f0ff',
    log: '[BOOT] ESP32-S3 240MHz booting...\n[WIFI] Connected to IoT-Gateway (RSSI: -42dBm)\n[OLED] Rendered: "WELCOME RECRUITER!"',
  },
  {
    name: '🎯 Attenda Edge AI',
    code: `// Edge Fingerprint & Face Verification\nvoid loop() {\n  auto res = edgeAI.verifyFace();\n  if (res.latency < 1500) {\n    oled.print("ACCESS GRANTED");\n    led.setColor("#22c55e");\n  }\n}`,
    oledText: 'ID: 2026-ENG · GRANTED',
    ledColor: '#22c55e',
    log: '[EDGE-AI] TensorFlow Lite invoked on ESP32-S3\n[FACE-ID] Match confidence: 96.8% in 1.2s\n[GPIO] Relay 1 triggered (Open Door)',
  },
  {
    name: '📡 AWS IoT Telemetry',
    code: `// Stream metrics to AWS CloudWatch\nvoid sendMetrics() {\n  mqtt.publish("nodes/hcmc/state", {\n    temp: 28.4,\n    freeHeap: 248192,\n    load: "NORMAL"\n  });\n  led.setColor("#eab308");\n}`,
    oledText: 'MQTT -> AWS S3 / EC2',
    ledColor: '#eab308',
    log: '[MQTT] TLS Handshake with a21xxxx.iot.ap-southeast-1.amazonaws.com\n[PUB] Payload: 128 bytes sent\n[AWS] CloudWatch alarm metric recorded',
  },
  {
    name: '🚨 Alert Mode',
    code: `// Hardware Interrupt Handler\nvoid IRAM_ATTR isr() {\n  led.setColor("#ef4444");\n  oled.print("SYSTEM BUSY 99%");\n  buzzer.tone(440, 200);\n}`,
    oledText: 'ALERT: 100+ CLIENTS',
    ledColor: '#ef4444',
    log: '[WARN] Concurrency limit: 100 instances\n[CDP] Custom memory client: 1KB per session\n[AIMD] Screenshot interval: 800ms',
  },
]

export default function Esp32Simulator() {
  const [activePresetIndex, setActivePresetIndex] = useState(0)
  const [code, setCode] = useState(PRESETS[0].code)
  const [oledMessage, setOledMessage] = useState(PRESETS[0].oledText)
  const [ledColor, setLedColor] = useState(PRESETS[0].ledColor)
  const [isFlashing, setIsFlashing] = useState(false)
  const [flashProgress, setFlashProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([
    '[INIT] ESP32-S3-WROOM-1 Rev 2.4 Ready',
    '[CORE] Xtensa LX7 @ 240MHz · 8MB PSRAM',
    '[STATUS] Node listening on GPIO 48',
  ])
  const [bootCounter, setBootCounter] = useState(42)
  const [uptime, setUptime] = useState(0)
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Uptime heartbeat timer
  useEffect(() => {
    const timer = setInterval(() => {
      setUptime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  const handleSelectPreset = (index: number) => {
    setActivePresetIndex(index)
    const preset = PRESETS[index]
    setCode(preset.code)
    runFlash(preset.oledText, preset.ledColor, preset.log)
  }

  const runFlash = (textOverride?: string, colorOverride?: string, logOverride?: string) => {
    setIsFlashing(true)
    setFlashProgress(0)

    const interval = setInterval(() => {
      setFlashProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsFlashing(false)

          // Parse OLED text from code if user manually edited it
          const matchOled = code.match(/oled\.print\("([^"]+)"\)/)
          const targetOled = textOverride || (matchOled ? matchOled[1] : 'FIRMWARE RUNNING')

          // Parse LED color if edited
          const matchColor = code.match(/setColor\("([^"]+)"\)/)
          const targetColor = colorOverride || (matchColor ? matchColor[1] : '#00f0ff')

          setOledMessage(targetOled)
          setLedColor(targetColor)
          setBootCounter((c) => c + 1)

          setLogs((prevLogs) => [
            ...prevLogs.slice(-10),
            `[FLASH] Erased 0x10000 -> Flashed 248KB (SHA256 OK)`,
            `[BOOT #${bootCounter + 1}] System online`,
            ...(logOverride ? logOverride.split('\n') : [`[GPIO] RGB updated to ${targetColor}`]),
          ])
          return 100
        }
        return prev + 25
      })
    }, 120)
  }

  const handleManualRun = () => {
    runFlash()
  }

  const handleTriggerButton = () => {
    setLogs((prev) => [
      ...prev.slice(-10),
      `[INTERRUPT] GPIO 0 Button pressed (T=${uptime}s)`,
      `[HARDWARE] Toggled diagnostic signal`,
    ])
    // Toggle pulse color temporarily
    setLedColor((c) => (c === '#ffffff' ? '#00f0ff' : '#ffffff'))
  }

  return (
    <div className="w-full h-full flex flex-col justify-between text-left font-sans select-none">
      {/* Top Header Card */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs font-semibold tracking-wider text-white/90">
            ESP32-S3 HARDWARE LAB
          </span>
        </div>
        <span className="font-mono text-[10px] text-white/30 tracking-widest">
          ATTENDA · EDGE NODE
        </span>
      </div>

      {/* Main Microcontroller Board UI */}
      <div className="my-auto py-2">
        <div className="relative bg-[#0d0f12] border border-white/15 rounded-lg p-5 shadow-2xl overflow-hidden">
          {/* PCB Grid Background */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />

          {/* PCB Corner Mounting Holes */}
          <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full border border-amber-600/50 bg-black/60" />
          <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border border-amber-600/50 bg-black/60" />
          <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full border border-amber-600/50 bg-black/60" />
          <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full border border-amber-600/50 bg-black/60" />

          {/* Board Silkscreen Top Label */}
          <div className="flex items-center justify-between text-[9px] font-mono text-white/30 mb-4 tracking-widest">
            <span>ESP32-S3-WROOM-1 · DUAL CORE 240MHz</span>
            <span>REV 2.4</span>
          </div>

          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Left: 0.96" OLED Display */}
            <div className="col-span-7 bg-black border border-white/20 rounded p-2.5 shadow-inner">
              <div className="flex items-center justify-between text-[8px] font-mono text-emerald-400/60 border-b border-emerald-950 pb-1 mb-1.5">
                <span>SSD1306 OLED · 128x64</span>
                <span className="flex items-center gap-1">
                  <span>📶</span>
                  <span>{uptime}s</span>
                </span>
              </div>
              <div className="min-h-[52px] flex flex-col justify-center items-center text-center">
                {isFlashing ? (
                  <div className="w-full space-y-1">
                    <div className="text-[10px] font-mono text-amber-400 animate-pulse">
                      FLASHING FIRMWARE... {flashProgress}%
                    </div>
                    <div className="w-full bg-zinc-800 h-1 rounded overflow-hidden">
                      <div
                        className="bg-amber-400 h-full transition-all duration-100"
                        style={{ width: `${flashProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold tracking-wider text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]">
                      {oledMessage}
                    </div>
                    <div className="text-[9px] font-mono text-emerald-500/50">
                      GPIO 48 RGB: {ledColor} · ATTENDA IOT
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Chip Shield + Interactive RGB NeoPixel & Buttons */}
            <div className="col-span-5 flex flex-col justify-between space-y-3">
              {/* RGB Status NeoPixel */}
              <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded px-3 py-2">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-white/40">WS2812B RGB</span>
                  <span className="text-[10px] font-mono text-white/80 uppercase">{ledColor}</span>
                </div>
                <div
                  className="w-5 h-5 rounded-full border border-white/40 transition-all duration-300"
                  style={{
                    backgroundColor: ledColor,
                    boxShadow: `0 0 16px ${ledColor}, 0 0 4px #ffffff`,
                  }}
                />
              </div>

              {/* Physical GPIO 0 Button */}
              <button
                onClick={handleTriggerButton}
                className="w-full flex items-center justify-between px-3 py-2 bg-white/5 border border-white/10 hover:border-white/40 hover:bg-white/10 active:scale-95 transition-all text-left"
              >
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-white/40">INTERRUPT</span>
                  <span className="text-[10px] font-mono text-white/90">CLICK GPIO 0</span>
                </div>
                <span className="w-2.5 h-2.5 rounded-sm bg-white/20 border border-white/40" />
              </button>
            </div>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-white/40 tracking-wider">PRESET FIRMWARE</span>
            <span className="text-[9px] font-mono text-white/20">CLICK TO TEST</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESETS.map((preset, idx) => (
              <button
                key={preset.name}
                onClick={() => handleSelectPreset(idx)}
                className={`text-left text-xs font-mono px-3 py-2 border transition-all truncate ${
                  activePresetIndex === idx
                    ? 'border-white bg-white/10 text-white font-semibold'
                    : 'border-white/10 bg-white/[0.02] text-white/50 hover:border-white/30 hover:text-white'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Live Mini Code Editor */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-white/40 tracking-wider">EDIT FIRMWARE (C++ / PYTHON)</span>
            <button
              onClick={handleManualRun}
              disabled={isFlashing}
              className="text-[10px] font-mono font-semibold px-2.5 py-1 bg-white text-black hover:bg-white/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <span>▶</span>
              <span>{isFlashing ? 'FLASHING...' : 'FLASH CODE'}</span>
            </button>
          </div>
          <div className="relative border border-white/10 bg-black/60 rounded overflow-hidden">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={5}
              spellCheck={false}
              className="w-full bg-transparent p-2.5 font-mono text-xs text-white/90 focus:outline-none resize-none leading-relaxed selection:bg-white/20"
            />
          </div>
          <p className="text-[9px] font-mono text-white/30 mt-1">
            * Tip: Edit the text inside <code className="text-white/60">oled.print("...")</code> or <code className="text-white/60">setColor("...")</code> and hit Flash Code!
          </p>
        </div>
      </div>

      {/* Serial Monitor (115200 baud) */}
      <div className="pt-2 border-t border-white/10">
        <div className="flex items-center justify-between text-[9px] font-mono text-white/30 mb-1">
          <span>SERIAL MONITOR @ 115200 BAUD</span>
          <span>TTY / USB0</span>
        </div>
        <div
          ref={logContainerRef}
          className="h-20 bg-black/80 border border-white/10 rounded p-2 overflow-y-auto font-mono text-[10px] text-emerald-400/80 space-y-0.5 leading-tight select-text"
        >
          {logs.map((log, i) => (
            <div key={i} className="truncate">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
