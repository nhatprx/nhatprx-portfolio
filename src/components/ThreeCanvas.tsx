import { useState, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Float } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import BitexcoTower, { type TowerViewMode } from './BitexcoTower'
import {
  RotateCw,
  Sun,
  Moon,
  Grid,
  Camera,
  Compass,
  Building2,
} from 'lucide-react'

type CameraPreset = 'full' | 'helipad' | 'crown' | 'skydeck'

const CAMERA_POSITIONS: Record<
  CameraPreset,
  { position: [number, number, number]; target: [number, number, number] }
> = {
  full: { position: [0, 1.2, 8.5], target: [0, 0.2, 0] },
  helipad: { position: [3.0, 1.8, 2.2], target: [1.28, 1.6, 0.06] },
  crown: { position: [0.2, 3.6, 4.2], target: [0, 2.8, 0] },
  skydeck: { position: [0, 1.4, 4.0], target: [0, 1.4, 0] },
}

export default function ThreeCanvas() {
  const [autoRotate, setAutoRotate] = useState(true)
  const [mode, setMode] = useState<TowerViewMode>('night')
  const [activePreset, setActivePreset] = useState<CameraPreset>('full')
  const controlsRef = useRef<OrbitControlsImpl>(null)

  const handlePresetChange = (preset: CameraPreset) => {
    setActivePreset(preset)
    const config = CAMERA_POSITIONS[preset]
    if (controlsRef.current) {
      controlsRef.current.object.position.set(...config.position)
      controlsRef.current.target.set(...config.target)
      controlsRef.current.update()
    }
  }

  return (
    <div className="w-full h-full min-h-[580px] lg:min-h-[720px] relative select-none bg-slate-950 overflow-hidden rounded-2xl border border-slate-800">
      {/* Top Floating Bar: Title & Quick Specs */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-800/60 shadow-xl pointer-events-auto">
          <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/80">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide">
                Bitexco Financial Tower 3D
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                262.5m • 68 Tầng
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Kiến trúc búp sen • Sân đỗ trực thăng tầng 52 vươn 22m • TP. Hồ Chí Minh
            </p>
          </div>
        </div>

        {/* View Mode Switcher (Night / Day / Wireframe) */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl pointer-events-auto">
          <button
            type="button"
            onClick={() => setMode('night')}
            title="Chế độ ban đêm / Neon Cyberpunk"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'night'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-800/80'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ban đêm</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('day')}
            title="Chế độ ban ngày thực tế"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'day'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-800/80'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ban ngày</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('wireframe')}
            title="Chế độ khung dây kiến trúc / Blueprint"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'wireframe'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-800/80'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Khung dây</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Auto Rotate Toggle */}
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? 'Tạm dừng xoay' : 'Tự động xoay'}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              autoRotate ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin-slow' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bottom Floating Bar: Camera View Presets */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl pointer-events-auto">
          <span className="text-[11px] font-mono text-slate-400 px-2 flex items-center gap-1">
            <Camera className="w-3 h-3 text-cyan-400" />
            Góc nhìn:
          </span>

          <button
            type="button"
            onClick={() => handlePresetChange('full')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activePreset === 'full'
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Toàn cảnh
          </button>

          <button
            type="button"
            onClick={() => handlePresetChange('helipad')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activePreset === 'helipad'
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            🚁 Sân đỗ trực thăng (Tầng 52)
          </button>

          <button
            type="button"
            onClick={() => handlePresetChange('crown')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activePreset === 'crown'
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Đỉnh tháp & Ăng-ten
          </button>

          <button
            type="button"
            onClick={() => handlePresetChange('skydeck')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activePreset === 'skydeck'
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Đài quan sát Skydeck
          </button>
        </div>

        {/* Interaction Hint */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
          <Compass className="w-3 h-3 text-cyan-400" />
          <span>Giữ chuột trái để xoay • Cuộn chuột để zoom</span>
        </div>
      </div>

      {/* WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 1.2, 8.5], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Lighting Rig */}
          <ambientLight intensity={mode === 'night' ? 0.65 : 1.3} />

          <directionalLight
            position={[8, 14, 8]}
            intensity={mode === 'night' ? 1.8 : 2.8}
            color={mode === 'night' ? '#38bdf8' : '#ffffff'}
          />

          <directionalLight
            position={[-8, 6, -6]}
            intensity={mode === 'night' ? 1.2 : 1.0}
            color={mode === 'night' ? '#c084fc' : '#f8fafc'}
          />

          <pointLight
            position={[3, 1.8, 2.5]}
            intensity={mode === 'night' ? 1.4 : 0.8}
            color="#38bdf8"
            distance={7}
          />

          {/* Background Stars in Night Mode */}
          {mode === 'night' && (
            <Stars
              radius={45}
              depth={25}
              count={900}
              factor={3}
              saturation={0.5}
              fade
              speed={1}
            />
          )}

          {/* 3D Bitexco Model */}
          <Float speed={autoRotate ? 0.8 : 0} rotationIntensity={0.1} floatIntensity={0.15}>
            <BitexcoTower scale={1.05} mode={mode} />
          </Float>

          {/* Orbit Controls */}
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            autoRotate={autoRotate}
            autoRotateSpeed={0.9}
            minDistance={2.5}
            maxDistance={14}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI / 1.95}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
