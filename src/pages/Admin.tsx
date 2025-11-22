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
import { PromotionsManager } from "@/components/admin/PromotionsManager";
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
  const [promotions, setPromotions] = useState<any[]>([]);
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
      const [settingsData, couponsData, navData, menuData, usersData, ordersData, deliveryBoysData, promotionsData] = await Promise.all([
        api.getAllSettings(),
        api.getAllCoupons(),
        api.getAllNavbarItems(),
        api.getAllMenuItems(),
        api.getAllUsers(),
        api.getAllOrders(),
        api.getDeliveryBoys(),
        api.getAllPromotions(),
      ]);

      const servicesSetting = settingsData.find((s: any) => s.key === "services_visible");
      setServicesVisible(servicesSetting?.value === true);

      setCoupons(couponsData || []);
      setNavItems(navData || []);
      setMenuItems(menuData || []);
      setUsers(usersData || []);
      setOrders(ordersData || []);
      setDeliveryBoys(deliveryBoysData || []);
      setPromotions(promotionsData || []);
      
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

  const exportData = (type: string, data: any[]) => {
    let csvContent = "";
    let filename = "";

    if (type === 'orders') {
      filename = `orders_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = "Order Number,Customer,Phone,Address,Total,Status,Date\n";
      data.forEach(order => {
        csvContent += `"${order.orderNumber}","${order.customerName}","${order.customerPhone}","${order.deliveryAddress}","${order.totalAmount}","${order.status}","${new Date(order.createdAt).toLocaleString()}"\n`;
      });
    } else if (type === 'users') {
      filename = `users_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = "Name,Email,Phone,Role,Created\n";
      data.forEach(user => {
        csvContent += `"${user.name}","${user.email}","${user.phone || 'N/A'}","${user.role}","${new Date(user.createdAt).toLocaleString()}"\n`;
      });
    } else if (type === 'revenue') {
      filename = `revenue_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = "Date,Order Number,Customer,Amount,Status\n";
      data.forEach(order => {
        csvContent += `"${new Date(order.createdAt).toLocaleDateString()}","${order.orderNumber}","${order.customerName}","${order.totalAmount}","${order.status}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `${filename} has been downloaded`,
    });
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
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="coupons">Coupons</TabsTrigger>
              <TabsTrigger value="promotions">Promotions</TabsTrigger>
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

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{orders.length}</p>
                    <p className="text-sm text-muted-foreground">All time</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      ₹{orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">All time</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{users.filter(u => u.role === 'user').length}</p>
                    <p className="text-sm text-muted-foreground">Registered customers</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Reports & Export</CardTitle>
                      <CardDescription>Download detailed reports</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => exportData('orders', orders)} variant="outline">
                        Export Orders
                      </Button>
                      <Button onClick={() => exportData('users', users)} variant="outline">
                        Export Users
                      </Button>
                      <Button onClick={() => exportData('revenue', orders)} variant="outline">
                        Export Revenue
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Order Statistics</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Pending:</span>
                            <span className="font-medium">{orders.filter(o => o.status === 'pending').length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Assigned:</span>
                            <span className="font-medium">{orders.filter(o => o.status === 'assigned').length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Out for Delivery:</span>
                            <span className="font-medium">{orders.filter(o => o.status === 'out_for_delivery').length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivered:</span>
                            <span className="font-medium text-green-600">{orders.filter(o => o.status === 'delivered').length}</span>
                          </div>
                        </div>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">User Statistics</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Customers:</span>
                            <span className="font-medium">{users.filter(u => u.role === 'user').length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivery Boys:</span>
                            <span className="font-medium">{users.filter(u => u.role === 'delivery_boy').length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Admins:</span>
                            <span className="font-medium">{users.filter(u => u.role === 'admin').length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Users:</span>
                            <span className="font-medium">{users.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
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

            <TabsContent value="promotions">
              <PromotionsManager promotions={promotions} onRefresh={fetchData} />
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
