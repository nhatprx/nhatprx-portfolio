import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import BitexcoTower from './BitexcoTower'
import * as THREE from 'three'

/**
 * Scroll-driven camera keyframes.
 * Each keyframe maps a scroll progress (0–1) to a camera position, lookAt target,
 * and tower rotation, creating a cinematic scroll experience.
 */
const KEYFRAMES = [
  // Hero: wide establishing shot, tower on left
  { t: 0.0, pos: [2.0, 2.8, 6.0], target: [0.5, 2.0, 0], rotY: 230, mat: 'dark' as const },
  // About: orbit slightly right, mid-height
  { t: 0.2, pos: [-1.5, 2.5, 5.5], target: [0.0, 2.5, 0], rotY: 280, mat: 'dark' as const },
  // Experience: close-up from low angle, dramatic
  { t: 0.4, pos: [0.5, 0.8, 4.0], target: [0.0, 3.0, 0], rotY: 320, mat: 'white' as const },
  // Projects: bird's eye angled view
  { t: 0.6, pos: [3.0, 4.5, 4.5], target: [0.0, 2.0, 0], rotY: 190, mat: 'dark' as const },
  // Skills: wireframe reveal
  { t: 0.8, pos: [-2.0, 3.5, 5.0], target: [0.0, 2.5, 0], rotY: 140, mat: 'wireframe' as const },
  // Contact: final orbit back
  { t: 1.0, pos: [1.0, 2.0, 5.5], target: [0.5, 2.5, 0], rotY: 230, mat: 'dark' as const },
]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function lerpVec3(a: number[], b: number[], t: number): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}

// Smooth easing
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function getInterpolated(scrollProgress: number) {
  const p = Math.max(0, Math.min(1, scrollProgress))
  let i = 0
  for (let k = 0; k < KEYFRAMES.length - 1; k++) {
    if (p >= KEYFRAMES[k].t && p <= KEYFRAMES[k + 1].t) {
      i = k
      break
    }
  }
  if (p >= KEYFRAMES[KEYFRAMES.length - 1].t) i = KEYFRAMES.length - 2

  const kf0 = KEYFRAMES[i]
  const kf1 = KEYFRAMES[i + 1]
  const localT = (p - kf0.t) / (kf1.t - kf0.t)
  const eased = easeInOutCubic(localT)

  return {
    pos: lerpVec3(kf0.pos, kf1.pos, eased),
    target: lerpVec3(kf0.target, kf1.target, eased),
    rotY: lerp(kf0.rotY, kf1.rotY, eased),
    // material changes at midpoint
    mat: localT < 0.5 ? kf0.mat : kf1.mat,
  }
}

interface ScrollCameraProps {
  scrollProgress: number
}

function ScrollCamera({ scrollProgress }: ScrollCameraProps) {
  const targetPos = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())

  useFrame(({ camera }) => {
    const interp = getInterpolated(scrollProgress)
    targetPos.current.set(...interp.pos)
    targetLookAt.current.set(...interp.target)

    // Smooth damping for buttery transitions
    camera.position.lerp(targetPos.current, 0.08)
    const currentLookAt = new THREE.Vector3()
    camera.getWorldDirection(currentLookAt)
    currentLookAt.multiplyScalar(5).add(camera.position)
    currentLookAt.lerp(targetLookAt.current, 0.08)
    camera.lookAt(targetLookAt.current)
  })

  return null
}

interface ScrollCanvasProps {
  scrollProgress: number
}

export default function ScrollCanvas({ scrollProgress }: ScrollCanvasProps) {
  const interp = useMemo(() => getInterpolated(scrollProgress), [scrollProgress])

  return (
    <div className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }}>
      <Canvas
        camera={{
          position: KEYFRAMES[0].pos as [number, number, number],
          fov: 40,
          near: 0.1,
          far: 100,
        }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Minimal monochrome lighting */}
          <ambientLight intensity={0.5} color="#ffffff" />
          <directionalLight position={[8, 12, 8]} intensity={2.5} color="#ffffff" />
          <directionalLight position={[-8, 10, -6]} intensity={1.5} color="#ffffff" />
          <directionalLight position={[0, -6, 4]} intensity={0.4} color="#ffffff" />

          <BitexcoTower rotationY={interp.rotY} material={interp.mat} />
          <ScrollCamera scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  )
}
