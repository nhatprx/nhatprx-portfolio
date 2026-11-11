import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface BitexcoTowerProps {
  scale?: number
}

export default function BitexcoTower({ scale = 1 }: BitexcoTowerProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const beaconLightRef = useRef<THREE.PointLight>(null!)
  const beaconMeshRef = useRef<THREE.Mesh>(null!)

  const totalFloors = 68
  const baseHeight = 5.6
  const crownSlant = 0.72

  // Procedural geometries for the detailed double-petal tower
  const {
    frontPetalGeo,
    rearPetalGeo,
    slantedRoofGeo,
    verticalFinsGeo,
    floorSlabsGeo,
    revealSeamGeo,
    mechanicalFloorsGeo,
  } = useMemo(() => {
    const radialSegments = 72
    const heightSegments = 60

    // Characteristic Carlos Zapata lotus-bud profile
    const getProfile = (v: number) => {
      // Aerodynamic bulge around 28% height
      const bulge = Math.sin(v * Math.PI) * 0.24
      const taper = 1.0 - v * 0.54
      const rx = (0.94 + bulge) * taper
      const rz = (0.7 + bulge * 0.8) * taper
      return { rx, rz }
    }

    // Slanted crown roofline (slanted diagonally towards east/river)
    const getTopHeight = (phi: number) => {
      return baseHeight + Math.sin(phi - 0.3) * crownSlant
    }

    // --- 1. FRONT PETAL (Holding the helipad side, phi: -PI/2 to PI/2) ---
    const fPositions: number[] = []
    const fNormals: number[] = []
    const fUvs: number[] = []
    const fIndices: number[] = []
    const fGrid: number[][] = []

    const halfRad = Math.floor(radialSegments / 2)
    for (let iy = 0; iy <= heightSegments; iy++) {
      const v = iy / heightSegments
      const row: number[] = []

      for (let ix = 0; ix <= halfRad; ix++) {
        // Angles from -PI/2 to PI/2 (front face)
        const phi = -Math.PI / 2 + (ix / halfRad) * Math.PI
        const maxHeight = getTopHeight(phi)
        const y = v * maxHeight
        const { rx, rz } = getProfile(v)

        const shapeMod = 1.0 + Math.cos(phi) * 0.12 - Math.cos(2 * phi) * 0.05
        const x = Math.cos(phi) * rx * shapeMod * 1.01
        const z = Math.sin(phi) * rz * 1.01

        fPositions.push(x, y, z)
        fUvs.push(ix / halfRad, v)
        fNormals.push(Math.cos(phi), 0.08, Math.sin(phi))
        row.push(fPositions.length / 3 - 1)
      }
      fGrid.push(row)
    }

    for (let iy = 0; iy < heightSegments; iy++) {
      for (let ix = 0; ix < halfRad; ix++) {
        const a = fGrid[iy][ix]
        const b = fGrid[iy + 1][ix]
        const c = fGrid[iy + 1][ix + 1]
        const d = fGrid[iy][ix + 1]
        fIndices.push(a, b, d)
        fIndices.push(b, c, d)
      }
    }

    const fpGeo = new THREE.BufferGeometry()
    fpGeo.setAttribute('position', new THREE.Float32BufferAttribute(fPositions, 3))
    fpGeo.setAttribute('normal', new THREE.Float32BufferAttribute(fNormals, 3))
    fpGeo.setAttribute('uv', new THREE.Float32BufferAttribute(fUvs, 2))
    fpGeo.setIndex(fIndices)
    fpGeo.computeVertexNormals()

    // --- 2. REAR PETAL (Higher crest at top, phi: PI/2 to 3PI/2) ---
    const rPositions: number[] = []
    const rNormals: number[] = []
    const rUvs: number[] = []
    const rIndices: number[] = []
    const rGrid: number[][] = []

    for (let iy = 0; iy <= heightSegments; iy++) {
      const v = iy / heightSegments
      const row: number[] = []

      for (let ix = 0; ix <= halfRad; ix++) {
        const phi = Math.PI / 2 + (ix / halfRad) * Math.PI
        // Rear petal extends higher at the crown crest
        const maxHeight = getTopHeight(phi) + (v > 0.8 ? (v - 0.8) * 0.45 : 0)
        const y = v * maxHeight
        const { rx, rz } = getProfile(v)

        const shapeMod = 1.0 + Math.cos(phi) * 0.12 - Math.cos(2 * phi) * 0.05
        const x = Math.cos(phi) * rx * shapeMod
        const z = Math.sin(phi) * rz

        rPositions.push(x, y, z)
        rUvs.push(ix / halfRad, v)
        rNormals.push(Math.cos(phi), 0.08, Math.sin(phi))
        row.push(rPositions.length / 3 - 1)
      }
      rGrid.push(row)
    }

    for (let iy = 0; iy < heightSegments; iy++) {
      for (let ix = 0; ix < halfRad; ix++) {
        const a = rGrid[iy][ix]
        const b = rGrid[iy + 1][ix]
        const c = rGrid[iy + 1][ix + 1]
        const d = rGrid[iy][ix + 1]
        rIndices.push(a, b, d)
        rIndices.push(b, c, d)
      }
    }

    const rpGeo = new THREE.BufferGeometry()
    rpGeo.setAttribute('position', new THREE.Float32BufferAttribute(rPositions, 3))
    rpGeo.setAttribute('normal', new THREE.Float32BufferAttribute(rNormals, 3))
    rpGeo.setAttribute('uv', new THREE.Float32BufferAttribute(rUvs, 2))
    rpGeo.setIndex(rIndices)
    rpGeo.computeVertexNormals()

    // --- 3. SLANTED ROOF ATRIUM CAP ---
    const capPositions: number[] = []
    const capIndices: number[] = []
    capPositions.push(0, baseHeight, 0) // Center

    for (let ix = 0; ix <= radialSegments; ix++) {
      const u = ix / radialSegments
      const phi = u * Math.PI * 2
      const maxHeight = getTopHeight(phi)
      const { rx, rz } = getProfile(1.0)
      const shapeMod = 1.0 + Math.cos(phi) * 0.12 - Math.cos(2 * phi) * 0.05
      const x = Math.cos(phi) * rx * shapeMod
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

    // --- 4. 68 INDIVIDUAL FLOOR SLABS (Visible through glass) ---
    const floorPositions: number[] = []
    for (let f = 1; f <= totalFloors; f++) {
      const v = f / totalFloors
      const { rx, rz } = getProfile(v)
      const pts = 50
      for (let s = 0; s < pts; s++) {
        const phi1 = (s / pts) * Math.PI * 2
        const phi2 = ((s + 1) / pts) * Math.PI * 2
        const y1 = v * getTopHeight(phi1)
        const y2 = v * getTopHeight(phi2)
        const mod1 = 1.0 + Math.cos(phi1) * 0.12 - Math.cos(2 * phi1) * 0.05
        const mod2 = 1.0 + Math.cos(phi2) * 0.12 - Math.cos(2 * phi2) * 0.05

        floorPositions.push(
          Math.cos(phi1) * rx * 0.98 * mod1, y1, Math.sin(phi1) * rz * 0.98,
          Math.cos(phi2) * rx * 0.98 * mod2, y2, Math.sin(phi2) * rz * 0.98
        )
      }
    }
    const fsGeo = new THREE.BufferGeometry()
    fsGeo.setAttribute('position', new THREE.Float32BufferAttribute(floorPositions, 3))

    // --- 5. DOUBLE-HEIGHT MECHANICAL PLANT FLOORS (Levels 29-30 & 48) ---
    const mechPositions: number[] = []
    const mechFloors = [29 / 68, 30 / 68, 48 / 68]
    for (const v of mechFloors) {
      const { rx, rz } = getProfile(v)
      const pts = 60
      for (let s = 0; s < pts; s++) {
        const phi1 = (s / pts) * Math.PI * 2
        const phi2 = ((s + 1) / pts) * Math.PI * 2
        const y1 = v * getTopHeight(phi1)
        const y2 = v * getTopHeight(phi2)
        const mod1 = 1.0 + Math.cos(phi1) * 0.12 - Math.cos(2 * phi1) * 0.05
        const mod2 = 1.0 + Math.cos(phi2) * 0.12 - Math.cos(2 * phi2) * 0.05

        mechPositions.push(
          Math.cos(phi1) * rx * 1.008 * mod1, y1, Math.sin(phi1) * rz * 1.008,
          Math.cos(phi2) * rx * 1.008 * mod2, y2, Math.sin(phi2) * rz * 1.008
        )
      }
    }
    const mfGeo = new THREE.BufferGeometry()
    mfGeo.setAttribute('position', new THREE.Float32BufferAttribute(mechPositions, 3))

    // --- 6. HIGH-DENSITY VERTICAL ARCHITECTURAL MULLION FINS (44 vertical ribs) ---
    const finPositions: number[] = []
    const finCount = 44
    for (let i = 0; i < finCount; i++) {
      const phi = (i / finCount) * Math.PI * 2
      const shapeMod = 1.0 + Math.cos(phi) * 0.12 - Math.cos(2 * phi) * 0.05
      const steps = 40
      for (let s = 0; s < steps; s++) {
        const v1 = s / steps
        const v2 = (s + 1) / steps
        const { rx: rx1, rz: rz1 } = getProfile(v1)
        const { rx: rx2, rz: rz2 } = getProfile(v2)
        const y1 = v1 * getTopHeight(phi)
        const y2 = v2 * getTopHeight(phi)

        finPositions.push(
          Math.cos(phi) * rx1 * 1.01 * shapeMod, y1, Math.sin(phi) * rz1 * 1.01,
          Math.cos(phi) * rx2 * 1.01 * shapeMod, y2, Math.sin(phi) * rz2 * 1.01
        )
      }
    }
    const vfGeo = new THREE.BufferGeometry()
    vfGeo.setAttribute('position', new THREE.Float32BufferAttribute(finPositions, 3))

    // --- 7. VERTICAL REVEAL SEAM (Gap between the two interlocking petals) ---
    const seamPositions: number[] = []
    const seams = [Math.PI / 2, -Math.PI / 2]
    for (const phi of seams) {
      const steps = 50
      for (let s = 0; s < steps; s++) {
        const v1 = s / steps
        const v2 = (s + 1) / steps
        const { rx: rx1, rz: rz1 } = getProfile(v1)
        const { rx: rx2, rz: rz2 } = getProfile(v2)
        const y1 = v1 * getTopHeight(phi)
        const y2 = v2 * getTopHeight(phi)

        seamPositions.push(
          Math.cos(phi) * rx1 * 1.018, y1, Math.sin(phi) * rz1 * 1.018,
          Math.cos(phi) * rx2 * 1.018, y2, Math.sin(phi) * rz2 * 1.018
        )
      }
    }
    const rsGeo = new THREE.BufferGeometry()
    rsGeo.setAttribute('position', new THREE.Float32BufferAttribute(seamPositions, 3))

    return {
      frontPetalGeo: fpGeo,
      rearPetalGeo: rpGeo,
      slantedRoofGeo: cGeo,
      floorSlabsGeo: fsGeo,
      mechanicalFloorsGeo: mfGeo,
      verticalFinsGeo: vfGeo,
      revealSeamGeo: rsGeo,
    }
  }, [baseHeight, crownSlant, totalFloors])

  // Memory disposal (Ponytail guideline)
  useEffect(() => {
    return () => {
      frontPetalGeo.dispose()
      rearPetalGeo.dispose()
      slantedRoofGeo.dispose()
      floorSlabsGeo.dispose()
      mechanicalFloorsGeo.dispose()
      verticalFinsGeo.dispose()
      revealSeamGeo.dispose()
    }
  }, [
    frontPetalGeo,
    rearPetalGeo,
    slantedRoofGeo,
    floorSlabsGeo,
    mechanicalFloorsGeo,
    verticalFinsGeo,
    revealSeamGeo,
  ])

  // Helipad perimeter lights and safety net stanchions (monochrome white)
  const { helipadLights, stanchions } = useMemo(() => {
    const lights: [number, number, number][] = []
    const stanch: [number, number, number][] = []
    const count = 20
    const innerR = 0.54
    const outerR = 0.62
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      lights.push([Math.cos(angle) * innerR, 0.04, Math.sin(angle) * innerR])
      stanch.push([Math.cos(angle) * outerR, 0.02, Math.sin(angle) * outerR])
    }
    return { helipadLights: lights, stanchions: stanch }
  }, [])

  // Spire beacon flash (pure white strobe)
  useFrame((state) => {
    if (beaconLightRef.current && beaconMeshRef.current) {
      const flash = Math.sin(state.clock.elapsedTime * 5.0) > 0.4
      beaconLightRef.current.intensity = flash ? 3.5 : 0.2
      const mat = beaconMeshRef.current.material as THREE.MeshBasicMaterial
      if (mat) {
        mat.color.set(flash ? '#ffffff' : '#333333')
      }
    }
  })

  // Exact vertical parameters
  const helipadFloorRatio = 52 / 68
  const helipadY = baseHeight * helipadFloorRatio
  const helipadX = 1.32
  const helipadZ = 0.06

  const skydeckFloorRatio = 49 / 68
  const skydeckY = baseHeight * skydeckFloorRatio

  return (
    <group ref={groupRef} scale={scale} position={[0, -2.8, 0]}>
      {/* ============================================================ */}
      {/* 1. CENTRAL ELEVATOR CORE COLUMN (Black concrete)             */}
      {/* ============================================================ */}
      <mesh position={[0, baseHeight * 0.48, 0]}>
        <cylinderGeometry args={[0.35, 0.42, baseHeight * 0.96, 24]} />
        <meshStandardMaterial color="#000000" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* ============================================================ */}
      {/* 2. DUAL INTERLOCKING LOTUS GLASS PETALS                      */}
      {/* ============================================================ */}
      {/* Front Petal (High-contrast dark tinted glass) */}
      <mesh geometry={frontPetalGeo}>
        <meshPhysicalMaterial
          color="#050505"
          emissive="#111111"
          emissiveIntensity={0.2}
          roughness={0.05}
          metalness={0.95}
          transmission={0.4}
          transparent
          opacity={0.9}
          reflectivity={1.0}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* Rear Petal (Slightly deeper jet black with soar crest) */}
      <mesh geometry={rearPetalGeo}>
        <meshPhysicalMaterial
          color="#080808"
          emissive="#181818"
          emissiveIntensity={0.25}
          roughness={0.05}
          metalness={0.95}
          transmission={0.4}
          transparent
          opacity={0.92}
          reflectivity={1.0}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* ============================================================ */}
      {/* 3. 68 INDIVIDUAL HORIZONTAL FLOOR SLAB LINES (Pure White)    */}
      {/* ============================================================ */}
      <lineSegments geometry={floorSlabsGeo}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.35} />
      </lineSegments>

      {/* Double-Height Mechanical Plant Floors (Louvers at levels 29-30 & 48) */}
      <lineSegments geometry={mechanicalFloorsGeo}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.85} linewidth={2} />
      </lineSegments>

      {/* ============================================================ */}
      {/* 4. HIGH-DENSITY VERTICAL STRUCTURAL MULLIONS (White/Silver)  */}
      {/* ============================================================ */}
      <lineSegments geometry={verticalFinsGeo}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.45} />
      </lineSegments>

      {/* Vertical Reveal Seams between petals */}
      <lineSegments geometry={revealSeamGeo}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.9} linewidth={2} />
      </lineSegments>

      {/* ============================================================ */}
      {/* 5. SAIGON SKYDECK (FLOOR 49 PANORAMIC OBSERVATION DECK)     */}
      {/* ============================================================ */}
      <group position={[0, skydeckY, 0]}>
        {/* Recessed observation band */}
        <mesh>
          <cylinderGeometry args={[0.55, 0.57, 0.14, 48]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.6}
            transparent
            opacity={0.9}
          />
        </mesh>
        {/* Skydeck mullion pillars */}
        <mesh>
          <cylinderGeometry args={[0.56, 0.58, 0.14, 24, 1, true]} />
          <meshBasicMaterial color="#000000" wireframe />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 6. SLANTED ATRIUM CROWN & STRUCTURAL TRUSSES                */}
      {/* ============================================================ */}
      <mesh geometry={slantedRoofGeo}>
        <meshStandardMaterial color="#000000" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Exposed Internal Roof Truss Space Frame */}
      <group position={[0, baseHeight + 0.1, 0]}>
        <mesh rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.08, 0.8, 0.5]} />
          <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[-0.05, 0.15, 0]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.06, 0.65, 0.45]} />
          <meshStandardMaterial color="#555555" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Stainless Steel Lattice Spire / Mast */}
      <mesh position={[-0.1, baseHeight + 0.72, 0]}>
        <cylinderGeometry args={[0.015, 0.04, 1.25, 16]} />
        <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Radar Communication Discs on Spire */}
      <mesh position={[-0.1, baseHeight + 0.5, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.015, 24]} />
        <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.1, baseHeight + 0.85, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.012, 24]} />
        <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Spire Obstruction Warning Beacon (Pure White Xenon Strobe) */}
      <mesh ref={beaconMeshRef} position={[-0.1, baseHeight + 1.35, 0]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <pointLight
        ref={beaconLightRef}
        position={[-0.1, baseHeight + 1.35, 0]}
        color="#ffffff"
        distance={6}
        intensity={3.5}
      />

      {/* ============================================================ */}
      {/* 7. HIGHLY DETAILED CANTILEVERED HELIPAD (FLOOR 52, ~191M)    */}
      {/* ============================================================ */}
      <group position={[helipadX, helipadY, helipadZ]}>
        {/* Enclosed Passenger Skybridge connecting Floor 52 to Helipad */}
        <group position={[-0.45, 0, 0]}>
          <mesh position={[0.18, 0, 0]}>
            <boxGeometry args={[0.46, 0.05, 0.22]} />
            <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Skybridge Glass Balustrades */}
          <mesh position={[0.18, 0.07, 0.11]}>
            <boxGeometry args={[0.46, 0.09, 0.01]} />
            <meshPhysicalMaterial color="#ffffff" transmission={0.8} transparent opacity={0.7} />
          </mesh>
          <mesh position={[0.18, 0.07, -0.11]}>
            <boxGeometry args={[0.46, 0.09, 0.01]} />
            <meshPhysicalMaterial color="#ffffff" transmission={0.8} transparent opacity={0.7} />
          </mesh>
          {/* Handrails (White chrome) */}
          <mesh position={[0.18, 0.12, 0.11]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.46, 8]} />
            <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[0.18, 0.12, -0.11]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.46, 8]} />
            <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>

        {/* Circular Tarmac Platform */}
        <mesh>
          <cylinderGeometry args={[0.56, 0.48, 0.08, 48]} />
          <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.3} />
        </mesh>

        {/* Angled Safety Catch-Netting Ring */}
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.56, 0.64, 48]} />
          <meshBasicMaterial color="#ffffff" wireframe side={THREE.DoubleSide} />
        </mesh>

        {/* Safety Net Stanchions (Posts around perimeter) */}
        {stanchions.map(([sx, sy, sz], idx) => (
          <mesh key={`stanch-${idx}`} position={[sx, sy + 0.03, sz]}>
            <cylinderGeometry args={[0.005, 0.005, 0.06, 6]} />
            <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
          </mesh>
        ))}

        {/* --- High-Contrast Helipad Landing Deck Markings --- */}
        {/* 1. Outer White Boundary Guide Ring */}
        <mesh position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.42, 0.52, 48]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>

        {/* 2. Inner Touchdown Aiming Circle */}
        <mesh position={[0, 0.043, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.24, 0.28, 48]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>

        {/* 3. Bold White "H" Landing Symbol */}
        <group position={[0, 0.044, 0]}>
          {/* Left Vertical Bar */}
          <mesh position={[-0.09, 0, 0]}>
            <boxGeometry args={[0.032, 0.002, 0.18]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Right Vertical Bar */}
          <mesh position={[0.09, 0, 0]}>
            <boxGeometry args={[0.032, 0.002, 0.18]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Center Crossbar */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.15, 0.002, 0.032]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Perimeter Elevated Aviation Lights (Crisp White & Silver dots) */}
        {helipadLights.map(([lx, ly, lz], idx) => (
          <group key={`light-${idx}`} position={[lx, ly, lz]}>
            {/* Small light post */}
            <mesh position={[0, -0.015, 0]}>
              <cylinderGeometry args={[0.004, 0.004, 0.03, 6]} />
              <meshStandardMaterial color="#222222" />
            </mesh>
            {/* Glowing bulb */}
            <mesh>
              <sphereGeometry args={[0.014, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}

        {/* Inverted V-Truss Heavy Tubular Steel Struts (Anchored to core column) */}
        <group position={[-0.58, -0.34, 0]}>
          {/* Primary central steel tube */}
          <mesh position={[0.28, 0.16, 0]} rotation={[0, 0, 0.68]}>
            <cylinderGeometry args={[0.036, 0.036, 0.78, 16]} />
            <meshStandardMaterial color="#222222" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Left lateral diagonal truss */}
          <mesh position={[0.28, 0.16, 0.19]} rotation={[0.36, 0, 0.68]}>
            <cylinderGeometry args={[0.026, 0.026, 0.82, 12]} />
            <meshStandardMaterial color="#222222" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Right lateral diagonal truss */}
          <mesh position={[0.28, 0.16, -0.19]} rotation={[-0.36, 0, 0.68]}>
            <cylinderGeometry args={[0.026, 0.026, 0.82, 12]} />
            <meshStandardMaterial color="#222222" metalness={0.95} roughness={0.15} />
          </mesh>

          {/* Cross-bracing steel links (X-braces) */}
          <mesh position={[0.28, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.38, 8]} />
            <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* ============================================================ */}
      {/* 8. 5-STORY TIERED PODIUM (Icon68 Commercial Base)           */}
      {/* ============================================================ */}
      <group position={[0, 0.24, 0]}>
        {/* Tier 1 - Main Podium Structure (Onyx black) */}
        <mesh>
          <cylinderGeometry args={[1.2, 1.36, 0.48, 48]} />
          <meshStandardMaterial color="#050505" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Tier 2 - Curved Glass Ribbon Entrance */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[1.22, 1.34, 0.28, 48]} />
          <meshPhysicalMaterial
            color="#000000"
            roughness={0.05}
            metalness={0.95}
            transmission={0.5}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* White Architectural Columns on Podium Facade */}
        <mesh>
          <cylinderGeometry args={[1.225, 1.345, 0.28, 24, 1, true]} />
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>
        {/* Cantilever Entrance Canopy Overhang */}
        <mesh position={[0.92, -0.12, 0.52]} rotation={[0, 0.42, 0]}>
          <boxGeometry args={[0.42, 0.04, 0.64]} />
          <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  )
}
