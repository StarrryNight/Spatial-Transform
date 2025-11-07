# Spatial Audio Generator

A React web application that generates spatial audio in a 3D environment. Experience immersive 3D sound by positioning a speaker in 3D space relative to a mannequin listener.

## Features

- 🎵 **MP3 Audio Import**: Upload and play your own audio files
- 🎭 **3D Visualization**: Interactive Three.js scene with mannequin and speaker
- 🔊 **Spatial Audio**: Real-time 3D audio positioning using Web Audio API with HRTF (Head-Related Transfer Function)
- 🖱️ **Drag & Drop**: Intuitively position the speaker by dragging it in 3D space
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd spatialTransform
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## How to Use

1. **Upload Audio**: Click the "Upload MP3" button in the header to select an audio file
2. **Position Speaker**: Click and drag the orange speaker in the 3D scene to position it
3. **Listen**: When you release the speaker, audio will automatically play from that position
4. **Move While Playing**: Drag the speaker while audio is playing to hear real-time spatial audio changes
5. **Control Camera**: Use mouse to orbit, zoom, and pan the camera around the scene

## Technology Stack

- **React 18** - UI framework
- **Three.js** - 3D graphics rendering
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for react-three-fiber
- **Web Audio API** - Spatial audio processing with PannerNode
- **Vite** - Build tool and dev server

## Project Structure

```
spatialTransform/
├── src/
│   ├── components/
│   │   ├── Scene.jsx          # Main 3D scene with mannequin and speaker
│   │   ├── Mannequin.jsx      # 3D mannequin model (listener)
│   │   ├── Speaker.jsx        # Draggable 3D speaker model
│   │   └── AudioControls.jsx  # File upload and playback controls
│   ├── App.jsx                # Main application component
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Audio Features

The spatial audio implementation uses:
- **HRTF (Head-Related Transfer Function)**: Provides realistic 3D audio positioning
- **Inverse Distance Model**: Audio volume decreases with distance
- **Real-time Position Updates**: Audio position updates as you drag the speaker

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (may require user interaction to start audio)

## License

See LICENSE file for details.
