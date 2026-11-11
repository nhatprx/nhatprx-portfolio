import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import BitexcoTower, { type TowerMaterialMode } from './BitexcoTower'
import { RotateCcw, Sparkles, Circle, Square, Grid } from 'lucide-react'

// Camera focused on the crown & helipad with headroom so the tip is never cut off
const DEFAULT_CAMERA = {
  position: [0.96, 1.95, 5.2] as [number, number, number],
  target: [0.96, 2.78, 0] as [number, number, number],
  fov: 37,
}

export default function ThreeCanvas() {
  const [mode, setMode] = useState<TowerMaterialMode>('cyan')
  const [autoRotate, setAutoRotate] = useState(false)

  return (
    <div className="absolute inset-0 w-full h-full bg-slate-950 select-none overflow-hidden">
      {/* Subtle Atmospheric Gradient Glows */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_25%_35%,rgba(14,165,233,0.18)_0%,transparent_50%),radial-gradient(ellipse_at_80%_65%,rgba(168,85,247,0.12)_0%,transparent_55%)]" />

      {/* Floating Material & View Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 pointer-events-auto shadow-xl">
        <button
          type="button"
          onClick={() => setMode('cyan')}
          title="Chế độ Kính Xanh Thực Tế (Cyan Glass)"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
            mode === 'cyan'
              ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-800'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Kính xanh</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('dark')}
          title="Chế độ Đen (Obsidian Dark)"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
            mode === 'dark'
              ? 'bg-slate-800 text-white font-bold border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Circle className="w-3 h-3 fill-slate-950 text-slate-400" />
          <span>Đen</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('white')}
          title="Chế độ Trắng (Titanium White)"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
            mode === 'white'
              ? 'bg-slate-100 text-slate-950 font-bold border border-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Square className="w-3 h-3 fill-white text-white" />
          <span>Trắng</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('wireframe')}
          title="Chế độ Khung dây (Wireframe)"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
            mode === 'wireframe'
              ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-800'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Grid className="w-3 h-3 text-purple-400" />
          <span>Khung dây</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-800 mx-0.5" />

        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? 'Dừng xoay' : 'Tự động xoay'}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            autoRotate ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-white'
          }`}
        >
          <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin-slow' : ''}`} />
        </button>
      </div>

      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{
          position: DEFAULT_CAMERA.position,
          fov: DEFAULT_CAMERA.fov,
        }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Subtle Ambient Light with cool tone */}
          <ambientLight intensity={mode === 'cyan' ? 0.6 : mode === 'white' ? 0.7 : 0.45} color="#e0f2fe" />

          {/* Key Light from front-right with cyan warmth */}
          <directionalLight
            position={[8, 12, 8]}
            intensity={mode === 'cyan' ? 2.8 : mode === 'white' ? 2.0 : 2.5}
            color={mode === 'cyan' ? '#38bdf8' : '#ffffff'}
          />

          {/* Rim Light from back-left highlighting the curved spine */}
          <directionalLight
            position={[-8, 10, -6]}
            intensity={mode === 'cyan' ? 2.2 : mode === 'white' ? 1.0 : 1.8}
            color={mode === 'cyan' ? '#c084fc' : '#ffffff'}
          />

          {/* Bottom fill light for the helipad saucer underbelly */}
          <directionalLight
            position={[0, -6, 4]}
            intensity={0.6}
            color="#bae6fd"
          />

          {/* Bitexco STL Model */}
          <BitexcoTower mode={mode} />

          {/* Orbit Controls (Drag to rotate, scroll to zoom) */}
          <OrbitControls
            target={DEFAULT_CAMERA.target}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={autoRotate}
            autoRotateSpeed={0.8}
            enableDamping={true}
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={15}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
