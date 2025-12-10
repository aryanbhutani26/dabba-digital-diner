import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import storefrontImage from "@/assets/indiya-storefront.jpg";
import chefMaria from "@/assets/chef-maria.jpg";
import chefJames from "@/assets/chef-james.jpg";
import chefSophie from "@/assets/chef-sophie.jpg";
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
                <h1 className="text-5xl font-bold mb-6">Welcome to Indiya Bar & Restaurant</h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Located in the heart of Orpington, Indiya Bar & Restaurant brings you the finest Indian dining experience. 
                  Our elegant storefront welcomes you into a world of authentic flavors, modern ambiance, and exceptional hospitality.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  We take pride in serving authentic Indian cuisine, thoughtfully prepared with fresh, 
                  high-quality ingredients. Our passionate chefs honour traditional recipes, infusing 
                  each dish with stories and heritage that make it so special. From beloved classics 
                  to unique regional specialities, every plate reflects the richness and spirit of India.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  <strong>Visit us at:</strong><br />
                  180 High Street, Orpington, BR6 0JW<br />
                  Phone: 01689 451 403<br />
                  Website: www.dineindiya.co.uk
                </p>
                <p className="text-lg text-muted-foreground">
                  More than just a restaurant, Indiya is a cultural destination where food brings people together. 
                  Experience modern authentic dining in our beautifully designed space.
                </p>
              </div>
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={storefrontImage}
                    alt="Indiya Bar & Restaurant - Finest Indian Restaurant Storefront"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                      📍 180 High Street, Orpington
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="px-4 py-20 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-4xl font-bold text-center mb-12">What Makes Us Special</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-8 text-center">
                  <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Authentic Flavours</h3>
                  <p className="text-muted-foreground">
                    Rooted in India's rich culinary heritage, our dishes are prepared with high-quality 
                    ingredients sourced from trusted partners, honouring traditional recipes with every plate.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-8 text-center">
                  <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Heartfelt Hospitality</h3>
                  <p className="text-muted-foreground">
                    Friendly, attentive service rooted in warmth, respect, and a personal touch. 
                    We treat every guest like family, making each visit memorable.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-8 text-center">
                  <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Community Connection</h3>
                  <p className="text-muted-foreground">
                    Strong community involvement, supporting diverse cultures and local initiatives. 
                    A trusted local brand known for consistency, care, and connection.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Community & Culture Section */}
        <section className="px-4 py-20">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6">More Than Just a Restaurant</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Whether we're sponsoring festivals, hosting private celebrations, or collaborating with 
                community programmes, Indiya proudly stands as a partner in preserving and sharing tradition.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 md:p-12 text-center">
              <h3 className="text-3xl font-bold mb-6">Our Promise to You</h3>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                At Indiya Restaurant, good food meets great people — like you. Whether you're dining in, 
                celebrating a special occasion, or simply craving comfort, we're here to make every 
                experience unforgettable.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <span className="font-semibold">Authentic Flavours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  <span className="font-semibold">Warm Hospitality</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary" />
                  <span className="font-semibold">Trusted Quality</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-primary mt-8">
                Visit us and let us serve you with warmth and flavour.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
