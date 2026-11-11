import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface BitexcoTowerProps {
  scale?: number
}

export default function BitexcoTower({ scale = 1 }: BitexcoTowerProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const beaconRef = useRef<THREE.PointLight>(null!)
  const beaconMeshRef = useRef<THREE.Mesh>(null!)

  // Procedural Bitexco Tower Geometry
  const { towerGeo, capGeo, floorLinesGeo } = useMemo(() => {
    const radialSegments = 52
    const heightSegments = 36
    const baseHeight = 4.8
    const crownAngle = 0.55 // Slanted angle of the iconic crown

    // Generate tower body vertices
    const positions: number[] = []
    const normals: number[] = []
    const uvs: number[] = []
    const indices: number[] = []

    const grid: number[][] = []

    // Helper for profile width at normalized height v (0 to 1)
    // Bitexco shape: starts wide, bulges gently at 20-30%, then gracefully tapers like a lotus bud
    const getProfile = (v: number) => {
      // lotus bud curve
      const bulge = Math.sin(v * Math.PI) * 0.18
      const taper = 1.0 - v * 0.48
      const rx = (0.85 + bulge) * taper
      const rz = (0.62 + bulge * 0.8) * taper
      return { rx, rz }
    }

    // Top slanted height for angle phi
    const getTopHeight = (phi: number) => {
      return baseHeight + Math.sin(phi - 0.2) * crownAngle
    }

    for (let iy = 0; iy <= heightSegments; iy++) {
      const v = iy / heightSegments
      const row: number[] = []

      for (let ix = 0; ix <= radialSegments; ix++) {
        const u = ix / radialSegments
        const phi = u * Math.PI * 2

        // Top height varies with radial angle to create the slanted crown
        const maxHeight = getTopHeight(phi)
        const y = v * maxHeight

        const { rx, rz } = getProfile(v)

        // Petal/aerodynamic teardrop shaping (Carlos Zapata design)
        const shapeMod = 1.0 + Math.cos(phi) * 0.08 - Math.cos(2 * phi) * 0.05
        const x = Math.cos(phi) * rx * shapeMod
        const z = Math.sin(phi) * rz

        positions.push(x, y, z)
        uvs.push(u, v)

        // Simple outward normal approximation
        const nx = Math.cos(phi)
        const nz = Math.sin(phi)
        normals.push(nx, 0.1, nz)

        row.push(positions.length / 3 - 1)
      }
      grid.push(row)
    }

    // Indices for cylinder quads
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

    // Slanted Top Cap Geometry
    const capPositions: number[] = []
    const capIndices: number[] = []
    const centerIndex = 0

    // Center of slanted roof
    const centerMaxHeight = baseHeight
    capPositions.push(0, centerMaxHeight, 0)

    for (let ix = 0; ix <= radialSegments; ix++) {
      const u = ix / radialSegments
      const phi = u * Math.PI * 2
      const maxHeight = getTopHeight(phi)
      const { rx, rz } = getProfile(1.0)
      const shapeMod = 1.0 + Math.cos(phi) * 0.08 - Math.cos(2 * phi) * 0.05
      const x = Math.cos(phi) * rx * shapeMod
      const z = Math.sin(phi) * rz
      capPositions.push(x, maxHeight, z)
    }

    for (let ix = 1; ix <= radialSegments; ix++) {
      capIndices.push(centerIndex, ix, ix + 1)
    }

    const cGeo = new THREE.BufferGeometry()
    cGeo.setAttribute('position', new THREE.Float32BufferAttribute(capPositions, 3))
    cGeo.setIndex(capIndices)
    cGeo.computeVertexNormals()

    // Floor lines for high-tech architectural visualization
    const linePoints: number[] = []
    const floorSteps = 24
    for (let f = 1; f < floorSteps; f++) {
      const v = f / floorSteps
      const { rx, rz } = getProfile(v)
      for (let s = 0; s <= 40; s++) {
        const phi = (s / 40) * Math.PI * 2
        const y = v * getTopHeight(phi)
        const shapeMod = 1.0 + Math.cos(phi) * 0.08 - Math.cos(2 * phi) * 0.05
        const x = Math.cos(phi) * (rx * 1.002) * shapeMod
        const z = Math.sin(phi) * (rz * 1.002)
        linePoints.push(x, y, z)
      }
    }
    const fGeo = new THREE.BufferGeometry()
    fGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePoints, 3))

    return { towerGeo: tGeo, capGeo: cGeo, floorLinesGeo: fGeo }
  }, [])

  // Helipad Lights Array
  const helipadLights = useMemo(() => {
    const lights: [number, number, number][] = []
    const count = 10
    const radius = 0.44
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      lights.push([Math.cos(angle) * radius, 0.03, Math.sin(angle) * radius])
    }
    return lights
  }, [])

  // Beacon flash & subtle idle rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35
      // Gentle parallax sway
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, state.pointer.y * 0.15, 0.05)
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -state.pointer.x * 0.15, 0.05)
    }

    // Top beacon flash (aviation warning light)
    if (beaconRef.current && beaconMeshRef.current) {
      const intensity = Math.sin(state.clock.elapsedTime * 4) > 0.4 ? 2.5 : 0.2
      beaconRef.current.intensity = intensity
      const beaconMat = beaconMeshRef.current.material as THREE.MeshBasicMaterial
      if (beaconMat) {
        beaconMat.color.set(intensity > 1 ? '#ff3366' : '#660011')
      }
    }
  })

  // Helipad parameters (Floor 52 cantilever ~ 68% height)
  const helipadY = 3.25
  const helipadX = 1.18
  const helipadZ = 0.08

  return (
    <group ref={groupRef} scale={scale} position={[0, -2.2, 0]}>
      {/* 1. Main Glass Tower Body */}
      <mesh geometry={towerGeo}>
        <meshPhysicalMaterial
          color="#0ea5e9"
          emissive="#0284c7"
          emissiveIntensity={0.15}
          roughness={0.12}
          metalness={0.88}
          transmission={0.35}
          transparent
          opacity={0.85}
          reflectivity={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* 2. Wireframe / Architectural Floor Matrix */}
      <lineSegments geometry={floorLinesGeo}>
        <lineBasicMaterial color="#38bdf8" transparent opacity={0.25} />
      </lineSegments>

      {/* 3. Slanted Crown Roof */}
      <mesh geometry={capGeo}>
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* 4. Architectural Crown Fin Blades (The lotus petals tip) */}
      <mesh position={[0.05, 4.85, 0]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.08, 0.65, 0.4]} />
        <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* 5. Architectural Antenna / Spire */}
      <mesh position={[-0.1, 5.3, 0]}>
        <cylinderGeometry args={[0.015, 0.03, 0.9, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Spire aviation warning beacon */}
      <mesh ref={beaconMeshRef} position={[-0.1, 5.75, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshBasicMaterial color="#ff3366" />
      </mesh>
      <pointLight ref={beaconRef} position={[-0.1, 5.75, 0]} color="#ff3366" distance={3} />

      {/* 6. Iconic Cantilevered Helipad (Floor 52) */}
      <group position={[helipadX, helipadY, helipadZ]}>
        {/* Helipad Circular Platform */}
        <mesh>
          <cylinderGeometry args={[0.48, 0.44, 0.06, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
        </mesh>

        {/* Helipad Landing Surface with perimeter ring */}
        <mesh position={[0, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.32, 0.45, 32]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>

        {/* Inner Landing Circle */}
        <mesh position={[0, 0.033, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.18, 0.22, 32]} />
          <meshBasicMaterial color="#f8fafc" side={THREE.DoubleSide} />
        </mesh>

        {/* Helipad "H" Marking */}
        <group position={[0, 0.034, 0]}>
          {/* Vertical left leg of H */}
          <mesh position={[-0.07, 0, 0]}>
            <boxGeometry args={[0.025, 0.001, 0.14]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
          {/* Vertical right leg of H */}
          <mesh position={[0.07, 0, 0]}>
            <boxGeometry args={[0.025, 0.001, 0.14]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
          {/* Horizontal crossbar of H */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.12, 0.001, 0.025]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
        </group>

        {/* Helipad Perimeter Beacon Lights */}
        {helipadLights.map(([lx, ly, lz], idx) => (
          <mesh key={idx} position={[lx, ly, lz]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color={idx % 2 === 0 ? '#38bdf8' : '#10b981'} />
          </mesh>
        ))}

        {/* Structural Cantilever Truss Struts under Helipad */}
        <group position={[-0.45, -0.22, 0]}>
          <mesh position={[0.2, 0.1, 0]} rotation={[0, 0, 0.6]}>
            <cylinderGeometry args={[0.02, 0.02, 0.55, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[0.2, 0.1, 0.15]} rotation={[0.3, 0, 0.6]}>
            <cylinderGeometry args={[0.018, 0.018, 0.58, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[0.2, 0.1, -0.15]} rotation={[-0.3, 0, 0.6]}>
            <cylinderGeometry args={[0.018, 0.018, 0.58, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* 7. Tower Podium / 5-Story Base Structure */}
      <group position={[0, 0.16, 0]}>
        <mesh>
          <cylinderGeometry args={[1.1, 1.25, 0.35, 32]} />
          <meshStandardMaterial
            color="#0f172a"
            metalness={0.8}
            roughness={0.4}
          />
        </mesh>
        {/* Podium glass curtain band */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1.12, 1.23, 0.2, 32]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            roughness={0.1}
            metalness={0.9}
            transmission={0.4}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>

      {/* 8. Plaza Base Platform with Cyberpunk Rings */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[1.8, 1.9, 0.1, 48]} />
          <meshStandardMaterial color="#020617" roughness={0.7} metalness={0.5} />
        </mesh>

        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.4, 1.45, 48]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.65, 1.7, 48]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  )
}

