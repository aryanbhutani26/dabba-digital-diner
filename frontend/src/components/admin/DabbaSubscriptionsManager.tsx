import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Loader2, Search, Eye, Phone, MapPin, Clock, User, Package, Mail } from "lucide-react";

interface User {
  name?: string;
  email?: string;
  phone?: string;
  addresses?: any[];
  createdAt?: string;
}

interface Subscription {
  _id: string;
  serviceName: string;
  servicePrice: number;
  pricingPeriod: string;
  startDate: string;
  deliveryTime: string;
  phoneNumber: string;
  fulfillmentType: string;
  deliveryAddress?: string;
  pickupLocation?: string;
  specialInstructions?: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  orderCount?: number;
}

export const DabbaSubscriptionsManager = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      console.log('Fetching dabba subscriptions...');
      const data = await api.getAllDabbaSubscriptions();
      console.log('Received subscriptions data:', data);
      console.log('Number of subscriptions:', Array.isArray(data) ? data.length : 'Not an array');
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      toast({
        title: "Error",
        description: `Failed to fetch subscriptions: ${error.message}`,
        variant: "destructive",
      });
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (subscriptionId: string, newStatus: string) => {
    try {
      await api.updateDabbaSubscriptionStatus(subscriptionId, newStatus);
      toast({
        title: "Success",
        description: "Subscription status updated successfully",
      });
      fetchSubscriptions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription status",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = async (subscriptionId: string) => {
    try {
      const details = await api.getDabbaSubscriptionDetails(subscriptionId);
      setSelectedSubscription(details);
      setDetailsDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch subscription details",
        variant: "destructive",
      });
    }
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const userName = subscription.user?.name || 'Unknown User';
    const userEmail = subscription.user?.email || 'unknown@example.com';
    
    const matchesSearch = 
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.phoneNumber.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || subscription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-[#c3a85c]';
      case 'paused': return 'bg-orange-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dabba Subscriptions Management</CardTitle>
          <CardDescription>
            Manage customer Dabba service subscriptions and view detailed information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, email, service, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subscriptions List */}
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Subscriptions Found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" 
                  ? "No subscriptions match your current filters."
                  : "No customers have subscribed to Dabba services yet."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubscriptions.map((subscription) => (
                <div
                  key={subscription._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{subscription.user?.name || 'Unknown User'}</h3>
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {subscription.user?.email || 'unknown@example.com'}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {subscription.serviceName} - £{subscription.servicePrice}/{subscription.pricingPeriod}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(subscription._id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Start: {new Date(subscription.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{subscription.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{subscription.fulfillmentType}</span>
                    </div>
                  </div>

                  {subscription.status !== 'cancelled' && (
                    <div className="flex gap-2">
                      <Select
                        value={subscription.status}
                        onValueChange={(value) => handleStatusUpdate(subscription._id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogDescription>
              Complete information about the customer and their subscription
            </DialogDescription>
          </DialogHeader>

          {selectedSubscription && (
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Name:</span>
                      <p>{selectedSubscription.user?.name || 'Unknown User'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <p>{selectedSubscription.user?.email || 'unknown@example.com'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>
                      <p>{selectedSubscription.user?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Member Since:</span>
                      <p>{selectedSubscription.user?.createdAt ? new Date(selectedSubscription.user.createdAt).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Total Orders:</span>
                      <p>{selectedSubscription.orderCount || 0}</p>
                    </div>
                  </div>

                  {selectedSubscription.user?.addresses && selectedSubscription.user.addresses.length > 0 && (
                    <div>
                      <span className="font-medium">Saved Addresses:</span>
                      <div className="mt-2 space-y-2">
                        {selectedSubscription.user.addresses.map((address: any, index: number) => (
                          <div key={index} className="p-2 bg-muted rounded text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{address.label || 'Address'}</Badge>
                            </div>
                            <p>{address.address}</p>
                            {address.flatNumber && <p>Flat: {address.flatNumber}</p>}
                            {address.landmark && <p>Landmark: {address.landmark}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Subscription Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Subscription Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Service:</span>
                      <p>{selectedSubscription.serviceName}</p>
                    </div>
                    <div>
                      <span className="font-medium">Price:</span>
                      <p>£{selectedSubscription.servicePrice}/{selectedSubscription.pricingPeriod}</p>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <Badge className={getStatusColor(selectedSubscription.status)}>
                        {selectedSubscription.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Payment Status:</span>
                      <Badge className={selectedSubscription.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-red-500'}>
                        {selectedSubscription.paymentStatus}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Start Date:</span>
                      <p>{new Date(selectedSubscription.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Delivery Time:</span>
                      <p>{selectedSubscription.deliveryTime}</p>
                    </div>
                    <div>
                      <span className="font-medium">Contact Phone:</span>
                      <p>{selectedSubscription.phoneNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium">Fulfillment:</span>
                      <p className="capitalize">{selectedSubscription.fulfillmentType}</p>
                    </div>
                  </div>

                  {selectedSubscription.deliveryAddress && (
                    <div>
                      <span className="font-medium">Delivery Address:</span>
                      <p className="mt-1 p-2 bg-muted rounded">{selectedSubscription.deliveryAddress}</p>
                    </div>
                  )}

                  {selectedSubscription.pickupLocation && (
                    <div>
                      <span className="font-medium">Pickup Location:</span>
                      <p className="mt-1 p-2 bg-muted rounded">{selectedSubscription.pickupLocation}</p>
                    </div>
                  )}

                  {selectedSubscription.specialInstructions && (
                    <div>
                      <span className="font-medium">Special Instructions:</span>
                      <p className="mt-1 p-2 bg-muted rounded">{selectedSubscription.specialInstructions}</p>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    <p>Subscribed on: {new Date(selectedSubscription.createdAt).toLocaleString()}</p>
                    <p>Last updated: {new Date(selectedSubscription.updatedAt).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};