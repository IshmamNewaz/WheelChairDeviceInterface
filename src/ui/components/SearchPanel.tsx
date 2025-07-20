import React, { useState, useCallback } from 'react';
import L from 'leaflet';

interface SearchPanelProps {
  onFromLocationSet: (location: L.LatLngExpression | null) => void;
  onToLocationSet: (location: L.LatLngExpression | null) => void;
  onSearchResult: (result: L.LatLngExpression | null) => void;
  onExitClick: () => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onFromLocationSet, onToLocationSet, onSearchResult, onExitClick }) => {
  const [fromSearchTerm, setFromSearchTerm] = useState<string>('');
  const [toSearchTerm, setToSearchTerm] = useState<string>('');

  const geocodeAddress = async (address: string): Promise<L.LatLngExpression | null> => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        return [lat, lon];
      } else {
        console.error('No results found for:', address);
        return null;
      }
    } catch (error) {
      console.error('Error during geocoding:', error);
      return null;
    }
  };

  const handleShowRoute = useCallback(async () => {
    let fromLocation: L.LatLngExpression | null = null;
    if (fromSearchTerm) {
      fromLocation = await geocodeAddress(fromSearchTerm);
    }

    let toLocation: L.LatLngExpression | null = null;
    if (toSearchTerm) {
      toLocation = await geocodeAddress(toSearchTerm);
    }

    onFromLocationSet(fromLocation);
    onToLocationSet(toLocation);
    onSearchResult(toLocation); // For map centering
    console.log('SearchPanel: fromLocation geocoded:', fromLocation);
    console.log('SearchPanel: toLocation geocoded:', toLocation);

  }, [fromSearchTerm, toSearchTerm, onFromLocationSet, onToLocationSet, onSearchResult]);

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2 style={{ fontSize: '1.5rem', alignSelf: 'flex-start', margin: 0, marginBottom: '20px' }}>Find Your Route</h2>
      <input
        type="text"
        placeholder="From (e.g., Current Location)"
        value={fromSearchTerm}
        onChange={(e) => setFromSearchTerm(e.target.value)}
        style={{
          boxSizing: `border-box`,
          border: `1px solid transparent`,
          width: `100%`,
          height: `40px`,
          padding: `0 12px`,
          borderRadius: `3px`,
          boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
          fontSize: `16px`,
          outline: `none`,
          textOverflow: `ellipses`,
          marginBottom: '15px'
        }}
      />
      <input
        type="text"
        placeholder="To (Destination)"
        value={toSearchTerm}
        onChange={(e) => setToSearchTerm(e.target.value)}
        style={{
          boxSizing: `border-box`,
          border: `1px solid transparent`,
          width: `100%`,
          height: `40px`,
          padding: `0 12px`,
          borderRadius: `3px`,
          boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
          fontSize: `16px`,
          outline: `none`,
          textOverflow: `ellipses`,
          marginBottom: '20px'
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '20px' }}>
        <button
          onClick={handleShowRoute}
          style={{
            height: `40px`,
            padding: `0 20px`,
            borderRadius: `3px`,
            border: `none`,
            backgroundColor: `#4285F4`,
            color: `white`,
            fontSize: `16px`,
            cursor: `pointer`,
            boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
          }}
        >
          Show Route
        </button>
      </div>
      <div style={{ marginTop: 'auto', marginBottom: '20px', display: 'flex', justifyContent: 'center', width: '100%' }}>
        <button
          onClick={onExitClick}
          style={{
            height: `40px`,
            padding: `0 20px`,
            borderRadius: `3px`,
            border: `none`,
            backgroundColor: `#f44336`,
            color: `white`,
            fontSize: `16px`,
            cursor: `pointer`,
            boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
          }}
        >
          Exit App
        </button>
      </div>
    </div>
  );
};

export default SearchPanel;
