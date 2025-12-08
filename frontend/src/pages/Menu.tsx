import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DishDialog from "@/components/DishDialog";
import CartSheet from "@/components/CartSheet";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Loader2, Search } from "lucide-react";

interface Dish {
  name: string;
  description: string;
  price: string;
  image: string;
  images?: string[];
  longDescription?: string;
  ingredients?: string[];
  allergens?: string[];
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
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [lunchEnabled, setLunchEnabled] = useState(true);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await api.getMenuItems();
      const items = response.items || response;
      const lunchEnabledStatus = response.lunchEnabled !== undefined ? response.lunchEnabled : true;
      
      setMenuItems(items);
      setLunchEnabled(lunchEnabledStatus);
      
      // Define the 4 main categories in order
      const mainCategories = ['Mains', 'Lunch', 'Drinks', 'Desserts'];
      
      // Extract unique categories from items and order them
      const itemCategories = [...new Set(items.map((item: any) => item.category))];
      const orderedCategories = mainCategories.filter(cat => 
        itemCategories.some(itemCat => itemCat.toLowerCase() === cat.toLowerCase())
      );
      
      // Add any additional categories not in main list
      const additionalCategories = itemCategories.filter(cat => 
        !mainCategories.some(mainCat => mainCat.toLowerCase() === cat.toLowerCase())
      );
      
      setCategories([...orderedCategories, ...additionalCategories]);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter items by search query
  const filteredMenuItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group items by category
  const menuCategories: Record<string, any[]> = {};
  categories.forEach(category => {
    menuCategories[category] = filteredMenuItems.filter(item => item.category === category);
  });

