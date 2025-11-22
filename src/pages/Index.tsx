import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-restaurant.jpg";
import aboutRestaurant from "@/assets/about-restaurant.jpg";
import { UtensilsCrossed, Award, Clock, Heart, Tag, Percent, Gift, Sparkles, ArrowRight } from "lucide-react";
import tiffinHero from "@/assets/tiffin-hero.jpg";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Testimonials } from "@/components/Testimonials";

const Index = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [servicesVisible, setServicesVisible] = useState(true);
  const [activePromotion, setActivePromotion] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [couponsData, settingsData, promotionsData] = await Promise.all([
        api.getCoupons(),
        api.getSetting('services_visible').catch(() => ({ value: true })),
        api.getActivePromotions().catch(() => []),
      ]);

      setOffers(couponsData);
      setServicesVisible(settingsData.value === true);
      
      // Get the first active promotion for the banner
      if (promotionsData && promotionsData.length > 0) {
        setActivePromotion(promotionsData[0]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const features = [
    {
      icon: <UtensilsCrossed className="w-12 h-12 text-primary" />,
      title: "Authentic Flavours",
      description: "Rooted in India's rich culinary heritage with traditional recipes",
    },
    {
      icon: <Award className="w-12 h-12 text-primary" />,
      title: "Quality Ingredients",
      description: "High-quality ingredients sourced from trusted partners",
    },
    {
      icon: <Heart className="w-12 h-12 text-primary" />,
      title: "Heartfelt Hospitality",
      description: "Friendly service rooted in warmth, respect, and personal touch",
    },
    {
      icon: <Sparkles className="w-12 h-12 text-primary" />,
      title: "Community Connection",
      description: "A trusted local brand supporting diverse cultures and initiatives",
    },
  ];

  const featuredDishes = [
    {
      name: "Grilled Ribeye",
      description: "16oz prime ribeye with roasted vegetables",
      image: "https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80",
    },
    {
      name: "Pan-Seared Salmon",
      description: "Atlantic salmon with herb butter",
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
    },
    {
      name: "Lobster Linguine",
      description: "Fresh lobster in white wine sauce",
      image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80",
    },
  ];

  const getIconComponent = (iconName: string) => {
    const icons: any = {
      Percent: <Percent className="w-8 h-8" />,
      Gift: <Gift className="w-8 h-8" />,
      Tag: <Tag className="w-8 h-8" />,
    };
    return icons[iconName] || <Tag className="w-8 h-8" />;
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Promotions Banner - Only shows if there's an active promotion */}
      {activePromotion && (
        <section className="relative bg-gradient-to-r from-accent via-primary to-secondary text-primary-foreground py-4 px-4 overflow-hidden mt-20">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />
          </div>
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 animate-pulse" />
                <div>
                  <h3 className="text-lg md:text-xl font-bold">
                    {activePromotion.title} - {new Date(activePromotion.startDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} to {new Date(activePromotion.endDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                  </h3>
                  <p className="text-sm opacity-90">
                    {activePromotion.description} | {activePromotion.discountType === 'percentage' ? `${activePromotion.discountValue}% Off` : `£${activePromotion.discountValue} Off`}
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="border-2 border-white text-white hover:bg-white hover:text-primary shrink-0">
                <Link to="/reservations" className="flex items-center gap-2">
                  Book Now <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Experience Fine Dining
            <span className="block mt-2 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Redefined
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            Where culinary artistry meets unforgettable ambiance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
            <Button asChild variant="hero" size="lg">
              <Link to="/reservations">Reserve Your Table</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
              <Link to="/menu">View Our Menu</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Why Choose Indiya Restaurant?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Bringing vibrant Indian flavours to London with exceptional food, heartfelt hospitality, 
              and strong community connection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 hover:border-primary transition-all duration-300 hover:shadow-xl"
              >
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Dishes Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Our Signature Dishes</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our chef's specially curated dishes that define fine dining
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {featuredDishes.map((dish, index) => (
              <Card
                key={index}
                className="overflow-hidden group hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-2xl font-bold mb-2">{dish.name}</h3>
                  <p className="text-muted-foreground mb-4">{dish.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="hero" size="lg">
              <Link to="/menu">View Full Menu</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Dabba Service Section */}
      {servicesVisible && (
        <section className="py-20 px-4 bg-gradient-to-br from-background via-accent/5 to-background">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="text-4xl sm:text-5xl font-bold mb-6">Our Signature Dabba Service</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Experience the authentic taste of home-cooked meals, delivered fresh to your doorstep. 
                  Our dabba service brings you wholesome, nutritious meals prepared daily with premium ingredients.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Timely Delivery</h3>
                      <p className="text-muted-foreground text-sm">Hot meals delivered right on time, every day</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Heart className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Made Fresh Daily</h3>
                      <p className="text-muted-foreground text-sm">Traditional recipes with authentic flavors</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Tag className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Affordable Plans</h3>
                      <p className="text-muted-foreground text-sm">Starting from ₹299/day with various options</p>
                    </div>
                  </div>
                </div>
                <Button asChild variant="hero" size="lg">
                  <Link to="/services">Explore Dabba Plans</Link>
                </Button>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative rounded-lg overflow-hidden shadow-2xl">
                  <img
                    src={tiffinHero}
                    alt="Traditional Tiffin Dabba Service"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Special Offers Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Special Offers & Coupons</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Take advantage of our exclusive deals and make your dining experience even more special
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {offers.map((offer, index) => (
              <Card
                key={index}
                className="overflow-hidden border-2 border-amber-600/20 hover:border-amber-500 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/20 group"
              >
                <div className="bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 p-8 text-gray-900">
                  <div className="flex justify-center mb-4">{getIconComponent(offer.icon)}</div>
                  <h3 className="text-3xl font-bold mb-2 text-center">{offer.title}</h3>
                  <p className="text-xl text-center opacity-90">{offer.subtitle}</p>
                </div>
                <CardContent className="p-6 bg-card">
                  <p className="text-muted-foreground mb-4 text-center">{offer.description}</p>
                  <div className="bg-muted rounded-lg p-4 text-center border border-amber-500/20">
                    <p className="text-xs text-muted-foreground mb-1">Coupon Code</p>
                    <p className="text-xl font-bold text-amber-500 font-mono tracking-wider">{offer.code}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              *Terms and conditions apply. Cannot be combined with other offers.
            </p>
          </div>
        </div>
      </section>

      {/* Restaurant Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">About Our Restaurant</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Indiya Bar & Restaurant is where culinary excellence meets elegant ambiance. For over a decade, we've been 
                delighting guests with our innovative approach to fine dining, combining traditional 
                techniques with modern flair.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Our award-winning chefs use only the finest, locally-sourced ingredients to create 
                unforgettable dining experiences. Every dish tells a story, and every visit becomes 
                a cherished memory.
              </p>
              <Button asChild variant="hero" size="lg">
                <Link to="/about">Learn More About Us</Link>
              </Button>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={aboutRestaurant}
                  alt="Indiya Bar & Restaurant Interior"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready for an Unforgettable Experience?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Book your table today and discover why Indiya Bar & Restaurant is the talk of the town
          </p>
          <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary">
            <Link to="/reservations">Make a Reservation</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
