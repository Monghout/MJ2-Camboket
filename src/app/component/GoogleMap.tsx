// components/AdvancedMap.tsx
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  Autocomplete,
} from "@react-google-maps/api";
import { useState, useRef, useCallback } from "react";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = {
  lat: 11.5564, // Default Phnom Penh
  lng: 104.9282,
};

export default function AdvancedMap() {
  const [markerPosition, setMarkerPosition] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!, // Store in .env
    libraries: ["places"],
  });

  const handlePlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMapCenter({ lat, lng });
        setMarkerPosition({ lat, lng });
      }
    }
  };

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setMarkerPosition({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    }
  }, []);

  const locateMe = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setMapCenter(pos);
        setMarkerPosition(pos);
      },
      () => {
        alert("Failed to get your location");
      }
    );
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <Autocomplete
          onLoad={setAutocomplete}
          onPlaceChanged={handlePlaceChanged}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Search location"
            className="border p-2 rounded w-full"
          />
        </Autocomplete>
        <button
          onClick={locateMe}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Locate Me
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={14}
        onClick={onMapClick}
      >
        {markerPosition && (
          <Marker
            position={markerPosition}
            draggable
            onDragEnd={(e) => {
              if (e.latLng) {
                setMarkerPosition({
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng(),
                });
              }
            }}
          />
        )}
      </GoogleMap>

      {markerPosition && (
        <div className="space-y-2">
          <p>
            <strong>Latitude:</strong> {markerPosition.lat}
          </p>
          <p>
            <strong>Longitude:</strong> {markerPosition.lng}
          </p>
          <button
            onClick={() => {
              const link = `https://www.google.com/maps?q=${markerPosition.lat},${markerPosition.lng}`;
              navigator.clipboard.writeText(link);
              alert("Google Maps link copied!");
            }}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Copy Map Link
          </button>
        </div>
      )}
    </div>
  );
}
