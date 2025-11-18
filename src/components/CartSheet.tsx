import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
    const price = parseFloat(item.price.replace(/[$+]/g, ''));
    return sum + (price * item.quantity);
  }, 0);

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
          price: parseFloat(item.price.replace(/[$+]/g, '')),
          quantity: item.quantity,
          image: item.image,
        })),
        totalAmount: totalPrice + 50, // Add delivery fee
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
                  const price = parseFloat(item.price.replace(/[$+]/g, ''));
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
                            <span className="font-bold text-primary">${itemTotal}</span>
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
              
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                </div>
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
