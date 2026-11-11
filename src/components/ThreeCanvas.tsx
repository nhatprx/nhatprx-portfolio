import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import BitexcoTower from './BitexcoTower'

export default function ThreeCanvas() {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-black select-none overflow-hidden">
      <Canvas
        camera={{ position: [2.8, 0.8, 9.6], fov: 38 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#000000']} />

        <Suspense fallback={null}>
          {/* High-Contrast Monochromatic Architectural Lighting */}
          <ambientLight intensity={0.5} color="#ffffff" />

          {/* Key Light (Front-Right to catch the helipad and facade) */}
          <directionalLight
            position={[12, 16, 12]}
            intensity={2.6}
            color="#ffffff"
          />

          {/* Rim Light (Back-Left to illuminate the soaring curve and crest) */}
          <directionalLight
            position={[-12, 14, -8]}
            intensity={2.0}
            color="#ffffff"
          />

          {/* Fill Light (Soft subtle fill from below) */}
          <directionalLight
            position={[0, -8, 8]}
            intensity={0.7}
            color="#ffffff"
          />

          {/* High-Detail Bitexco Tower matching the architectural photograph */}
          <BitexcoTower scale={1.08} />

          {/* 360-degree Smooth Orbit Controls */}
          <OrbitControls
            target={[0, 0.3, 0]}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={0.6}
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
