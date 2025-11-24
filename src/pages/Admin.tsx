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
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [newReservationsCount, setNewReservationsCount] = useState(0);
  const [hasShownNewOrdersToast, setHasShownNewOrdersToast] = useState(false);
  const [hasShownNewReservationsToast, setHasShownNewReservationsToast] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page",
        variant: "destructive",
      });
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      // Auto-refresh every 30 seconds to check for new orders (silent mode)
      const interval = setInterval(() => fetchData(true), 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const fetchData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    
    try {
      const [settingsData, couponsData, navData, menuData, usersData, ordersData, deliveryBoysData, promotionsData, vouchersData, reservationsData] = await Promise.all([
        api.getAllSettings(),
        api.getAllCoupons(),
        api.getAllNavbarItems(),
        api.getAllMenuItems(),
        api.getAllUsers(),
        api.getAllOrders(),
        api.getDeliveryBoys(),
        api.getAllPromotions(),
        api.getAllVouchers(),
        api.getAllReservations(),
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
      setVouchers(vouchersData || []);
      setReservations(reservationsData || []);
      
      // Count new pending orders
      const pendingOrders = ordersData.filter((order: any) => order.status === 'pending');
      const newPendingCount = pendingOrders.length;
      
      // Only show notification if there are NEW orders (count increased) and we haven't shown it yet
      if (newPendingCount > newOrdersCount && !hasShownNewOrdersToast) {
        toast({
          title: "New Orders!",
          description: `You have ${newPendingCount} new order${newPendingCount > 1 ? 's' : ''} waiting for assignment`,
        });
        setHasShownNewOrdersToast(true);
      }
      
      setNewOrdersCount(newPendingCount);
      
      // Count new pending reservations
      const pendingReservations = reservationsData.filter((res: any) => res.status === 'pending');
      const newReservationsCount = pendingReservations.length;
      
      // Show notification for new reservations
      if (newReservationsCount > newReservationsCount && !hasShownNewReservationsToast) {
        toast({
          title: "New Reservations!",
          description: `You have ${newReservationsCount} new reservation${newReservationsCount > 1 ? 's' : ''} to review`,
        });
        setHasShownNewReservationsToast(true);
      }
      
      setNewReservationsCount(newReservationsCount);
    } catch (error) {
      if (!silent) {
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive",
        });
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
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
      <main className="pt-24 md:pt-32 pb-20 px-2 sm:px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Admin Panel</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your restaurant's content</p>
          </div>

          <Tabs defaultValue="orders" className="space-y-4 md:space-y-6">
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <TabsList className="inline-flex w-full sm:w-auto min-w-full sm:min-w-0 flex-nowrap sm:flex-wrap justify-start sm:justify-center px-2 sm:px-0">
                <TabsTrigger value="orders" className="relative whitespace-nowrap text-xs sm:text-sm">
                  <span className="hidden sm:inline">Orders</span>
                  <span className="sm:hidden">📦</span>
                  {newOrdersCount > 0 && (
                    <Badge className="ml-1 sm:ml-2 bg-red-500 text-xs px-1 sm:px-2">{newOrdersCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="analytics" className="whitespace-nowrap text-xs sm:text-sm">
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden">📊</span>
                </TabsTrigger>
                <TabsTrigger value="general" className="whitespace-nowrap text-xs sm:text-sm">
                  <span className="hidden sm:inline">General</span>
                  <span className="sm:hidden">⚙️</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="whitespace-nowrap text-xs sm:text-sm">
                  <span className="hidden sm:inline">Users</span>
                  <span className="sm:hidden">👥</span>
                </TabsTrigger>
                <TabsTrigger value="coupons" className="whitespace-nowrap text-xs sm:text-sm">
                  <span className="hidden sm:inline">Coupons</span>
                  <span className="sm:hidden">🎫</span>
                </TabsTrigger>
                <TabsTrigger value="promotions" className="whitespace-nowrap text-xs sm:text-sm">
                  <span className="hidden sm:inline">Promotions</span>
                  <span className="sm:hidden">🎉</span>
                </TabsTrigger>
                <TabsTrigger value="reservations" className="relative whitespace-nowrap text-xs sm:text-sm">
                  <span className="hidden sm:inline">Reservations</span>
                  <span className="sm:hidden">📅</span>
                  {newReservationsCount > 0 && (
                    <Badge className="ml-1 sm:ml-2 bg-red-500 text-xs px-1 sm:px-2">{newReservationsCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="navigation" className="whitespace-nowrap text-xs sm:text-sm">
                  <span className="hidden sm:inline">Navigation</span>
                  <span className="sm:hidden">🧭</span>
                </TabsTrigger>
                <TabsTrigger value="menu" className="whitespace-nowrap text-xs sm:text-sm">
                  <span className="hidden sm:inline">Menu</span>
                  <span className="sm:hidden">🍽️</span>
                </TabsTrigger>
              </TabsList>
            </div>

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
                                <p><strong>Total:</strong> £{order.totalAmount}</p>
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
                      £{orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(2)}
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl">User Management</CardTitle>
                      <CardDescription className="text-sm">Manage users and delivery boys</CardDescription>
                    </div>
                    <AddDeliveryBoyDialog onSuccess={fetchData} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map((user) => (
                      <div
                        key={user._id}
                        className="group relative bg-gradient-to-br from-background to-muted/20 border-2 rounded-xl p-5 hover:border-primary/50 hover:shadow-lg transition-all duration-200"
                      >
                        {/* User Avatar */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate mb-1">{user.name}</h3>
                            <Badge 
                              variant={
                                user.role === 'admin' ? 'default' : 
                                user.role === 'delivery_boy' ? 'secondary' : 
                                'outline'
                              }
                              className="text-xs"
                            >
                              {user.role === 'delivery_boy' ? 'Delivery Boy' : 
                               user.role === 'admin' ? 'Admin' : 'User'}
                            </Badge>
                          </div>
                        </div>

                        {/* User Details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="text-xs">📧</span>
                            <span className="truncate">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="text-xs">📞</span>
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 pt-4 border-t">
                          <Select
                            value={user.role}
                            onValueChange={(value) => updateUserRole(user._id, value)}
                          >
                            <SelectTrigger className="w-full text-sm">
                              <SelectValue placeholder="Change role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">👤 User</SelectItem>
                              <SelectItem value="delivery_boy">🚚 Delivery Boy</SelectItem>
                              <SelectItem value="admin">👑 Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteUser(user._id)}
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {users.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">👥</span>
                      </div>
                      <p className="text-muted-foreground">No users yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="promotions">
              <PromotionsManager promotions={promotions} onRefresh={fetchData} />
            </TabsContent>

            <TabsContent value="coupons">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl">Manage Coupons</CardTitle>
                      <CardDescription className="text-sm">Add, edit, or remove discount coupons</CardDescription>
                    </div>
                    <AddCouponDialog onSuccess={fetchData} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coupons.map((coupon) => (
                      <div
                        key={coupon._id || coupon.id}
                        className="group relative bg-gradient-to-br from-primary/5 to-transparent border-2 rounded-xl p-5 hover:border-primary/50 hover:shadow-lg transition-all duration-200"
                      >
                        {/* Coupon Icon */}
                        <div className="absolute top-4 right-4 text-3xl opacity-20 group-hover:opacity-40 transition-opacity">
                          🎫
                        </div>

                        {/* Coupon Details */}
                        <div className="mb-4">
                          <Badge variant="secondary" className="mb-3 font-mono font-bold">
                            {coupon.code}
                          </Badge>
                          <h3 className="font-semibold text-lg mb-1">{coupon.title}</h3>
                          {coupon.subtitle && (
                            <p className="text-sm text-muted-foreground">{coupon.subtitle}</p>
                          )}
                          {coupon.description && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{coupon.description}</p>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="mb-4">
                          <Badge variant={coupon.isActive ? "default" : "secondary"}>
                            {coupon.isActive ? '✓ Active' : '✗ Inactive'}
                          </Badge>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t">
                          <EditCouponDialog coupon={coupon} onSuccess={fetchData} />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteCoupon(coupon._id || coupon.id)}
                            className="flex-1"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {coupons.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🎫</span>
                      </div>
                      <p className="text-muted-foreground mb-2">No coupons yet</p>
                      <p className="text-sm text-muted-foreground">Create your first coupon to offer discounts</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reservations">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl">Reservations Management</CardTitle>
                      <CardDescription className="text-sm">View and manage table reservations</CardDescription>
                    </div>
                    {newReservationsCount > 0 && (
                      <Badge className="bg-red-500 text-white">
                        {newReservationsCount} New
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reservations.map((reservation) => (
                      <div
                        key={reservation._id}
                        className={`group relative bg-gradient-to-br ${
                          reservation.status === 'confirmed' ? 'from-green-500/10 via-green-500/5 to-background/50 border-green-500/20' :
                          reservation.status === 'cancelled' ? 'from-red-500/10 via-red-500/5 to-background/50 border-red-500/20' :
                          'from-yellow-500/10 via-yellow-500/5 to-background/50 border-yellow-500/20'
                        } border-2 rounded-xl p-5 hover:shadow-lg hover:border-opacity-40 transition-all duration-200 backdrop-blur-sm`}
                      >
                        {/* Reservation Icon */}
                        <div className="absolute top-4 right-4 text-3xl opacity-20 group-hover:opacity-40 transition-opacity">
                          📅
                        </div>

                        {/* Guest Info */}
                        <div className="mb-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                              {reservation.name?.charAt(0).toUpperCase() || 'G'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base truncate mb-1">{reservation.name}</h3>
                              <Badge 
                                className={`text-xs ${
                                  reservation.status === 'confirmed' ? 'bg-green-500' :
                                  reservation.status === 'cancelled' ? 'bg-red-500' :
                                  'bg-yellow-500'
                                }`}
                              >
                                {reservation.status === 'confirmed' ? '✓ Confirmed' :
                                 reservation.status === 'cancelled' ? '✗ Cancelled' :
                                 '⏳ Pending'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Contact Details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="text-xs">📧</span>
                            <span className="truncate">{reservation.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="text-xs">📞</span>
                            <span>{reservation.phone}</span>
                          </div>
                        </div>

                        {/* Reservation Details */}
                        <div className="space-y-2 mb-4 pb-4 border-b">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">📆 Date:</span>
                            <span className="font-medium">{new Date(reservation.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">🕐 Time:</span>
                            <span className="font-medium">{reservation.time}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">👥 Guests:</span>
                            <span className="font-medium">{reservation.guests} people</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">📝 Created:</span>
                            <span className="font-medium text-xs">{new Date(reservation.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Special Requests */}
                        {reservation.specialRequests && (
                          <div className="mb-4 p-3 bg-muted/30 backdrop-blur-sm rounded-lg border border-border/50">
                            <p className="text-xs font-semibold mb-1 text-foreground/80">Special Requests:</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{reservation.specialRequests}</p>
                          </div>
                        )}

                        {/* Actions */}
                        {reservation.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={async () => {
                                try {
                                  await api.updateReservationStatus(reservation._id, 'confirmed');
                                  toast({ title: "Reservation confirmed" });
                                  fetchData();
                                } catch (error) {
                                  toast({ title: "Error", variant: "destructive" });
                                }
                              }}
                            >
                              ✓ Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                              onClick={async () => {
                                try {
                                  await api.updateReservationStatus(reservation._id, 'cancelled');
                                  toast({ title: "Reservation cancelled" });
                                  fetchData();
                                } catch (error) {
                                  toast({ title: "Error", variant: "destructive" });
                                }
                              }}
                            >
                              ✗ Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {reservations.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📅</span>
                      </div>
                      <p className="text-muted-foreground mb-2">No reservations yet</p>
                      <p className="text-sm text-muted-foreground">Reservations will appear here when customers book tables</p>
                    </div>
                  )}
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl">Menu Items</CardTitle>
                      <CardDescription className="text-sm">Manage restaurant menu items</CardDescription>
                    </div>
                    <AddMenuItemDialog onSuccess={fetchData} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menuItems.map((item) => (
                      <div
                        key={item._id || item.id}
                        className="group relative bg-gradient-to-br from-background to-muted/20 border-2 rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-200"
                      >
                        {/* Menu Item Image */}
                        {item.image && (
                          <div className="relative h-40 overflow-hidden">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                                {item.category}
                              </Badge>
                            </div>
                          </div>
                        )}

                        {/* Menu Item Details */}
                        <div className="p-5">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{item.name}</h3>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                          )}
                          
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl font-bold text-primary">£{item.price}</span>
                            {item.isVeg !== undefined && (
                              <Badge variant={item.isVeg ? "default" : "secondary"} className="text-xs">
                                {item.isVeg ? '🌱 Veg' : '🍖 Non-Veg'}
                              </Badge>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-4 border-t">
                            <EditMenuItemDialog item={item} onSuccess={fetchData} />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteMenuItem(item._id || item.id)}
                              className="flex-1"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {menuItems.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🍽️</span>
                      </div>
                      <p className="text-muted-foreground mb-2">No menu items yet</p>
                      <p className="text-sm text-muted-foreground">Add your first dish to get started</p>
                    </div>
                  )}
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
