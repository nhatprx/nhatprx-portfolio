import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface BitexcoTowerProps {
  scale?: number
}

export default function BitexcoTower({ scale = 1 }: BitexcoTowerProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const beaconRef = useRef<THREE.PointLight>(null!)
  const beaconMeshRef = useRef<THREE.Mesh>(null!)

  // -------------------------------------------------------------
  // PROCEDURAL GEOMETRIES MATCHING THE EXACT ARCHITECTURAL PHOTO
  // -------------------------------------------------------------
  const {
    lowerTowerGeo,
    upperTowerGeo,
    lowerFloorsGeo,
    upperFloorsGeo,
    upperMullionsGeo,
    lowerMullionsGeo,
    crownGrillGeo,
  } = useMemo(() => {
    // -----------------------------------------------------------
    // 1. LOWER TOWER SECTION (y from 0 to 3.45)
    // -----------------------------------------------------------
    const ySplit = 3.45
    const lowerStepsY = 40
    const radSteps = 64

    // Lower section profile parameters
    const getLowerProfile = (t: number) => {
      // t from 0 (base) to 1 (helipad level)
      // Left side: smooth convex curve
      const leftX = -0.92 - Math.sin(t * Math.PI * 0.8) * 0.28
      // Right side: bulges out at waist, then tapers, then flares right below helipad
      const rightX = 0.88 + Math.sin(t * Math.PI) * 0.16 + (t > 0.8 ? (t - 0.8) * 0.6 : 0)
      const xCenter = (leftX + rightX) / 2
      const radiusX = (rightX - leftX) / 2
      // Depth along Z
      const radiusZ = 0.68 + Math.sin(t * Math.PI * 0.7) * 0.14 - t * 0.12
      return { xCenter, radiusX, radiusZ, leftX, rightX }
    }

    const lowerPos: number[] = []
    const lowerNorms: number[] = []
    const lowerUvs: number[] = []
    const lowerIndices: number[] = []
    const lowerGrid: number[][] = []

    for (let iy = 0; iy <= lowerStepsY; iy++) {
      const t = iy / lowerStepsY
      const y = t * ySplit
      const { xCenter, radiusX, radiusZ } = getLowerProfile(t)
      const row: number[] = []

      for (let ix = 0; ix <= radSteps; ix++) {
        const u = ix / radSteps
        const phi = u * Math.PI * 2

        // Aerodynamic asymmetric cross-section
        const shapeMod = 1.0 + Math.cos(phi) * 0.08 - Math.cos(2 * phi) * 0.04
        const x = xCenter + Math.cos(phi) * radiusX * shapeMod
        const z = Math.sin(phi) * radiusZ

        lowerPos.push(x, y, z)
        lowerUvs.push(u, t)
        lowerNorms.push(Math.cos(phi), 0.05, Math.sin(phi))
        row.push(lowerPos.length / 3 - 1)
      }
      lowerGrid.push(row)
    }

    for (let iy = 0; iy < lowerStepsY; iy++) {
      for (let ix = 0; ix < radSteps; ix++) {
        const a = lowerGrid[iy][ix]
        const b = lowerGrid[iy + 1][ix]
        const c = lowerGrid[iy + 1][ix + 1]
        const d = lowerGrid[iy][ix + 1]
        lowerIndices.push(a, b, d)
        lowerIndices.push(b, c, d)
      }
    }

    const lGeo = new THREE.BufferGeometry()
    lGeo.setAttribute('position', new THREE.Float32BufferAttribute(lowerPos, 3))
    lGeo.setAttribute('normal', new THREE.Float32BufferAttribute(lowerNorms, 3))
    lGeo.setAttribute('uv', new THREE.Float32BufferAttribute(lowerUvs, 2))
    lGeo.setIndex(lowerIndices)
    lGeo.computeVertexNormals()

    // -----------------------------------------------------------
    // 2. UPPER TOWER BLADE (y from 3.45 to 5.95)
    // Dramatic setback above helipad, soaring curved scoop to needle tip
    // -----------------------------------------------------------
    const yTop = 5.95
    const upperStepsY = 40
    const upperPos: number[] = []
    const upperNorms: number[] = []
    const upperUvs: number[] = []
    const upperIndices: number[] = []
    const upperGrid: number[][] = []

    const getUpperProfile = (t: number) => {
      // t from 0 (helipad level 3.45) to 1 (top crest 5.95)
      // Left side: continues the soaring convex curve upwards to the tip
      const leftX = -1.14 + t * 0.76 // terminates at -0.38
      // Right side: starts recessed at 0.38, sweeps in a deep concave arch to meet left at tip
      const rightX = 0.38 - Math.pow(t, 1.25) * 0.74 // terminates at -0.36
      const xCenter = (leftX + rightX) / 2
      const radiusX = Math.max(0.015, (rightX - leftX) / 2)
      // Depth along Z tapers sharply to a razor edge at the crown
      const radiusZ = Math.max(0.02, 0.56 * (1.0 - t * 0.94))
      return { xCenter, radiusX, radiusZ, leftX, rightX }
    }

    for (let iy = 0; iy <= upperStepsY; iy++) {
      const t = iy / upperStepsY
      const y = ySplit + t * (yTop - ySplit)
      const { xCenter, radiusX, radiusZ } = getUpperProfile(t)
      const row: number[] = []

      for (let ix = 0; ix <= radSteps; ix++) {
        const u = ix / radSteps
        const phi = u * Math.PI * 2

        // Fluted sail / scoop cross-section
        const shapeMod = 1.0 + Math.cos(phi) * 0.12
        const x = xCenter + Math.cos(phi) * radiusX * shapeMod
        const z = Math.sin(phi) * radiusZ

        upperPos.push(x, y, z)
        upperUvs.push(u, t)
        upperNorms.push(Math.cos(phi), 0.1, Math.sin(phi))
        row.push(upperPos.length / 3 - 1)
      }
      upperGrid.push(row)
    }

    for (let iy = 0; iy < upperStepsY; iy++) {
      for (let ix = 0; ix < radSteps; ix++) {
        const a = upperGrid[iy][ix]
        const b = upperGrid[iy + 1][ix]
        const c = upperGrid[iy + 1][ix + 1]
        const d = upperGrid[iy][ix + 1]
        upperIndices.push(a, b, d)
        upperIndices.push(b, c, d)
      }
    }

    const uGeo = new THREE.BufferGeometry()
    uGeo.setAttribute('position', new THREE.Float32BufferAttribute(upperPos, 3))
    uGeo.setAttribute('normal', new THREE.Float32BufferAttribute(upperNorms, 3))
    uGeo.setAttribute('uv', new THREE.Float32BufferAttribute(upperUvs, 2))
    uGeo.setIndex(upperIndices)
    uGeo.computeVertexNormals()

    // -----------------------------------------------------------
    // 3. HORIZONTAL FLOOR RINGS (Lower & Upper)
    // -----------------------------------------------------------
    // Lower Tower: 48 floors (up to helipad at floor 52)
    const lowerFloorPos: number[] = []
    const lowerFloorsCount = 48
    for (let f = 1; f <= lowerFloorsCount; f++) {
      const t = f / lowerFloorsCount
      const y = t * ySplit
      const { xCenter, radiusX, radiusZ } = getLowerProfile(t)
      const pts = 48
      for (let s = 0; s < pts; s++) {
        const phi1 = (s / pts) * Math.PI * 2
        const phi2 = ((s + 1) / pts) * Math.PI * 2
        const x1 = xCenter + Math.cos(phi1) * (radiusX * 1.002) * (1.0 + Math.cos(phi1) * 0.08)
        const z1 = Math.sin(phi1) * (radiusZ * 1.002)
        const x2 = xCenter + Math.cos(phi2) * (radiusX * 1.002) * (1.0 + Math.cos(phi2) * 0.08)
        const z2 = Math.sin(phi2) * (radiusZ * 1.002)
        lowerFloorPos.push(x1, y, z1, x2, y, z2)
      }
    }
    const lfGeo = new THREE.BufferGeometry()
    lfGeo.setAttribute('position', new THREE.Float32BufferAttribute(lowerFloorPos, 3))

    // Upper Tower: 16 floors (from floor 52 to 68)
    const upperFloorPos: number[] = []
    const upperFloorsCount = 18
    for (let f = 1; f <= upperFloorsCount; f++) {
      const t = f / upperFloorsCount
      const y = ySplit + t * (yTop - ySplit - 0.25)
      const { xCenter, radiusX, radiusZ } = getUpperProfile(t)
      const pts = 40
      for (let s = 0; s < pts; s++) {
        const phi1 = (s / pts) * Math.PI * 2
        const phi2 = ((s + 1) / pts) * Math.PI * 2
        const x1 = xCenter + Math.cos(phi1) * (radiusX * 1.002) * (1.0 + Math.cos(phi1) * 0.12)
        const z1 = Math.sin(phi1) * (radiusZ * 1.002)
        const x2 = xCenter + Math.cos(phi2) * (radiusX * 1.002) * (1.0 + Math.cos(phi2) * 0.12)
        const z2 = Math.sin(phi2) * (radiusZ * 1.002)
        upperFloorPos.push(x1, y, z1, x2, y, z2)
      }
    }
    const ufGeo = new THREE.BufferGeometry()
    ufGeo.setAttribute('position', new THREE.Float32BufferAttribute(upperFloorPos, 3))

    // -----------------------------------------------------------
    // 4. VERTICAL MULLION FINS
    // -----------------------------------------------------------
    // Lower Tower vertical fins
    const lowerFinPos: number[] = []
    const lFinCount = 36
    for (let i = 0; i < lFinCount; i++) {
      const phi = (i / lFinCount) * Math.PI * 2
      const steps = 30
      for (let s = 0; s < steps; s++) {
        const t1 = s / steps
        const t2 = (s + 1) / steps
        const y1 = t1 * ySplit
        const y2 = t2 * ySplit
        const p1 = getLowerProfile(t1)
        const p2 = getLowerProfile(t2)
        const x1 = p1.xCenter + Math.cos(phi) * (p1.radiusX * 1.005) * (1.0 + Math.cos(phi) * 0.08)
        const z1 = Math.sin(phi) * (p1.radiusZ * 1.005)
        const x2 = p2.xCenter + Math.cos(phi) * (p2.radiusX * 1.005) * (1.0 + Math.cos(phi) * 0.08)
        const z2 = Math.sin(phi) * (p2.radiusZ * 1.005)
        lowerFinPos.push(x1, y1, z1, x2, y2, z2)
      }
    }
    const lmGeo = new THREE.BufferGeometry()
    lmGeo.setAttribute('position', new THREE.Float32BufferAttribute(lowerFinPos, 3))

    // Upper Tower vertical fins (distinct fan pattern seen in the photo)
    const upperFinPos: number[] = []
    const uFinCount = 28
    for (let i = 0; i < uFinCount; i++) {
      const phi = (i / uFinCount) * Math.PI * 2
      const steps = 30
      for (let s = 0; s < steps; s++) {
        const t1 = s / steps
        const t2 = (s + 1) / steps
        const y1 = ySplit + t1 * (yTop - ySplit)
        const y2 = ySplit + t2 * (yTop - ySplit)
        const p1 = getUpperProfile(t1)
        const p2 = getUpperProfile(t2)
        const x1 = p1.xCenter + Math.cos(phi) * (p1.radiusX * 1.006) * (1.0 + Math.cos(phi) * 0.12)
        const z1 = Math.sin(phi) * (p1.radiusZ * 1.006)
        const x2 = p2.xCenter + Math.cos(phi) * (p2.radiusX * 1.006) * (1.0 + Math.cos(phi) * 0.12)
        const z2 = Math.sin(phi) * (p2.radiusZ * 1.006)
        upperFinPos.push(x1, y1, z1, x2, y2, z2)
      }
    }
    const umGeo = new THREE.BufferGeometry()
    umGeo.setAttribute('position', new THREE.Float32BufferAttribute(upperFinPos, 3))

    // -----------------------------------------------------------
    // 5. DARK MECHANICAL GRILL / RECESSED CREST BAND (As in photo)
    // -----------------------------------------------------------
    const grillPos: number[] = []
    const grillLines = 8
    for (let g = 0; g < grillLines; g++) {
      const t = 0.88 + (g / grillLines) * 0.09
      const y = ySplit + t * (yTop - ySplit)
      const { xCenter, radiusX, radiusZ } = getUpperProfile(t)
      const pts = 32
      for (let s = 0; s < pts; s++) {
        const phi1 = (s / pts) * Math.PI * 2
        const phi2 = ((s + 1) / pts) * Math.PI * 2
        grillPos.push(
          xCenter + Math.cos(phi1) * radiusX * 1.01, y, Math.sin(phi1) * radiusZ * 1.01,
          xCenter + Math.cos(phi2) * radiusX * 1.01, y, Math.sin(phi2) * radiusZ * 1.01
        )
      }
    }
    const cgGeo = new THREE.BufferGeometry()
    cgGeo.setAttribute('position', new THREE.Float32BufferAttribute(grillPos, 3))

    return {
      lowerTowerGeo: lGeo,
      upperTowerGeo: uGeo,
      lowerFloorsGeo: lfGeo,
      upperFloorsGeo: ufGeo,
      lowerMullionsGeo: lmGeo,
      upperMullionsGeo: umGeo,
      crownGrillGeo: cgGeo,
    }
  }, [])

  // Dispose geometries on unmount (Ponytail performance rule)
  useEffect(() => {
    return () => {
      lowerTowerGeo.dispose()
      upperTowerGeo.dispose()
      lowerFloorsGeo.dispose()
      upperFloorsGeo.dispose()
      lowerMullionsGeo.dispose()
      upperMullionsGeo.dispose()
      crownGrillGeo.dispose()
    }
  }, [
    lowerTowerGeo,
    upperTowerGeo,
    lowerFloorsGeo,
    upperFloorsGeo,
    lowerMullionsGeo,
    upperMullionsGeo,
    crownGrillGeo,
  ])

  // Helipad rim stanchions & lights
  const { helipadLights, stanchions } = useMemo(() => {
    const lights: [number, number, number][] = []
    const stanch: [number, number, number][] = []
    const count = 28
    const rDeck = 0.72
    const rNet = 0.82
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      lights.push([Math.cos(angle) * rDeck, 0.04, Math.sin(angle) * rDeck])
      stanch.push([Math.cos(angle) * rNet, 0.03, Math.sin(angle) * rNet])
    }
    return { helipadLights: lights, stanchions: stanch }
  }, [])

  // Spire beacon flash (pure white strobe)
  useFrame((state) => {
    if (beaconRef.current && beaconMeshRef.current) {
      const flash = Math.sin(state.clock.elapsedTime * 5.0) > 0.45
      beaconRef.current.intensity = flash ? 3.5 : 0.2
      const mat = beaconMeshRef.current.material as THREE.MeshBasicMaterial
      if (mat) {
        mat.color.set(flash ? '#ffffff' : '#222222')
      }
    }
  })

  // Helipad exact position in relation to the waist
  const helipadX = 1.38
  const helipadY = 3.44
  const helipadZ = 0.0

  return (
    <group ref={groupRef} scale={scale} position={[0, -2.9, 0]}>
      {/* ============================================================ */}
      {/* 1. LOWER TOWER SHUTTLE (Base up to Helipad Level)            */}
      {/* ============================================================ */}
      <mesh geometry={lowerTowerGeo}>
        <meshPhysicalMaterial
          color="#060606"
          emissive="#121212"
          emissiveIntensity={0.25}
          roughness={0.06}
          metalness={0.94}
          transmission={0.35}
          transparent
          opacity={0.92}
          reflectivity={1.0}
          clearcoat={1.0}
          clearcoatRoughness={0.04}
        />
      </mesh>

      {/* Lower Tower Floor Bands (White) */}
      <lineSegments geometry={lowerFloorsGeo}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.4} />
      </lineSegments>

      {/* Lower Tower Vertical Mullions (White/Silver) */}
      <lineSegments geometry={lowerMullionsGeo}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.35} />
      </lineSegments>

      {/* Concrete core column */}
      <mesh position={[-0.1, 1.7, 0]}>
        <cylinderGeometry args={[0.38, 0.44, 3.4, 24]} />
        <meshStandardMaterial color="#000000" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* ============================================================ */}
      {/* 2. UPPER TOWER BLADE (Helipad Level to Needletip Crest)      */}
      {/* ============================================================ */}
      <mesh geometry={upperTowerGeo}>
        <meshPhysicalMaterial
          color="#080808"
          emissive="#1a1a1a"
          emissiveIntensity={0.3}
          roughness={0.05}
          metalness={0.96}
          transmission={0.45}
          transparent
          opacity={0.9}
          reflectivity={1.0}
          clearcoat={1.0}
          clearcoatRoughness={0.04}
        />
      </mesh>

      {/* Upper Blade Floor Bands (White) */}
      <lineSegments geometry={upperFloorsGeo}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.45} />
      </lineSegments>

      {/* Upper Blade Vertical Mullions (White fan pattern from photo) */}
      <lineSegments geometry={upperMullionsGeo}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.5} />
      </lineSegments>

      {/* Recessed Dark Mechanical Grill / Crest Louvre Band */}
      <lineSegments geometry={crownGrillGeo}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.85} linewidth={2} />
      </lineSegments>

      {/* Architectural Crown Spine Blade (The ultra-sharp razor crest) */}
      <mesh position={[-0.38, 5.92, 0]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[0.03, 0.42, 0.16]} />
        <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Spire / Needle Tip */}
      <mesh position={[-0.38, 6.18, 0]}>
        <cylinderGeometry args={[0.008, 0.02, 0.52, 12]} />
        <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Pulsing White Strobe Beacon at the Pinnacle */}
      <mesh ref={beaconMeshRef} position={[-0.38, 6.45, 0]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <pointLight
        ref={beaconRef}
        position={[-0.38, 6.45, 0]}
        color="#ffffff"
        distance={6}
        intensity={3.5}
      />

      {/* ============================================================ */}
      {/* 3. SAIGON SKYDECK (Observation Deck, Floors 49-50)          */}
      {/* ============================================================ */}
      <group position={[0.08, 3.25, 0]}>
        <mesh>
          <cylinderGeometry args={[0.62, 0.65, 0.15, 48]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.55}
            transparent
            opacity={0.88}
          />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 4. THE ICONIC HELIPAD (FLOOR 52 FLYING SAUCER)              */}
      {/* Exactly as visible in the uploaded photo                     */}
      {/* ============================================================ */}
      <group position={[helipadX, helipadY, helipadZ]}>
        {/* Aerodynamic Convex Dish Underbelly (Mushroom saucer bowl) */}
        <mesh position={[0, -0.06, 0]}>
          <cylinderGeometry args={[0.72, 0.32, 0.16, 48]} />
          <meshStandardMaterial
            color="#080808"
            metalness={0.92}
            roughness={0.25}
          />
        </mesh>

        {/* Lower support collar under saucer */}
        <mesh position={[0, -0.16, 0]}>
          <cylinderGeometry args={[0.34, 0.28, 0.08, 32]} />
          <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.4} />
        </mesh>

        {/* Flat Tarmac Landing Deck */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.72, 0.72, 0.04, 48]} />
          <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.3} />
        </mesh>

        {/* Angled Safety Perimeter Net Ring (Tilted upwards at 15 degrees) */}
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.72, 0.84, 48]} />
          <meshBasicMaterial color="#ffffff" wireframe side={THREE.DoubleSide} />
        </mesh>

        {/* Safety Net Stanchions (Perimeter posts around the catch net) */}
        {stanchions.map(([sx, sy, sz], idx) => (
          <mesh key={`stanch-${idx}`} position={[sx, sy + 0.03, sz]}>
            <cylinderGeometry args={[0.005, 0.005, 0.065, 6]} />
            <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
          </mesh>
        ))}

        {/* Perimeter Small Wind Indicator / Antenna Post (Visible in photo!) */}
        <mesh position={[0.78, 0.14, 0.1]}>
          <cylinderGeometry args={[0.004, 0.004, 0.22, 6]} />
          <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.05} />
        </mesh>

        {/* --- High-Contrast White Helipad Markings --- */}
        {/* Outer White Aiming Circle */}
        <mesh position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.52, 0.65, 48]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>

        {/* Inner Guidance Circle */}
        <mesh position={[0, 0.043, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.35, 48]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>

        {/* Bold White "H" Landing Symbol */}
        <group position={[0, 0.044, 0]}>
          {/* Left Vertical Bar */}
          <mesh position={[-0.11, 0, 0]}>
            <boxGeometry args={[0.036, 0.002, 0.22]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Right Vertical Bar */}
          <mesh position={[0.11, 0, 0]}>
            <boxGeometry args={[0.036, 0.002, 0.22]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Center Crossbar */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.184, 0.002, 0.036]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* White Perimeter Aviation Marker Lights */}
        {helipadLights.map(([lx, ly, lz], idx) => (
          <group key={`hl-${idx}`} position={[lx, ly, lz]}>
            <mesh position={[0, -0.015, 0]}>
              <cylinderGeometry args={[0.004, 0.004, 0.03, 6]} />
              <meshStandardMaterial color="#222222" />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.014, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}

        {/* Heavy Cantilever Anchor Struts into building core */}
        <group position={[-0.6, -0.22, 0]}>
          {/* Central primary heavy structural steel raking pipe */}
          <mesh position={[0.25, 0.08, 0]} rotation={[0, 0, 0.65]}>
            <cylinderGeometry args={[0.042, 0.042, 0.72, 16]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Lateral diagonal braces */}
          <mesh position={[0.25, 0.08, 0.22]} rotation={[0.35, 0, 0.65]}>
            <cylinderGeometry args={[0.03, 0.03, 0.76, 12]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0.25, 0.08, -0.22]} rotation={[-0.35, 0, 0.65]}>
            <cylinderGeometry args={[0.03, 0.03, 0.76, 12]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>

        {/* Walkway Skybridge connecting tower to helipad */}
        <group position={[-0.45, -0.01, 0]}>
          <mesh position={[0.18, 0, 0]}>
            <boxGeometry args={[0.48, 0.05, 0.24]} />
            <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Handrails */}
          <mesh position={[0.18, 0.09, 0.12]}>
            <boxGeometry args={[0.48, 0.12, 0.01]} />
            <meshPhysicalMaterial color="#ffffff" transmission={0.8} transparent opacity={0.7} />
          </mesh>
          <mesh position={[0.18, 0.09, -0.12]}>
            <boxGeometry args={[0.48, 0.12, 0.01]} />
            <meshPhysicalMaterial color="#ffffff" transmission={0.8} transparent opacity={0.7} />
          </mesh>
        </group>
      </group>

      {/* ============================================================ */}
      {/* 5. 5-STORY TIERED PODIUM (Icon68 Shopping Base)              */}
      {/* ============================================================ */}
      <group position={[-0.02, 0.22, 0]}>
        <mesh>
          <cylinderGeometry args={[1.18, 1.34, 0.44, 48]} />
          <meshStandardMaterial color="#050505" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[1.2, 1.32, 0.26, 48]} />
          <meshPhysicalMaterial
            color="#000000"
            roughness={0.05}
            metalness={0.95}
            transmission={0.5}
            transparent
            opacity={0.85}
          />
        </mesh>
        <mesh>
          <cylinderGeometry args={[1.205, 1.325, 0.26, 24, 1, true]} />
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>
        <mesh position={[0.92, -0.1, 0.5]} rotation={[0, 0.42, 0]}>
          <boxGeometry args={[0.4, 0.04, 0.6]} />
          <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  )
}
