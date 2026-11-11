import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export type TowerViewMode = 'night' | 'day' | 'wireframe'

interface BitexcoTowerProps {
  scale?: number
  mode?: TowerViewMode
}

export default function BitexcoTower({ scale = 1, mode = 'night' }: BitexcoTowerProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const beaconLightRef = useRef<THREE.PointLight>(null!)
  const beaconMeshRef = useRef<THREE.Mesh>(null!)

  // Total floor count of Bitexco: 68 floors
  const totalFloors = 68
  const baseHeight = 5.2
  const crownAngle = 0.62 // Characteristic slanted cut angle

  // Procedural Bitexco Parametric Curves & Geometries
  const {
    towerGeo,
    capGeo,
    verticalMullionsGeo,
    floorSlabsGeo,
    contourLinesGeo,
  } = useMemo(() => {
    const radialSegments = 64
    const heightSegments = 50

    // Lotus bud profile function (Carlos Zapata architectural form)
    // Starts at base, expands gently around 25-30% height (bulge), then gracefully tapers to the neck
    const getProfile = (v: number) => {
      // Gentle lotus bud belly
      const bulge = Math.sin(v * Math.PI) * 0.22
      const taper = 1.0 - v * 0.52
      const rx = (0.92 + bulge) * taper
      const rz = (0.68 + bulge * 0.78) * taper
      return { rx, rz }
    }

    // Top slanted roofline curve (sliced diagonally towards the river)
    const getTopHeight = (phi: number) => {
      return baseHeight + Math.sin(phi - 0.28) * crownAngle
    }

    // --- 1. Main Curtain Wall Facade Geometry ---
    const positions: number[] = []
    const normals: number[] = []
    const uvs: number[] = []
    const indices: number[] = []
    const grid: number[][] = []

    for (let iy = 0; iy <= heightSegments; iy++) {
      const v = iy / heightSegments
      const row: number[] = []

      for (let ix = 0; ix <= radialSegments; ix++) {
        const u = ix / radialSegments
        const phi = u * Math.PI * 2

        const maxHeight = getTopHeight(phi)
        const y = v * maxHeight

        const { rx, rz } = getProfile(v)

        // Asymmetric petal / teardrop cross-section
        const petalMod = 1.0 + Math.cos(phi) * 0.1 - Math.cos(2 * phi) * 0.06
        const x = Math.cos(phi) * rx * petalMod
        const z = Math.sin(phi) * rz

        positions.push(x, y, z)
        uvs.push(u, v)

        // Outward surface normal
        const nx = Math.cos(phi)
        const nz = Math.sin(phi)
        normals.push(nx, 0.08, nz)

        row.push(positions.length / 3 - 1)
      }
      grid.push(row)
    }

    for (let iy = 0; iy < heightSegments; iy++) {
      for (let ix = 0; ix < radialSegments; ix++) {
        const a = grid[iy][ix]
        const b = grid[iy + 1][ix]
        const c = grid[iy + 1][ix + 1]
        const d = grid[iy][ix + 1]

        indices.push(a, b, d)
        indices.push(b, c, d)
      }
    }

    const tGeo = new THREE.BufferGeometry()
    tGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    tGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    tGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    tGeo.setIndex(indices)
    tGeo.computeVertexNormals()

    // --- 2. Slanted Crown Roof Cap ---
    const capPositions: number[] = []
    const capIndices: number[] = []
    capPositions.push(0, baseHeight, 0) // Center vertex

    for (let ix = 0; ix <= radialSegments; ix++) {
      const u = ix / radialSegments
      const phi = u * Math.PI * 2
      const maxHeight = getTopHeight(phi)
      const { rx, rz } = getProfile(1.0)
      const petalMod = 1.0 + Math.cos(phi) * 0.1 - Math.cos(2 * phi) * 0.06
      const x = Math.cos(phi) * rx * petalMod
      const z = Math.sin(phi) * rz
      capPositions.push(x, maxHeight, z)
    }

    for (let ix = 1; ix <= radialSegments; ix++) {
      capIndices.push(0, ix, ix + 1)
    }

    const cGeo = new THREE.BufferGeometry()
    cGeo.setAttribute('position', new THREE.Float32BufferAttribute(capPositions, 3))
    cGeo.setIndex(capIndices)
    cGeo.computeVertexNormals()

    // --- 3. 68 Floor Slab Rings ---
    const floorPositions: number[] = []
    for (let f = 1; f <= totalFloors; f++) {
      const v = f / totalFloors
      const { rx, rz } = getProfile(v)
      const ringPoints = 48

      for (let s = 0; s < ringPoints; s++) {
        const phi1 = (s / ringPoints) * Math.PI * 2
        const phi2 = ((s + 1) / ringPoints) * Math.PI * 2

        const y1 = v * getTopHeight(phi1)
        const y2 = v * getTopHeight(phi2)

        const mod1 = 1.0 + Math.cos(phi1) * 0.1 - Math.cos(2 * phi1) * 0.06
        const mod2 = 1.0 + Math.cos(phi2) * 0.1 - Math.cos(2 * phi2) * 0.06

        floorPositions.push(
          Math.cos(phi1) * rx * 0.985 * mod1,
          y1,
          Math.sin(phi1) * rz * 0.985,
          Math.cos(phi2) * rx * 0.985 * mod2,
          y2,
          Math.sin(phi2) * rz * 0.985
        )
      }
    }
    const fsGeo = new THREE.BufferGeometry()
    fsGeo.setAttribute('position', new THREE.Float32BufferAttribute(floorPositions, 3))

    // --- 4. Vertical Architectural Mullions (Vertical Ribs) ---
    const mullionPositions: number[] = []
    const mullionCount = 32
    for (let m = 0; m < mullionCount; m++) {
      const phi = (m / mullionCount) * Math.PI * 2
      const petalMod = 1.0 + Math.cos(phi) * 0.1 - Math.cos(2 * phi) * 0.06
      const steps = 30
      for (let s = 0; s < steps; s++) {
        const v1 = s / steps
        const v2 = (s + 1) / steps

        const { rx: rx1, rz: rz1 } = getProfile(v1)
        const { rx: rx2, rz: rz2 } = getProfile(v2)

        const y1 = v1 * getTopHeight(phi)
        const y2 = v2 * getTopHeight(phi)

        mullionPositions.push(
          Math.cos(phi) * rx1 * 1.006 * petalMod,
          y1,
          Math.sin(phi) * rz1 * 1.006,
          Math.cos(phi) * rx2 * 1.006 * petalMod,
          y2,
          Math.sin(phi) * rz2 * 1.006
        )
      }
    }
    const vmGeo = new THREE.BufferGeometry()
    vmGeo.setAttribute('position', new THREE.Float32BufferAttribute(mullionPositions, 3))

    // --- 5. Illuminated Contour Ribs (The two main lotus petal seams) ---
    const contourPositions: number[] = []
    const seamAngles = [0, Math.PI, Math.PI * 0.5, Math.PI * 1.5]
    for (const phi of seamAngles) {
      const petalMod = 1.0 + Math.cos(phi) * 0.1 - Math.cos(2 * phi) * 0.06
      const steps = 40
      for (let s = 0; s < steps; s++) {
        const v1 = s / steps
        const v2 = (s + 1) / steps
        const { rx: rx1, rz: rz1 } = getProfile(v1)
        const { rx: rx2, rz: rz2 } = getProfile(v2)
        const y1 = v1 * getTopHeight(phi)
        const y2 = v2 * getTopHeight(phi)

        contourPositions.push(
          Math.cos(phi) * rx1 * 1.012 * petalMod,
          y1,
          Math.sin(phi) * rz1 * 1.012,
          Math.cos(phi) * rx2 * 1.012 * petalMod,
          y2,
          Math.sin(phi) * rz2 * 1.012
        )
      }
    }
    const clGeo = new THREE.BufferGeometry()
    clGeo.setAttribute('position', new THREE.Float32BufferAttribute(contourPositions, 3))

    return {
      towerGeo: tGeo,
      capGeo: cGeo,
      floorSlabsGeo: fsGeo,
      verticalMullionsGeo: vmGeo,
      contourLinesGeo: clGeo,
    }
  }, [baseHeight, crownAngle, totalFloors])

  // Geometry cleanup on unmount (Ponytail memory requirement)
  useEffect(() => {
    return () => {
      towerGeo.dispose()
      capGeo.dispose()
      floorSlabsGeo.dispose()
      verticalMullionsGeo.dispose()
      contourLinesGeo.dispose()
    }
  }, [towerGeo, capGeo, floorSlabsGeo, verticalMullionsGeo, contourLinesGeo])

  // Helipad lights coordinates along circular rim
  const helipadLights = useMemo(() => {
    const lights: [number, number, number][] = []
    const count = 16
    const radius = 0.52
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      lights.push([Math.cos(angle) * radius, 0.035, Math.sin(angle) * radius])
    }
    return lights
  }, [])

  // Animation frame loop: Spire red aviation warning flash and subtle rotation
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle float parallax
      groupRef.current.position.y = -2.3 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03
    }

    // Top beacon flash (aviation obstruction light)
    if (beaconLightRef.current && beaconMeshRef.current) {
      const flash = Math.sin(state.clock.elapsedTime * 4.5) > 0.35
      beaconLightRef.current.intensity = flash ? 3.0 : 0.1
      const mat = beaconMeshRef.current.material as THREE.MeshBasicMaterial
      if (mat) {
        mat.color.set(flash ? '#ff2a5f' : '#450a1b')
      }
    }
  })

  // Geometric positions
  // Helipad is at Floor 52 (~191m / 262.5m = 72% height)
  const helipadFloorRatio = 52 / 68
  const helipadY = baseHeight * helipadFloorRatio
  const helipadX = 1.28
  const helipadZ = 0.06

  // Skydeck observation deck is at Floor 49
  const skydeckFloorRatio = 49 / 68
  const skydeckY = baseHeight * skydeckFloorRatio

  return (
    <group ref={groupRef} scale={scale} position={[0, -2.3, 0]}>
      {/* ============================================================ */}
      {/* 1. CENTRAL REINFORCED CONCRETE CORE                         */}
      {/* ============================================================ */}
      <mesh position={[0, baseHeight * 0.49, 0]}>
        <cylinderGeometry args={[0.34, 0.42, baseHeight * 0.98, 24]} />
        <meshStandardMaterial
          color={mode === 'night' ? '#0f172a' : '#cbd5e1'}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* ============================================================ */}
      {/* 2. MAIN GLASS CURTAIN WALL (DOUBLE-CURVED ENVELOPE)         */}
      {/* ============================================================ */}
      {mode === 'wireframe' ? (
        <mesh geometry={towerGeo}>
          <meshBasicMaterial color="#38bdf8" wireframe />
        </mesh>
      ) : (
        <mesh geometry={towerGeo}>
          <meshPhysicalMaterial
            color={mode === 'night' ? '#0284c7' : '#0369a1'}
            emissive={mode === 'night' ? '#0369a1' : '#082f49'}
            emissiveIntensity={mode === 'night' ? 0.35 : 0.05}
            roughness={0.08}
            metalness={0.92}
            transmission={0.55}
            transparent
            opacity={mode === 'night' ? 0.88 : 0.92}
            reflectivity={0.95}
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </mesh>
      )}

      {/* ============================================================ */}
      {/* 3. 68 FLOOR SLAB LINES (INTERIOR FLOORS VISIBLE VIA GLASS)   */}
      {/* ============================================================ */}
      <lineSegments geometry={floorSlabsGeo}>
        <lineBasicMaterial
          color={mode === 'night' ? '#67e8f9' : '#94a3b8'}
          transparent
          opacity={mode === 'night' ? 0.4 : 0.25}
        />
      </lineSegments>

      {/* ============================================================ */}
      {/* 4. VERTICAL ARCHITECTURAL MULLIONS (CURTAIN WALL RIBS)      */}
      {/* ============================================================ */}
      <lineSegments geometry={verticalMullionsGeo}>
        <lineBasicMaterial
          color={mode === 'night' ? '#06b6d4' : '#64748b'}
          transparent
          opacity={mode === 'night' ? 0.5 : 0.3}
        />
      </lineSegments>

      {/* ============================================================ */}
      {/* 5. ILLUMINATED LOTUS CONTOUR SEAMS                          */}
      {/* ============================================================ */}
      {mode === 'night' && (
        <lineSegments geometry={contourLinesGeo}>
          <lineBasicMaterial color="#38bdf8" transparent opacity={0.85} linewidth={2} />
        </lineSegments>
      )}

      {/* ============================================================ */}
      {/* 6. FLOOR 49 SAIGON SKYDECK (PANORAMIC OBSERVATION DECK)     */}
      {/* ============================================================ */}
      <group position={[0, skydeckY, 0]}>
        {/* Skydeck tinted glass band */}
        <mesh>
          <cylinderGeometry args={[0.56, 0.58, 0.12, 40]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#06b6d4"
            emissiveIntensity={mode === 'night' ? 0.8 : 0.2}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 7. SLANTED CROWN ROOF & ATRIUM                              */}
      {/* ============================================================ */}
      <mesh geometry={capGeo}>
        <meshStandardMaterial
          color={mode === 'night' ? '#090d16' : '#1e293b'}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Crown Architectural Fin Blades (Lotus petal tips) */}
      <group position={[0.04, baseHeight + 0.18, 0]}>
        <mesh rotation={[0, 0, 0.12]}>
          <boxGeometry args={[0.06, 0.75, 0.45]} />
          <meshStandardMaterial
            color="#0284c7"
            metalness={0.92}
            roughness={0.15}
            emissive="#0369a1"
            emissiveIntensity={mode === 'night' ? 0.4 : 0.1}
          />
        </mesh>
      </group>

      {/* Architectural Antenna / Spire */}
      <mesh position={[-0.1, baseHeight + 0.65, 0]}>
        <cylinderGeometry args={[0.012, 0.035, 1.1, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Spire Obstruction Warning Beacon Light (Red Flash) */}
      <mesh ref={beaconMeshRef} position={[-0.1, baseHeight + 1.22, 0]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color="#ff2a5f" />
      </mesh>
      <pointLight
        ref={beaconLightRef}
        position={[-0.1, baseHeight + 1.22, 0]}
        color="#ff2a5f"
        distance={4.5}
        intensity={2.5}
      />

      {/* ============================================================ */}
      {/* 8. ICONIC CANTILEVERED HELIPAD (FLOOR 52, ~191M LEVEL)      */}
      {/* ============================================================ */}
      <group position={[helipadX, helipadY, helipadZ]}>
        {/* Cantilever Skybridge Walkway connecting Floor 52 to Helipad */}
        <group position={[-0.42, 0, 0]}>
          <mesh position={[0.16, 0, 0]}>
            <boxGeometry args={[0.42, 0.05, 0.22]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Skybridge Safety Glass Railings */}
          <mesh position={[0.16, 0.06, 0.11]}>
            <boxGeometry args={[0.42, 0.07, 0.01]} />
            <meshPhysicalMaterial color="#38bdf8" transmission={0.7} transparent opacity={0.6} />
          </mesh>
          <mesh position={[0.16, 0.06, -0.11]}>
            <boxGeometry args={[0.42, 0.07, 0.01]} />
            <meshPhysicalMaterial color="#38bdf8" transmission={0.7} transparent opacity={0.6} />
          </mesh>
        </group>

        {/* Helipad Circular Platform */}
        <mesh>
          <cylinderGeometry args={[0.56, 0.5, 0.07, 36]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.85}
            roughness={0.3}
          />
        </mesh>

        {/* Safety Catch Net Outer Ring (Angled slightly upward) */}
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.56, 0.62, 36]} />
          <meshBasicMaterial
            color="#475569"
            wireframe
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Helipad Landing Deck Markings */}
        {/* 1. Outer Guidance Ring */}
        <mesh position={[0, 0.038, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38, 0.52, 36]} />
          <meshBasicMaterial
            color={mode === 'night' ? '#38bdf8' : '#e2e8f0'}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* 2. Inner Aiming Circle */}
        <mesh position={[0, 0.039, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.22, 0.26, 36]} />
          <meshBasicMaterial color="#f8fafc" side={THREE.DoubleSide} />
        </mesh>

        {/* 3. The Big "H" Landing Symbol */}
        <group position={[0, 0.04, 0]}>
          {/* Left Vertical Bar */}
          <mesh position={[-0.08, 0, 0]}>
            <boxGeometry args={[0.028, 0.002, 0.16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Right Vertical Bar */}
          <mesh position={[0.08, 0, 0]}>
            <boxGeometry args={[0.028, 0.002, 0.16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Center Crossbar */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.132, 0.002, 0.028]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Perimeter Aviation Lights (Alternating Cyan & Emerald green) */}
        {helipadLights.map(([lx, ly, lz], idx) => (
          <mesh key={idx} position={[lx, ly, lz]}>
            <sphereGeometry args={[0.016, 8, 8]} />
            <meshBasicMaterial
              color={
                mode === 'night'
                  ? idx % 4 === 0
                    ? '#fbbf24' // amber
                    : idx % 2 === 0
                    ? '#38bdf8' // cyan
                    : '#10b981' // green
                  : '#cbd5e1'
              }
            />
          </mesh>
        ))}

        {/* Structural Cantilever Inverted V-Truss Support Struts (Anchored into tower core) */}
        <group position={[-0.55, -0.32, 0]}>
          {/* Central primary heavy steel strut */}
          <mesh position={[0.26, 0.15, 0]} rotation={[0, 0, 0.66]}>
            <cylinderGeometry args={[0.032, 0.032, 0.72, 12]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.25} />
          </mesh>
          {/* Left lateral diagonal brace */}
          <mesh position={[0.26, 0.15, 0.18]} rotation={[0.34, 0, 0.66]}>
            <cylinderGeometry args={[0.024, 0.024, 0.76, 10]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.25} />
          </mesh>
          {/* Right lateral diagonal brace */}
          <mesh position={[0.26, 0.15, -0.18]} rotation={[-0.34, 0, 0.66]}>
            <cylinderGeometry args={[0.024, 0.024, 0.76, 10]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.25} />
          </mesh>
        </group>
      </group>

      {/* ============================================================ */}
      {/* 9. TIERED 5-STORY RETAIL PODIUM (ICON68 SHOPPING PLAZA)     */}
      {/* ============================================================ */}
      <group position={[0, 0.22, 0]}>
        {/* Tier 1 Podium Body */}
        <mesh>
          <cylinderGeometry args={[1.18, 1.34, 0.44, 40]} />
          <meshStandardMaterial
            color={mode === 'night' ? '#0f172a' : '#334155'}
            metalness={0.85}
            roughness={0.35}
          />
        </mesh>
        {/* Podium Glass Entrance Band */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1.2, 1.32, 0.26, 40]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={mode === 'night' ? 0.3 : 0.05}
            roughness={0.1}
            metalness={0.9}
            transmission={0.4}
            transparent
            opacity={0.8}
          />
        </mesh>
        {/* Entrance Curved Canopy Overhang */}
        <mesh position={[0.9, -0.1, 0.5]} rotation={[0, 0.4, 0]}>
          <boxGeometry args={[0.4, 0.04, 0.6]} />
          <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 10. SAIGON WATERFRONT REFLECTIVE PLAZA PLATFORM              */}
      {/* ============================================================ */}
      <group position={[0, 0, 0]}>
        {/* Base Plaza Disc */}
        <mesh position={[0, -0.06, 0]}>
          <cylinderGeometry args={[2.2, 2.3, 0.12, 64]} />
          <meshStandardMaterial
            color={mode === 'night' ? '#020617' : '#e2e8f0'}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>

        {/* Reflective Water / Plaza Concentric Accent Rings */}
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.56, 64]} />
          <meshBasicMaterial
            color={mode === 'night' ? '#06b6d4' : '#0284c7'}
            transparent
            opacity={mode === 'night' ? 0.7 : 0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.85, 1.9, 64]} />
          <meshBasicMaterial
            color={mode === 'night' ? '#a855f7' : '#94a3b8'}
            transparent
            opacity={mode === 'night' ? 0.5 : 0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  )
}
