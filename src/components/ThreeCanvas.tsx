import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import BitexcoTower from './BitexcoTower'

export default function ThreeCanvas() {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-slate-950 select-none overflow-hidden">
      <Canvas
        camera={{ position: [0, 1.0, 9.5], fov: 40 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#020617']} />

        <Suspense fallback={null}>
          {/* Studio Architectural Lighting */}
          <ambientLight intensity={0.7} />

          <directionalLight
            position={[10, 15, 10]}
            intensity={2.2}
            color="#38bdf8"
          />

          <directionalLight
            position={[-10, 8, -8]}
            intensity={1.4}
            color="#c084fc"
          />

          <pointLight
            position={[4, 2, 4]}
            intensity={1.2}
            color="#06b6d4"
            distance={10}
          />

          {/* Pure Bitexco Tower */}
          <BitexcoTower scale={1.05} mode="night" />

          {/* Smooth 360-degree Orbit Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={1.0}
            enableDamping={true}
            dampingFactor={0.05}
            minDistance={2.5}
            maxDistance={18}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
