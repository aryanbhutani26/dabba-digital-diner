import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    startDate: '',
    deliveryTime: '',
    phoneNumber: '',
    fulfillmentType: 'delivery', // 'delivery' or 'pickup'
    deliveryAddress: '',
    pickupLocation: '',
    specialInstructions: '',
  });

  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};

    // Validate start date
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else {
      const selectedDate = new Date(formData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
    }

    // Validate delivery time
    if (!formData.deliveryTime) {
      newErrors.deliveryTime = 'Delivery time is required';
    }

    // Validate phone number (exactly 10 digits)
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be exactly 10 digits';
    }

    // Validate fulfillment details
    if (formData.fulfillmentType === 'delivery' && !formData.deliveryAddress) {
      newErrors.deliveryAddress = 'Delivery address is required';
    } else if (formData.fulfillmentType === 'pickup' && !formData.pickupLocation) {
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
      fulfillmentType: 'delivery',
      deliveryAddress: '',
      pickupLocation: '',
      specialInstructions: '',
    });
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const pickupLocations = [
    'Restaurant - 180 High Street, Orpington',
    'Orpington Station',
    'Orpington High Street (Near Primark)',
    'Orpington Library',
    'Custom Location (Please specify in instructions)'
  ];

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
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">{service.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
            <p className="text-lg font-bold text-primary">
              £{typeof service.price === 'number' ? service.price.toFixed(2) : service.price}/{service.pricingPeriod || 'day'}
            </p>
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
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className={errors.startDate ? 'border-red-500' : ''}
            />
            {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
          </div>

          {/* Delivery Time */}
          <div>
            <Label htmlFor="deliveryTime" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Preferred Delivery/Pickup Time *
            </Label>
            <Select value={formData.deliveryTime} onValueChange={(value) => setFormData({ ...formData, deliveryTime: value })}>
              <SelectTrigger className={errors.deliveryTime ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {/* Fulfillment Type */}
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4" />
              Fulfillment Method *
            </Label>
            <RadioGroup
              value={formData.fulfillmentType}
              onValueChange={(value) => setFormData({ ...formData, fulfillmentType: value })}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery" className="cursor-pointer">Home Delivery</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup" className="cursor-pointer">Self Pickup</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Delivery Address */}
          {formData.fulfillmentType === 'delivery' && (
            <div>
              <Label htmlFor="deliveryAddress">Delivery Address *</Label>
              <Input
                id="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                placeholder="Enter your full delivery address"
                className={errors.deliveryAddress ? 'border-red-500' : ''}
              />
              {errors.deliveryAddress && <p className="text-sm text-red-500 mt-1">{errors.deliveryAddress}</p>}
            </div>
          )}

          {/* Pickup Location */}
          {formData.fulfillmentType === 'pickup' && (
            <div>
              <Label htmlFor="pickupLocation">Pickup Location *</Label>
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
              {errors.pickupLocation && <p className="text-sm text-red-500 mt-1">{errors.pickupLocation}</p>}
            </div>
          )}

          {/* Special Instructions */}
          <div>
            <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
            <Input
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
              placeholder="Any special dietary requirements or delivery instructions"
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