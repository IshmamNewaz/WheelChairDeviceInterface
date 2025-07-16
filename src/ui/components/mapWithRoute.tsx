import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
  Autocomplete
} from '@react-google-maps/api';

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%'
};

const center: google.maps.LatLngLiteral = {
  lat: 23.8103, // fallback center (Dhaka)
  lng: 90.4125
};

function MapWithRoute() {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [origin, setOrigin] = useState<google.maps.LatLngLiteral | null>(null);
  const [destination, setDestination] = useState<google.maps.LatLngLiteral | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete>(null);
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyAu8IP2NCr0DMMboULhk_SicbL1q8WGW50',
    libraries: ['places']
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const userLoc: google.maps.LatLngLiteral = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setOrigin(userLoc);
      });
    }
  }, []);

  const calculateRoute = useCallback(() => {
    if (origin && selectedPlace && selectedPlace.geometry && selectedPlace.geometry.location) {
      const newDestination: google.maps.LatLngLiteral = {
        lat: selectedPlace.geometry.location.lat(),
        lng: selectedPlace.geometry.location.lng()
      };
      setDestination(newDestination);

      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: origin,
          destination: newDestination,
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error(`error fetching directions ${result}`);
          }
        }
      );
    }
  }, [origin, selectedPlace]);

  useEffect(() => {
    // Recalculate route if origin or destination changes (e.g., user's location updates)
    if (origin && destination) {
      calculateRoute();
    }
  }, [origin, destination, calculateRoute]);

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      setSelectedPlace(autocompleteRef.current.getPlace());
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flexGrow: 1 }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={origin || center}
          zoom={14}
        >
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </div>
      <div style={{ padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Autocomplete
          onLoad={(autocomplete) => {
            if (autocomplete) {
              (autocompleteRef as React.MutableRefObject<google.maps.places.Autocomplete>).current = autocomplete;
            }
          }}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            placeholder="Enter a destination"
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
        </Autocomplete>
        <button
          onClick={calculateRoute}
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
