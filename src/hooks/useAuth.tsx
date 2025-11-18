import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDeliveryBoy, setIsDeliveryBoy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const data = await api.getMe();
      setUser(data.user);
      setIsAdmin(data.user.role === 'admin');
      setIsDeliveryBoy(data.user.role === 'delivery_boy');
    } catch (error) {
      console.error('Auth check failed:', error);
      api.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    api.signOut();
    setUser(null);
    setIsAdmin(false);
    setIsDeliveryBoy(false);
  };

  return { user, isAdmin, isDeliveryBoy, loading, signOut };
};
