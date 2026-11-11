import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import BitexcoTower from './BitexcoTower'

export default function ThreeCanvas() {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-black select-none overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 9.2], fov: 38 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#000000']} />

        <Suspense fallback={null}>
          {/* Monochromatic Studio Architectural Lighting (Pure White / Black) */}
          <ambientLight intensity={0.55} color="#ffffff" />

          <directionalLight
            position={[10, 16, 10]}
            intensity={2.4}
            color="#ffffff"
          />

          <directionalLight
            position={[-10, 8, -10]}
            intensity={1.2}
            color="#ffffff"
          />

          <directionalLight
            position={[0, -10, 5]}
            intensity={0.6}
            color="#ffffff"
          />

          {/* High-Detail Monochromatic Bitexco Tower */}
          <BitexcoTower scale={1.05} />

          {/* Smooth 360-degree Orbit Controls */}
          <OrbitControls
            target={[0, 0, 0]}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={0.8}
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
