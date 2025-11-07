import React, { useRef } from 'react'
import './AudioControls.css'

function AudioControls({ onFileUpload, audioFile, isPlaying, onPlay, onStop }) {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('audio/')) {
      onFileUpload(file)
    } else {
      alert('Please select a valid audio file (MP3, WAV, etc.)')
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="audio-controls">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button
        className="btn btn-upload"
        onClick={handleUploadClick}
        disabled={isPlaying}
      >
        {audioFile ? `📁 ${audioFile.name}` : '📁 Upload MP3'}
      </button>
      {audioFile && (
        <button
          className="btn btn-stop"
          onClick={onStop}
          disabled={!isPlaying}
        >
          {isPlaying ? '⏹ Stop' : '⏹ Stopped'}
        </button>
      )}
    </div>
  )
}

export default AudioControls

