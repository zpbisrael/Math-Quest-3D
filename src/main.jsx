import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GameStateProvider } from './store/useGameState.jsx'
import { KeyboardControls } from '@react-three/drei'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GameStateProvider>
      <KeyboardControls
        map={[
          { name: "forward", keys: ["ArrowUp", "w", "W"] },
          { name: "backward", keys: ["ArrowDown", "s", "S"] },
          { name: "left", keys: ["ArrowLeft", "a", "A"] },
          { name: "right", keys: ["ArrowRight", "d", "D"] },
          { name: "jump", keys: ["Space"] },
          { name: "interact", keys: ["e", "E"] },
          { name: "inventory", keys: ["q", "Q"] },
        ]}
      >
        <App />
      </KeyboardControls>
    </GameStateProvider>
  </StrictMode>,
)
