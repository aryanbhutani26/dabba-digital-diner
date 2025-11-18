import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { 
  Loader2, 
  Package, 
  MapPin, 
  Phone, 
  Clock, 
  DollarSign,
  CheckCircle,
  TrendingUp,
  Navigation
} from "lucide-react";

const Delivery = () => {
  const { user, isAdmin, isDeliveryBoy, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ todayDeliveries: 0, totalDeliveries: 0, totalEarnings: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && (!user || (!isAdmin && !isDeliveryBoy))) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, isAdmin, isDeliveryBoy, authLoading, navigate, toast]);

  useEffect(() => {
    if (user) {
      fetchData();
      // Refresh data every 30 seconds
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [ordersData, statsData] = await Promise.all([
        api.getMyDeliveries(),
        api.getDeliveryStats(),
      ]);
      
      // Check for new assigned orders
      const newAssignedOrders = ordersData.filter((order: any) => 
        order.status === 'assigned' && 
        !orders.find((o: any) => o._id === order._id && o.status === 'assigned')
      );
      
      if (newAssignedOrders.length > 0 && orders.length > 0) {
        newAssignedOrders.forEach((order: any) => {
          toast({
            title: "New Delivery Assigned!",
            description: `Order #${order.orderNumber} - ${order.customerName}\nAddress: ${order.deliveryAddress}`,
          });
        });
      }
      
      setOrders(ordersData || []);
      setStats(statsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch delivery data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      // Get current location if available
      let location = undefined;
      if (navigator.geolocation && newStatus === 'out_for_delivery') {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (error) {
          console.log('Location access denied');
        }
      }

      await api.updateOrderStatus(orderId, newStatus, location);
      toast({
        title: "Success",
        description: `Order status updated to ${newStatus.replace('_', ' ')}`,
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const startLocationTracking = (orderId: string) => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location tracking",
        variant: "destructive",
      });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          await api.updateOrderLocation(
            orderId,
            position.coords.latitude,
            position.coords.longitude
          );
        } catch (error) {
          console.error('Failed to update location:', error);
        }
      },
      (error) => {
        console.error('Location error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    // Store watchId to stop tracking later
    return watchId;
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      assigned: "bg-blue-500",
      picked_up: "bg-yellow-500",
      out_for_delivery: "bg-orange-500",
      delivered: "bg-green-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow: any = {
      assigned: { next: "picked_up", label: "Mark as Picked Up" },
      picked_up: { next: "out_for_delivery", label: "Start Delivery" },
      out_for_delivery: { next: "delivered", label: "Mark as Delivered" },
    };
    return statusFlow[currentStatus];
  };

  const openInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Delivery Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name || 'Delivery Partner'}!</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 hover:border-primary transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Today's Deliveries</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats.todayDeliveries}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active orders: {orders.length}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats.totalDeliveries}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All time completed
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">₹{stats.totalEarnings}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  From delivery fees
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Active Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Active Deliveries</CardTitle>
              <CardDescription>
                {orders.length === 0 
                  ? "No active deliveries at the moment" 
                  : `You have ${orders.length} active ${orders.length === 1 ? 'delivery' : 'deliveries'}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground">No active deliveries</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    New orders will appear here when assigned to you
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card 
                      key={order._id} 
                      className="border-2 hover:border-primary transition-all cursor-pointer"
                      onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">Order #{order.orderNumber || order._id.slice(-6)}</h3>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{order.deliveryAddress}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{order.customerPhone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Ordered: {new Date(order.createdAt).toLocaleTimeString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                <span>Total: ₹{order.totalAmount} | Delivery Fee: ₹{order.deliveryFee}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {selectedOrder?._id === order._id && (
                          <div className="mt-4 pt-4 border-t space-y-3">
                            <div className="bg-muted p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Order Items:</h4>
                              <ul className="space-y-1 text-sm">
                                {order.items?.map((item: any, idx: number) => (
                                  <li key={idx}>
                                    {item.quantity}x {item.name} - ₹{item.price}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openInMaps(order.deliveryAddress);
                                }}
                              >
                                <Navigation className="h-4 w-4 mr-2" />
                                Open in Maps
                              </Button>

                              {getNextStatus(order.status) && (
                                <Button
                                  className="flex-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus(order._id, getNextStatus(order.status).next);
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {getNextStatus(order.status).label}
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Delivery;
