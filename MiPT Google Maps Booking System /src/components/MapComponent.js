import React from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const MapComponent = ({ onMapClick, markerPosition }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: '',
    libraries,
  });

  if (loadError) return 'Error loading maps';
  if (!isLoaded) return 'Loading maps';

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={8}
      center={markerPosition || { lat: 40.7128, lng: -74.0060 }}
      onClick={onMapClick}
    >
      {window.google && markerPosition && <Marker position={markerPosition} />}
    </GoogleMap>
  );
};

export default MapComponent;