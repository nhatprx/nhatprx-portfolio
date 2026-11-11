import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import BitexcoTower, { type TowerMaterialMode } from './BitexcoTower'
import { RotateCcw, Circle, Square, Grid } from 'lucide-react'

// Camera focused on the crown & helipad with headroom so the tip is never cut off
const DEFAULT_CAMERA = {
  position: [0.96, 1.95, 5.2] as [number, number, number],
  target: [0.96, 2.78, 0] as [number, number, number],
  fov: 37,
}

export default function ThreeCanvas() {
  const [mode, setMode] = useState<TowerMaterialMode>('dark')
  const [autoRotate, setAutoRotate] = useState(false)

  return (
    <div className="absolute inset-0 w-full h-full bg-black select-none overflow-hidden">
      {/* Floating Monochromatic Material & View Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-neutral-950/85 backdrop-blur-md p-1.5 rounded-xl border border-neutral-800 pointer-events-auto">
        <button
          type="button"
          onClick={() => setMode('dark')}
          title="Chế độ Đen (Obsidian Dark)"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
            mode === 'dark'
              ? 'bg-neutral-800 text-white font-bold border border-neutral-700'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Circle className="w-3 h-3 fill-neutral-900 text-neutral-400" />
          <span>Đen</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('white')}
          title="Chế độ Trắng (Titanium White)"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
            mode === 'white'
              ? 'bg-neutral-100 text-neutral-950 font-bold border border-white'
              : 'text-neutral-400 hover:text-white'
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
              ? 'bg-neutral-800 text-white font-bold border border-neutral-700'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Grid className="w-3 h-3 text-white" />
          <span>Khung dây</span>
        </button>

        <div className="h-4 w-[1px] bg-neutral-800 mx-0.5" />

        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? 'Dừng xoay' : 'Tự động xoay'}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            autoRotate ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'
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
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#000000']} />

        <Suspense fallback={null}>
          {/* Monochromatic Studio Lights for crisp architectural contrast */}
          <ambientLight intensity={mode === 'white' ? 0.65 : 0.4} color="#ffffff" />

          {/* Key Light from front-right catching helipad and scoop */}
          <directionalLight
            position={[8, 12, 8]}
            intensity={mode === 'white' ? 2.0 : 2.6}
            color="#ffffff"
          />

          {/* Rim Light from back-left highlighting the curved spine */}
          <directionalLight
            position={[-8, 10, -6]}
            intensity={mode === 'white' ? 1.0 : 2.0}
            color="#ffffff"
          />

          {/* Bottom fill light for the helipad saucer underbelly */}
          <directionalLight
            position={[0, -6, 4]}
            intensity={0.6}
            color="#ffffff"
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
