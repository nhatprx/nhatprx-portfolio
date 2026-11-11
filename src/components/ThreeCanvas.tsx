import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Float } from '@react-three/drei'
import BitexcoTower from './BitexcoTower'
import { RotateCw, Sparkles, Eye } from 'lucide-react'

export default function ThreeCanvas() {
  const [autoRotate, setAutoRotate] = useState(true)
  const [nightMode, setNightMode] = useState(true)

  return (
    <div className="w-full h-full min-h-[420px] lg:min-h-[540px] relative select-none">
      {/* 3D Scene Controls Pill */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-800/50 shadow-lg pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-medium text-cyan-300">
            Bitexco Tower 3D
          </span>
          <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-2">
            HCMC, Vietnam
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-800 pointer-events-auto">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? 'Pause Rotation' : 'Enable Auto-Rotate'}
            aria-label="Toggle auto rotate"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              autoRotate ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin-slow' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setNightMode(!nightMode)}
            title="Toggle Night / Ambient Lighting"
            aria-label="Toggle night mode"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              nightMode ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Helper Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400/80 bg-slate-950/70 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-800/80">
          <Eye className="w-3 h-3 text-cyan-400" />
          Drag to rotate • Scroll to zoom
        </span>
      </div>

      {/* WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 1.2, 7.5], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={nightMode ? 0.6 : 1.2} />
          <directionalLight
            position={[8, 12, 6]}
            intensity={nightMode ? 1.8 : 2.5}
            color={nightMode ? '#38bdf8' : '#ffffff'}
          />
          <pointLight
            position={[-6, 4, -4]}
            intensity={nightMode ? 1.4 : 0.8}
            color="#c084fc"
          />
          <pointLight
            position={[4, -2, 5]}
            intensity={0.8}
            color="#06b6d4"
          />

          {/* Background Stars for Night City Skyline feel */}
          {nightMode && (
            <Stars
              radius={40}
              depth={25}
              count={700}
              factor={3}
              saturation={0.5}
              fade
              speed={1}
            />
          )}

          {/* Floating Bitexco Model */}
          <Float speed={autoRotate ? 1.2 : 0} rotationIntensity={0.2} floatIntensity={0.3}>
            <BitexcoTower scale={0.92} />
          </Float>

          {/* Controls */}
          <OrbitControls
            enablePan={false}
            autoRotate={autoRotate}
            autoRotateSpeed={1.0}
            minDistance={4}
            maxDistance={12}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 1.95}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
