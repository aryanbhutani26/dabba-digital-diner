import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Loader2, User, MapPin, Package, Plus, Trash2, Truck, FileText, IdCard } from "lucide-react";
import { AddressInput } from "@/components/AddressInput";
import { AddressMapPicker, AddressData } from "@/components/AddressMapPicker";
import { Home, Briefcase, Clock } from "lucide-react";

const Account = () => {
  const { user, loading: authLoading, isDeliveryBoy } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
    vehicleType: '',
    vehicleNumber: '',
    vehicleModel: '',
  });
  const [newAddress, setNewAddress] = useState('');
  const [addressCoordinates, setAddressCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [showAddressMap, setShowAddressMap] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      const [profileData, ordersData] = await Promise.all([
        api.getUserProfile(),
        api.getUserOrders(),
      ]);
      setProfile(profileData);
      setOrders(ordersData);
      setFormData({
        name: profileData.name || '',
        phone: profileData.phone || '',
        licenseNumber: profileData.licenseNumber || '',
        vehicleType: profileData.vehicleType || '',
        vehicleNumber: profileData.vehicleNumber || '',
        vehicleModel: profileData.vehicleModel || '',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await api.updateUserProfile(formData);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setEditMode(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.trim()) return;

    try {
      const addressData = {
        address: newAddress,
        coordinates: addressCoordinates
      };
      const addresses = [...(profile.addresses || []), addressData];
      await api.updateUserProfile({ addresses });
      toast({
        title: "Success",
        description: "Address added successfully",
      });
      setNewAddress('');
      setAddressCoordinates(null);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add address",
        variant: "destructive",
      });
    }
  };

  const handleSaveMapAddress = async (addressData: AddressData) => {
    try {
      const fullAddress = [
        addressData.flatNumber,
        addressData.address,
        addressData.landmark && `Near ${addressData.landmark}`
      ].filter(Boolean).join(', ');

      const newAddressData = {
        label: addressData.label,
        customLabel: addressData.customLabel,
        address: fullAddress,
        flatNumber: addressData.flatNumber,
        landmark: addressData.landmark,
        coordinates: addressData.coordinates
      };

      const addresses = [...(profile.addresses || []), newAddressData];
      await api.updateUserProfile({ addresses });
      
      toast({
        title: "Success",
        description: "Address saved successfully",
      });
      
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save address",
        variant: "destructive",
      });
    }
  };

  const getAddressIcon = (label: string) => {
    switch (label) {
      case 'Home':
        return <Home className="h-5 w-5" />;
      case 'Work':
        return <Briefcase className="h-5 w-5" />;
      default:
        return <MapPin className="h-5 w-5" />;
    }
  };

  const getAddressLabel = (address: any) => {
    if (typeof address === 'string') return 'Other';
    return address.customLabel || address.label || 'Other';
  };

  const handleDeleteAddress = async (index: number) => {
    try {
      const addresses = profile.addresses.filter((_: any, i: number) => i !== index);
      await api.updateUserProfile({ addresses });
      toast({
        title: "Success",
        description: "Address removed successfully",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove address",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: "bg-gray-500",
      assigned: "bg-blue-500",
      picked_up: "bg-yellow-500",
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Account</h1>
            <p className="text-muted-foreground">Manage your profile and orders</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              {!isDeliveryBoy && (
                <TabsTrigger value="addresses">
                  <MapPin className="h-4 w-4 mr-2" />
                  Addresses
                </TabsTrigger>
              )}
              {isDeliveryBoy && (
                <TabsTrigger value="vehicle">
                  <Truck className="h-4 w-4 mr-2" />
                  Vehicle Info
                </TabsTrigger>
              )}
              <TabsTrigger value="orders">
                <Package className="h-4 w-4 mr-2" />
                {isDeliveryBoy ? 'Deliveries' : 'Orders'}
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!editMode}
                      placeholder="+44 7700 900000"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Required for order delivery and communication
                    </p>
                  </div>
                  {isDeliveryBoy && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 mb-4">
                        <IdCard className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">License Information</h3>
                      </div>
                      <div>
                        <Label htmlFor="licenseNumber">License Number</Label>
                        <Input
                          id="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                          disabled={!editMode}
                          placeholder="DL1234567890"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {editMode ? (
                      <>
                        <Button onClick={handleUpdateProfile}>Save Changes</Button>
                        <Button variant="outline" onClick={() => setEditMode(false)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vehicle Info Tab (Delivery Boys Only) */}
            {isDeliveryBoy && (
              <TabsContent value="vehicle">
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Information</CardTitle>
                    <CardDescription>Manage your delivery vehicle details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vehicleType">Vehicle Type</Label>
                        <Input
                          id="vehicleType"
                          value={formData.vehicleType}
                          onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                          disabled={!editMode}
                          placeholder="Bike / Scooter / Car"
                        />
                      </div>
                      <div>
                        <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                        <Input
                          id="vehicleNumber"
                          value={formData.vehicleNumber}
                          onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                          disabled={!editMode}
                          placeholder="DL01AB1234"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="vehicleModel">Vehicle Model</Label>
                        <Input
                          id="vehicleModel"
                          value={formData.vehicleModel}
                          onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                          disabled={!editMode}
                          placeholder="Honda Activa / Hero Splendor"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Documents</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <IdCard className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Driving License</p>
                              <p className="text-sm text-muted-foreground">
                                {formData.licenseNumber || 'Not provided'}
                              </p>
                            </div>
                          </div>
                          <Badge variant={formData.licenseNumber ? "default" : "secondary"}>
                            {formData.licenseNumber ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {editMode ? (
                        <>
                          <Button onClick={handleUpdateProfile}>Save Changes</Button>
                          <Button variant="outline" onClick={() => setEditMode(false)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setEditMode(true)}>Edit Vehicle Info</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Addresses Tab */}
            {!isDeliveryBoy && (
              <TabsContent value="addresses">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Choose a delivery address</h2>
                      <p className="text-muted-foreground">Multiple addresses in this location</p>
                    </div>
                    <Button onClick={() => setShowAddressMap(true)} size="lg">
                      <Plus className="h-5 w-5 mr-2" />
                      Add New Address
                    </Button>
                  </div>

                  {/* Addresses Grid */}
                  {profile?.addresses && profile.addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.addresses.map((address: any, index: number) => {
                        const addressText = typeof address === 'string' ? address : address.address;
                        const label = getAddressLabel(address);
                        const hasDetails = typeof address === 'object' && (address.flatNumber || address.landmark);
                        
                        return (
                          <Card key={index} className="relative hover:shadow-lg transition-all">
                            <CardContent className="p-6">
                              {/* Label Icon & Name */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    {getAddressIcon(typeof address === 'object' ? address.label : 'Other')}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-lg">{label}</h3>
                                    {hasDetails && address.flatNumber && (
                                      <p className="text-sm text-muted-foreground">{address.flatNumber}</p>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteAddress(index)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Address Text */}
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {addressText}
                              </p>

                              {/* Landmark */}
                              {hasDetails && address.landmark && (
                                <p className="text-xs text-muted-foreground mb-4">
                                  📍 Near {address.landmark}
                                </p>
                              )}

                              {/* Delivery Time Estimate */}
                              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4">
                                <Clock className="h-4 w-4" />
                                <span>25-30 MINS</span>
                              </div>

                              {/* Deliver Here Button */}
                              <Button className="w-full" variant="default">
                                DELIVER HERE
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No saved addresses</h3>
                        <p className="text-muted-foreground mb-6">
                          Add your first delivery address to get started
                        </p>
                        <Button onClick={() => setShowAddressMap(true)} size="lg">
                          <Plus className="h-5 w-5 mr-2" />
                          Add Address
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Address Map Picker Dialog */}
                <AddressMapPicker
                  open={showAddressMap}
                  onClose={() => setShowAddressMap(false)}
                  onSave={handleSaveMapAddress}
                />
              </TabsContent>
            )}

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>View your past orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg text-muted-foreground">No orders yet</p>
                      <Button asChild className="mt-4">
                        <a href="/menu">Browse Menu</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order._id}
                          className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                          onClick={() => navigate(`/order-confirmation?id=${order._id}`)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p>{order.items?.length} items</p>
                            <p className="font-semibold">Total: £{order.totalAmount}</p>
                          </div>
                        </div>
                      ))}
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

export default Account;
