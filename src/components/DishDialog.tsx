import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Dish {
  name: string;
  description: string;
  price: string;
  image: string;
  longDescription?: string;
  ingredients?: string[];
}

interface DishDialogProps {
  dish: Dish | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (dish: Dish, quantity: number) => void;
}

const DishDialog = ({ dish, open, onOpenChange, onAddToCart }: DishDialogProps) => {
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  if (!dish) return null;

  const handleAddToCart = () => {
    onAddToCart(dish, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity}x ${dish.name} added to your cart`,
    });
    onOpenChange(false);
    setQuantity(1);
  };

  const priceValue = parseFloat(dish.price.replace(/[$+]/g, ''));
  const totalPrice = (priceValue * quantity).toFixed(2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">{dish.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="aspect-video w-full overflow-hidden rounded-lg">
            <img
              src={dish.image}
              alt={dish.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">
                {dish.longDescription || dish.description}
              </p>
            </div>

            {dish.ingredients && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Ingredients</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {dish.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <span className="text-lg font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <span className="text-3xl font-bold text-primary">${totalPrice}</span>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DishDialog;
