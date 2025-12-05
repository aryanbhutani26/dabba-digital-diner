import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddressInputProps {
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  onAdd?: () => void;
  placeholder?: string;
  showAddButton?: boolean;
}

export const AddressInput = ({ 
  value, 
  onChange, 
  onAdd, 
  placeholder = "Enter your delivery address",
  showAddButton = true 
}: AddressInputProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use Google Geocoding API to get address from coordinates
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();

          if (data.results && data.results[0]) {
            const address = data.results[0].formatted_address;
            onChange(address, { lat: latitude, lng: longitude });
            toast({
              title: "Location detected",
              description: "Your current location has been added",
            });
          } else {
            // Fallback to coordinates if geocoding fails
            onChange(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`, { lat: latitude, lng: longitude });
            toast({
              title: "Location detected",
              description: "Please verify and edit the address if needed",
            });
          }
        } catch (error) {
          // Fallback to coordinates
          onChange(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`, { lat: latitude, lng: longitude });
          toast({
            title: "Location detected",
            description: "Please verify and edit the address if needed",
          });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        let errorMessage = "Failed to get your location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }

        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="address">Delivery Address</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="address"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="pl-10"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={getCurrentLocation}
          disabled={loading}
          title="Use current location"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </Button>
        {showAddButton && onAdd && (
          <Button
            type="button"
            onClick={onAdd}
            disabled={!value.trim()}
          >
            Add
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Click the location icon to use your current location, or type your address manually
      </p>
    </div>
  );
};
