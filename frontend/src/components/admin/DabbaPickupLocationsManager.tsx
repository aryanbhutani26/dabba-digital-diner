import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export const DabbaPickupLocationsManager = () => {
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPickupLocations();
  }, []);

  const fetchPickupLocations = async () => {
    try {
      setLoading(true);
      const response = await api.getSetting('dabba_pickup_locations');
      const savedLocations = response.value || [
        'Restaurant - 180 High Street, Orpington',
        'Orpington Station',
        'Orpington High Street (Near Primark)',
        'Orpington Library',
        'Custom Location (Please specify in instructions)'
      ];
      setLocations(savedLocations);
    } catch (error) {
      // Set default locations if none exist
      setLocations([
        'Restaurant - 180 High Street, Orpington',
        'Orpington Station',
        'Orpington High Street (Near Primark)',
        'Orpington Library',
        'Custom Location (Please specify in instructions)'
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addLocation = () => {
    setLocations([...locations, '']);
  };

  const removeLocation = (index: number) => {
    if (locations.length > 1) {
      setLocations(locations.filter((_, i) => i !== index));
    }
  };

  const updateLocation = (index: number, value: string) => {
    const newLocations = [...locations];
    newLocations[index] = value;
    setLocations(newLocations);
  };

  const saveLocations = async () => {
    const validLocations = locations.filter(loc => loc.trim());
    
    if (validLocations.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one pickup location",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await api.updateSetting('dabba_pickup_locations', validLocations);
      toast({
        title: "Success",
        description: "Pickup locations updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update pickup locations",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading pickup locations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Pickup Locations
          </CardTitle>
          <Button onClick={addLocation} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {locations.map((location, index) => (
            <div key={index} className="flex gap-2 items-center">
              <div className="flex-1">
                <Input
                  value={location}
                  onChange={(e) => updateLocation(index, e.target.value)}
                  placeholder="Enter pickup location (e.g., Restaurant - 180 High Street, Orpington)"
                  className="w-full"
                />
              </div>
              {locations.length > 1 && (
                <Button
                  onClick={() => removeLocation(index)}
                  size="icon"
                  variant="outline"
                  className="shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {locations.filter(loc => loc.trim()).length} location{locations.filter(loc => loc.trim()).length !== 1 ? 's' : ''} configured
          </p>
          <Button onClick={saveLocations} disabled={saving}>
            {saving ? "Saving..." : "Save Locations"}
          </Button>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>💡 Tip:</strong> These locations will be available for customers to select when subscribing to dabba services. 
            Make sure to include clear, recognizable locations that are convenient for pickup.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};