  // Fallback static menu for demo
  const staticMenuCategories = {
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
        ingredients: ["Atlantic Scallops", "Butter", "Lemon", "Garlic", "White Wine", "Prosciutto", "Microgreens"],
        allergens: ["Shellfish", "Dairy", "Pork"]
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
        ingredients: ["Arborio Rice", "Black Truffle", "Parmesan", "Eggs", "Breadcrumbs", "Truffle Oil"],
        allergens: ["Gluten", "Dairy", "Eggs"]
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
        ingredients: ["Beef Tenderloin", "Arugula", "Parmesan", "Capers", "Lemon", "Truffle Oil", "Olive Oil"],
        allergens: ["Dairy"]
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
        ingredients: ["Burrata Cheese", "Heirloom Tomatoes", "Fresh Basil", "Balsamic Reduction", "Extra Virgin Olive Oil", "Sea Salt"],
        allergens: ["Dairy"]
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
        ingredients: ["Prime Ribeye", "Garlic", "Butter", "Fresh Herbs", "Seasonal Vegetables", "Sea Salt", "Black Pepper"],
        allergens: ["Dairy"]
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
        ingredients: ["Atlantic Salmon", "Butter", "Dill", "Parsley", "Lemon", "Asparagus", "White Wine"],
        allergens: ["Fish", "Dairy"]
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
        ingredients: ["Maine Lobster", "Linguine", "White Wine", "Garlic", "Cherry Tomatoes", "Fresh Basil", "Butter"],
        allergens: ["Shellfish", "Gluten", "Dairy"]
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
        ingredients: ["Arborio Rice", "Wild Mushrooms", "Parmesan", "White Wine", "Vegetable Stock", "Truffle Oil", "Butter"],
        allergens: ["Dairy", "Mushrooms"]
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
        ingredients: ["Duck Leg", "Duck Fat", "Orange", "Honey", "Fresh Thyme", "Fingerling Potatoes", "Red Wine"],
        allergens: ["Poultry"]
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
        ingredients: ["Dark Chocolate", "Butter", "Eggs", "Sugar", "Flour", "Vanilla Ice Cream", "Raspberry Coulis"],
        allergens: ["Gluten", "Dairy", "Eggs"]
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
        ingredients: ["Heavy Cream", "Vanilla Bean", "Egg Yolks", "Sugar", "Fresh Berries"],
        allergens: ["Dairy", "Eggs"]
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
        ingredients: ["Mascarpone", "Ladyfingers", "Espresso", "Eggs", "Sugar", "Cocoa Powder", "Marsala Wine"],
        allergens: ["Dairy", "Gluten", "Eggs", "Alcohol"]
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
        ingredients: ["Tart Dough", "Almond Cream", "Seasonal Fruits", "Apricot Glaze", "Vanilla", "Butter"],
        allergens: ["Gluten", "Nuts", "Dairy", "Eggs"]
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
        ingredients: ["Premium Grapes", "Natural Fermentation"],
        allergens: ["Sulfites", "Alcohol"]
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
        ingredients: ["Premium Spirits", "Fresh Fruits", "House-made Syrups", "Fresh Herbs", "Bitters"],
        allergens: ["Alcohol"]
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
        ingredients: ["Artisan Coffee Beans", "Steamed Milk", "Espresso"],
        allergens: ["Dairy", "Caffeine"]
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
        ingredients: ["Premium Aged Spirits"],
        allergens: ["Alcohol"]
      },
    ],
  };

  const handleDishClick = (dish: Dish) => {
    setSelectedDish(dish);
    setIsDialogOpen(true);
  };

  const handleAddToCart = (dish: Dish, quantity: number) => {
    setCartItems(prevItems => {
      // For items with variants, include size in the comparison
      const itemKey = (dish as any).selectedSize 
        ? `${dish.name}-${(dish as any).selectedSize}` 
        : dish.name;
      
      const existingItemIndex = prevItems.findIndex(item => {
        const existingKey = item.selectedSize 
          ? `${item.name}-${item.selectedSize}` 
          : item.name;
        return existingKey === itemKey;
      });
      
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
        selectedSize: (dish as any).selectedSize,
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

      {/* Floating Cart Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <CartSheet 
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={() => setCartItems([])}
        />
      </div>

      <main className="pt-32 pb-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-script">Our Royal Menu</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6">
              Carefully curated dishes crafted with passion and precision
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search dishes, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-6 text-base"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : menuItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No menu items available yet. Check back soon!</p>
            </div>
          ) : searchQuery ? (
            // Show all search results across categories when searching
            <div className="space-y-4">
              {filteredMenuItems.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">No dishes found</p>
                  <p className="text-sm text-muted-foreground">Try searching with different keywords</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground text-center">
                      Found {filteredMenuItems.length} dish{filteredMenuItems.length !== 1 ? 'es' : ''} matching "{searchQuery}"
                    </p>
                  </div>
                  <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                    {filteredMenuItems.map((item, index) => (
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
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                            <div className="flex-1">
                              <h3 className="text-xl md:text-2xl font-semibold mb-2 group-hover:text-primary transition-colors font-script">
                                {item.name}
                              </h3>
                              <p className="text-sm md:text-base text-muted-foreground">{item.description}</p>
                            </div>
                            <div className="shrink-0">
                              {item.hasVariants && item.variants ? (
                                <div className="text-right">
                                  <span className="text-xl md:text-2xl font-bold text-accent">
                                    From £{Math.min(...item.variants.map((v: any) => v.price)).toFixed(2)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xl md:text-2xl font-bold text-accent">
                                  £{typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                                </span>
                              )}
                            </div>
                          </div>
                          {item.allergens && item.allergens.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-xs text-muted-foreground mb-1.5">May contain allergens:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {item.allergens.map((allergen: string, idx: number) => (
                                  <span 
                                    key={idx} 
                                    className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-full border border-destructive/20"
                                  >
                                    {allergen}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            // Show tabs when not searching
            <Tabs defaultValue={categories[0]} className="w-full">
              <TabsList className={`grid w-full mb-8 md:mb-12 bg-gradient-to-r from-muted via-muted/80 to-muted h-auto p-2 rounded-xl shadow-lg border border-border/50 ${categories.length <= 4 ? `grid-cols-${categories.length}` : 'grid-cols-2 lg:grid-cols-4'} gap-2`}>
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category} 
                    value={category} 
                    className="text-sm md:text-base py-4 px-6 capitalize font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted-foreground/10"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(menuCategories).map(([category, items]) => {
                const isLunchCategory = category.toLowerCase() === 'lunch';
                const isLunchDisabled = isLunchCategory && !lunchEnabled;
                
                // Group items by subcategory
                const itemsBySubcategory: Record<string, any[]> = {};
                items.forEach(item => {
                  const subcategory = item.subcategory || 'Other';
                  if (!itemsBySubcategory[subcategory]) {
                    itemsBySubcategory[subcategory] = [];
                  }
                  itemsBySubcategory[subcategory].push(item);
                });
                
                return (
                  <TabsContent key={category} value={category} className="space-y-6">
                    {isLunchDisabled && (
                      <div className="bg-muted/50 border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center backdrop-blur-sm">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-4xl opacity-50">🍱</span>
                        </div>
                        <h3 className="text-2xl font-semibold mb-2 text-muted-foreground">Lunch Service Unavailable</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          We're not currently serving lunch. Please check back during our lunch hours or explore our other delicious menu options.
                        </p>
                      </div>
                    )}
                    
                    <div className={`space-y-8 ${isLunchDisabled ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                      {Object.entries(itemsBySubcategory).map(([subcategory, subcategoryItems]) => (
                        <div key={subcategory} className="space-y-4">
                          {/* Subcategory Heading */}
                          <div className="border-b-2 border-primary/20 pb-2">
                            <h2 className="text-2xl md:text-3xl font-bold font-script bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                              {subcategory}
                            </h2>
                          </div>
                          
                          {/* Items Grid */}
                          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                            {subcategoryItems.map((item, index) => (
                              <Card 
                                key={index} 
                                className="hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                                onClick={() => !isLunchDisabled && handleDishClick(item)}
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
                                    <div className="shrink-0">
                                      {item.hasVariants && item.variants ? (
                                        <div className="text-right">
                                          <span className="text-xl md:text-2xl font-bold text-accent">
                                            From £{Math.min(...item.variants.map((v: any) => v.price)).toFixed(2)}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-xl md:text-2xl font-bold text-accent">
                                          £{typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {item.allergens && item.allergens.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-border">
                                      <p className="text-xs text-muted-foreground mb-1.5">May contain allergens:</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {item.allergens.map((allergen, idx) => (
                                          <span 
                                            key={idx} 
                                            className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-full border border-destructive/20"
                                          >
                                            {allergen}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
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

