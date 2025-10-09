import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Dish {
  name: string;
  description: string;
  price: string;
  image: string;
  images?: string[];
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();

  if (!dish) return null;

  const displayImages = dish.images || [dish.image];

  const handleAddToCart = () => {
    onAddToCart(dish, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity}x ${dish.name} added to your cart`,
    });
    onOpenChange(false);
    setQuantity(1);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const priceValue = parseFloat(dish.price.replace(/[$+]/g, ''));
  const totalPrice = (priceValue * quantity).toFixed(2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 sm:p-6">
        <div className="p-4 sm:p-0">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl sm:text-3xl font-bold font-script">{dish.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6">
            {/* Image Carousel */}
            <div className="relative aspect-video w-full overflow-hidden rounded-lg group">
              <img
                src={displayImages[currentImageIndex]}
                alt={`${dish.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-300"
              />
              
              {displayImages.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {/* Next Button */}
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  
                  {/* Image Indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    {displayImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex 
                            ? 'bg-accent w-6' 
                            : 'bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Description</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {dish.longDescription || dish.description}
                </p>
              </div>

              {dish.ingredients && (
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Ingredients</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm sm:text-base">
                    {dish.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t">
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <span className="text-base sm:text-lg font-medium">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 sm:h-10 sm:w-10"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <span className="w-10 sm:w-12 text-center font-semibold text-base sm:text-lg">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 sm:h-10 sm:w-10"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
                <span className="text-2xl sm:text-3xl font-bold text-accent">${totalPrice}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DishDialog;
