import { useMemo, useEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { Center } from '@react-three/drei'
import * as THREE from 'three'

interface BitexcoTowerProps {
  rotationY?: number
  material?: 'dark' | 'white' | 'wireframe'
}

export default function BitexcoTower({ rotationY = 230, material = 'dark' }: BitexcoTowerProps) {
  const rawGeometry = useLoader(STLLoader, '/bitexco.stl')

  const { geometry, edgesGeo } = useMemo(() => {
    const geo = rawGeometry.clone()
    geo.computeVertexNormals()
    const edges = new THREE.EdgesGeometry(geo, 24)
    return { geometry: geo, edgesGeo: edges }
  }, [rawGeometry])

  useEffect(() => {
    return () => {
      geometry.dispose()
      edgesGeo.dispose()
    }
  }, [geometry, edgesGeo])

  const angleY = (rotationY * Math.PI) / 180

  return (
    <Center>
      <group rotation={[0, angleY, 0]}>
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <mesh geometry={geometry} scale={0.088} castShadow receiveShadow>
            {material === 'dark' ? (
              <meshPhysicalMaterial
                color="#111111"
                emissive="#000000"
                roughness={0.15}
                metalness={0.9}
                clearcoat={1.0}
                clearcoatRoughness={0.08}
                reflectivity={1.0}
              />
            ) : material === 'white' ? (
              <meshStandardMaterial
                color="#f0f0f0"
                roughness={0.25}
                metalness={0.12}
              />
            ) : (
              <meshBasicMaterial color="#ffffff" wireframe />
            )}
          </mesh>

          {/* Architectural contour lines */}
          <lineSegments geometry={edgesGeo} scale={0.088}>
            <lineBasicMaterial
              color={material === 'white' ? '#999999' : '#ffffff'}
              transparent
              opacity={material === 'wireframe' ? 0 : 0.15}
            />
          </lineSegments>
        </group>
      </group>
    </Center>
  )
}
