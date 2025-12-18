import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Calendar, Clock, MapPin, Phone, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe';
import { PaymentForm } from '@/components/PaymentForm';

interface DabbaSubscriptionDialogProps {
  service: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DabbaSubscriptionDialog = ({ service, open, onOpenChange }: DabbaSubscriptionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [pickupLocations, setPickupLocations] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    startDate: '',
    deliveryTime: '',
    phoneNumber: '',
    pickupLocation: '',
    specialInstructions: '',
  });

  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};

    // Validate start date and time (must be at least 4 hours from now)
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else if (!formData.deliveryTime) {
      newErrors.deliveryTime = 'Delivery time is required';
    } else {
      const selectedDateTime = new Date(`${formData.startDate}T${formData.deliveryTime}:00`);
      const now = new Date();
      const minimumDateTime = new Date(now.getTime() + (4 * 60 * 60 * 1000)); // 4 hours from now
      
      if (selectedDateTime < minimumDateTime) {
        const minDateStr = minimumDateTime.toLocaleDateString();
        const minTimeStr = minimumDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        newErrors.startDate = `Start date and time must be at least 4 hours from now. Earliest available: ${minDateStr} at ${minTimeStr}`;
        newErrors.deliveryTime = 'Please select a time at least 4 hours from now';
      }
    }

    // Validate delivery time separately if start date is valid
    if (!formData.deliveryTime && !newErrors.deliveryTime) {
      newErrors.deliveryTime = 'Delivery time is required';
    }

    // Validate phone number (exactly 10 digits)
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be exactly 10 digits';
    }

    // Validate pickup location
    if (!formData.pickupLocation) {
      newErrors.pickupLocation = 'Pickup location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to Dabba services",
        variant: "destructive",
      });
      return;
    }

    if (!service || !service._id) {
      toast({
        title: "Error",
        description: "Invalid service selected",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Create subscription and payment intent
      const response = await api.createDabbaSubscription({
        serviceId: service._id,
        ...formData,
      });

      console.log('Subscription response:', response);
      console.log('Client secret:', response.clientSecret);

      if (!response.clientSecret) {
        throw new Error('No payment client secret received from server');
      }

      setSubscriptionData(response.subscription);
      setClientSecret(response.clientSecret);
      setShowPayment(true);
    } catch (error: any) {
      console.error('Subscription creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Subscription Successful!",
      description: `You have successfully subscribed to ${service.title}`,
    });
    onOpenChange(false);
    setShowPayment(false);
    setFormData({
      startDate: '',
      deliveryTime: '',
      phoneNumber: '',
      pickupLocation: '',
      specialInstructions: '',
    });
  };

  const allTimeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  // Get available time slots based on selected date
  const getAvailableTimeSlots = () => {
    if (!formData.startDate) return allTimeSlots;
    
    const selectedDate = new Date(formData.startDate);
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();
    
    if (!isToday) {
      return allTimeSlots; // All slots available for future dates
    }
    
    // For today, only show slots that are at least 4 hours from now
    const now = new Date();
    const minimumTime = new Date(now.getTime() + (4 * 60 * 60 * 1000));
    const minimumTimeStr = minimumTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    return allTimeSlots.filter(timeSlot => {
      return timeSlot >= minimumTimeStr;
    });
  };

  const availableTimeSlots = getAvailableTimeSlots();

  // Fetch pickup locations from admin settings
  const fetchPickupLocations = async () => {
    try {
      const response = await api.getSetting('dabba_pickup_locations');
      const locations = response.value || [
        'Restaurant - 180 High Street, Orpington',
        'Orpington Station', 
        'Orpington High Street (Near Primark)',
        'Orpington Library',
        'Custom Location (Please specify in instructions)'
      ];
      setPickupLocations(locations);
    } catch (error) {
      // Fallback to default locations
      setPickupLocations([
        'Restaurant - 180 High Street, Orpington',
        'Orpington Station',
        'Orpington High Street (Near Primark)', 
        'Orpington Library',
        'Custom Location (Please specify in instructions)'
      ]);
    }
  };

  // Fetch pickup locations when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchPickupLocations();
    }
  }, [open]);

  if (showPayment) {
    if (!clientSecret) {
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto dialog-scroll">
            <DialogHeader>
              <DialogTitle>Payment Error</DialogTitle>
              <DialogDescription>
                Unable to initialize payment. Please try again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Button onClick={() => setShowPayment(false)} className="w-full">
                Go Back
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto dialog-scroll">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Complete your payment for {service.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Elements 
              stripe={stripePromise}
              options={{
                clientSecret: clientSecret,
                appearance: {
                  theme: 'stripe',
                },
              }}
            >
              <PaymentForm
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                amount={service.price}
                description={`Dabba Subscription: ${service.title}`}
              />
            </Elements>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Subscribe to {service.title}</DialogTitle>
          <DialogDescription>
            Fill in your details to subscribe to this Dabba service
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 dialog-scroll">
          <form onSubmit={handleSubscribe} className="space-y-6 pb-4">
          {/* Service Summary */}
          <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 border-2 border-primary/20 rounded-xl p-6 shadow-sm">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{service.description}</p>
                </div>
                <div className="ml-4 text-right">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                    <span className="text-2xl font-bold text-primary">
                      £{typeof service.price === 'number' ? service.price.toFixed(2) : service.price}
                    </span>
                    <span className="text-sm text-primary/70">/{service.pricingPeriod || 'day'}</span>
                  </div>
                </div>
              </div>
              
              {/* Elegant Advance Booking Notice */}
              <div className="relative bg-gradient-to-r from-[#c3a85c]/10 via-[#c3a85c]/5 to-transparent border border-[#c3a85c]/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-[#c3a85c]/5 to-transparent rounded-xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#c3a85c]/10 flex items-center justify-center border border-[#c3a85c]/20">
                      <Clock className="w-5 h-5 text-[#c3a85c]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#c3a85c] text-base">Advance Booking Required</h4>
                      <p className="text-xs text-[#c3a85c]/70">Fresh preparation guaranteed</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#c3a85c]/80 leading-relaxed pl-13">
                    All dabba subscriptions must be placed at least <strong className="text-[#c3a85c]">4 hours in advance</strong> to ensure fresh preparation and timely pickup from your selected location.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <Label htmlFor="startDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Start Date *
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => {
                setFormData({ ...formData, startDate: e.target.value, deliveryTime: '' }); // Reset time when date changes
              }}
              min={new Date().toISOString().split('T')[0]}
              className={errors.startDate ? 'border-red-500' : ''}
            />
            <div className="mt-2 p-3 bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 rounded-lg">
              <p className="text-sm text-primary/80 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Subscriptions must start at least 4 hours from now to allow preparation time.
              </p>
            </div>
            {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
          </div>

          {/* Delivery Time */}
          <div>
            <Label htmlFor="deliveryTime" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Preferred Pickup Time *
            </Label>
            <Select 
              value={formData.deliveryTime} 
              onValueChange={(value) => setFormData({ ...formData, deliveryTime: value })}
              disabled={!formData.startDate}
            >
              <SelectTrigger className={errors.deliveryTime ? 'border-red-500' : ''}>
                <SelectValue placeholder={formData.startDate ? "Select time slot" : "Please select a date first"} />
              </SelectTrigger>
              <SelectContent>
                {availableTimeSlots.length > 0 ? (
                  availableTimeSlots.map((time) => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-slots" disabled>No available time slots for selected date</SelectItem>
                )}
              </SelectContent>
            </Select>
            {formData.startDate && availableTimeSlots.length === 0 && (
              <div className="mt-2 p-3 bg-gradient-to-r from-orange-500/5 to-transparent border border-orange-500/20 rounded-lg">
                <p className="text-sm text-orange-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  No time slots available for today. Please select a future date or try again later.
                </p>
              </div>
            )}
            {formData.startDate && new Date(formData.startDate).toDateString() === new Date().toDateString() && availableTimeSlots.length > 0 && (
              <div className="mt-2 p-3 bg-gradient-to-r from-[#c3a85c]/5 to-transparent border border-[#c3a85c]/20 rounded-lg">
                <p className="text-sm text-[#c3a85c] flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Orders must be placed at least 4 hours in advance. Available slots shown for today.
                </p>
              </div>
            )}
            {errors.deliveryTime && <p className="text-sm text-red-500 mt-1">{errors.deliveryTime}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <Label htmlFor="phoneNumber" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number (10 digits) *
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              placeholder="1234567890"
              maxLength={10}
              className={errors.phoneNumber ? 'border-red-500' : ''}
            />
            {errors.phoneNumber && <p className="text-sm text-red-500 mt-1">{errors.phoneNumber}</p>}
          </div>

          {/* Pickup Location */}
          <div>
            <Label htmlFor="pickupLocation" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Pickup Location *
            </Label>
            <Select value={formData.pickupLocation} onValueChange={(value) => setFormData({ ...formData, pickupLocation: value })}>
              <SelectTrigger className={errors.pickupLocation ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select pickup location" />
              </SelectTrigger>
              <SelectContent>
                {pickupLocations.map((location) => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2 p-3 bg-gradient-to-r from-accent/5 to-transparent border border-accent/10 rounded-lg">
              <p className="text-sm text-accent/80 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                All dabba services are pickup only. Select your preferred pickup location.
              </p>
            </div>
            {errors.pickupLocation && <p className="text-sm text-red-500 mt-1">{errors.pickupLocation}</p>}
          </div>

          {/* Special Instructions */}
          <div>
            <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
            <Input
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
              placeholder="Any special dietary requirements or pickup instructions"
            />
          </div>

            <DialogFooter className="gap-2 sm:gap-0 flex-shrink-0 mt-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                {loading ? "Processing..." : `Subscribe - £${service.price}`}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};