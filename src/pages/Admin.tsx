import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, Edit } from "lucide-react";

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
    
    const [settingsRes, couponsRes, navRes, menuRes] = await Promise.all([
      supabase.from("site_settings").select("*"),
      supabase.from("coupons").select("*"),
      supabase.from("navbar_items").select("*").order("sort_order"),
      supabase.from("menu_items").select("*"),
    ]);

    if (settingsRes.data) {
      const servicesSetting = settingsRes.data.find(s => s.key === "services_visible");
      setServicesVisible(servicesSetting?.value === true);
    }

    setCoupons(couponsRes.data || []);
    setNavItems(navRes.data || []);
    setMenuItems(menuRes.data || []);
    setLoading(false);
  };

  const toggleServicesVisibility = async () => {
    const newValue = !servicesVisible;
    const { error } = await supabase
      .from("site_settings")
      .update({ value: newValue })
      .eq("key", "services_visible");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update services visibility",
        variant: "destructive",
      });
    } else {
      setServicesVisible(newValue);
      toast({
        title: "Success",
        description: `Services section ${newValue ? "enabled" : "disabled"}`,
      });
    }
  };

  const deleteCoupon = async (id: string) => {
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Coupon deleted" });
      fetchData();
    }
  };

  const deleteNavItem = async (id: string) => {
    const { error } = await supabase.from("navbar_items").delete().eq("id", id);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete navigation item",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Navigation item deleted" });
      fetchData();
    }
  };

  const deleteMenuItem = async (id: string) => {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Menu item deleted" });
      fetchData();
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
                  <CardTitle>Manage Coupons</CardTitle>
                  <CardDescription>Add, edit, or remove coupons</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {coupons.map((coupon) => (
                      <div
                        key={coupon.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-semibold">{coupon.title}</h3>
                          <p className="text-sm text-muted-foreground">{coupon.code}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteCoupon(coupon.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="navigation">
              <Card>
                <CardHeader>
                  <CardTitle>Navigation Items</CardTitle>
                  <CardDescription>Manage navigation menu items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {navItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.path}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteNavItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="menu">
              <Card>
                <CardHeader>
                  <CardTitle>Menu Items</CardTitle>
                  <CardDescription>Manage restaurant menu items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {menuItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.price} • {item.category}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteMenuItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
