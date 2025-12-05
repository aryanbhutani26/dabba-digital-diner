import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface DeliveryBoyRedirectProps {
  children: React.ReactNode;
}

export const DeliveryBoyRedirect = ({ children }: DeliveryBoyRedirectProps) => {
  const { isDeliveryBoy, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isDeliveryBoy) {
      navigate("/delivery");
    }
  }, [isDeliveryBoy, loading, navigate]);

  if (loading) {
    return null;
  }

  if (isDeliveryBoy) {
    return null;
  }

  return <>{children}</>;
};
