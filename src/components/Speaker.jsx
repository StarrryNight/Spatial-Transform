import React, { forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const Speaker = forwardRef(({ 
  position, 
  onPointerDown, 
  isDragging 
}, ref) => {
  const meshRef = React.useRef()
  const combinedRef = React.useCallback((node) => {
    meshRef.current = node
    if (typeof ref === 'function') {
      ref(node)
    } else if (ref) {
      ref.current = node
    }
  }, [ref])

  // Pulsing animation when dragging
  useFrame((state) => {
    if (meshRef.current) {
      if (isDragging) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.1
        meshRef.current.scale.set(scale, scale, scale)
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
      }
    }
  })

  return (
    <group
      ref={combinedRef}
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation()
        console.log('Group onPointerDown', e)
        if (onPointerDown) onPointerDown(e)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        if (!isDragging) {
          document.body.style.cursor = 'grab'
        }
      }}
      onPointerOut={() => {
        if (!isDragging) {
          document.body.style.cursor = 'default'
        }
      }}
      onClick={(e) => {
        e.stopPropagation()
        console.log('Group onClick', e)
      }}
    >
      {/* Main speaker body */}
      <mesh 
        castShadow
        onPointerDown={(e) => {
          e.stopPropagation()
          console.log('Mesh clicked!', e)
          if (onPointerDown) onPointerDown(e)
        }}
        onClick={(e) => {
          e.stopPropagation()
          console.log('Mesh onClick!', e)
        }}
      >
        <boxGeometry args={[0.4, 0.6, 0.3]} />
        <meshStandardMaterial 
          color={isDragging ? "#e74c3c" : "#e67e22"} 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Speaker cone/grill */}
      <mesh 
        position={[0, 0, 0.16]}
        onPointerDown={(e) => {
          e.stopPropagation()
          if (onPointerDown) onPointerDown(e)
        }}
      >
        <cylinderGeometry args={[0.25, 0.25, 0.05, 32]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      
      {/* Speaker indicator light */}
      <mesh 
        position={[0, 0.3, 0.16]}
        onPointerDown={(e) => {
          e.stopPropagation()
          if (onPointerDown) onPointerDown(e)
        }}
      >
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial 
          color="#2ecc71" 
          emissive="#2ecc71" 
          emissiveIntensity={isDragging ? 1 : 0.5} 
        />
      </mesh>
      
      {/* Base/stand */}
      <mesh 
        position={[0, -0.35, 0]} 
        receiveShadow
        onPointerDown={(e) => {
          e.stopPropagation()
          if (onPointerDown) onPointerDown(e)
        }}
      >
        <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* Direction indicator arrow */}
      <mesh 
        position={[0, 0, 0.2]} 
        rotation={[0, 0, 0]}
        onPointerDown={(e) => {
          e.stopPropagation()
          if (onPointerDown) onPointerDown(e)
        }}
      >
        <coneGeometry args={[0.1, 0.2, 8]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
    </group>
  )
})

Speaker.displayName = 'Speaker'

export default Speaker

