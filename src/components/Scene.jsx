import React, { useState, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Grid, Environment } from '@react-three/drei'
import Mannequin from './Mannequin'
import Speaker from './Speaker'
import * as THREE from 'three'

function Scene({ onPlayAudio, onUpdateSpeakerPosition, isPlaying, hasAudio }) {
  const [speakerPosition, setSpeakerPosition] = useState([2, 0, 0])
  const [isDragging, setIsDragging] = useState(false)
  const speakerRef = useRef()
  const positionRef = useRef([2, 0, 0]) // Keep ref for latest position
  const { camera, raycaster, gl } = useThree()
  const planeRef = useRef()
  const controlsRef = useRef()

  // Create invisible plane for dragging
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  
  // Create a bounding box for the speaker to detect clicks
  const speakerBoundingBox = useRef(new THREE.Box3())

  // Global mouse move handler for dragging
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (event) => {
      // Convert mouse position to normalized device coordinates
      const rect = gl.domElement.getBoundingClientRect()
      const mouse = new THREE.Vector2()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // Raycast to find intersection with ground plane
      raycaster.setFromCamera(mouse, camera)
      const intersect = raycaster.ray.intersectPlane(plane, new THREE.Vector3())
      
      if (intersect) {
        const newPosition = [intersect.x, 0, intersect.z]
        positionRef.current = newPosition
        setSpeakerPosition(newPosition)
        
        // Update audio position if playing
        if (isPlaying && onUpdateSpeakerPosition) {
          onUpdateSpeakerPosition({
            x: intersect.x,
            y: 0,
            z: intersect.z
          })
        }
      }
    }

    const handleMouseUp = () => {
      // Reset cursor style
      if (gl.domElement) {
        gl.domElement.style.cursor = 'default'
      }
      setIsDragging(false)
      
      // Audio should already be playing from when drag started
      // No need to restart it here
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isPlaying, onUpdateSpeakerPosition, onPlayAudio, camera, raycaster, gl, plane, hasAudio])

  const handlePointerDown = (e) => {
    e.stopPropagation()
    // Change cursor style
    if (gl.domElement) {
      gl.domElement.style.cursor = 'grabbing'
    }
    console.log('Speaker clicked! Starting drag...', e)
    setIsDragging(true)
    
    // Start audio playback immediately when dragging starts (if audio is loaded)
    if (onPlayAudio && hasAudio && !isPlaying) {
      const currentPos = positionRef.current
      onPlayAudio({
        x: currentPos[0],
        y: currentPos[1],
        z: currentPos[2]
      })
    }
    
    return false
  }

  useFrame(() => {
    if (speakerRef.current) {
      // Direct position update for better responsiveness
      const targetPos = new THREE.Vector3(...speakerPosition)
      if (isDragging) {
        speakerRef.current.position.copy(targetPos)
      } else {
        speakerRef.current.position.lerp(targetPos, 0.1)
      }
      
      // Update bounding box for click detection
      speakerBoundingBox.current.setFromObject(speakerRef.current)
    }
  })
  
  // Handle clicks on canvas to detect speaker clicks
  useEffect(() => {
    const handleClick = (event) => {
      if (isDragging) return
      
      const rect = gl.domElement.getBoundingClientRect()
      const mouse = new THREE.Vector2()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      raycaster.setFromCamera(mouse, camera)
      
      // Check if click is on speaker
      if (speakerRef.current) {
        const intersects = raycaster.intersectObject(speakerRef.current, true)
        if (intersects.length > 0) {
          console.log('Speaker clicked via raycast!', intersects)
          // Change cursor style
          if (gl.domElement) {
            gl.domElement.style.cursor = 'grabbing'
          }
          setIsDragging(true)
          
          // Start audio playback immediately when clicking (if audio is loaded)
          if (onPlayAudio && hasAudio && !isPlaying) {
            const currentPos = positionRef.current
            onPlayAudio({
              x: currentPos[0],
              y: currentPos[1],
              z: currentPos[2]
            })
          }
          
          event.stopPropagation()
          event.preventDefault()
        }
      }
    }
    
    gl.domElement.addEventListener('click', handleClick)
    return () => {
      gl.domElement.removeEventListener('click', handleClick)
    }
  }, [gl, camera, raycaster, isDragging, onPlayAudio, hasAudio, isPlaying])

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 5]} />
      <OrbitControls
        ref={controlsRef}
        enablePan={!isDragging}
        enableZoom={!isDragging}
        enableRotate={!isDragging}
        minDistance={3}
        maxDistance={20}
        enableDamping={true}
        dampingFactor={0.05}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} />
      
      {/* Environment */}
      <Environment preset="sunset" />
      
      {/* Ground grid */}
      <Grid
        args={[20, 20]}
        cellColor="#6f6f6f"
        sectionColor="#9d4b4b"
        cellThickness={0.5}
        sectionThickness={1}
        fadeDistance={25}
        fadeStrength={1}
      />
      
      {/* Ground plane for raycasting (invisible) */}
      <mesh
        ref={planeRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
      </mesh>
      
      {/* Mannequin in center */}
      <Mannequin position={[0, 0, 0]} />
      
      {/* Draggable Speaker */}
      <Speaker
        ref={speakerRef}
        position={speakerPosition}
        onPointerDown={handlePointerDown}
        isDragging={isDragging}
      />
      
      {/* Debug: Test if speaker is visible */}
      {process.env.NODE_ENV === 'development' && (
        <mesh position={speakerPosition} visible={false}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="red" wireframe />
        </mesh>
      )}
    </>
  )
}

export default Scene

