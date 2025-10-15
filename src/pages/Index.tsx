import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-restaurant.jpg";
import aboutRestaurant from "@/assets/about-restaurant.jpg";
import { UtensilsCrossed, Award, Clock, Heart, Tag, Percent, Gift } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: <UtensilsCrossed className="w-12 h-12 text-primary" />,
      title: "Exquisite Cuisine",
      description: "Crafted by award-winning chefs using the finest ingredients",
    },
    {
      icon: <Award className="w-12 h-12 text-primary" />,
      title: "Award Winning",
      description: "Recognized globally for culinary excellence and innovation",
    },
    {
      icon: <Clock className="w-12 h-12 text-primary" />,
      title: "Perfect Timing",
      description: "Seamless service ensuring every moment is memorable",
    },
    {
      icon: <Heart className="w-12 h-12 text-primary" />,
      title: "Made with Love",
      description: "Every dish is a testament to our passion for great food",
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

  const offers = [
    {
      icon: <Percent className="w-8 h-8" />,
      title: "20% OFF",
      subtitle: "Weekend Dinner",
      description: "Valid on Fri-Sun from 6 PM onwards",
      code: "WEEKEND20",
      color: "from-primary to-accent",
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Free Dessert",
      subtitle: "On Your Birthday",
      description: "Show your ID and enjoy a complimentary dessert",
      code: "BIRTHDAY",
      color: "from-accent to-secondary",
    },
    {
      icon: <Tag className="w-8 h-8" />,
      title: "30% OFF",
      subtitle: "First Time Visit",
      description: "New customers get special discount on first order",
      code: "FIRST30",
      color: "from-secondary to-primary",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

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
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-foreground">
              <Link to="/menu">View Our Menu</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Why Choose Savoria</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover what makes us the premier destination for exceptional dining
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
                className="overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl group"
              >
                <div className={`bg-gradient-to-br ${offer.color} p-8 text-primary-foreground`}>
                  <div className="flex justify-center mb-4">{offer.icon}</div>
                  <h3 className="text-3xl font-bold mb-2 text-center">{offer.title}</h3>
                  <p className="text-xl text-center opacity-90">{offer.subtitle}</p>
                </div>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4 text-center">{offer.description}</p>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Coupon Code</p>
                    <p className="text-xl font-bold text-primary font-mono tracking-wider">{offer.code}</p>
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
                Savoria is where culinary excellence meets elegant ambiance. For over a decade, we've been 
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
                  alt="Savoria Restaurant Interior"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready for an Unforgettable Experience?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Book your table today and discover why Savoria is the talk of the town
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
