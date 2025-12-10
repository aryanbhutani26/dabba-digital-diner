import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { 
  FileText, 
  Download, 
  Printer, 
  Eye, 
  RefreshCw,
  Search,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  RotateCcw
} from 'lucide-react';
import moment from 'moment';

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  status: string;
  total?: number;
  createdAt: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
    selectedSize?: string;
  }>;
  invoiceUrls?: {
    html: string;
    kitchen: string;
    data: string;
    downloadBill: string;
    downloadKitchen: string;
    reprint: string;
  };
}

export const InvoiceManager = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reprintingOrder, setReprintingOrder] = useState<string | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<string | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrdersWithInvoices(50, 0, statusFilter);
      setOrders(data.orders || []);
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      setOrders([]); // Set empty array on error
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch orders',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = async (orderId: string, type: 'bill' | 'kitchen' = 'bill') => {
    const key = `${orderId}-${type}`;
    setViewingInvoice(key);
    try {
      const htmlContent = await api.getInvoiceHtml(orderId, type);
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to view invoice',
        variant: 'destructive'
      });
    } finally {
      setViewingInvoice(null);
    }
  };

  const handleDownloadInvoice = async (orderId: string, type: 'bill' | 'kitchen' = 'bill') => {
    const key = `${orderId}-${type}`;
    setDownloadingInvoice(key);
    try {
      const blob = await api.downloadInvoice(orderId, type);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `invoice_${orderId}_${type}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: 'Download Complete',
        description: `Invoice downloaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to download invoice',
        variant: 'destructive'
      });
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const handleReprint = async (orderId: string, printerType: 'kitchen' | 'bill' | 'both' = 'both') => {
    setReprintingOrder(orderId);
    try {
      const result = await api.reprintOrder(orderId, printerType);
      
      if (result.success) {
        toast({
          title: 'Reprint Triggered',
          description: result.message,
        });
      } else {
        toast({
          title: 'Reprint Failed',
          description: result.error || 'Failed to trigger reprint',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to trigger reprint',
        variant: 'destructive'
      });
    } finally {
      setReprintingOrder(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      confirmed: 'default',
      preparing: 'secondary',
      ready: 'secondary',
      delivered: 'default',
      cancelled: 'destructive'
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customerPhone && order.customerPhone.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Manager
          </CardTitle>
          <CardDescription>
            View, download, and reprint invoices for all orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, customer name, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchOrders} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Order Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">£{parseFloat(order.total?.toString() || '0').toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          {moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{order.customerName}</span>
                        </div>
                        {order.customerPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{order.customerPhone}</span>
                          </div>
                        )}
                        {order.customerEmail && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{order.customerEmail}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        {order.deliveryAddress && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-xs">{order.deliveryAddress}</span>
                          </div>
                        )}
                        {order.paymentMethod && (
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">{order.paymentMethod}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Items Summary */}
                    <div className="text-sm text-muted-foreground">
                      <strong>Items:</strong> {order.items?.map(item => 
                        `${item.quantity}x ${item.name}${item.selectedSize ? ` (${item.selectedSize})` : ''}`
                      ).join(', ') || 'No items'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-48">
                    <div className="text-sm font-medium mb-2">Invoice Actions</div>
                    
                    {/* View Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleViewInvoice(order._id, 'bill')}
                        variant="outline"
                        size="sm"
                        disabled={!order._id || viewingInvoice === `${order._id}-bill`}
                      >
                        {viewingInvoice === `${order._id}-bill` ? (
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4 mr-1" />
                        )}
                        Bill
                      </Button>
                      <Button
                        onClick={() => handleViewInvoice(order._id, 'kitchen')}
                        variant="outline"
                        size="sm"
                        disabled={!order._id || viewingInvoice === `${order._id}-kitchen`}
                      >
                        {viewingInvoice === `${order._id}-kitchen` ? (
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4 mr-1" />
                        )}
                        Kitchen
                      </Button>
                    </div>

                    {/* Download Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleDownloadInvoice(order._id, 'bill')}
                        variant="outline"
                        size="sm"
                        disabled={!order._id || downloadingInvoice === `${order._id}-bill`}
                      >
                        {downloadingInvoice === `${order._id}-bill` ? (
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-1" />
                        )}
                        Bill
                      </Button>
                      <Button
                        onClick={() => handleDownloadInvoice(order._id, 'kitchen')}
                        variant="outline"
                        size="sm"
                        disabled={!order._id || downloadingInvoice === `${order._id}-kitchen`}
                      >
                        {downloadingInvoice === `${order._id}-kitchen` ? (
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-1" />
                        )}
                        Kitchen
                      </Button>
                    </div>

                    {/* Reprint Button */}
                    <Button
                      onClick={() => handleReprint(order._id, 'both')}
                      disabled={reprintingOrder === order._id || !order._id}
                      variant="default"
                      size="sm"
                      className="w-full"
                    >
                      {reprintingOrder === order._id ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4 mr-2" />
                      )}
                      Reprint Both
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};