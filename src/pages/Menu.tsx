import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DishDialog from "@/components/DishDialog";
import CartSheet from "@/components/CartSheet";
import { useState } from "react";

interface Dish {
  name: string;
  description: string;
  price: string;
  image: string;
  images?: string[];
  longDescription?: string;
  ingredients?: string[];
}

interface CartItem {
  name: string;
  price: string;
  quantity: number;
  image: string;
}

const Menu = () => {
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const menuCategories = {
    starters: [
      { 
        name: "Seared Scallops", 
        description: "Pan-seared scallops with lemon butter sauce", 
        price: "$18",
        image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80",
          "https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=800&q=80",
          "https://images.unsplash.com/photo-1580959375944-0be29ff8cc0c?w=800&q=80"
        ],
        longDescription: "Fresh Atlantic scallops perfectly seared and served with a delicate lemon butter sauce, garnished with microgreens and crispy prosciutto.",
        ingredients: ["Atlantic Scallops", "Butter", "Lemon", "Garlic", "White Wine", "Prosciutto", "Microgreens"]
      },
      { 
        name: "Truffle Arancini", 
        description: "Crispy risotto balls with black truffle", 
        price: "$14",
        image: "https://images.unsplash.com/photo-1601001815894-4bb6c81416d7?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1601001815894-4bb6c81416d7?w=800&q=80",
          "https://images.unsplash.com/photo-1627662168337-23746e5df1b1?w=800&q=80",
          "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&q=80"
        ],
        longDescription: "Golden crispy risotto balls filled with creamy arborio rice, parmesan, and shaved black truffle, served with truffle aioli.",
        ingredients: ["Arborio Rice", "Black Truffle", "Parmesan", "Eggs", "Breadcrumbs", "Truffle Oil"]
      },
      { 
        name: "Beef Carpaccio", 
        description: "Thinly sliced beef with arugula and parmesan", 
        price: "$16",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
          "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&q=80",
          "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=800&q=80"
        ],
        longDescription: "Paper-thin slices of premium beef tenderloin topped with fresh arugula, shaved parmesan, capers, and a drizzle of truffle oil.",
        ingredients: ["Beef Tenderloin", "Arugula", "Parmesan", "Capers", "Lemon", "Truffle Oil", "Olive Oil"]
      },
      { 
        name: "Burrata Caprese", 
        description: "Fresh burrata, heirloom tomatoes, basil", 
        price: "$15",
        image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&q=80",
          "https://images.unsplash.com/photo-1592417817038-d13f11fd46f8?w=800&q=80",
          "https://images.unsplash.com/photo-1623428187425-5b8e8c097d37?w=800&q=80"
        ],
        longDescription: "Creamy burrata cheese paired with colorful heirloom tomatoes, fresh basil, aged balsamic reduction, and extra virgin olive oil.",
        ingredients: ["Burrata Cheese", "Heirloom Tomatoes", "Fresh Basil", "Balsamic Reduction", "Extra Virgin Olive Oil", "Sea Salt"]
      },
    ],
    mains: [
      { 
        name: "Grilled Ribeye", 
        description: "16oz prime ribeye with roasted vegetables", 
        price: "$48",
        image: "https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80",
          "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
          "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&q=80"
        ],
        longDescription: "16oz prime ribeye steak grilled to perfection, served with seasonal roasted vegetables and garlic herb butter.",
        ingredients: ["Prime Ribeye", "Garlic", "Butter", "Fresh Herbs", "Seasonal Vegetables", "Sea Salt", "Black Pepper"]
      },
      { 
        name: "Pan-Seared Salmon", 
        description: "Atlantic salmon with herb butter", 
        price: "$36",
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
          "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80",
          "https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=800&q=80"
        ],
        longDescription: "Fresh Atlantic salmon fillet pan-seared with crispy skin, topped with compound herb butter and served with asparagus.",
        ingredients: ["Atlantic Salmon", "Butter", "Dill", "Parsley", "Lemon", "Asparagus", "White Wine"]
      },
      { 
        name: "Lobster Linguine", 
        description: "Fresh lobster in white wine sauce", 
        price: "$42",
        image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80",
          "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80",
          "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800&q=80"
        ],
        longDescription: "Fresh Maine lobster tail with linguine pasta in a delicate white wine garlic sauce, finished with cherry tomatoes and basil.",
        ingredients: ["Maine Lobster", "Linguine", "White Wine", "Garlic", "Cherry Tomatoes", "Fresh Basil", "Butter"]
      },
      { 
        name: "Mushroom Risotto", 
        description: "Creamy risotto with wild mushrooms", 
        price: "$28",
        image: "https://images.unsplash.com/photo-1476124369491-c1ca3b27a67a?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1476124369491-c1ca3b27a67a?w=800&q=80",
          "https://images.unsplash.com/photo-1637806930600-37fa8892069d?w=800&q=80",
          "https://images.unsplash.com/photo-1595908129746-2f0fe0bf9c86?w=800&q=80"
        ],
        longDescription: "Creamy arborio risotto cooked with a medley of wild mushrooms, finished with parmesan and truffle oil.",
        ingredients: ["Arborio Rice", "Wild Mushrooms", "Parmesan", "White Wine", "Vegetable Stock", "Truffle Oil", "Butter"]
      },
      { 
        name: "Duck Confit", 
        description: "Slow-cooked duck leg with orange glaze", 
        price: "$38",
        image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&q=80",
          "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80",
          "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80"
        ],
        longDescription: "Tender duck leg slow-cooked in its own fat, served with a citrus orange glaze and roasted fingerling potatoes.",
        ingredients: ["Duck Leg", "Duck Fat", "Orange", "Honey", "Fresh Thyme", "Fingerling Potatoes", "Red Wine"]
      },
    ],
    desserts: [
      { 
        name: "Chocolate Lava Cake", 
        description: "Warm chocolate cake with vanilla ice cream", 
        price: "$12",
        image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80",
          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
          "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80"
        ],
        longDescription: "Rich chocolate cake with a molten center, served warm with vanilla bean ice cream and raspberry coulis.",
        ingredients: ["Dark Chocolate", "Butter", "Eggs", "Sugar", "Flour", "Vanilla Ice Cream", "Raspberry Coulis"]
      },
      { 
        name: "Crème Brûlée", 
        description: "Classic vanilla custard with caramelized sugar", 
        price: "$10",
        image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&q=80",
          "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80",
          "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80"
        ],
        longDescription: "Silky smooth vanilla bean custard topped with a perfectly caramelized sugar crust, served with fresh berries.",
        ingredients: ["Heavy Cream", "Vanilla Bean", "Egg Yolks", "Sugar", "Fresh Berries"]
      },
      { 
        name: "Tiramisu", 
        description: "Traditional Italian coffee-flavored dessert", 
        price: "$11",
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80",
          "https://images.unsplash.com/photo-1631206853831-c551aad97597?w=800&q=80",
          "https://images.unsplash.com/photo-1586041828039-1f4da3c1e4d3?w=800&q=80"
        ],
        longDescription: "Classic Italian dessert with layers of espresso-soaked ladyfingers and mascarpone cream, dusted with cocoa powder.",
        ingredients: ["Mascarpone", "Ladyfingers", "Espresso", "Eggs", "Sugar", "Cocoa Powder", "Marsala Wine"]
      },
      { 
        name: "Seasonal Fruit Tart", 
        description: "Fresh fruit on almond cream base", 
        price: "$13",
        image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&q=80",
          "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80",
          "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80"
        ],
        longDescription: "Buttery tart shell filled with almond cream and topped with seasonal fresh fruits and apricot glaze.",
        ingredients: ["Tart Dough", "Almond Cream", "Seasonal Fruits", "Apricot Glaze", "Vanilla", "Butter"]
      },
    ],
    drinks: [
      { 
        name: "House Wine", 
        description: "Red or White, by the glass", 
        price: "$12",
        image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
          "https://images.unsplash.com/photo-1474722883778-ab3abd3826f8?w=800&q=80",
          "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800&q=80"
        ],
        longDescription: "Carefully selected wines from our cellar, available in both red and white varieties, perfectly paired with our menu.",
        ingredients: ["Premium Grapes", "Natural Fermentation"]
      },
      { 
        name: "Craft Cocktails", 
        description: "Ask about our seasonal selections", 
        price: "$15",
        image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80",
          "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800&q=80",
          "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80"
        ],
        longDescription: "Our mixologists create unique cocktails using premium spirits, fresh ingredients, and house-made syrups.",
        ingredients: ["Premium Spirits", "Fresh Fruits", "House-made Syrups", "Fresh Herbs", "Bitters"]
      },
      { 
        name: "Artisan Coffee", 
        description: "Espresso, Cappuccino, Latte", 
        price: "$5",
        image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80",
          "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
          "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&q=80"
        ],
        longDescription: "Expertly crafted coffee drinks made with freshly roasted beans and steamed milk, perfect any time of day.",
        ingredients: ["Artisan Coffee Beans", "Steamed Milk", "Espresso"]
      },
      { 
        name: "Premium Spirits", 
        description: "Whiskey, Cognac, Tequila", 
        price: "$18+",
        image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80",
          "https://images.unsplash.com/photo-1527281400156-4a96d313ba94?w=800&q=80",
          "https://images.unsplash.com/photo-1582037928769-181f2644ecb7?w=800&q=80"
        ],
        longDescription: "An extensive selection of aged whiskeys, cognacs, and premium tequilas from around the world.",
        ingredients: ["Premium Aged Spirits"]
      },
    ],
  };

  const handleDishClick = (dish: Dish) => {
    setSelectedDish(dish);
    setIsDialogOpen(true);
  };

  const handleAddToCart = (dish: Dish, quantity: number) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.name === dish.name);
      
      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      }
      
      return [...prevItems, {
        name: dish.name,
        price: dish.price,
        quantity,
        image: dish.image,
      }];
    });
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    setCartItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index].quantity = newQuantity;
      return newItems;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCartItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-12">
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-script">Our Royal Menu</h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Carefully curated dishes crafted with passion and precision
              </p>
            </div>
            <div className="shrink-0">
              <CartSheet 
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />
            </div>
          </div>

          <Tabs defaultValue="starters" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8 md:mb-12 bg-muted h-auto">
              <TabsTrigger value="starters" className="text-sm md:text-base py-3">Starters</TabsTrigger>
              <TabsTrigger value="mains" className="text-sm md:text-base py-3">Mains</TabsTrigger>
              <TabsTrigger value="desserts" className="text-sm md:text-base py-3">Desserts</TabsTrigger>
              <TabsTrigger value="drinks" className="text-sm md:text-base py-3">Drinks</TabsTrigger>
            </TabsList>

            {Object.entries(menuCategories).map(([category, items]) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                  {items.map((item, index) => (
                    <Card 
                      key={index} 
                      className="hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                      onClick={() => handleDishClick(item)}
                    >
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div className="flex-1">
                            <h3 className="text-xl md:text-2xl font-semibold mb-2 group-hover:text-primary transition-colors font-script">
                              {item.name}
                            </h3>
                            <p className="text-sm md:text-base text-muted-foreground">{item.description}</p>
                          </div>
                          <span className="text-xl md:text-2xl font-bold text-accent shrink-0">{item.price}</span>
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

      <DishDialog
        dish={selectedDish}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddToCart={handleAddToCart}
      />

      <Footer />
    </div>
  );
};

export default Menu;

