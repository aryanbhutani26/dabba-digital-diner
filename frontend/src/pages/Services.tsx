import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PackageCheck, Truck, Star, Users, Utensils, Calendar, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { DabbaSubscriptionDialog } from "@/components/DabbaSubscriptionDialog";
import tiffinHero from "@/assets/tiffin-hero.jpg";
import tiffinBox1 from "@/assets/tiffin-box-1.jpg";
import tiffinBox2 from "@/assets/tiffin-box-2.jpg";
import tiffinBox3 from "@/assets/tiffin-box-3.jpg";
import indiyaLogo from "@/assets/indiya-logo.jpg";

const Services = () => {
  const [dabbaServices, setDabbaServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);

  useEffect(() => {
    fetchDabbaServices();
  }, []);

  const fetchDabbaServices = async () => {
    try {
      const services = await api.getDabbaServices();
      setDabbaServices(services);
    } catch (error) {
      console.error('Failed to fetch dabba services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fallback static plans if no services are configured
  const fallbackTiffinPlans = [
    {
      image: tiffinBox1,
      title: "Executive Dabba",
      price: "£299",
      description: "Perfect for working professionals",
      features: ["3 Curries", "Rice & Roti", "Dal & Salad", "Sweet"],
    },
    {
      image: tiffinBox2,
      title: "Royal Dabba",
      price: "£399",
      description: "Premium authentic experience",
      features: ["4 Curries", "Rice & Roti", "Dal & Raita", "Sweet & Papad"],
    },
    {
      image: tiffinBox3,
      title: "Family Dabba",
      price: "£899",
      description: "Serves 3-4 people",
      features: ["5 Curries", "Rice & Roti", "Dal & Raita", "Sweet & Extras"],
    },
  ];

  const tiffinPlans = dabbaServices.length > 0 ? dabbaServices : fallbackTiffinPlans;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Catering & Banquet Section */}
      <section className="py-20 px-4 bg-background mt-20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Catering & Banquet Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Make your special occasions unforgettable with our premium catering and elegant banquet facilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-xl">
              <CardContent className="pt-8 pb-6 text-center">
                <div className="flex justify-center mb-4">
                  <Users className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Wedding Catering</h3>
                <p className="text-muted-foreground mb-4">
                  Complete wedding catering services with customized menus for your special day
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Custom menu planning
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Professional service staff
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Elegant presentation
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-xl">
              <CardContent className="pt-8 pb-6 text-center">
                <div className="flex justify-center mb-4">
                  <Utensils className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Corporate Events</h3>
                <p className="text-muted-foreground mb-4">
                  Professional catering for corporate meetings, conferences, and business events
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Flexible packages
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    On-time delivery
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Volume discounts
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-xl">
              <CardContent className="pt-8 pb-6 text-center">
                <div className="flex justify-center mb-4">
                  <Calendar className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Banquet Halls</h3>
                <p className="text-muted-foreground mb-4">
                  Beautifully decorated banquet halls for parties, celebrations, and gatherings
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Multiple hall sizes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Modern amenities
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Decoration services
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Minimum 50 guests | Advance booking required
            </p>
            <Button asChild variant="hero" size="lg">
              <Link to="/contact">Request Catering Quote</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Golden Divider */}
      <div className="relative py-8">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c3a85c] to-transparent h-px top-1/2 transform -translate-y-1/2"></div>
        <div className="flex justify-center relative z-10">
          <div className="bg-background px-8 relative">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-[#c3a85c] overflow-hidden relative z-20">
              <img 
                src={indiyaLogo} 
                alt="Indiya Restaurant Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${tiffinHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/50" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Our Signature
            <span className="block mt-2 text-primary">
              Dabba Service
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto">
            Experience the authentic taste of home-cooked meals, delivered fresh to your doorstep
          </p>
        </div>
      </section>

      {/* Dabba/Tiffin Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            <div className="flex flex-col items-center text-center p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-primary/20 hover:border-primary/50 transition-all duration-300">
              <PackageCheck className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">Fresh Daily</h3>
              <p className="text-white/80 text-sm">Prepared fresh every day with premium ingredients</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-primary/20 hover:border-primary/50 transition-all duration-300">
              <Truck className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">Timely Delivery</h3>
              <p className="text-white/80 text-sm">Hot meals delivered right on time, every time</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-primary/20 hover:border-primary/50 transition-all duration-300">
              <Star className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">Authentic Taste</h3>
              <p className="text-white/80 text-sm">Traditional recipes with a modern twist</p>
            </div>
          </div>

          {/* Tiffin Plans */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tiffinPlans.map((plan, index) => (
                <Card
                  key={plan._id || plan.id || index}
                  className="bg-white/5 backdrop-blur-sm border-2 border-primary/30 hover:border-primary transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 group overflow-hidden"
                >
                  <div className="relative h-64 sm:h-72 overflow-hidden">
                    <img
                      src={plan.image || fallbackTiffinPlans[index % fallbackTiffinPlans.length]?.image}
                      alt={plan.title || plan.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl sm:text-3xl font-bold text-primary mb-1">{plan.title || plan.name}</h3>
                      <p className="text-white/90 text-sm">{plan.description}</p>
                    </div>
                  </div>
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-baseline mb-4">
                      <span className="text-4xl font-bold text-primary">
                        £{typeof plan.price === 'number' ? plan.price.toFixed(2) : (plan.price || '0.00')}
                      </span>
                      <span className="text-white/70 ml-2">/{plan.pricingPeriod || 'day'}</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {(plan.features || []).map((feature, idx) => (
                        <li key={idx} className="flex items-center text-white/90 text-sm">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      variant="outline" 
                      className="w-full border-primary text-primary hover:bg-primary hover:text-black transition-all duration-300"
                      onClick={() => {
                        setSelectedService(plan);
                        setSubscriptionDialogOpen(true);
                      }}
                    >
                      Subscribe Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-white/80 mb-4">
              Custom plans available for corporate and bulk orders
            </p>
            <Button asChild variant="default" size="lg" className="bg-primary text-black hover:bg-primary/90">
              <Link to="/contact">Get Custom Quote</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Subscription Dialog */}
      {selectedService && (
        <DabbaSubscriptionDialog
          service={selectedService}
          open={subscriptionDialogOpen}
          onOpenChange={setSubscriptionDialogOpen}
        />
      )}
    </div>
  );
};

export default Services;
