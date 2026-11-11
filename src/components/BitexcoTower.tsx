import { useMemo, useEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { Center } from '@react-three/drei'
import * as THREE from 'three'

export type TowerMaterialMode = 'dark' | 'white' | 'wireframe'

interface BitexcoTowerProps {
  mode?: TowerMaterialMode
}

export default function BitexcoTower({ mode = 'dark' }: BitexcoTowerProps) {
  const rawGeometry = useLoader(STLLoader, '/bitexco.stl')

  // Smooth vertex normals & architectural edges
  const { geometry, edgesGeo } = useMemo(() => {
    const geo = rawGeometry.clone()
    geo.computeVertexNormals()

    // Threshold angle of 24 degrees to highlight key architectural silhouette edges
    const edges = new THREE.EdgesGeometry(geo, 24)

    return { geometry: geo, edgesGeo: edges }
  }, [rawGeometry])

  useEffect(() => {
    return () => {
      geometry.dispose()
      edgesGeo.dispose()
    }
  }, [geometry, edgesGeo])

  // Exact rotation:
  // 1. rotation.x = -PI/2 (makes STL Z-axis upright as Three.js Y-axis)
  // 2. rotation.y = 265 degrees (aligns the helipad pointing to the right and crown tip to the left, matching the photo)
  const angleY = (265 * Math.PI) / 180

  return (
    <Center>
      <group rotation={[0, angleY, 0]}>
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <mesh geometry={geometry} scale={0.088} castShadow receiveShadow>
            {mode === 'dark' ? (
              <meshPhysicalMaterial
                color="#0c0c0c"
                emissive="#000000"
                roughness={0.15}
                metalness={0.9}
                clearcoat={1.0}
                clearcoatRoughness={0.08}
                reflectivity={1.0}
              />
            ) : mode === 'white' ? (
              <meshStandardMaterial
                color="#f8fafc"
                roughness={0.25}
                metalness={0.12}
              />
            ) : (
              <meshBasicMaterial color="#ffffff" wireframe />
            )}
          </mesh>

          {/* Subtle white contour lines in dark mode */}
          {mode === 'dark' && (
            <lineSegments geometry={edgesGeo} scale={0.088}>
              <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
            </lineSegments>
          )}
        </group>
      </group>
    </Center>
  )
}
