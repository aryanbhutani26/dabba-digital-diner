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
import { Loader2, Trash2, Package, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EditMenuItemDialog } from "@/components/admin/EditMenuItemDialog";
import { EditCouponDialog } from "@/components/admin/EditCouponDialog";
import { EditNavItemDialog } from "@/components/admin/EditNavItemDialog";
import { AddMenuItemDialog } from "@/components/admin/AddMenuItemDialog";
import { AddCouponDialog } from "@/components/admin/AddCouponDialog";
import { AddNavItemDialog } from "@/components/admin/AddNavItemDialog";
import { AddDeliveryBoyDialog } from "@/components/admin/AddDeliveryBoyDialog";
import { PromotionsManager } from "@/components/admin/PromotionsManager";
import { AddDabbaServiceDialog } from "@/components/admin/AddDabbaServiceDialog";
import { EditDabbaServiceDialog } from "@/components/admin/EditDabbaServiceDialog";
import { ThermalPrinterDashboard } from "@/components/admin/ThermalPrinterDashboard";
import { InvoiceManager } from "@/components/admin/InvoiceManager";
import { DabbaSubscriptionsManager } from "@/components/admin/DabbaSubscriptionsManager";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { BirthdayCouponsManager } from "@/components/admin/BirthdayCouponsManager";
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
  const [coupons, setCoupons] = useState<any[]>([]);
  const [navItems, setNavItems] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [dabbaServices, setDabbaServices] = useState<any[]>([]);
  const [servicesEnabled, setServicesEnabled] = useState(false);
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
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [signatureDishes, setSignatureDishes] = useState<string[]>([]);
  const [deliveryFee, setDeliveryFee] = useState<number>(50);
  const [lunchMenuEnabled, setLunchMenuEnabled] = useState<boolean>(true);

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

  // Note: Dashboard is now the default tab, no redirect needed

  const fetchData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    
    try {
      const [couponsData, navData, menuData, usersData, ordersData, deliveryBoysData, promotionsData, vouchersData, reservationsData, dabbaServicesData, servicesVisibilityData, signatureDishesData, deliveryFeeData, lunchMenuData] = await Promise.all([
        api.getAllCoupons(),
        api.getAllNavbarItems(),
        api.getAllMenuItems(),
        api.getAllUsers(),
        api.getAllOrders(),
        api.getDeliveryBoys(),
        api.getAllPromotions(),
        api.getAllVouchers(),
        api.getAllReservations(),
        api.getDabbaServicesAdmin().catch(() => []),
        api.getServicesVisibility().catch(() => ({ enabled: false })),
        api.getSetting('signature_dishes').catch(() => ({ value: [] })),
        api.getSetting('delivery_fee').catch(() => ({ value: 50 })),
        api.getSetting('lunch_menu_enabled').catch(() => ({ value: true })),
      ]);

      setCoupons(couponsData || []);
      setNavItems(navData || []);
      setMenuItems(menuData || []);
      setDabbaServices(dabbaServicesData || []);
      setServicesEnabled(servicesVisibilityData?.enabled || false);
      setUsers(usersData || []);
      setOrders(ordersData || []);
      setDeliveryBoys(deliveryBoysData || []);
      setPromotions(promotionsData || []);
      setVouchers(vouchersData || []);
      setReservations(reservationsData || []);
      setSignatureDishes(signatureDishesData?.value || []);
      setDeliveryFee(deliveryFeeData?.value || 50);
      setLunchMenuEnabled(lunchMenuData?.value !== false);
      
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

  const deleteDabbaService = async (id: string) => {
    try {
      await api.deleteDabbaService(id);
      toast({ title: "Success", description: "Dabba service deleted" });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete dabba service",
        variant: "destructive",
      });
    }
  };

  const toggleServicesVisibility = async () => {
    try {
      const newEnabled = !servicesEnabled;
      await api.toggleServicesVisibility(newEnabled);
      setServicesEnabled(newEnabled);
      toast({
        title: "Success",
        description: `Services ${newEnabled ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update services visibility",
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
      pending: "bg-[#c3a85c]",
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      <main className="pt-24 md:pt-32 pb-20 px-2 sm:px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Elegant Header */}
          <div className="mb-6 md:mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 rounded-3xl blur-3xl -z-10" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 md:p-6 bg-card/30 backdrop-blur-sm border rounded-2xl">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                    <span className="text-2xl">👨‍💼</span>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Admin Panel</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Manage your restaurant's content</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">System Online</span>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-4 md:space-y-6">
            {/* Clean Admin Navigation - Grid Layout */}
            <TabsList className="grid grid-cols-6 lg:grid-cols-12 gap-2 h-auto bg-card/80 backdrop-blur-sm border rounded-xl p-3 shadow-sm">
              <TabsTrigger 
                value="dashboard" 
                className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted"
              >
                <span className="text-xl">🏠</span>
                <span>Home</span>
              </TabsTrigger>
              <TabsTrigger 
                value="orders" 
                className="relative flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted"
              >
                <span className="text-xl">📦</span>
                <span>Orders</span>
                {newOrdersCount > 0 && (
                  <Badge className="absolute top-1 right-1 h-5 min-w-5 flex items-center justify-center p-0 bg-red-500 text-[10px] rounded-full">{newOrdersCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted"
              >
                <span className="text-xl">📊</span>
                <span>Stats</span>
              </TabsTrigger>
              <TabsTrigger 
                value="general" 
                className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted"
              >
                <span className="text-xl">⚙️</span>
                <span>Settings</span>
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted"
              >
                <span className="text-xl">👥</span>
                <span>Users</span>
              </TabsTrigger>
              <TabsTrigger 
                value="coupons" 
                className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted"
              >
                <span className="text-xl">🎫</span>
                <span>Coupons</span>
              </TabsTrigger>
              <TabsTrigger 
                value="birthday-coupons" 
                className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted"
              >
                <span className="text-xl">🎂</span>
                <span>Birthday</span>
              </TabsTrigger>
              <TabsTrigger 
                value="promotions" 
                className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted"
              >
                <span className="text-xl">🎉</span>
                <span>Promos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="reservations" 
                className="relative flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted"
              >
                <span className="text-xl">📅</span>
                <span>Bookings</span>
                {newReservationsCount > 0 && (
                  <Badge className="absolute top-1 right-1 h-5 min-w-5 flex items-center justify-center p-0 bg-red-500 text-[10px] rounded-full">{newReservationsCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="navigation" 
                className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted"
              >
                <span className="text-xl">🧭</span>
                <span>Nav</span>
              </TabsTrigger>
              <TabsTrigger 
                value="menu" 
                className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted"
              >
                <span className="text-xl">🍽️</span>
                <span>Menu</span>
              </TabsTrigger>
              <TabsTrigger 
                value="services" 
                className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted"
              >
                <span className="text-xl">🥡</span>
                <span>Services</span>
              </TabsTrigger>
              <TabsTrigger 
                value="gallery" 
                className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted"
              >
                <span className="text-xl">🖼️</span>
                <span>Gallery</span>
              </TabsTrigger>
              <TabsTrigger 
                value="printers" 
                className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted"
              >
                <span className="text-xl">🖨️</span>
                <span>Printers</span>
              </TabsTrigger>
              <TabsTrigger 
                value="invoices" 
                className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted"
              >
                <span className="text-xl">📄</span>
                <span>Invoices</span>
              </TabsTrigger>
              <TabsTrigger 
                value="subscriptions" 
                className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted"
              >
                <span className="text-xl">🥘</span>
                <span>Subscriptions</span>
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard">
              <div className="space-y-6">
                {/* Welcome Header */}
                <div>
                  <h2 className="text-2xl font-bold">Dashboard</h2>
                  <p className="text-muted-foreground">Welcome back! Here's an overview of your restaurant.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Orders */}
                  <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-background border-blue-500/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <span className="text-xl">📦</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">All time orders</p>
                    </CardContent>
                  </Card>

                  {/* Total Revenue */}
                  <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-green-500/5 to-background border-green-500/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <span className="text-xl">💰</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-green-600">
                        £{orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Total earnings</p>
                    </CardContent>
                  </Card>

                  {/* Total Users */}
                  <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-background border-purple-500/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                          <span className="text-xl">👥</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-purple-600">{users.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">Registered users</p>
                    </CardContent>
                  </Card>

                  {/* Pending Orders */}
                  <Card className="relative overflow-hidden bg-gradient-to-br from-[#c3a85c]/10 via-[#c3a85c]/5 to-background border-[#c3a85c]/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
                        <div className="w-10 h-10 rounded-full bg-[#c3a85c]/10 flex items-center justify-center">
                          <span className="text-xl">⏳</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-[#c3a85c]">{orders.filter(o => o.status === 'pending').length}</p>
                      <p className="text-xs text-muted-foreground mt-1">Awaiting assignment</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <button
                        onClick={() => document.querySelector('[value="orders"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
                        className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-accent transition-colors"
                      >
                        <Package className="h-8 w-8 mb-2 text-primary" />
                        <span className="text-sm font-medium">Manage Orders</span>
                      </button>
                      <button
                        onClick={() => document.querySelector('[value="menu"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
                        className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-accent transition-colors"
                      >
                        <span className="text-3xl mb-2">🍽️</span>
                        <span className="text-sm font-medium">Edit Menu</span>
                      </button>
                      <button
                        onClick={() => document.querySelector('[value="users"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
                        className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-accent transition-colors"
                      >
                        <span className="text-3xl mb-2">👥</span>
                        <span className="text-sm font-medium">Manage Users</span>
                      </button>
                      <button
                        onClick={() => document.querySelector('[value="analytics"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
                        className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-accent transition-colors"
                      >
                        <span className="text-3xl mb-2">📊</span>
                        <span className="text-sm font-medium">View Analytics</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

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
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Orders */}
                <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-background border-blue-500/20 hover:border-blue-500/40 transition-all">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16"></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <span className="text-xl">📦</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">All time orders</p>
                  </CardContent>
                </Card>

                {/* Total Revenue */}
                <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-green-500/5 to-background border-green-500/20 hover:border-green-500/40 transition-all">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16"></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <span className="text-xl">💰</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">
                      £{orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Total earnings</p>
                  </CardContent>
                </Card>

                {/* Active Customers */}
                <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-background border-purple-500/20 hover:border-purple-500/40 transition-all">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16"></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <span className="text-xl">👥</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-purple-600">{users.filter(u => u.role === 'user').length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Registered users</p>
                  </CardContent>
                </Card>

                {/* Delivery Boys */}
                <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-background border-orange-500/20 hover:border-orange-500/40 transition-all">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16"></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Delivery Boys</CardTitle>
                      <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <span className="text-xl">🚚</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-orange-600">{users.filter(u => u.role === 'delivery_boy').length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Active drivers</p>
                  </CardContent>
                </Card>
              </div>

              {/* Export Section */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <span>📊</span> Reports & Export
                      </CardTitle>
                      <CardDescription className="text-sm">Download detailed reports in CSV format</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => exportData('orders', orders)} variant="outline" size="sm" className="border-primary/20 hover:border-primary/40">
                        <span className="mr-2">📦</span> Export Orders
                      </Button>
                      <Button onClick={() => exportData('users', users)} variant="outline" size="sm" className="border-primary/20 hover:border-primary/40">
                        <span className="mr-2">👥</span> Export Users
                      </Button>
                      <Button onClick={() => exportData('revenue', orders)} variant="outline" size="sm" className="border-primary/20 hover:border-primary/40">
                        <span className="mr-2">💰</span> Export Revenue
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Statistics */}
                <Card className="bg-gradient-to-br from-background to-muted/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>📊</span> Order Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Pending */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[#c3a85c]/10 border border-[#c3a85c]/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#c3a85c]/20 flex items-center justify-center">
                            <span className="text-lg">⏳</span>
                          </div>
                          <span className="font-medium">Pending</span>
                        </div>
                        <span className="text-2xl font-bold text-[#c3a85c]">{orders.filter(o => o.status === 'pending').length}</span>
                      </div>

                      {/* Assigned */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span className="text-lg">📋</span>
                          </div>
                          <span className="font-medium">Assigned</span>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">{orders.filter(o => o.status === 'assigned').length}</span>
                      </div>

                      {/* Out for Delivery */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <span className="text-lg">🚚</span>
                          </div>
                          <span className="font-medium">Out for Delivery</span>
                        </div>
                        <span className="text-2xl font-bold text-orange-600">{orders.filter(o => o.status === 'out_for_delivery').length}</span>
                      </div>

                      {/* Delivered */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <span className="text-lg">✅</span>
                          </div>
                          <span className="font-medium">Delivered</span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'delivered').length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Statistics */}
                <Card className="bg-gradient-to-br from-background to-muted/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>👥</span> User Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Customers */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <span className="text-lg">👤</span>
                          </div>
                          <span className="font-medium">Customers</span>
                        </div>
                        <span className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'user').length}</span>
                      </div>

                      {/* Delivery Boys */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <span className="text-lg">🚚</span>
                          </div>
                          <span className="font-medium">Delivery Boys</span>
                        </div>
                        <span className="text-2xl font-bold text-orange-600">{users.filter(u => u.role === 'delivery_boy').length}</span>
                      </div>

                      {/* Admins */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                            <span className="text-lg">👑</span>
                          </div>
                          <span className="font-medium">Admins</span>
                        </div>
                        <span className="text-2xl font-bold text-red-600">{users.filter(u => u.role === 'admin').length}</span>
                      </div>

                      {/* Total Users */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-lg">📊</span>
                          </div>
                          <span className="font-medium">Total Users</span>
                        </div>
                        <span className="text-2xl font-bold text-primary">{users.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Configure site-wide settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Signature Dishes Section */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Our Signature Dishes</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select 3 dishes to feature on the homepage. These will be displayed in the "Our Signature Dishes" section.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[0, 1, 2].map((index) => (
                        <div key={index} className="space-y-2">
                          <Label>Signature Dish {index + 1}</Label>
                          <Select
                            value={signatureDishes[index] || ""}
                            onValueChange={(value) => {
                              const newDishes = [...signatureDishes];
                              newDishes[index] = value;
                              setSignatureDishes(newDishes);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a dish..." />
                            </SelectTrigger>
                            <SelectContent>
                              {menuItems.map((item) => (
                                <SelectItem 
                                  key={item._id || item.id} 
                                  value={item._id || item.id}
                                  disabled={signatureDishes.includes(item._id || item.id) && signatureDishes[index] !== (item._id || item.id)}
                                >
                                  {item.name} - {item.category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {signatureDishes[index] && (
                            <div className="mt-2 p-3 border rounded-lg bg-muted/50">
                              {(() => {
                                const dish = menuItems.find(item => (item._id || item.id) === signatureDishes[index]);
                                return dish ? (
                                  <div className="flex gap-3">
                                    {dish.image && (
                                      <img 
                                        src={dish.image} 
                                        alt={dish.name}
                                        className="w-16 h-16 object-cover rounded"
                                      />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">{dish.name}</p>
                                      <p className="text-xs text-muted-foreground truncate">{dish.description}</p>
                                      <p className="text-sm font-semibold text-primary mt-1">£{dish.price}</p>
                                    </div>
                                  </div>
                                ) : null;
                              })()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={async () => {
                        try {
                          await api.updateSetting('signature_dishes', signatureDishes.filter(Boolean));
                          toast({
                            title: "Success",
                            description: "Signature dishes updated successfully",
                          });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to update signature dishes",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="w-full md:w-auto"
                    >
                      Save Signature Dishes
                    </Button>
                  </div>

                  {/* Delivery Fee Section */}
                  <div className="space-y-4 pt-6 border-t">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Delivery Fee</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Set the delivery fee that will be applied to all orders. This fee will be displayed in the cart and checkout.
                      </p>
                    </div>
                    
                    <div className="max-w-md">
                      <Label htmlFor="delivery-fee">Delivery Fee (£)</Label>
                      <div className="flex gap-4 items-end mt-2">
                        <div className="flex-1">
                          <Input
                            id="delivery-fee"
                            type="number"
                            step="0.01"
                            min="0"
                            value={deliveryFee}
                            onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                            placeholder="e.g. 50.00"
                            className="text-lg"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Current fee: £{deliveryFee.toFixed(2)}
                          </p>
                        </div>
                        <Button 
                          onClick={async () => {
                            try {
                              await api.updateSetting('delivery_fee', deliveryFee);
                              toast({
                                title: "Success",
                                description: `Delivery fee updated to £${deliveryFee.toFixed(2)}`,
                              });
                              fetchData();
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to update delivery fee",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Update Delivery Fee
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Lunch Menu Toggle Section */}
                  <div className="space-y-4 pt-6 border-t">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Lunch Menu Availability</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Control whether customers can order from the lunch menu. When disabled, the lunch menu will be grayed out with a message indicating it's unavailable.
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                      <div className="flex-1">
                        <Label htmlFor="lunch-menu-toggle" className="text-base font-medium cursor-pointer">
                          Enable Lunch Menu Orders
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {lunchMenuEnabled 
                            ? "Customers can currently order from the lunch menu" 
                            : "Lunch menu is currently disabled for orders"}
                        </p>
                      </div>
                      <Switch
                        id="lunch-menu-toggle"
                        checked={lunchMenuEnabled}
                        onCheckedChange={async (checked) => {
                          try {
                            await api.updateSetting('lunch_menu_enabled', checked);
                            setLunchMenuEnabled(checked);
                            toast({
                              title: "Success",
                              description: `Lunch menu ${checked ? 'enabled' : 'disabled'} successfully`,
                            });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to update lunch menu status",
                              variant: "destructive",
                            });
                          }
                        }}
                      />
                    </div>
                    
                    {!lunchMenuEnabled && (
                      <div className="p-4 bg-[#c3a85c]/5 border border-[#c3a85c]/20 rounded-lg">
                        <p className="text-sm text-[#c3a85c]">
                          <strong>⚠️ Lunch menu is disabled.</strong> Customers will see a message that lunch is not currently being served, and items will be grayed out.
                        </p>
                      </div>
                    )}
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

            {/* Birthday Coupons Tab */}
            <TabsContent value="birthday-coupons">
              <BirthdayCouponsManager />
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
                          'from-[#c3a85c]/10 via-[#c3a85c]/5 to-background/50 border-[#c3a85c]/20'
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
                                  'bg-[#c3a85c]'
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
                    <div className="flex-1">
                      <CardTitle className="text-xl sm:text-2xl">Menu Items</CardTitle>
                      <CardDescription className="text-sm">Manage restaurant menu items</CardDescription>
                    </div>
                    <AddMenuItemDialog onSuccess={fetchData} />
                  </div>
                  
                  {/* Search Bar */}
                  <div className="mt-4 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search menu items by name, category, or description..."
                      value={menuSearchQuery}
                      onChange={(e) => setMenuSearchQuery(e.target.value)}
                      className="pl-10 pr-4"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menuItems
                      .filter(item => 
                        item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                        item.description?.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                        item.category.toLowerCase().includes(menuSearchQuery.toLowerCase())
                      )
                      .map((item) => (
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
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
                              <Badge className={`font-semibold shadow-lg ${
                                item.category === 'Mains' ? 'bg-orange-500 hover:bg-orange-600 text-white' :
                                item.category === 'Lunch' ? 'bg-green-500 hover:bg-green-600 text-white' :
                                item.category === 'Drinks' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                                item.category === 'Desserts' ? 'bg-pink-500 hover:bg-pink-600 text-white' :
                                'bg-purple-500 hover:bg-purple-600 text-white'
                              }`}>
                                {item.category}
                              </Badge>
                              {item.subcategory && (
                                <Badge className="bg-slate-700 hover:bg-slate-800 text-white backdrop-blur text-xs font-medium shadow-md">
                                  {item.subcategory}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Menu Item Details */}
                        <div className="p-5">
                          {/* Category badge if no image */}
                          {!item.image && (
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className={`font-semibold ${
                                item.category === 'Mains' ? 'bg-orange-500 hover:bg-orange-600 text-white' :
                                item.category === 'Lunch' ? 'bg-green-500 hover:bg-green-600 text-white' :
                                item.category === 'Drinks' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                                item.category === 'Desserts' ? 'bg-pink-500 hover:bg-pink-600 text-white' :
                                'bg-purple-500 hover:bg-purple-600 text-white'
                              }`}>
                                {item.category}
                              </Badge>
                              {item.subcategory && (
                                <Badge className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-medium">
                                  {item.subcategory}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{item.name}</h3>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                          )}
                          
                          <div className="flex items-center justify-between mb-4">
                            {item.hasVariants && item.variants ? (
                              <div className="space-y-1">
                                {item.variants.map((variant: any, vIdx: number) => (
                                  <div key={vIdx} className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{variant.size}:</span>
                                    <span className="text-sm font-bold text-primary">
                                      £{variant.price.toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-2xl font-bold text-primary">£{item.price}</span>
                            )}
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
                  
                  {menuItems.length > 0 && menuItems.filter(item => 
                    item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                    item.description?.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                    item.category.toLowerCase().includes(menuSearchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔍</span>
                      </div>
                      <p className="text-muted-foreground mb-2">No items found</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your search query</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl">Dabba Services Management</CardTitle>
                      <CardDescription className="text-sm">Manage tiffin/dabba service packages</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="services-enabled"
                          checked={servicesEnabled}
                          onCheckedChange={toggleServicesVisibility}
                        />
                        <Label htmlFor="services-enabled" className="text-sm">
                          {servicesEnabled ? 'Services Enabled' : 'Services Disabled'}
                        </Label>
                      </div>
                      <AddDabbaServiceDialog onSuccess={fetchData} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!servicesEnabled && (
                    <div className="mb-6 p-4 bg-[#c3a85c]/5 border border-[#c3a85c]/20 rounded-lg">
                      <p className="text-sm text-[#c3a85c]">
                        <strong>Services are currently disabled.</strong> Enable the toggle above to show the Services section in the navigation menu.
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dabbaServices.map((service) => (
                      <div
                        key={service._id}
                        className="group relative bg-gradient-to-br from-background to-muted/20 border-2 rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-200"
                      >
                        {/* Service Image */}
                        {service.image && (
                          <div className="relative h-40 overflow-hidden">
                            <img 
                              src={service.image} 
                              alt={service.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2">
                              <Badge variant={service.isActive ? "default" : "secondary"} className="bg-background/90 backdrop-blur">
                                {service.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        )}

                        {/* Service Details */}
                        <div className="p-5">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{service.title}</h3>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{service.description}</p>
                          )}
                          
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl font-bold text-primary">£{service.price?.toFixed(2)}</span>
                            <Badge variant="outline" className="text-xs">
                              Order: {service.order || 0}
                            </Badge>
                          </div>

                          {/* Features */}
                          {service.features && service.features.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-semibold mb-2">Features:</p>
                              <div className="flex flex-wrap gap-1">
                                {service.features.slice(0, 3).map((feature: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                                {service.features.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{service.features.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-4 border-t">
                            <EditDabbaServiceDialog service={service} onSuccess={fetchData} />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteDabbaService(service._id)}
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
                  
                  {dabbaServices.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🥡</span>
                      </div>
                      <p className="text-muted-foreground mb-2">No dabba services yet</p>
                      <p className="text-sm text-muted-foreground">Create your first dabba/tiffin service package</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gallery Management Tab */}
            <TabsContent value="gallery">
              <GalleryManager />
            </TabsContent>

            {/* Thermal Printers Tab */}
            <TabsContent value="printers">
              <ThermalPrinterDashboard />
            </TabsContent>

            {/* Invoice Manager Tab */}
            <TabsContent value="invoices">
              <InvoiceManager />
            </TabsContent>

            {/* Dabba Subscriptions Tab */}
            <TabsContent value="subscriptions">
              <DabbaSubscriptionsManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
