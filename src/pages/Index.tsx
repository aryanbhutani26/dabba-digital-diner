import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-restaurant.jpg";
import tiffinHero from "@/assets/tiffin-hero.jpg";
import tiffinBox1 from "@/assets/tiffin-box-1.jpg";
import tiffinBox2 from "@/assets/tiffin-box-2.jpg";
import tiffinBox3 from "@/assets/tiffin-box-3.jpg";
import { UtensilsCrossed, Award, Clock, Heart, PackageCheck, Truck, Star } from "lucide-react";

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

  const tiffinPlans = [
    {
      image: tiffinBox1,
      title: "Executive Dabba",
      price: "₹299",
      description: "Perfect for working professionals",
      features: ["3 Curries", "Rice & Roti", "Dal & Salad", "Sweet"],
    },
    {
      image: tiffinBox2,
      title: "Royal Dabba",
      price: "₹399",
      description: "Premium authentic experience",
      features: ["4 Curries", "Rice & Roti", "Dal & Raita", "Sweet & Papad"],
    },
    {
      image: tiffinBox3,
      title: "Family Dabba",
      price: "₹899",
      description: "Serves 3-4 people",
      features: ["5 Curries", "Rice & Roti", "Dal & Raita", "Sweet & Extras"],
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

      {/* Dabba/Tiffin Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${tiffinHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-primary">
              Our Signature Dabba Service
            </h2>
            <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto">
              Experience the authentic taste of home-cooked meals, delivered fresh to your doorstep
            </p>
          </div>

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiffinPlans.map((plan, index) => (
              <Card
                key={index}
                className="bg-white/5 backdrop-blur-sm border-2 border-primary/30 hover:border-primary transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 group overflow-hidden"
              >
                <div className="relative h-64 sm:h-72 overflow-hidden">
                  <img
                    src={plan.image}
                    alt={plan.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl sm:text-3xl font-bold text-primary mb-1">{plan.title}</h3>
                    <p className="text-white/90 text-sm">{plan.description}</p>
                  </div>
                </div>
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    <span className="text-white/70 ml-2">/day</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-white/90 text-sm">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full border-primary text-primary hover:bg-primary hover:text-black transition-all duration-300"
                  >
                    Subscribe Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

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
