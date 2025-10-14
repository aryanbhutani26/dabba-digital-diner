import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PackageCheck, Truck, Star } from "lucide-react";
import { Link } from "react-router-dom";
import tiffinHero from "@/assets/tiffin-hero.jpg";
import tiffinBox1 from "@/assets/tiffin-box-1.jpg";
import tiffinBox2 from "@/assets/tiffin-box-2.jpg";
import tiffinBox3 from "@/assets/tiffin-box-3.jpg";

const Services = () => {
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
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden mt-20">
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

      <Footer />
    </div>
  );
};

export default Services;
