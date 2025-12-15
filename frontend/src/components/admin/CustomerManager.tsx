import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { 
  Loader2, 
  Users, 
  Crown, 
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Gift,
  Eye,
  Star,
  Award
} from "lucide-react";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  totalSubscriptions: number;
  totalCoupons: number;
  lastOrderDate?: string;
  createdAt: string;
}

interface CustomerStats {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  avgOrdersPerCustomer: number;
}

export const CustomerManager = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [topCustomers, setTopCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    avgOrdersPerCustomer: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('totalOrders');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [couponForm, setCouponForm] = useState({
    discountPercentage: 10,
    validDays: 30,
    message: '',
    usageLimit: 1
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
    fetchTopCustomers();
  }, [currentPage, searchTerm, sortBy, sortOrder]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.getCustomers({
        page: currentPage,
        limit: 20,
        search: searchTerm,
        sortBy,
        sortOrder
      });
      
      setCustomers(response.customers);
      setStats(response.stats);
      setTotalPages(response.pagination.pages);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTopCustomers = async () => {
    try {
      const response = await api.getTopCustomers({ limit: 10, metric: 'totalSpent' });
      setTopCustomers(response);
    } catch (error: any) {
      console.error('Failed to fetch top customers:', error);
    }
  };

  const handleViewCustomer = async (customerId: string) => {
    try {
      const customer = await api.getCustomerDetails(customerId);
      setSelectedCustomer(customer);
      setShowCustomerDetails(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch customer details",
        variant: "destructive",
      });
    }
  };

  const handleCreateCoupon = async () => {
    if (!selectedCustomer) return;

    try {
      const result = await api.createSpecialCoupon(selectedCustomer._id, {
        ...couponForm,
        message: couponForm.message || `🎉 Special ${couponForm.discountPercentage}% discount just for you, ${selectedCustomer.name}!`
      });

      toast({
        title: "Success",
        description: `Special coupon ${result.code} created and sent to ${selectedCustomer.email}`,
      });

      setShowCouponDialog(false);
      setCouponForm({
        discountPercentage: 10,
        validDays: 30,
        message: '',
        usageLimit: 1
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create special coupon",
        variant: "destructive",
      });
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 1: return <Award className="h-5 w-5 text-gray-400" />;
      case 2: return <Star className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>;
    }
  };

  const getCustomerTier = (totalOrders: number) => {
    // Customer tiers based on total number of orders:
    // VIP: 20+ orders, Gold: 10-19 orders, Silver: 5-9 orders, Bronze: 0-4 orders
    if (totalOrders >= 20) return { tier: 'VIP', color: 'bg-purple-500' };
    if (totalOrders >= 10) return { tier: 'Gold', color: 'bg-yellow-500' };
    if (totalOrders >= 5) return { tier: 'Silver', color: 'bg-gray-400' };
    return { tier: 'Bronze', color: 'bg-amber-600' };
  };

  if (loading && customers.length === 0) {
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">£{(stats.totalRevenue || 0).toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Orders/Customer</p>
                <p className="text-2xl font-bold">{(stats.avgOrdersPerCustomer || 0).toFixed(1)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all-customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-customers">
            <Users className="h-4 w-4 mr-2" />
            All Customers
          </TabsTrigger>
          <TabsTrigger value="top-customers">
            <Crown className="h-4 w-4 mr-2" />
            Top Customers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>
                View and manage all customers who have signed up or placed orders
              </CardDescription>
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="totalOrders">Total Orders</SelectItem>
                    <SelectItem value="totalSpent">Total Spent</SelectItem>
                    <SelectItem value="avgOrderValue">Avg Order Value</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="createdAt">Join Date</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No customers found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search criteria' : 'No customers have signed up yet'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {customers.map((customer) => {
                      const tier = getCustomerTier(customer.totalOrders);
                      return (
                        <div
                          key={customer._id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">{customer.name}</h3>
                                <Badge className={`${tier.color} text-white`}>
                                  {tier.tier}
                                </Badge>
                                {customer.totalOrders >= 10 && (
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    Loyal Customer
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-4 w-4" />
                                  {customer.email}
                                </div>
                                {customer.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-4 w-4" />
                                    {customer.phone}
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Joined {new Date(customer.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewCustomer(customer._id)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Total Orders:</span>
                              <p className="text-lg font-bold text-blue-600">{customer.totalOrders}</p>
                            </div>
                            <div>
                              <span className="font-medium">Total Spent:</span>
                              <p className="text-lg font-bold text-green-600">£{(customer.totalSpent || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="font-medium">Avg Order:</span>
                              <p className="text-lg font-bold text-purple-600">£{(customer.avgOrderValue || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="font-medium">Last Order:</span>
                              <p className="text-sm">
                                {customer.lastOrderDate 
                                  ? new Date(customer.lastOrderDate).toLocaleDateString()
                                  : 'Never'
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-customers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Top Customers
              </CardTitle>
              <CardDescription>
                Your most valuable customers ranked by total spending
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topCustomers.length === 0 ? (
                <div className="text-center py-8">
                  <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No top customers yet</h3>
                  <p className="text-muted-foreground">
                    Customers will appear here once they start placing orders
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topCustomers.map((customer, index) => {
                    const tier = getCustomerTier(customer.totalOrders);
                    return (
                      <div
                        key={customer._id}
                        className={`group relative bg-gradient-to-br from-background to-muted/20 border-2 rounded-xl p-5 hover:border-primary/50 hover:shadow-lg transition-all duration-200 ${
                          index < 3 ? 'border-[#c3a85c]/30 bg-gradient-to-br from-[#c3a85c]/5 via-[#c3a85c]/2 to-background' : ''
                        }`}
                      >
                        {/* Rank Badge */}
                        <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                          {getRankIcon(index)}
                        </div>

                        {/* Customer Info */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                            {customer.name?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg truncate">{customer.name}</h3>
                              <Badge className={`${tier.color} text-white text-xs`}>
                                {tier.tier}
                              </Badge>
                              {index < 3 && (
                                <Badge variant="outline" className="text-[#c3a85c] border-[#c3a85c] text-xs">
                                  Top {index + 1}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{customer.email}</p>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Total Orders</p>
                            <p className="text-xl font-bold text-blue-600">{customer.totalOrders}</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Total Spent</p>
                            <p className="text-xl font-bold text-green-600">£{(customer.totalSpent || 0).toFixed(2)}</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Avg Order</p>
                            <p className="text-xl font-bold text-purple-600">£{(customer.avgOrderValue || 0).toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCustomer(customer._id)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            className="bg-[#c3a85c] hover:bg-[#b8985a] text-white flex-1"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowCouponDialog(true);
                            }}
                          >
                            <Gift className="h-4 w-4 mr-2" />
                            Send Coupon
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Customer Details Dialog */}
      <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Complete profile and order history
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-lg">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p>{selectedCustomer.email}</p>
                    </div>
                    {selectedCustomer.phone && (
                      <div>
                        <Label className="text-sm font-medium">Phone</Label>
                        <p>{selectedCustomer.phone}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium">Member Since</Label>
                      <p>{new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Total Orders</Label>
                        <p className="text-2xl font-bold text-blue-600">{selectedCustomer.totalOrders}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Total Spent</Label>
                        <p className="text-2xl font-bold text-green-600">£{(selectedCustomer.totalSpent || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Avg Order Value</Label>
                        <p className="text-xl font-bold text-purple-600">£{(selectedCustomer.avgOrderValue || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Last Order</Label>
                        <p className="text-sm">
                          {selectedCustomer.lastOrderDate 
                            ? new Date(selectedCustomer.lastOrderDate).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              {selectedCustomer.recentOrders && selectedCustomer.recentOrders.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedCustomer.recentOrders.slice(0, 5).map((order: any) => (
                        <div key={order._id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">Order #{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">£{(order.totalAmount || 0).toFixed(2)}</p>
                            <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCustomerDetails(false)}
                >
                  Close
                </Button>
                <Button
                  className="bg-[#c3a85c] hover:bg-[#b8985a] text-white"
                  onClick={() => {
                    setShowCouponDialog(true);
                  }}
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Create Special Coupon
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Special Coupon Dialog */}
      <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Special Coupon</DialogTitle>
            <DialogDescription>
              Create a personalized coupon for {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="discountPercentage">Discount Percentage</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="discountPercentage"
                  type="number"
                  min="1"
                  max="100"
                  value={couponForm.discountPercentage}
                  onChange={(e) => setCouponForm({ 
                    ...couponForm, 
                    discountPercentage: parseInt(e.target.value) || 0 
                  })}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>

            <div>
              <Label htmlFor="validDays">Valid for (days)</Label>
              <Input
                id="validDays"
                type="number"
                min="1"
                max="365"
                value={couponForm.validDays}
                onChange={(e) => setCouponForm({ 
                  ...couponForm, 
                  validDays: parseInt(e.target.value) || 1 
                })}
              />
            </div>

            <div>
              <Label htmlFor="usageLimit">Usage Limit</Label>
              <Input
                id="usageLimit"
                type="number"
                min="1"
                max="10"
                value={couponForm.usageLimit}
                onChange={(e) => setCouponForm({ 
                  ...couponForm, 
                  usageLimit: parseInt(e.target.value) || 1 
                })}
              />
            </div>

            <div>
              <Label htmlFor="message">Personal Message</Label>
              <Textarea
                id="message"
                value={couponForm.message}
                onChange={(e) => setCouponForm({ ...couponForm, message: e.target.value })}
                placeholder={`🎉 Special ${couponForm.discountPercentage}% discount just for you, ${selectedCustomer?.name}!`}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCouponDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCoupon}
              className="bg-[#c3a85c] hover:bg-[#b8985a] text-white"
            >
              <Gift className="h-4 w-4 mr-2" />
              Create & Send Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};