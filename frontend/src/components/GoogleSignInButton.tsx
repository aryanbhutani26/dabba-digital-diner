import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
}

export const GoogleSignInButton = ({ onSuccess }: GoogleSignInButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if Google Client ID is configured
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      console.warn('Google Client ID not configured');
      return;
    }

    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      try {
        // @ts-ignore
        if (window.google && window.google.accounts) {
          // @ts-ignore
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          setGoogleLoaded(true);
        }
      } catch (error) {
        console.error('Google Sign-In initialization error:', error);
        setGoogleLoaded(false);
      }
    };

    script.onerror = () => {
      console.error('Failed to load Google Sign-In script');
      setGoogleLoaded(false);
    };

    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {
        // Script might already be removed
      }
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) {
      toast({
        title: 'Google Sign-In Error',
        description: 'No credential received. Please try email/password sign-in.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const data = await api.googleSignIn(response.credential);
      
      toast({
        title: 'Welcome!',
        description: `Signed in as ${data.user.name}`,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      }
    } catch (error: any) {
      console.error('Google Sign-In API error:', error);
      toast({
        title: 'Sign-In Failed',
        description: 'Please try using email and password instead.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (googleLoaded) {
      try {
        // @ts-ignore
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // FedCM is disabled or blocked
            toast({
              title: "Google Sign-In Unavailable",
              description: "Please enable third-party cookies or use email/password sign-in instead.",
              variant: "destructive",
            });
          }
        });
      } catch (error) {
        console.error('Google Sign-In error:', error);
        toast({
          title: "Google Sign-In Error",
          description: "Please try using email/password sign-in instead.",
          variant: "destructive",
        });
      }
    }
  };

  // Don't render if Google Client ID is not configured
  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return (
      <div className="w-full text-center py-4">
        <p className="text-sm text-muted-foreground">
          Google Sign-In is not configured. Please use email/password.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleGoogleSignIn}
        disabled={loading || !googleLoaded}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : !googleLoaded ? (
          <div className="h-5 w-5 mr-3 bg-gray-300 rounded animate-pulse" />
        ) : (
          <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {loading ? 'Signing in...' : !googleLoaded ? 'Loading Google...' : 'Continue with Google'}
      </Button>
      
      {!googleLoaded && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Having trouble? Use email/password sign-in below
        </p>
      )}
    </div>
  );
};
