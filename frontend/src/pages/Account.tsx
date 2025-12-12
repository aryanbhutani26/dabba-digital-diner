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
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    licenseNumber: '',
    vehicleType: '',
    vehicleNumber: '',
    vehicleModel: '',
  });
  const [phoneError, setPhoneError] = useState('');
  const [dobError, setDobError] = useState('');
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

  const validatePhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Remove country codes (common ones: +44, +91, +1, etc.)
    let cleanPhone = digitsOnly;
    
    // Remove UK country code (+44)
    if (cleanPhone.startsWith('44') && cleanPhone.length > 10) {
      cleanPhone = cleanPhone.substring(2);
    }
    // Remove other common country codes
    else if (cleanPhone.startsWith('91') && cleanPhone.length > 10) {
      cleanPhone = cleanPhone.substring(2);
    }
    else if (cleanPhone.startsWith('1') && cleanPhone.length === 11) {
      cleanPhone = cleanPhone.substring(1);
    }
    
    return cleanPhone;
  };

  const handlePhoneChange = (value: string) => {
    const cleanPhone = validatePhoneNumber(value);
    setFormData({ ...formData, phone: cleanPhone });
    
    // Validate phone number
    if (cleanPhone.length === 0) {
      setPhoneError('Phone number is required');
    } else if (cleanPhone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
    } else if (!/^\d{10}$/.test(cleanPhone)) {
      setPhoneError('Phone number must contain only digits');
    } else {
      setPhoneError('');
    }
  };

  const handleDobChange = (value: string) => {
    setFormData({ ...formData, dateOfBirth: value });
    
    // Validate date of birth
    if (!value) {
      setDobError('Date of birth is required');
      return;
    }

    const selectedDate = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();
    
    if (selectedDate > today) {
      setDobError('Date of birth cannot be in the future');
    } else if (age < 13 || (age === 13 && monthDiff < 0)) {
      setDobError('You must be at least 13 years old');
    } else if (age > 120) {
      setDobError('Please enter a valid date of birth');
    } else {
      setDobError('');
    }
  };

  const fetchData = async () => {
    try {
      const [profileData, ordersData, subscriptionsData] = await Promise.all([
        api.getUserProfile(),
        api.getUserOrders(),
        api.getMyDabbaSubscriptions().catch(() => []),
      ]);
      setProfile(profileData);
      setOrders(ordersData);
      setSubscriptions(subscriptionsData);
      setFormData({
        name: profileData.name || '',
        phone: profileData.phone || '',
        dateOfBirth: profileData.dateOfBirth ? profileData.dateOfBirth.split('T')[0] : '',
        licenseNumber: profileData.licenseNumber || '',
        vehicleType: profileData.vehicleType || '',
        vehicleNumber: profileData.vehicleNumber || '',
        vehicleModel: profileData.vehicleModel || '',
      });
      
      // Reset errors when loading existing data
      setPhoneError('');
      setDobError('');
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
    // Validate phone number before submitting
    if (formData.phone && phoneError) {
      toast({
        title: "Validation Error",
        description: phoneError,
        variant: "destructive",
      });
      return;
    }

    if (formData.phone && formData.phone.length !== 10) {
      toast({
        title: "Validation Error",
        description: "Phone number must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }

    // Validate date of birth before submitting
    if (!formData.dateOfBirth) {
      toast({
        title: "Validation Error",
        description: "Date of birth is required",
        variant: "destructive",
      });
      return;
    }

    if (dobError) {
      toast({
        title: "Validation Error",
        description: dobError,
        variant: "destructive",
      });
      return;
    }

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
      picked_up: "bg-[#c3a85c]",
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
              {!isDeliveryBoy && (
                <TabsTrigger value="subscriptions">
                  <FileText className="h-4 w-4 mr-2" />
                  Dabba Subscriptions
                </TabsTrigger>
              )}
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
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      disabled={!editMode}
                      placeholder="1234567890"
                      required
                      className={phoneError ? "border-red-500" : ""}
                    />
                    {phoneError && (
                      <p className="text-xs text-red-500 mt-1">
                        {phoneError}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter 10-digit phone number (country code will be removed automatically)
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleDobChange(e.target.value)}
                      disabled={!editMode}
                      required
                      className={dobError ? "border-red-500" : ""}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    {dobError && (
                      <p className="text-xs text-red-500 mt-1">
                        {dobError}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Required for birthday promotions and age verification
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
                        <Button 
                          onClick={handleUpdateProfile}
                          disabled={!!phoneError || !!dobError || (formData.phone && formData.phone.length !== 10) || !formData.dateOfBirth}
                        >
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setEditMode(false);
                          setPhoneError('');
                          setDobError('');
                        }}>
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
                          <Button 
                            onClick={handleUpdateProfile}
                            disabled={!!phoneError || !!dobError || (formData.phone && formData.phone.length !== 10) || !formData.dateOfBirth}
                          >
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => {
                            setEditMode(false);
                            setPhoneError('');
                            setDobError('');
                          }}>
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

            {/* Dabba Subscriptions Tab */}
            {!isDeliveryBoy && (
              <TabsContent value="subscriptions">
                <Card>
                  <CardHeader>
                    <CardTitle>My Dabba Subscriptions</CardTitle>
                    <CardDescription>
                      Manage your active Dabba service subscriptions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {subscriptions.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Subscriptions Yet</h3>
                        <p className="text-muted-foreground mb-4">
                          You haven't subscribed to any Dabba services yet.
                        </p>
                        <Button asChild>
                          <a href="/services">Browse Dabba Services</a>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {subscriptions.map((subscription) => (
                          <div
                            key={subscription._id}
                            className="border rounded-lg p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{subscription.serviceName}</h3>
                                <p className="text-sm text-muted-foreground">
                                  £{subscription.servicePrice}/{subscription.pricingPeriod}
                                </p>
                              </div>
                              <Badge
                                className={
                                  subscription.status === 'active' ? 'bg-green-500' :
                                  subscription.status === 'pending' ? 'bg-[#c3a85c]' :
                                  subscription.status === 'paused' ? 'bg-orange-500' :
                                  'bg-red-500'
                                }
                              >
                                {subscription.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Start Date:</span>
                                <p>{new Date(subscription.startDate).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <span className="font-medium">Delivery Time:</span>
                                <p>{subscription.deliveryTime}</p>
                              </div>
                              <div>
                                <span className="font-medium">Phone:</span>
                                <p>{subscription.phoneNumber}</p>
                              </div>
                              <div>
                                <span className="font-medium">Fulfillment:</span>
                                <p className="capitalize">{subscription.fulfillmentType}</p>
                              </div>
                            </div>

                            {subscription.deliveryAddress && (
                              <div className="text-sm">
                                <span className="font-medium">Delivery Address:</span>
                                <p>{subscription.deliveryAddress}</p>
                              </div>
                            )}

                            {subscription.pickupLocation && (
                              <div className="text-sm">
                                <span className="font-medium">Pickup Location:</span>
                                <p>{subscription.pickupLocation}</p>
                              </div>
                            )}

                            {subscription.specialInstructions && (
                              <div className="text-sm">
                                <span className="font-medium">Special Instructions:</span>
                                <p>{subscription.specialInstructions}</p>
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              {subscription.status === 'active' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      await api.cancelDabbaSubscription(subscription._id);
                                      toast({
                                        title: "Subscription Cancelled",
                                        description: "Your subscription has been cancelled successfully",
                                      });
                                      fetchData();
                                    } catch (error: any) {
                                      toast({
                                        title: "Error",
                                        description: error.message || "Failed to cancel subscription",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                >
                                  Cancel Subscription
                                </Button>
                              )}
                              <div className="text-xs text-muted-foreground flex items-center">
                                Subscribed on {new Date(subscription.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
