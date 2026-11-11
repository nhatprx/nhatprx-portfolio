import { useState } from 'react'
import ThreeCanvas from './components/ThreeCanvas'
import { GithubIcon } from './components/icons'
import { Info, Building, X } from 'lucide-react'

export default function App() {
  const [showSpecs, setShowSpecs] = useState(false)

  const architecturalSpecs = [
    { label: 'Tên công trình', value: 'Bitexco Financial Tower' },
    { label: 'Địa điểm', value: 'Quận 1, TP. Hồ Chí Minh, Việt Nam' },
    { label: 'Kiến trúc sư', value: 'Carlos Zapata (Mỹ)' },
    { label: 'Ý tưởng thiết kế', value: 'Búp sen hé nở (Biểu tượng văn hóa Việt Nam)' },
    { label: 'Chiều cao đỉnh tháp', value: '262.5 m (68 tầng nổi + 3 tầng hầm)' },
    { label: 'Sân đỗ trực thăng', value: 'Tầng 52 (~191m), vươn 22m ra ngoài không gian' },
    { label: 'Đài quan sát Skydeck', value: 'Tầng 49 (Tầm nhìn 360 độ toàn cảnh Sài Gòn)' },
    { label: 'Hệ vỏ kính mặt ngoài', value: 'Hơn 6.000 tấm kính đôi uốn cong 2 chiều nhập khẩu từ Bỉ' },
    { label: 'Khối đế trung tâm', value: '5 tầng thương mại Icon68 Shopping Mall' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-sm tracking-wide text-white">
            Tòa tháp Bitexco 3D
          </span>
          <span className="hidden sm:inline-block text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
            Interactive Three.js Model
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowSpecs(!showSpecs)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Thông số kiến trúc</span>
          </button>

          <a
            href="https://github.com/nhatprx/nhatprx-portfolio"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <GithubIcon className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Main 3D Canvas Area */}
      <main className="flex-1 p-3 sm:p-5 flex flex-col relative">
        <div className="flex-1 w-full relative">
          <ThreeCanvas />
        </div>

        {/* Slide-out Architectural Specs Drawer */}
        {showSpecs && (
          <aside className="absolute top-5 right-5 bottom-5 w-full max-w-sm bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl z-40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white">Hồ sơ kiến trúc Bitexco</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSpecs(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 text-xs">
              {architecturalSpecs.map((item, idx) => (
                <div key={idx} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="text-slate-400 text-[11px] font-medium">{item.label}</div>
                  <div className="text-slate-100 font-semibold mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="font-mono text-cyan-400">Three.js + R3F</span>
              <span>Ponytail Clean Code</span>
            </div>
          </aside>
        )}
      </main>
    </div>
  )
}
