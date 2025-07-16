import { useState } from 'react'
import './App.css'
import MapWithRoute from './components/mapWithRoute.tsx'
import SplashScreen from './components/SplashScreen.tsx'

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleAnimationComplete = () => {
    setShowSplash(false);
  };

  return (
    <div className="App">
      {showSplash ? (
        <SplashScreen onAnimationComplete={handleAnimationComplete} />
      ) : (
        <div style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%' }}>
          <MapWithRoute />
        </div>
      )}
    </div>
  )
}

export default App
