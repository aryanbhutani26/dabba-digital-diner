import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Package } from 'lucide-react';

interface LiveMapProps {
  deliveryLocation?: { latitude: number; longitude: number };
  customerLocation: { latitude: number; longitude: number };
  restaurantLocation?: { latitude: number; longitude: number };
  orderStatus: string;
}

export const LiveMap = ({ 
  deliveryLocation, 
  customerLocation,
  restaurantLocation,
  orderStatus 
}: LiveMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setMapLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // @ts-ignore
    const L = window.L;
    
    // Clear existing map
    mapRef.current.innerHTML = '';
    const mapContainer = document.createElement('div');
    mapContainer.style.height = '100%';
    mapContainer.style.width = '100%';
    mapRef.current.appendChild(mapContainer);

    // Initialize map
    const map = L.map(mapContainer).setView(
      [customerLocation.latitude, customerLocation.longitude],
      13
    );

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom icons
    const createCustomIcon = (color: string, icon: string) => {
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: ${color};
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            <span style="color: white; font-size: 20px;">${icon}</span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
    };

    // Add customer marker
    const customerMarker = L.marker(
      [customerLocation.latitude, customerLocation.longitude],
      { icon: createCustomIcon('#10b981', '🏠') }
    ).addTo(map);
    customerMarker.bindPopup('<b>Delivery Location</b><br>Your address');

    // Add restaurant marker if provided
    if (restaurantLocation) {
      const restaurantMarker = L.marker(
        [restaurantLocation.latitude, restaurantLocation.longitude],
        { icon: createCustomIcon('#f59e0b', '🍽️') }
      ).addTo(map);
      restaurantMarker.bindPopup('<b>Restaurant</b><br>Indiya Bar & Restaurant');
    }

    // Add delivery person marker if location available
    if (deliveryLocation) {
      const deliveryMarker = L.marker(
        [deliveryLocation.latitude, deliveryLocation.longitude],
        { icon: createCustomIcon('#3b82f6', '🏍️') }
      ).addTo(map);
      deliveryMarker.bindPopup('<b>Delivery Partner</b><br>On the way!');

      // Draw route line
      const routePoints = [
        [deliveryLocation.latitude, deliveryLocation.longitude],
        [customerLocation.latitude, customerLocation.longitude],
      ];
      
      L.polyline(routePoints, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10',
      }).addTo(map);

      // Fit bounds to show all markers
      const bounds = L.latLngBounds([
        [deliveryLocation.latitude, deliveryLocation.longitude],
        [customerLocation.latitude, customerLocation.longitude],
      ]);
      if (restaurantLocation) {
        bounds.extend([restaurantLocation.latitude, restaurantLocation.longitude]);
      }
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      map.remove();
    };
  }, [mapLoaded, deliveryLocation, customerLocation, restaurantLocation]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-border">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-border">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
              🏍️
            </div>
            <span>Delivery Partner</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
              🏠
            </div>
            <span>Your Location</span>
          </div>
          {restaurantLocation && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs">
                🍽️
              </div>
              <span>Restaurant</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-border">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">
            {orderStatus === 'out_for_delivery' ? 'On the way!' : 
             orderStatus === 'picked_up' ? 'Picked up' : 
             orderStatus === 'delivered' ? 'Delivered' : 'Preparing'}
          </span>
        </div>
      </div>
    </div>
  );
};
