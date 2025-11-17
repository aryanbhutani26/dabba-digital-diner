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
import { Loader2, Trash2 } from "lucide-react";
import { EditMenuItemDialog } from "@/components/admin/EditMenuItemDialog";
import { EditCouponDialog } from "@/components/admin/EditCouponDialog";
import { EditNavItemDialog } from "@/components/admin/EditNavItemDialog";
import { AddMenuItemDialog } from "@/components/admin/AddMenuItemDialog";
import { AddCouponDialog } from "@/components/admin/AddCouponDialog";
import { AddNavItemDialog } from "@/components/admin/AddNavItemDialog";

const Admin = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [servicesVisible, setServicesVisible] = useState(true);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [navItems, setNavItems] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/auth");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      const [settingsData, couponsData, navData, menuData] = await Promise.all([
        api.getAllSettings(),
        api.getAllCoupons(),
        api.getAllNavbarItems(),
        api.getAllMenuItems(),
      ]);

      const servicesSetting = settingsData.find((s: any) => s.key === "services_visible");
      setServicesVisible(servicesSetting?.value === true);

      setCoupons(couponsData || []);
      setNavItems(navData || []);
      setMenuItems(menuData || []);
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

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="coupons">Coupons</TabsTrigger>
              <TabsTrigger value="navigation">Navigation</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
            </TabsList>

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
