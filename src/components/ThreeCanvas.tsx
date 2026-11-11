import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import BitexcoTower, { type TowerMaterialMode } from './BitexcoTower'
import { RotateCw, Circle, Square, Grid } from 'lucide-react'

export default function ThreeCanvas() {
  const [mode, setMode] = useState<TowerMaterialMode>('dark')
  const [autoRotate, setAutoRotate] = useState(true)

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black select-none overflow-hidden">
      {/* Minimal Floating Monochromatic Mode Switcher */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-neutral-950/90 backdrop-blur-md p-1.5 rounded-xl border border-neutral-800">
        <button
          type="button"
          onClick={() => setMode('dark')}
          title="Chế độ Đen Obsidian (Dark)"
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
          title="Chế độ Trắng Titanium (White)"
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
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin-slow' : ''}`} />
        </button>
      </div>

      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 0, 8.8], fov: 40 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#000000']} />

        <Suspense fallback={null}>
          {/* Studio Pure Monochromatic Lighting */}
          <ambientLight intensity={mode === 'white' ? 0.7 : 0.45} color="#ffffff" />

          {/* Key Light */}
          <directionalLight
            position={[10, 15, 10]}
            intensity={mode === 'white' ? 2.0 : 2.5}
            color="#ffffff"
          />

          {/* Rim Light */}
          <directionalLight
            position={[-10, 10, -10]}
            intensity={mode === 'white' ? 1.0 : 1.8}
            color="#ffffff"
          />

          {/* Subtle Fill Light from bottom */}
          <directionalLight
            position={[0, -10, 5]}
            intensity={0.5}
            color="#ffffff"
          />

          {/* Bitexco STL Model */}
          <BitexcoTower mode={mode} />

          {/* 360-degree Orbit Controls */}
          <OrbitControls
            target={[0, 0, 0]}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={autoRotate}
            autoRotateSpeed={0.8}
            enableDamping={true}
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={20}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
