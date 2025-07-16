import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

// Fix for default marker icon not showing
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const center: L.LatLngExpression = [23.8103, 90.4125]; // fallback center (Dhaka)

interface RoutingMachineProps {
  origin: L.LatLngExpression;
  destination: L.LatLngExpression;
}

const RoutingMachine: React.FC<RoutingMachineProps> = ({ origin, destination }) => {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (!map) return;

    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng((origin as [number, number])[0], (origin as [number, number])[1]),
        L.latLng((destination as [number, number])[0], (destination as [number, number])[1])
      ],
      routeWhileDragging: true,
      showAlternatives: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      show: false, // Hide the routing instructions panel
    }).addTo(map);

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, origin, destination]);

  return null;
};

const MapRecenter: React.FC<{ center: L.LatLngExpression | null }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

function MapWithRoute() {
  const [origin, setOrigin] = useState<L.LatLngExpression | null>(null);
  const [destination, setDestination] = useState<L.LatLngExpression | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResult, setSearchResult] = useState<L.LatLngExpression | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const userLoc: L.LatLngExpression = [pos.coords.latitude, pos.coords.longitude];
        setOrigin(userLoc);
      });
    }
  }, []);

  const handleSearch = useCallback(async () => {
    console.log('Search button clicked. Search term:', searchTerm);
    if (searchTerm) {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`);
        console.log('Nominatim API response status:', response.status);
        const data = await response.json();
        console.log('Nominatim API response data:', data);
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setSearchResult([lat, lon]);
          setDestination([lat, lon]); // Set destination for routing
          console.log('Destination set to:', [lat, lon]);
        } else {
          console.error('No results found for search term:', searchTerm);
          setSearchResult(null);
          setDestination(null);
        }
      } catch (error) {
        console.error('Error during geocoding:', error);
        setSearchResult(null);
        setDestination(null);
      }
    } else {
      console.log('Search term is empty.');
    }
  }, [searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flexGrow: 1 }}>
        <MapContainer
          center={origin || center}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {origin && <Marker position={origin}><Popup>Your Location</Popup></Marker>}
          {searchResult && <Marker position={searchResult}><Popup>Destination</Popup></Marker>}
          {origin && destination && <RoutingMachine origin={origin} destination={destination} />}
          <MapRecenter center={searchResult} />
        </MapContainer>
      </div>
      <div style={{ padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Enter a destination"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            boxSizing: `border-box`,
            border: `1px solid transparent`,
            width: `300px`,
            height: `32px`,
            padding: `0 12px`,
            borderRadius: `3px`,
            boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
            fontSize: `14px`,
            outline: `none`,
            textOverflow: `ellipses`,
            marginRight: '10px'
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            height: `32px`,
            padding: `0 15px`,
            borderRadius: `3px`,
            border: `none`,
            backgroundColor: `#4285F4`,
            color: `white`,
            fontSize: `14px`,
            cursor: `pointer`,
            boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
          }}
        >
          Search Route
        </button>
      </div>
    </div>
  );
}

export default MapWithRoute;