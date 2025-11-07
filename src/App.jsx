import React, { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import AudioControls from './components/AudioControls'
import './App.css'

function App() {
  const [audioFile, setAudioFile] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioContextRef = useRef(null)
  const audioBufferRef = useRef(null)
  const sourceNodeRef = useRef(null)
  const pannerNodeRef = useRef(null)
  const gainNodeRef = useRef(null)

  const handleFileUpload = async (file) => {
    if (!file) return

    setAudioFile(file)
    const url = URL.createObjectURL(file)
    setAudioUrl(url)

    // Initialize AudioContext if not already done
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }

    // Load audio file
    try {
      const arrayBuffer = await file.arrayBuffer()
      audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer)
    } catch (error) {
      console.error('Error loading audio:', error)
    }
  }

  // Load default audio file on mount
  useEffect(() => {
    const loadDefaultAudio = async () => {
      try {
        // Try to load from public folder (Vite serves files from /public at root)
        const audioFileName = 'Polyphia _ G.O.A.T. (Official Music Video).mp3'
        const response = await fetch(`/${audioFileName}`)
        
        if (!response.ok) {
          // Fallback: try with default-audio.mp3 if it was renamed
          const fallbackResponse = await fetch('/default-audio.mp3')
          if (fallbackResponse.ok) {
            const blob = await fallbackResponse.blob()
            const file = new File([blob], 'default-audio.mp3', { type: 'audio/mpeg' })
            await handleFileUpload(file)
            console.log('Default audio file loaded successfully')
            return
          }
          throw new Error('File not found in public folder')
        }
        
        const blob = await response.blob()
        const file = new File([blob], audioFileName, { type: 'audio/mpeg' })
        await handleFileUpload(file)
        console.log('Default audio file loaded successfully')
      } catch (error) {
        console.warn('Could not load default audio file:', error)
        console.log('You can still upload your own audio file using the upload button')
        // Continue without default audio - user can upload their own file
      }
    }
    
    loadDefaultAudio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  const playAudio = async (speakerPosition) => {
    if (!audioContextRef.current || !audioBufferRef.current) {
      console.warn('Audio not ready. Please upload an audio file first.')
      return
    }

    // Resume AudioContext if suspended (browser autoplay policy)
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
    }

    // Stop previous audio if playing
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop()
    }

    // Create new source
const source = audioContextRef.current.createBufferSource()
source.buffer = audioBufferRef.current
source.loop = true

// ✅ Force mono input for proper HRTF spatialization
source.channelCount = 1
source.channelCountMode = 'explicit'
source.channelInterpretation = 'speakers'

    // Create panner node for spatial audio
    const panner = audioContextRef.current.createPanner()
    panner.panningModel = 'HRTF' // Head-Related Transfer Function for realistic 3D audio
    panner.distanceModel = 'inverse' // Volume decreases with distance
    panner.refDistance = 1 // Reference distance (1 unit = full volume)
    panner.maxDistance = 10000 // Maximum distance for audio
    panner.rolloffFactor = 1 // How quickly volume decreases with distance
    panner.coneInnerAngle = 360 // Full 360-degree sound cone
    panner.coneOuterAngle = 0 // No outer cone
    panner.coneOuterGain = 0 // No gain outside cone
    
    console.log('Panner created with HRTF spatial audio')

    // Set listener position (mannequin is at origin, head is at ~1.6 units up)
    // The listener represents the mannequin's head position
    const listener = audioContextRef.current.listener
    
    // Use modern API if available (Chrome, Edge, newer browsers)
    if (listener.positionX !== undefined) {
      listener.positionX.value = 0
      listener.positionY.value = 1.6  // Mannequin head height (head is at y=1.6)
      listener.positionZ.value = 0
      // Forward direction (where mannequin is looking)
      listener.forwardX.value = 0
      listener.forwardY.value = 0
      listener.forwardZ.value = -1  // Looking down negative Z
      // Up direction
      listener.upX.value = 0
      listener.upY.value = 1
      listener.upZ.value = 0
    } else if (listener.setPosition) {
      // Fallback for older browsers
      listener.setPosition(0, 1.6, 0)  // Head height at 1.6 units
      listener.setOrientation(0, 0, -1, 0, 1, 0)
    }

    // Set speaker position (convert Three.js coordinates to Web Audio coordinates)
    // Web Audio uses right-handed coordinate system (same as Three.js)
    // Three.js: X=right, Y=up, Z=towards camera (right-handed)
    // Web Audio: X=right, Y=up, Z=towards listener (right-handed)
    if (panner.positionX !== undefined) {
      panner.positionX.value = speakerPosition.x
      panner.positionY.value = speakerPosition.y
      panner.positionZ.value = speakerPosition.z
    } else if (panner.setPosition) {
      // Fallback for older browsers
      panner.setPosition(speakerPosition.x, speakerPosition.y, speakerPosition.z)
    }
    console.log('Initial speaker audio position:', speakerPosition)

    // Create gain node for volume control
    const gain = audioContextRef.current.createGain()
    gain.gain.value = 0.5

    // Connect nodes: source -> panner -> gain -> destination
    source.connect(panner)
    panner.connect(gain)
    gain.connect(audioContextRef.current.destination)

    // Store references
    sourceNodeRef.current = source
    pannerNodeRef.current = panner
    gainNodeRef.current = gain

    // Play audio
    source.start(0)
    setIsPlaying(true)

    // Handle end of playback
    source.onended = () => {
      setIsPlaying(false)
    }
  }

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop()
      sourceNodeRef.current = null
    }
    setIsPlaying(false)
  }

  const updateSpeakerPosition = (position) => {
    if (pannerNodeRef.current && isPlaying) {
      // Update panner position in real-time as speaker is dragged
      if (pannerNodeRef.current.positionX !== undefined) {
        pannerNodeRef.current.positionX.value = position.x
        pannerNodeRef.current.positionY.value = position.y
        pannerNodeRef.current.positionZ.value = position.z
      } else if (pannerNodeRef.current.setPosition) {
        // Fallback for older browsers
        pannerNodeRef.current.setPosition(position.x, position.y, position.z)
      }
      console.log('Updated speaker audio position:', position)
    }
  }

  return (
    <div className="app">
      <div className="app-header">
        <h1>Spatial Audio Generator</h1>
        <AudioControls
          onFileUpload={handleFileUpload}
          audioFile={audioFile}
          isPlaying={isPlaying}
          onPlay={() => {}}
          onStop={stopAudio}
        />
      </div>
      <div className="canvas-container">
        <Canvas
          camera={{ position: [0, 2, 5], fov: 50 }}
          shadows
        >
          <Scene
            onPlayAudio={playAudio}
            onUpdateSpeakerPosition={updateSpeakerPosition}
            isPlaying={isPlaying}
            hasAudio={!!audioFile}
          />
        </Canvas>
      </div>
    </div>
  )
}

export default App

