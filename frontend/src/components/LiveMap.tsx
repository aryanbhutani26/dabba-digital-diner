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
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any>({});
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

  // Initialize map only once
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    // @ts-ignore
    const L = window.L;
    
    const mapContainer = document.createElement('div');
    mapContainer.style.height = '100%';
    mapContainer.style.width = '100%';
    mapRef.current.appendChild(mapContainer);

    // Initialize map
    const map = L.map(mapContainer).setView(
      [customerLocation.latitude, customerLocation.longitude],
      13
    );
    
    mapInstanceRef.current = map;

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded, customerLocation.latitude, customerLocation.longitude]);

  // Update markers when locations change (without recreating map)
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    // @ts-ignore
    const L = window.L;
    const map = mapInstanceRef.current;

    console.log('🗺️ Updating map markers:', {
      customer: customerLocation,
      restaurant: restaurantLocation,
      delivery: deliveryLocation
    });

    // Custom icon creator
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

    // Clear existing markers and polylines (safely)
    Object.entries(markersRef.current).forEach(([key, marker]: [string, any]) => {
      if (marker && key !== 'boundsSet') {
        try {
          map.removeLayer(marker);
        } catch (e) {
          console.warn('Could not remove marker:', key);
        }
      }
    });
    
    // Keep boundsSet flag, clear everything else
    const wasBoundsSet = markersRef.current.boundsSet;
    markersRef.current = { boundsSet: wasBoundsSet };

    // Collect all locations for bounds calculation
    const allLocations: [number, number][] = [];

    // Add customer marker
    console.log('📍 Adding customer marker at:', customerLocation);
    markersRef.current.customer = L.marker(
      [customerLocation.latitude, customerLocation.longitude],
      { icon: createCustomIcon('#10b981', '🏠') }
    ).addTo(map);
    markersRef.current.customer.bindPopup('<b>Delivery Location</b><br>Your address');
    allLocations.push([customerLocation.latitude, customerLocation.longitude]);

    // Add restaurant marker if provided
    if (restaurantLocation) {
      console.log('🍽️ Adding restaurant marker at:', restaurantLocation);
      markersRef.current.restaurant = L.marker(
        [restaurantLocation.latitude, restaurantLocation.longitude],
        { icon: createCustomIcon('#f59e0b', '🍽️') }
      ).addTo(map);
      markersRef.current.restaurant.bindPopup('<b>Restaurant</b><br>Indiya Bar & Restaurant<br>180 High Street, Orpington');
      allLocations.push([restaurantLocation.latitude, restaurantLocation.longitude]);
    }

    // Add delivery person marker if location available
    if (deliveryLocation) {
      console.log('🏍️ Adding delivery marker at:', deliveryLocation);
      markersRef.current.delivery = L.marker(
        [deliveryLocation.latitude, deliveryLocation.longitude],
        { icon: createCustomIcon('#3b82f6', '🏍️') }
      ).addTo(map);
      markersRef.current.delivery.bindPopup('<b>Delivery Partner</b><br>On the way!');
      allLocations.push([deliveryLocation.latitude, deliveryLocation.longitude]);

      // Draw route line
      const routePoints = [
        [deliveryLocation.latitude, deliveryLocation.longitude],
        [customerLocation.latitude, customerLocation.longitude],
      ];
      
      markersRef.current.route = L.polyline(routePoints, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10',
      }).addTo(map);
    }

    // Always fit bounds to show all markers (not just when delivery location exists)
    if (allLocations.length > 0 && !markersRef.current.boundsSet) {
      console.log('🎯 Fitting bounds to locations:', allLocations);
      const bounds = L.latLngBounds(allLocations);
      map.fitBounds(bounds, { 
        padding: [50, 50],
        maxZoom: 15 // Prevent zooming in too much
      });
      markersRef.current.boundsSet = true;
    }
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
