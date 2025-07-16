import { useState, useEffect } from 'react'
import './App.css'
import MapWithRoute from './components/mapWithRoute.tsx'
import SplashScreen from './components/SplashScreen.tsx'
import SearchPanel from './components/SearchPanel.tsx'
import ExitConfirmationDialog from './components/ExitConfirmationDialog.tsx'
import L from 'leaflet';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send: (channel: string, ...args: any[]) => void;
      };
    };
  }
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [userGeolocation, setUserGeolocation] = useState<L.LatLngExpression | null>(null);
  const [fromLocation, setFromLocation] = useState<L.LatLngExpression | null>(null);
  const [toLocation, setToLocation] = useState<L.LatLngExpression | null>(null);
  const [searchResult, setSearchResult] = useState<L.LatLngExpression | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const handleAnimationComplete = () => {
    setShowSplash(false);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const userLoc: L.LatLngExpression = [pos.coords.latitude, pos.coords.longitude];
        setUserGeolocation(userLoc);
      });
    }
  }, []);

  const handleSearchResult = (result: L.LatLngExpression | null) => {
    setSearchResult(result);
  };

  const handleFromLocationSet = (location: L.LatLngExpression | null) => {
    setFromLocation(location);
  };

  const handleToLocationSet = (location: L.LatLngExpression | null) => {
    setToLocation(location);
  };

  const handleExitClick = () => {
    setShowExitDialog(true);
  };

  const handleConfirmExit = () => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send('quit-app');
    }
  };

  const handleCancelExit = () => {
    setShowExitDialog(false);
  };

  useEffect(() => {
    console.log('App.tsx State Update:');
    console.log('  userGeolocation:', userGeolocation);
    console.log('  fromLocation (from SearchPanel):', fromLocation);
    console.log('  toLocation (from SearchPanel):', toLocation);
    console.log('  MapWithRoute origin prop:', fromLocation || userGeolocation);
    console.log('  MapWithRoute destination prop:', toLocation);
  }, [userGeolocation, fromLocation, toLocation]);

  return (
    <div className="App">
      {showSplash ? (
        <SplashScreen onAnimationComplete={handleAnimationComplete} />
      ) : (
        <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
          <div style={{ width: '50%', height: '100%' }}>
            <SearchPanel
              onSearchResult={handleSearchResult}
              onFromLocationSet={handleFromLocationSet}
              onToLocationSet={handleToLocationSet}
              onExitClick={handleExitClick}
            />
          </div>
          <div style={{ width: '50%', height: '100%' }}>
            <MapWithRoute
              origin={fromLocation || userGeolocation}
              destination={toLocation}
              searchResult={searchResult}
            />
          </div>
        </div>
      )}
      <ExitConfirmationDialog
        isOpen={showExitDialog}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </div>
  )
}

export default App
