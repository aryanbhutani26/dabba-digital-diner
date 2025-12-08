import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Trash2, Minus, Plus, MapPin, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe';
import { PaymentForm } from '@/components/PaymentForm';

interface CartItem {
  name: string;
  price: string;
  quantity: number;
  image: string;
  selectedSize?: string;
}

interface CartSheetProps {
  items: CartItem[];
  onUpdateQuantity: (index: number, newQuantity: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart?: () => void;
}

const CartSheet = ({ items, onUpdateQuantity, onRemoveItem, onClearCart }: CartSheetProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<string[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  const [showCoupons, setShowCoupons] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [deliveryFee, setDeliveryFee] = useState<number>(50);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
    fetchDeliveryFee();
  }, [user]);

  const fetchDeliveryFee = async () => {
    try {
      const response = await api.getSetting('delivery_fee');
      setDeliveryFee(response.value || 50);
    } catch (error) {
      console.error('Failed to fetch delivery fee:', error);
      setDeliveryFee(50); // Default fallback
    }
  };

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const profile = await api.getUserProfile();
      setAddresses(profile.addresses || []);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
    return sum + (price * item.quantity);
  }, 0);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Enter coupon code",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find coupon from coupons list (you can also make an API call)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/coupons`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const coupons = await response.json();
      const coupon = coupons.find((c: any) => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive);

      if (!coupon) {
        toast({
          title: "Invalid coupon",
          description: "This coupon code is not valid",
          variant: "destructive",
        });
        return;
      }

      // Calculate discount (simple percentage for coupons)
      // Assuming coupons have a discount percentage in their title (e.g., "20% OFF")
      const discountMatch = coupon.title.match(/(\d+)%/);
      const discountPercent = discountMatch ? parseInt(discountMatch[1]) : 10; // Default 10%
      const discountAmount = (totalPrice * discountPercent) / 100;

      setAppliedCoupon(coupon);
      setDiscount(discountAmount);
      toast({
        title: "Coupon applied!",
        description: `You saved £${discountAmount.toFixed(2)} with ${coupon.code}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply coupon",
        variant: "destructive",
      });
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode('');
    toast({
      title: "Coupon removed",
      description: "Coupon has been removed from your order",
    });
  };

  const fetchAvailableCoupons = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/coupons`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const coupons = await response.json();
      setAvailableCoupons(coupons.filter((c: any) => c.isActive));
      setShowCoupons(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load coupons",
        variant: "destructive",
      });
    }
  };

  const selectCoupon = async (coupon: any) => {
    // Directly apply the selected coupon without validation
    try {
      // Calculate discount
      const discountMatch = coupon.title.match(/(\d+)%/);
      const discountPercent = discountMatch ? parseInt(discountMatch[1]) : 10;
      const discountAmount = (totalPrice * discountPercent) / 100;

      setAppliedCoupon(coupon);
      setDiscount(discountAmount);
      setCouponCode(coupon.code);
      setShowCoupons(false);
      
      toast({
        title: "Coupon applied!",
        description: `You saved £${discountAmount.toFixed(2)} with ${coupon.code}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply coupon",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = async () => {
    console.log('🚀 handleCheckout called');
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to place an order",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // Get user profile to check phone number
    try {
      const profile = await api.getUserProfile();
      
      if (!profile.phone || profile.phone.trim() === '') {
        toast({
          title: "Phone number required",
          description: "Please add your phone number in your account settings",
          variant: "destructive",
        });
        navigate("/account");
        return;
      }

      if (!profile.addresses || profile.addresses.length === 0) {
        toast({
          title: "Address required",
          description: "Please add a delivery address first",
          variant: "destructive",
        });
        navigate("/account");
        return;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify account details",
        variant: "destructive",
      });
      return;
    }

    if (addresses.length === 0) {
      toast({
        title: "Address required",
        description: "Please add a delivery address first",
        variant: "destructive",
      });
      navigate("/account");
      return;
    }

    try {
      setProcessingOrder(true);
      console.log('💳 Creating payment intent...');

      // Get user profile for customer details
      const profile = await api.getUserProfile();
      const finalAmount = totalPrice - discount + deliveryFee; // Subtract discount, add delivery fee
      
      console.log('💰 Final amount:', finalAmount);
      console.log('📧 Customer email:', profile.email || user.email);

      // Create payment intent
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/payment/create-payment-intent`;
      console.log('🌐 API URL:', apiUrl);
      
      const paymentResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          amount: finalAmount,
          customerEmail: profile.email || user.email,
        }),
      });

      console.log('📡 Payment response status:', paymentResponse.status);
      const paymentData = await paymentResponse.json();
      console.log('📦 Payment data:', paymentData);
      
      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || 'Failed to create payment');
      }

      // Store order data for after payment
      setCurrentOrder({
        items: items.map(item => ({
          name: item.name,
          price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')),
          quantity: item.quantity,
          image: item.image,
          selectedSize: item.selectedSize,
        })),
        totalAmount: finalAmount,
        discount: discount,
        couponCode: appliedCoupon?.code || null,
        deliveryAddress: addresses[selectedAddress],
        customerName: profile.name || user.name,
        customerPhone: profile.phone || 'Not provided',
        paymentMethod: 'stripe',
        paymentStatus: 'pending',
        paymentIntentId: paymentData.paymentIntentId,
      });

      console.log('✅ Setting client secret and showing payment form');
      setClientSecret(paymentData.clientSecret);
      setShowPayment(true);
    } catch (error: any) {
      console.error('❌ Payment initialization error:', error);
      toast({
        title: "Failed to initialize payment",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setProcessingOrder(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Create the order after successful payment
      // Include size information in order items
      const orderData = {
        ...currentOrder,
        items: currentOrder.items.map((item: any) => ({
          ...item,
          name: item.selectedSize ? `${item.name} (${item.selectedSize})` : item.name,
        })),
        paymentIntentId,
        paymentStatus: 'completed',
      };
      
      const order = await api.createOrder(orderData);

      toast({
        title: "Order placed successfully!",
        description: `Order #${order.orderNumber} has been confirmed and paid`,
      });

      // Clear cart and payment state
      if (onClearCart) {
        onClearCart();
      }
      setShowPayment(false);
      setClientSecret(null);
      setCurrentOrder(null);

      // Navigate to order confirmation
      navigate(`/order-confirmation?id=${order.orderId}`);
    } catch (error: any) {
      toast({
        title: "Order creation failed",
        description: "Payment succeeded but order creation failed. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
    setShowPayment(false);
    setClientSecret(null);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          size="lg" 
          className="relative h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs rounded-full">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl">
            {showPayment ? "Complete Payment" : "Your Cart"}
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-8 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* Delivery Address Section */}
              {user && (
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Delivery Address</h3>
                  </div>
                  {loading ? (
                    <p className="text-sm text-muted-foreground">Loading addresses...</p>
                  ) : addresses.length === 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">No saved addresses</p>
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link to="/account">
                          Add Address <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {addresses.map((address, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedAddress(index)}
                          className={`p-3 rounded border cursor-pointer transition-all ${
                            selectedAddress === index
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <p className="text-sm">{address}</p>
                        </div>
                      ))}
                      <Button asChild variant="ghost" size="sm" className="w-full">
                        <Link to="/account">
                          Manage Addresses <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {!user && (
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Delivery Address</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Sign in to use saved addresses
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/auth">
                      Sign In <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              )}

              <div className="space-y-4 max-h-[40vh] overflow-y-auto">
                {items.map((item, index) => {
                  const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
                  const itemTotal = (price * item.quantity).toFixed(2);
                  
                  return (
                    <div key={index} className="flex gap-4 p-4 bg-muted rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">
                          {item.name}
                          {item.selectedSize && (
                            <span className="text-sm text-muted-foreground ml-2">({item.selectedSize})</span>
                          )}
                        </h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">£{itemTotal}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-destructive/10"
                              onClick={() => onRemoveItem(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600 hover:text-red-700" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Coupon Section */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Have a coupon code?</label>
                    <Button 
                      onClick={fetchAvailableCoupons} 
                      variant="link" 
                      size="sm" 
                      type="button"
                      className="text-primary"
                    >
                      Show Available Coupons
                    </Button>
                  </div>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1"
                      />
                      <Button onClick={applyCoupon} variant="outline" type="button">
                        Apply
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500">{appliedCoupon.code}</Badge>
                        <span className="text-sm text-green-700">-£{discount.toFixed(2)}</span>
                      </div>
                      <Button 
                        onClick={removeCoupon} 
                        variant="outline" 
                        size="sm" 
                        type="button"
                        className="bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-500 font-semibold"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  
                  {/* Available Coupons Modal */}
                  {showCoupons && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCoupons(false)}>
                      <div className="bg-background rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Available Coupons</h3>
                          <Button 
                            onClick={() => setShowCoupons(false)} 
                            variant="ghost" 
                            size="icon"
                            type="button"
                            className="h-8 w-8"
                          >
                            <span className="sr-only">Close</span>
                            ✕
                          </Button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                          {availableCoupons.length === 0 ? (
                            <div className="text-center py-12">
                              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🎫</span>
                              </div>
                              <p className="text-muted-foreground">No coupons available at the moment</p>
                              <p className="text-sm text-muted-foreground mt-1">Check back later for exciting offers!</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {availableCoupons.map((coupon) => (
                                <div 
                                  key={coupon._id}
                                  className="group relative p-4 border-2 rounded-xl bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 hover:border-primary cursor-pointer transition-all duration-200 hover:shadow-md"
                                  onClick={() => selectCoupon(coupon)}
                                >
                                  <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="secondary" className="font-mono font-bold text-sm px-3 py-1">
                                          {coupon.code}
                                        </Badge>
                                      </div>
                                      <h4 className="font-semibold text-base text-primary group-hover:text-primary/80 transition-colors">
                                        {coupon.title}
                                      </h4>
                                    </div>
                                    <div className="text-2xl">🎉</div>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {coupon.subtitle}
                                  </p>
                                  {coupon.description && (
                                    <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                                      {coupon.description}
                                    </p>
                                  )}
                                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs font-medium text-primary">Click to apply →</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>£{totalPrice.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-£{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee:</span>
                  <span>£{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-2xl text-primary">£{(totalPrice - discount + deliveryFee).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {!showPayment ? (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckout}
                    disabled={processingOrder}
                  >
                    {processingOrder ? "Processing..." : "Proceed to Payment"}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Complete Payment</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setShowPayment(false);
                          setClientSecret(null);
                        }}
                      >
                        Back to Cart
                      </Button>
                    </div>
                    {!clientSecret ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-sm text-muted-foreground">Loading payment form...</p>
                      </div>
                    ) : (
                      <Elements 
                        stripe={stripePromise} 
                        options={{
                          clientSecret,
                          appearance: {
                            theme: 'stripe',
                          },
                        }}
                      >
                        <PaymentForm
                          amount={totalPrice - discount + deliveryFee}
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                        />
                      </Elements>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
