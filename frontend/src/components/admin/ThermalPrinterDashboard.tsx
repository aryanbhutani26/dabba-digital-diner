import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { 
  Printer, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  RefreshCw,
  TestTube,
  RotateCcw,
  Trash2,
  Activity
} from 'lucide-react';

interface PrinterStatus {
  name: string;
  ip: string;
  port: number;
  status: 'online' | 'offline' | 'error' | 'timeout' | 'unknown';
  enabled: boolean;
  lastCheck: string | null;
  errorCount: number;
  successCount: number;
}

interface QueueStatus {
  queueLength: number;
  isProcessing: boolean;
  pendingJobs: number;
  processingJobs: number;
}

export const ThermalPrinterDashboard = () => {
  const { toast } = useToast();
  const [printers, setPrinters] = useState<Record<string, PrinterStatus>>({});
  const [queueStatus, setQueueStatus] = useState<QueueStatus>({
    queueLength: 0,
    isProcessing: false,
    pendingJobs: 0,
    processingJobs: 0
  });
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testingPrinter, setTestingPrinter] = useState<string | null>(null);

  useEffect(() => {
    fetchPrinterStatus();
    const interval = setInterval(fetchPrinterStatus, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPrinterStatus = async () => {
    try {
      const data = await api.getThermalPrinterStatus();
      setPrinters(data.printers);
      setQueueStatus(data.queue);
      setEnabled(data.enabled);
    } catch (error) {
      console.error('Failed to fetch printer status:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch printer status. Make sure you are logged in as admin.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const testPrint = async (printerId: string) => {
    setTestingPrinter(printerId);
    try {
      const data = await api.testThermalPrint(printerId);
      
      if (data.success) {
        toast({
          title: 'Test Print Sent',
          description: `Test receipt sent to ${printerId} printer`,
        });
      } else {
        toast({
          title: 'Test Print Failed',
          description: data.error,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send test print',
        variant: 'destructive'
      });
    } finally {
      setTestingPrinter(null);
    }
  };

  const togglePrinter = async (printerId: string, enabled: boolean) => {
    try {
      const data = await api.toggleThermalPrinter(printerId, enabled);
      
      if (data.success) {
        toast({
          title: 'Printer Updated',
          description: `${printerId} printer ${enabled ? 'enabled' : 'disabled'}`,
        });
        fetchPrinterStatus();
      } else {
        toast({
          title: 'Update Failed',
          description: data.error,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update printer',
        variant: 'destructive'
      });
    }
  };

  const processQueue = async () => {
    try {
      const data = await api.processThermalPrintQueue();
      
      if (data.success) {
        toast({
          title: 'Queue Processing',
          description: 'Print queue processing triggered',
        });
        fetchPrinterStatus();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process queue',
        variant: 'destructive'
      });
    }
  };

  const clearQueue = async () => {
    try {
      const data = await api.clearThermalPrintQueue();
      
      if (data.success) {
        toast({
          title: 'Queue Cleared',
          description: data.message,
        });
        fetchPrinterStatus();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to clear queue',
        variant: 'destructive'
      });
    }
  };

  const resetPrinterStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/thermal-printers/reset-stats', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Statistics Reset',
          description: 'Printer statistics have been reset',
        });
        fetchPrinterStatus();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to reset statistics',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'timeout':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      online: 'default',
      offline: 'destructive',
      timeout: 'secondary',
      error: 'destructive',
      unknown: 'outline'
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Thermal Printing System
          </CardTitle>
          <CardDescription>
            BTP-R180II ESC/POS thermal printers on TCP port 9100
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium">
                  System {enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              {enabled && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Auto-printing Active
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchPrinterStatus} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={resetPrinterStats} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Stats
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Queue Status */}
      <Card>
        <CardHeader>
          <CardTitle>Print Queue</CardTitle>
          <CardDescription>Current printing queue status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{queueStatus.queueLength}</div>
              <div className="text-sm text-muted-foreground">Total Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{queueStatus.pendingJobs}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{queueStatus.processingJobs}</div>
              <div className="text-sm text-muted-foreground">Processing</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${queueStatus.isProcessing ? 'text-green-500' : 'text-gray-500'}`}>
                {queueStatus.isProcessing ? 'Active' : 'Idle'}
              </div>
              <div className="text-sm text-muted-foreground">Queue Status</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={processQueue} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Process Queue
            </Button>
            {queueStatus.queueLength > 0 && (
              <Button onClick={clearQueue} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Queue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Printer Status Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(printers).map(([id, printer]) => (
          <Card key={id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(printer.status)}
                  {printer.name}
                </div>
                {getStatusBadge(printer.status)}
              </CardTitle>
              <CardDescription>
                {printer.ip}:{printer.port}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Printer Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-green-600">{printer.successCount}</div>
                  <div className="text-muted-foreground">Successful Prints</div>
                </div>
                <div>
                  <div className="font-medium text-red-600">{printer.errorCount}</div>
                  <div className="text-muted-foreground">Failed Prints</div>
                </div>
              </div>

              {/* Last Check */}
              {printer.lastCheck && (
                <div className="text-sm text-muted-foreground">
                  Last checked: {new Date(printer.lastCheck).toLocaleString()}
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={printer.enabled}
                    onCheckedChange={(checked) => togglePrinter(id, checked)}
                  />
                  <span className="text-sm">Enabled</span>
                </div>
                
                <Button
                  onClick={() => testPrint(id)}
                  disabled={!printer.enabled || testingPrinter === id}
                  variant="outline"
                  size="sm"
                >
                  {testingPrinter === id ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Test Print
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};