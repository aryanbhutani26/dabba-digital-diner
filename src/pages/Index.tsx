import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-restaurant.jpg";
import { UtensilsCrossed, Award, Clock, Heart } from "lucide-react";

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
