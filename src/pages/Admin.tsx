import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Loader2, Trash2, Package } from "lucide-react";
import { Label } from "@/components/ui/label";
import { EditMenuItemDialog } from "@/components/admin/EditMenuItemDialog";
import { EditCouponDialog } from "@/components/admin/EditCouponDialog";
import { EditNavItemDialog } from "@/components/admin/EditNavItemDialog";
import { AddMenuItemDialog } from "@/components/admin/AddMenuItemDialog";
import { AddCouponDialog } from "@/components/admin/AddCouponDialog";
import { AddNavItemDialog } from "@/components/admin/AddNavItemDialog";
import { AddDeliveryBoyDialog } from "@/components/admin/AddDeliveryBoyDialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Admin = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [servicesVisible, setServicesVisible] = useState(true);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [navItems, setNavItems] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [deliveryBoys, setDeliveryBoys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, authLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      // Auto-refresh every 30 seconds to check for new orders
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      const [settingsData, couponsData, navData, menuData, usersData, ordersData, deliveryBoysData] = await Promise.all([
        api.getAllSettings(),
        api.getAllCoupons(),
        api.getAllNavbarItems(),
        api.getAllMenuItems(),
        api.getAllUsers(),
        api.getAllOrders(),
        api.getDeliveryBoys(),
      ]);

      const servicesSetting = settingsData.find((s: any) => s.key === "services_visible");
      setServicesVisible(servicesSetting?.value === true);

      setCoupons(couponsData || []);
      setNavItems(navData || []);
      setMenuItems(menuData || []);
      setUsers(usersData || []);
      setOrders(ordersData || []);
      setDeliveryBoys(deliveryBoysData || []);
      
      // Count new pending orders
      const pendingOrders = ordersData.filter((order: any) => order.status === 'pending');
      setNewOrdersCount(pendingOrders.length);
      
      // Show notification for new orders
      if (pendingOrders.length > 0) {
        toast({
          title: "New Orders!",
          description: `You have ${pendingOrders.length} new order${pendingOrders.length > 1 ? 's' : ''} waiting for assignment`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleServicesVisibility = async () => {
    const newValue = !servicesVisible;
    
    try {
      await api.updateSetting("services_visible", newValue);
      setServicesVisible(newValue);
      toast({
        title: "Success",
        description: `Services section ${newValue ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update services visibility",
        variant: "destructive",
      });
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      await api.deleteCoupon(id);
      toast({ title: "Success", description: "Coupon deleted" });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive",
      });
    }
  };

  const deleteNavItem = async (id: string) => {
    try {
      await api.deleteNavbarItem(id);
      toast({ title: "Success", description: "Navigation item deleted" });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete navigation item",
        variant: "destructive",
      });
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      await api.deleteMenuItem(id);
      toast({ title: "Success", description: "Menu item deleted" });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      toast({ title: "Success", description: "User role updated" });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await api.deleteUser(userId);
      toast({ title: "Success", description: "User deleted" });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const assignDeliveryBoy = async (orderId: string, deliveryBoyId: string) => {
    try {
      await api.assignDeliveryBoy(orderId, deliveryBoyId);
      toast({ 
        title: "Success", 
        description: "Order assigned to delivery boy. They will be notified." 
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign delivery boy",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: "bg-yellow-500",
      assigned: "bg-blue-500",
      picked_up: "bg-purple-500",
      out_for_delivery: "bg-orange-500",
      delivered: "bg-green-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Manage your restaurant's content</p>
          </div>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList>
              <TabsTrigger value="orders" className="relative">
                Orders
                {newOrdersCount > 0 && (
                  <Badge className="ml-2 bg-red-500">{newOrdersCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="coupons">Coupons</TabsTrigger>
              <TabsTrigger value="navigation">Navigation</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order Management</CardTitle>
                  <CardDescription>View and assign orders to delivery boys</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No orders yet</p>
                      </div>
                    ) : (
                      orders.map((order) => (
                        <div
                          key={order._id}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                                <Badge className={getStatusColor(order.status)}>
                                  {order.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                                {order.status === 'pending' && (
                                  <Badge variant="destructive">NEW</Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p><strong>Customer:</strong> {order.customerName}</p>
                                <p><strong>Phone:</strong> {order.customerPhone}</p>
                                <p><strong>Address:</strong> {order.deliveryAddress}</p>
                                <p><strong>Items:</strong> {order.items?.length} items</p>
                                <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                                <p><strong>Ordered:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                          
                          {order.status === 'pending' && (
                            <div className="pt-3 border-t">
                              <Label className="text-sm mb-2 block">Assign to Delivery Boy</Label>
                              <div className="flex gap-2">
                                <Select
                                  onValueChange={(value) => assignDeliveryBoy(order._id, value)}
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select delivery boy..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {deliveryBoys.map((boy) => (
                                      <SelectItem key={boy._id} value={boy._id}>
                                        {boy.name} - {boy.phone || 'No phone'}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                          
                          {order.status !== 'pending' && order.deliveryBoyId && (
                            <div className="pt-3 border-t text-sm">
                              <p className="text-muted-foreground">
                                <strong>Assigned to:</strong>{' '}
                                {deliveryBoys.find((b) => b._id === order.deliveryBoyId)?.name || 'Unknown'}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Configure site-wide settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Services Section Visibility</h3>
                      <p className="text-sm text-muted-foreground">
                        Toggle the services section on the homepage
                      </p>
                    </div>
                    <Switch checked={servicesVisible} onCheckedChange={toggleServicesVisibility} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage users and delivery boys</CardDescription>
                    </div>
                    <AddDeliveryBoyDialog onSuccess={fetchData} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{user.name}</h3>
                            <Badge variant={
                              user.role === 'admin' ? 'default' : 
                              user.role === 'delivery_boy' ? 'secondary' : 
                              'outline'
                            }>
                              {user.role === 'delivery_boy' ? 'Delivery Boy' : 
                               user.role === 'admin' ? 'Admin' : 'User'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {user.phone && (
                            <p className="text-sm text-muted-foreground">{user.phone}</p>
                          )}
                        </div>
                        <div className="flex gap-2 items-center">
                          <Select
                            value={user.role}
                            onValueChange={(value) => updateUserRole(user._id, value)}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="delivery_boy">Delivery Boy</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteUser(user._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="coupons">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Manage Coupons</CardTitle>
                      <CardDescription>Add, edit, or remove coupons</CardDescription>
                    </div>
                    <AddCouponDialog onSuccess={fetchData} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {coupons.map((coupon) => (
                      <div
                        key={coupon._id || coupon.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-semibold">{coupon.title}</h3>
                          <p className="text-sm text-muted-foreground">{coupon.code}</p>
                        </div>
                        <div className="flex gap-2">
                          <EditCouponDialog coupon={coupon} onSuccess={fetchData} />
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteCoupon(coupon._id || coupon.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="navigation">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Navigation Items</CardTitle>
                      <CardDescription>Manage navigation menu items</CardDescription>
                    </div>
                    <AddNavItemDialog onSuccess={fetchData} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {navItems.map((item) => (
                      <div
                        key={item._id || item.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.path}</p>
                        </div>
                        <div className="flex gap-2">
                          <EditNavItemDialog item={item} onSuccess={fetchData} />
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteNavItem(item._id || item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="menu">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Menu Items</CardTitle>
                      <CardDescription>Manage restaurant menu items</CardDescription>
                    </div>
                    <AddMenuItemDialog onSuccess={fetchData} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {menuItems.map((item) => (
                      <div
                        key={item._id || item.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.price} • {item.category}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <EditMenuItemDialog item={item} onSuccess={fetchData} />
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteMenuItem(item._id || item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
