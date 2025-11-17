import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { LiveMap } from "@/components/LiveMap";
import { 
  Loader2, 
  Package, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle,
  User,
  RefreshCw
} from "lucide-react";

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const orderId = searchParams.get('id');

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }
    fetchOrder();
    // Refresh every 10 seconds for live tracking
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      // In a real app, this would be a public endpoint or require order token
      const orders = await api.getMyDeliveries();
      const foundOrder = orders.find((o: any) => o._id === orderId);
      
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        toast({
          title: "Order not found",
          description: "Unable to find this order",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: any = {
      pending: { label: 'Order Placed', color: 'bg-gray-500', step: 1 },
      assigned: { label: 'Assigned to Delivery Partner', color: 'bg-blue-500', step: 2 },
      picked_up: { label: 'Picked Up', color: 'bg-yellow-500', step: 3 },
      out_for_delivery: { label: 'Out for Delivery', color: 'bg-orange-500', step: 4 },
      delivered: { label: 'Delivered', color: 'bg-green-500', step: 5 },
    };
    return statusMap[status] || statusMap.pending;
  };

  const getEstimatedTime = () => {
    if (!order) return 'Calculating...';
    if (order.status === 'delivered') return 'Delivered';
    if (order.status === 'out_for_delivery') return '10-15 mins';
    if (order.status === 'picked_up') return '15-20 mins';
    return '25-30 mins';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find the order you're looking for.
            </p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const customerLocation = { latitude: 12.9716, longitude: 77.5946 }; // Default Bangalore
  const restaurantLocation = { latitude: 12.9352, longitude: 77.6245 };
  const deliveryLocation = order.currentLocation || 
    (order.status === 'out_for_delivery' ? { latitude: 12.9500, longitude: 77.6000 } : undefined);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Track Your Order</h1>
              <p className="text-muted-foreground">
                Order #{order.orderNumber || order._id.slice(-6)}
              </p>
            </div>
            <Button variant="outline" onClick={fetchOrder}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-2">
              <Card className="h-[500px]">
                <CardContent className="p-0 h-full">
                  <LiveMap
                    deliveryLocation={deliveryLocation}
                    customerLocation={customerLocation}
                    restaurantLocation={restaurantLocation}
                    orderStatus={order.status}
                  />
                </CardContent>
              </Card>

              {/* Estimated Time */}
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estimated Arrival</p>
                        <p className="text-2xl font-bold">{getEstimatedTime()}</p>
                      </div>
                    </div>
                    <Badge className={`${statusInfo.color} text-white`}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Details Sidebar */}
            <div className="space-y-6">
              {/* Status Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                  <CardDescription>Track your order progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { status: 'pending', label: 'Order Placed', time: order.createdAt },
                      { status: 'assigned', label: 'Assigned', time: order.assignedAt },
                      { status: 'picked_up', label: 'Picked Up', time: order.pickedUpAt },
                      { status: 'out_for_delivery', label: 'Out for Delivery', time: order.outForDeliveryAt },
                      { status: 'delivered', label: 'Delivered', time: order.deliveredAt },
                    ].map((step, index) => {
                      const isCompleted = statusInfo.step > index + 1;
                      const isCurrent = statusInfo.step === index + 1;
                      
                      return (
                        <div key={step.status} className="flex items-start gap-3">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center shrink-0
                            ${isCompleted ? 'bg-green-500' : isCurrent ? 'bg-primary' : 'bg-muted'}
                          `}>
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-white" />
                            ) : (
                              <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-white' : 'bg-muted-foreground'}`} />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                              {step.label}
                            </p>
                            {step.time && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(step.time).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-medium">₹{item.price}</span>
                      </div>
                    ))}
                    <div className="pt-3 border-t">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-primary">₹{order.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Delivery Address</p>
                      <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                    </div>
                  </div>
                  {order.status === 'out_for_delivery' && (
                    <Button variant="outline" className="w-full mt-4">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Delivery Partner
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrackOrder;
