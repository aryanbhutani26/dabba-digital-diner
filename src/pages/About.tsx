import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import aboutImage from "@/assets/about-restaurant.jpg";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Users, Sparkles } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="px-4 mb-20">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl font-bold mb-6">Our Story</h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Founded in 2015, Savoria has been a cornerstone of culinary excellence in our community. 
                  Our passion for creating exceptional dining experiences drives everything we do.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  We believe that great food brings people together. Each dish tells a story, carefully 
                  crafted by our talented chefs using the finest locally-sourced ingredients.
                </p>
                <p className="text-lg text-muted-foreground">
                  Our commitment to quality, innovation, and hospitality has earned us numerous accolades 
                  and, more importantly, the loyalty of our guests.
                </p>
              </div>
              <div className="relative">
                <img
                  src={aboutImage}
                  alt="Restaurant interior"
                  className="rounded-2xl shadow-2xl w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="px-4 py-20 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-4xl font-bold text-center mb-12">Our Philosophy</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-8 text-center">
                  <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Quality First</h3>
                  <p className="text-muted-foreground">
                    We source only the finest ingredients, working with local farmers and artisans 
                    to ensure exceptional quality in every dish.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-8 text-center">
                  <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Community Focus</h3>
                  <p className="text-muted-foreground">
                    We're more than a restaurant – we're a gathering place where memories are made 
                    and relationships flourish.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-8 text-center">
                  <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Excellence Always</h3>
                  <p className="text-muted-foreground">
                    From our cuisine to our service, we maintain the highest standards in everything 
                    we do, every single day.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="px-4 py-20">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-4xl font-bold mb-6">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
              Our talented culinary team brings decades of combined experience from world-renowned 
              kitchens. Led by Executive Chef Maria Rodriguez, our kitchen is a place where creativity 
              and tradition come together to create unforgettable dishes.
            </p>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div>
                <h3 className="text-xl font-semibold mb-2">Maria Rodriguez</h3>
                <p className="text-primary font-medium mb-1">Executive Chef</p>
                <p className="text-sm text-muted-foreground">
                  20+ years of culinary excellence
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">James Chen</h3>
                <p className="text-primary font-medium mb-1">Sous Chef</p>
                <p className="text-sm text-muted-foreground">
                  Specializing in contemporary cuisine
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Sophie Laurent</h3>
                <p className="text-primary font-medium mb-1">Pastry Chef</p>
                <p className="text-sm text-muted-foreground">
                  Award-winning dessert artisan
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
