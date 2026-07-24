import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, AlertTriangle, ShieldAlert, Car, Bike, Package } from 'lucide-react';
import { RideRequest, VehicleCategory } from '../types';

interface MapViewProps {
  ride: RideRequest | null;
  onMapClick?: (coords: [number, number]) => void;
  onOpenPanicModal: () => void;
  driverLocation?: [number, number];
}

export const MapView: React.FC<MapViewProps> = ({
  ride,
  onMapClick,
  onOpenPanicModal,
  driverLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropoffMarkerRef = useRef<L.Marker | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = ride?.pickupCoords[0] || 10.4960;
      const initialLng = ride?.pickupCoords[1] || -66.8488;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | VeloX GPS',
        maxZoom: 19,
      }).addTo(map);

      // Map click handler to pick coordinates
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onMapClick) {
          onMapClick([e.latlng.lat, e.latlng.lng]);
        }
      });

      mapInstanceRef.current = map;
    }

    return () => {
      // Keep instance persistent for smooth performance
    };
  }, []);

  // Handle markers & polylines when ride data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing markers & polylines
    if (pickupMarkerRef.current) map.removeLayer(pickupMarkerRef.current);
    if (dropoffMarkerRef.current) map.removeLayer(dropoffMarkerRef.current);
    if (driverMarkerRef.current) map.removeLayer(driverMarkerRef.current);
    if (polylineRef.current) map.removeLayer(polylineRef.current);

    if (ride) {
      // Pickup Marker
      const pickupIcon = L.divIcon({
        className: 'custom-pickup-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 bg-emerald-500/30 rounded-full pickup-pulse"></div>
            <div class="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white font-bold text-xs">
              📍
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      pickupMarkerRef.current = L.marker(ride.pickupCoords, { icon: pickupIcon })
        .bindTooltip("Punto de Origen", { permanent: false, direction: 'top' })
        .addTo(map);

      // Dropoff Marker
      if (ride.dropoffCoords[0] !== 0) {
        const dropoffIcon = L.divIcon({
          className: 'custom-dropoff-pin',
          html: `
            <div class="w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white font-bold text-xs">
              🏁
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        dropoffMarkerRef.current = L.marker(ride.dropoffCoords, { icon: dropoffIcon })
          .bindTooltip("Destino", { permanent: false, direction: 'top' })
          .addTo(map);

        // Polyline Route
        polylineRef.current = L.polyline([ride.pickupCoords, ride.dropoffCoords], {
          color: '#2563eb',
          weight: 5,
          opacity: 0.8,
          dashArray: '10, 10',
        }).addTo(map);

        // Fit bounds
        const bounds = L.latLngBounds([ride.pickupCoords, ride.dropoffCoords]);
        if (driverLocation) bounds.extend(driverLocation);
        map.fitBounds(bounds, { padding: [50, 50] });
      } else {
        map.setView(ride.pickupCoords, 15);
      }
    }

    // Driver Marker
    if (driverLocation && ride?.driver) {
      const vehicleEmoji = ride.category === 'moto' ? '🏍️' : ride.category === 'delivery' ? '📦' : '🚗';
      
      const driverIcon = L.divIcon({
        className: 'custom-driver-pin',
        html: `
          <div class="relative flex flex-col items-center">
            <div class="bg-gray-900 text-amber-400 border border-amber-400 font-mono text-[10px] px-1.5 py-0.5 rounded shadow font-bold whitespace-nowrap mb-0.5">
              ${ride.driver.vehiclePlate}
            </div>
            <div class="w-9 h-9 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-xl border-2 border-white text-lg animate-bounce">
              ${vehicleEmoji}
            </div>
          </div>
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 45],
      });

      driverMarkerRef.current = L.marker(driverLocation, { icon: driverIcon }).addTo(map);
    }
  }, [ride, driverLocation]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && ride) {
      mapInstanceRef.current.setView(ride.pickupCoords, 15);
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([10.4960, -66.8488], 14);
    }
  };

  const isActiveRide = ride && ['driver_assigned', 'driver_arriving', 'in_trip'].includes(ride.status);

  return (
    <div className="relative w-full h-full min-h-[350px] bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px]" />

      {/* Recenter Button */}
      <button
        type="button"
        onClick={handleRecenter}
        className="absolute bottom-4 right-4 z-[500] bg-white text-slate-800 p-3 rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition active:scale-95"
        title="Centrar ubicación"
      >
        <Navigation className="w-5 h-5 text-indigo-600" />
      </button>

      {/* SOS PANIC BUTTON (Always visible during active ride or accessible on map) */}
      {isActiveRide && (
        <div className="absolute top-4 right-4 z-[500] animate-pulse">
          <button
            type="button"
            onClick={onOpenPanicModal}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-700 text-white font-extrabold px-4 py-2.5 rounded-full shadow-2xl border-2 border-white hover:from-red-700 hover:to-rose-800 transition transform active:scale-90"
          >
            <ShieldAlert className="w-5 h-5 animate-spin" />
            <span className="text-xs uppercase tracking-wider">Botón Pánico SOS</span>
          </button>
        </div>
      )}

      {/* Interactive Helper Banner */}
      {!ride?.dropoffCoords[0] && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] bg-slate-900/90 text-white text-xs px-3.5 py-2 rounded-full shadow-lg backdrop-blur-md border border-slate-700/50 flex items-center gap-2 pointer-events-none">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>Toca cualquier punto en el mapa para fijar tu destino</span>
        </div>
      )}
    </div>
  );
};
