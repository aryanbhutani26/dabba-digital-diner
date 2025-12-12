import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Store, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  TestTube,
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react';

interface POSConfig {
  enabled: boolean;
  serverUrl: string;
  integrationMethod: string;
  hasApiKey: boolean;
  hasCredentials: boolean;
}

export const POSIntegrationDashboard = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<POSConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchPOSConfig();
  }, []);

  const fetchPOSConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pos-integration/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Failed to fetch POS config:', error);
    } finally {
      setLoading(false);
    }
  };

  const testPOSConnection = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/pos-integration/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'POS Test Successful',
          description: 'Successfully connected to POS system',
        });
      } else {
        toast({
          title: 'POS Test Failed',
          description: data.error || 'Failed to connect to POS system',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to test POS connection',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const testPOSPrint = async (printerType: 'kitchen' | 'bill' | 'both' = 'both') => {
    try {
      const response = await fetch('/api/pos-integration/test-print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ printerType })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Test Print Sent',
          description: `Test print sent to ${printerType} printer(s) via POS system`,
        });
      } else {
        toast({
          title: 'Test Print Failed',
          description: data.error || 'Failed to send test print',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send test print',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!config) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <p className="text-muted-foreground">Failed to load POS configuration</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* POS System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            POS System Integration
          </CardTitle>
          <CardDescription>
            Connect to your existing Point of Sale system for automatic printing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {config.enabled ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  {config.enabled ? 'POS Integration Enabled' : 'POS Integration Disabled'}
                </span>
              </div>
              {config.enabled && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Settings className="h-3 w-3" />
                  {config.integrationMethod.toUpperCase()}
                </Badge>
              )}
            </div>
            <Button onClick={fetchPOSConfig} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Details */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Status</CardTitle>
          <CardDescription>Current POS integration settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Server URL:</span>
                <span className="text-sm text-muted-foreground">
                  {config.serverUrl}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Integration Method:</span>
                <Badge variant="outline">
                  {config.integrationMethod.toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Key:</span>
                {config.hasApiKey ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Credentials:</span>
                {config.hasCredentials ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Section */}
      {config.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Testing & Diagnostics</CardTitle>
            <CardDescription>Test your POS system connection and printing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={testPOSConnection}
                disabled={testing}
                variant="outline"
              >
                {testing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wifi className="h-4 w-4 mr-2" />
                )}
                Test Connection
              </Button>
              
              <Button
                onClick={() => testPOSPrint('kitchen')}
                variant="outline"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Kitchen Print
              </Button>
              
              <Button
                onClick={() => testPOSPrint('bill')}
                variant="outline"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Bill Print
              </Button>
              
              <Button
                onClick={() => testPOSPrint('both')}
                variant="default"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Both Printers
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Instructions */}
      {!config.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Setup POS Integration</CardTitle>
            <CardDescription>Connect to your existing POS system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                🏪 Use Your Existing POS System
              </h4>
              <p className="text-sm text-blue-800 mb-3">
                Since you're already using thermal printers with your POS system, 
                we can integrate directly with your current setup for faster and more reliable printing.
              </p>
              <div className="text-sm text-blue-700">
                <strong>We need from you:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Your POS system's server URL/IP address</li>
                  <li>API endpoint for print requests</li>
                  <li>Authentication details (API key or credentials)</li>
                  <li>Data format your POS system expects</li>
                </ul>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Benefits:</strong> No new software installation, uses your proven printer setup, 
                faster deployment, and familiar troubleshooting process.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};