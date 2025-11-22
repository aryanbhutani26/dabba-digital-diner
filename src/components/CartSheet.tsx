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

interface CartItem {
  name: string;
  price: string;
  quantity: number;
  image: string;
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

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

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

  const selectCoupon = (coupon: any) => {
    setCouponCode(coupon.code);
    setShowCoupons(false);
    // Auto-apply the selected coupon
    setTimeout(() => {
      applyCoupon();
    }, 100);
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to place an order",
        variant: "destructive",
      });
      navigate("/auth");
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

      // Get user profile for customer details
      const profile = await api.getUserProfile();

      // Create order with mock payment
      const orderData = {
        items: items.map(item => ({
          name: item.name,
          price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')),
          quantity: item.quantity,
          image: item.image,
        })),
        totalAmount: totalPrice - discount + 50, // Subtract discount, add delivery fee
        discount: discount,
        couponCode: appliedCoupon?.code || null,
        deliveryAddress: addresses[selectedAddress],
        customerName: profile.name || user.name,
        customerPhone: profile.phone || 'Not provided',
        paymentMethod: 'mock',
        paymentStatus: 'completed',
      };

      const order = await api.createOrder(orderData);

      toast({
        title: "Order placed successfully!",
        description: `Order #${order.orderNumber} is being prepared`,
      });

      // Clear cart
      if (onClearCart) {
        onClearCart();
      }

      // Navigate to order confirmation
      navigate(`/order-confirmation?id=${order.orderId}`);
    } catch (error: any) {
      toast({
        title: "Order failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingOrder(false);
    }
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
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-2xl">Your Cart</SheetTitle>
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
                        <h4 className="font-semibold mb-2">{item.name}</h4>
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
                              className="h-8 w-8"
                              onClick={() => onRemoveItem(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
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
                      <Button onClick={removeCoupon} variant="ghost" size="sm" type="button">
                        Remove
                      </Button>
                    </div>
                  )}
                  
                  {/* Available Coupons Modal */}
                  {showCoupons && (
                    <div className="mt-4 p-4 border rounded-lg bg-muted/50 max-h-64 overflow-y-auto">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Available Coupons</h4>
                        <Button 
                          onClick={() => setShowCoupons(false)} 
                          variant="ghost" 
                          size="sm"
                          type="button"
                        >
                          Close
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {availableCoupons.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No coupons available at the moment
                          </p>
                        ) : (
                          availableCoupons.map((coupon) => (
                            <div 
                              key={coupon._id}
                              className="p-3 border rounded-lg bg-white hover:border-primary cursor-pointer transition-colors"
                              onClick={() => selectCoupon(coupon)}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <Badge variant="outline" className="font-mono">
                                  {coupon.code}
                                </Badge>
                                <span className="text-sm font-semibold text-primary">
                                  {coupon.title}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {coupon.subtitle}
                              </p>
                              {coupon.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {coupon.description}
                                </p>
                              )}
                            </div>
                          ))
                        )}
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
                  <span>£50.00</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-2xl text-primary">£{(totalPrice - discount + 50).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={processingOrder}
                >
                  {processingOrder ? "Processing..." : "Proceed to Checkout"}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
