import React, { useEffect, useRef } from 'react';
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

interface MapWithRouteProps {
  origin: L.LatLngExpression | null;
  destination: L.LatLngExpression | null;
  searchResult: L.LatLngExpression | null;
}

const MapWithRoute: React.FC<MapWithRouteProps> = ({ origin, destination, searchResult }) => {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={searchResult || origin || center}
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
        <MapRecenter center={searchResult || origin} />
      </MapContainer>
    </div>
  );
};

export default MapWithRoute;
