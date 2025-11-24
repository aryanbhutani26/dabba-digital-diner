import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Calendar, Tag, TrendingDown } from "lucide-react";

const Specials = () => {
  const [promotions, setPromotions] = useState<any[]>([]);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const data = await api.getActivePromotions();
      setPromotions(data);
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">Special Offers & Events</h1>
            <p className="text-xl text-muted-foreground">
              Don't miss out on our exclusive deals and promotions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo) => (
              <Card key={promo._id} className="overflow-hidden hover:shadow-xl transition-all">
                <div className="bg-gradient-to-br from-primary to-accent p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-6 h-6" />
                    <Badge className="bg-white text-primary">
                      {promo.discountType === 'percentage' 
                        ? `${promo.discountValue}% OFF` 
                        : `£${promo.discountValue} OFF`}
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{promo.title}</h2>
                  <p className="text-white/90">{promo.description}</p>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Valid until {new Date(promo.endDate).toLocaleDateString()}</span>
                    </div>
                    {promo.minOrderValue > 0 && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        <span>Min order: £{promo.minOrderValue}</span>
                      </div>
                    )}
                    {promo.maxDiscount && promo.maxDiscount > 0 && (
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-muted-foreground" />
                        <span>Max discount: £{promo.maxDiscount}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {promotions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No active promotions at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Specials;
