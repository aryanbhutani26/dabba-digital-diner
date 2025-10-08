import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Menu = () => {
  const menuCategories = {
    starters: [
      { name: "Seared Scallops", description: "Pan-seared scallops with lemon butter sauce", price: "$18" },
      { name: "Truffle Arancini", description: "Crispy risotto balls with black truffle", price: "$14" },
      { name: "Beef Carpaccio", description: "Thinly sliced beef with arugula and parmesan", price: "$16" },
      { name: "Burrata Caprese", description: "Fresh burrata, heirloom tomatoes, basil", price: "$15" },
    ],
    mains: [
      { name: "Grilled Ribeye", description: "16oz prime ribeye with roasted vegetables", price: "$48" },
      { name: "Pan-Seared Salmon", description: "Atlantic salmon with herb butter", price: "$36" },
      { name: "Lobster Linguine", description: "Fresh lobster in white wine sauce", price: "$42" },
      { name: "Mushroom Risotto", description: "Creamy risotto with wild mushrooms", price: "$28" },
      { name: "Duck Confit", description: "Slow-cooked duck leg with orange glaze", price: "$38" },
    ],
    desserts: [
      { name: "Chocolate Lava Cake", description: "Warm chocolate cake with vanilla ice cream", price: "$12" },
      { name: "Crème Brûlée", description: "Classic vanilla custard with caramelized sugar", price: "$10" },
      { name: "Tiramisu", description: "Traditional Italian coffee-flavored dessert", price: "$11" },
      { name: "Seasonal Fruit Tart", description: "Fresh fruit on almond cream base", price: "$13" },
    ],
    drinks: [
      { name: "House Wine", description: "Red or White, by the glass", price: "$12" },
      { name: "Craft Cocktails", description: "Ask about our seasonal selections", price: "$15" },
      { name: "Artisan Coffee", description: "Espresso, Cappuccino, Latte", price: "$5" },
      { name: "Premium Spirits", description: "Whiskey, Cognac, Tequila", price: "$18+" },
    ],
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">Our Menu</h1>
            <p className="text-xl text-muted-foreground">
              Carefully curated dishes crafted with passion and precision
            </p>
          </div>

          <Tabs defaultValue="starters" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-12 bg-muted">
              <TabsTrigger value="starters" className="text-base">Starters</TabsTrigger>
              <TabsTrigger value="mains" className="text-base">Mains</TabsTrigger>
              <TabsTrigger value="desserts" className="text-base">Desserts</TabsTrigger>
              <TabsTrigger value="drinks" className="text-base">Drinks</TabsTrigger>
            </TabsList>

            {Object.entries(menuCategories).map(([category, items]) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="grid gap-6">
                  {items.map((item, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-2xl font-semibold mb-2">{item.name}</h3>
                            <p className="text-muted-foreground">{item.description}</p>
                          </div>
                          <span className="text-2xl font-bold text-primary ml-4">{item.price}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Menu;
