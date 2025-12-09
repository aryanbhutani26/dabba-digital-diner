import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MapPin, Home, Briefcase, MapPinned } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddressMapPickerProps {
  open: boolean;
  onClose: () => void;
  onSave: (addressData: AddressData) => void;
}

export interface AddressData {
  label: 'Home' | 'Work' | 'Other';
  customLabel?: string;
  address: string;
  flatNumber: string;
  landmark: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const AddressMapPicker = ({ open, onClose, onSave }: AddressMapPickerProps) => {
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const [formData, setFormData] = useState<AddressData>({
    label: 'Home',
    customLabel: '',
    address: '',
    flatNumber: '',
    landmark: '',
    coordinates: { lat: 51.3727, lng: 0.0985 } // Default: Restaurant location
  });

  // Load Leaflet
  useEffect(() => {
    if (!open) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setMapLoaded(true);
    document.body.appendChild(script);

    return () => {
      try {
        document.head.removeChild(link);
        document.body.removeChild(script);
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [open]);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current || !open) return;

    // @ts-ignore
    const L = window.L;
    
    const mapContainer = document.createElement('div');
    mapContainer.style.height = '100%';
    mapContainer.style.width = '100%';
    mapRef.current.appendChild(mapContainer);

    const map = L.map(mapContainer).setView([formData.coordinates.lat, formData.coordinates.lng], 15);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add draggable marker
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: #ef4444;
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          position: relative;
        ">
          <div style="
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    const marker = L.marker([formData.coordinates.lat, formData.coordinates.lng], {
      icon: customIcon,
      draggable: true
    }).addTo(map);
    
    markerRef.current = marker;

    // Update coordinates when marker is dragged
    marker.on('dragend', async () => {
      const position = marker.getLatLng();
      setFormData(prev => ({
        ...prev,
        coordinates: { lat: position.lat, lng: position.lng }
      }));
      
      // Reverse geocode to get address
      await reverseGeocode(position.lat, position.lng);
    });

    // Get user's current location
    getCurrentLocation();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded, open]);

  const getCurrentLocation = () => {
    setGettingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Update map and marker
          if (mapInstanceRef.current && markerRef.current) {
            // @ts-ignore
            const L = window.L;
            mapInstanceRef.current.setView([latitude, longitude], 16);
            markerRef.current.setLatLng([latitude, longitude]);
          }
          
          setFormData(prev => ({
            ...prev,
            coordinates: { lat: latitude, lng: longitude }
          }));
          
          // Reverse geocode to get address
          await reverseGeocode(latitude, longitude);
          setGettingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: 'Location access denied',
            description: 'Please enable location access or drag the pin manually',
            variant: 'destructive'
          });
          setGettingLocation(false);
        }
      );
    } else {
      toast({
        title: 'Geolocation not supported',
        description: 'Please drag the pin to your location',
        variant: 'destructive'
      });
      setGettingLocation(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/reverse-geocode`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat, lng })
      });
      
      if (!response.ok) {
        throw new Error(`Backend reverse geocoding returned ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.address) {
        setFormData(prev => ({
          ...prev,
          address: data.address
        }));
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Fallback to coordinates
      setFormData(prev => ({
        ...prev,
        address: `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }));
    }
  };

  const handleSave = () => {
    if (!formData.address.trim()) {
      toast({
        title: 'Address required',
        description: 'Please wait for the address to load or enter it manually',
        variant: 'destructive'
      });
      return;
    }

    if (formData.label === 'Other' && !formData.customLabel?.trim()) {
      toast({
        title: 'Label required',
        description: 'Please provide a name for this address',
        variant: 'destructive'
      });
      return;
    }

    onSave(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      label: 'Home',
      customLabel: '',
      address: '',
      flatNumber: '',
      landmark: '',
      coordinates: { lat: 51.3727, lng: 0.0985 }
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Save delivery address</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Map */}
          <div className="relative">
            <div ref={mapRef} className="w-full h-[300px] rounded-lg border-2 border-border overflow-hidden" />
            
            {gettingLocation && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Getting your location...</p>
                </div>
              </div>
            )}

            <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border text-sm">
              <p className="font-medium">📍 Drag pin to adjust location</p>
            </div>

            <Button
              onClick={getCurrentLocation}
              size="sm"
              className="absolute bottom-4 right-4 shadow-lg"
              disabled={gettingLocation}
            >
              <MapPinned className="h-4 w-4 mr-2" />
              Use Current Location
            </Button>
          </div>

          {/* Address Display */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-1">Selected Location</p>
                <p className="text-sm text-muted-foreground break-words">
                  {formData.address || 'Loading address...'}
                </p>
              </div>
            </div>
          </div>

          {/* Address Details Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="flatNumber">Door / Flat No.</Label>
                <Input
                  id="flatNumber"
                  value={formData.flatNumber}
                  onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
                  placeholder="e.g., 134, F2"
                />
              </div>
              <div>
                <Label htmlFor="landmark">Landmark</Label>
                <Input
                  id="landmark"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="e.g., Near Park"
                />
              </div>
            </div>

            {/* Address Label Selection */}
            <div>
              <Label className="mb-3 block">Save as</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={formData.label === 'Home' ? 'default' : 'outline'}
                  className="h-auto py-3 flex-col gap-2"
                  onClick={() => setFormData({ ...formData, label: 'Home', customLabel: '' })}
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Button>
                <Button
                  type="button"
                  variant={formData.label === 'Work' ? 'default' : 'outline'}
                  className="h-auto py-3 flex-col gap-2"
                  onClick={() => setFormData({ ...formData, label: 'Work', customLabel: '' })}
                >
                  <Briefcase className="h-5 w-5" />
                  <span>Work</span>
                </Button>
                <Button
                  type="button"
                  variant={formData.label === 'Other' ? 'default' : 'outline'}
                  className="h-auto py-3 flex-col gap-2"
                  onClick={() => setFormData({ ...formData, label: 'Other' })}
                >
                  <MapPin className="h-5 w-5" />
                  <span>Other</span>
                </Button>
              </div>
            </div>

            {formData.label === 'Other' && (
              <div>
                <Label htmlFor="customLabel">Address Label</Label>
                <Input
                  id="customLabel"
                  value={formData.customLabel}
                  onChange={(e) => setFormData({ ...formData, customLabel: e.target.value })}
                  placeholder="e.g., College, Friend's Place"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1" size="lg">
              Save Address & Proceed
            </Button>
            <Button onClick={handleClose} variant="outline" size="lg">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
