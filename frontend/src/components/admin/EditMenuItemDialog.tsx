import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Edit, Upload, X, Loader2, Plus } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  subcategory?: string;
  allergens?: string[];
  image?: string;
  hasVariants?: boolean;
  variants?: Array<{ size: string; price: number }>;
}

interface EditMenuItemDialogProps {
  item: MenuItem;
  onSuccess: () => void;
}

export const EditMenuItemDialog = ({ item, onSuccess }: EditMenuItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    subcategory: (item as any).subcategory || "",
    allergens: item.allergens?.join(", ") || "",
    image: item.image || "",
    hasVariants: (item as any).hasVariants || false,
  });
  const [variants, setVariants] = useState(
    (item as any).variants && (item as any).variants.length > 0
      ? (item as any).variants.map((v: any) => ({ size: v.size, price: v.price.toString() }))
      : [
          { size: "Small", price: "" },
          { size: "Medium", price: "" },
          { size: "Large", price: "" },
        ]
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(item.image || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const result = await api.uploadImage(base64, file.name, '/menu-items');

          setFormData({ ...formData, image: result.url });
          setImagePreview(result.url);
          
          toast({
            title: "Success",
            description: "Image uploaded successfully",
          });
        } catch (error) {
          console.error('Upload error:', error);
          toast({
            title: "Error",
            description: "Failed to upload image. Please try again.",
            variant: "destructive",
          });
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to read file",
          variant: "destructive",
        });
        setUploading(false);
      };
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: "" });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate variants if enabled
    if (formData.hasVariants) {
      const validVariants = variants.filter(v => v.price && parseFloat(v.price) > 0);
      if (validVariants.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one variant with a price",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
    }

    try {
      const itemId = (item as any)._id || item.id;
      const updateData: any = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || null,
        allergens: formData.allergens.split(",").map((a) => a.trim()).filter(Boolean),
        image: formData.image || null,
      };

      // Add price or variants based on selection
      if (formData.hasVariants) {
        updateData.hasVariants = true;
        updateData.variants = variants
          .filter(v => v.price && parseFloat(v.price) > 0)
          .map(v => ({
            size: v.size,
            price: parseFloat(v.price)
          }));
      } else {
        updateData.price = parseFloat(formData.price);
        updateData.hasVariants = false;
        updateData.variants = [];
      }

      await api.updateMenuItem(itemId, updateData);
      toast({ title: "Success", description: "Menu item updated" });
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update menu item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Menu Item</DialogTitle>
          <DialogDescription>Update the menu item details below</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          {/* Pricing Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="hasVariants" className="text-base font-semibold">Multiple Sizes/Variants</Label>
                <p className="text-sm text-muted-foreground">Enable if this item has different sizes (Small, Medium, Large)</p>
              </div>
              <input
                type="checkbox"
                id="hasVariants"
                checked={formData.hasVariants}
                onChange={(e) => setFormData({ ...formData, hasVariants: e.target.checked })}
                className="w-5 h-5"
              />
            </div>

            {!formData.hasVariants ? (
              <div>
                <Label htmlFor="price">Price (£)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 12.99"
                  required
                />
              </div>
            ) : (
              <div className="space-y-3">
                <Label>Size Variants & Prices</Label>
                {variants.map((variant, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <Input
                      value={variant.size}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[index].size = e.target.value;
                        setVariants(newVariants);
                      }}
                      placeholder="Size name"
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm">£</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={variant.price}
                        onChange={(e) => {
                          const newVariants = [...variants];
                          newVariants[index].price = e.target.value;
                          setVariants(newVariants);
                        }}
                        placeholder="Price"
                      />
                    </div>
                    {variants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setVariants(variants.filter((_, i) => i !== index))}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setVariants([...variants, { size: "", price: "" }])}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Size
                </Button>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mains">Mains</SelectItem>
                <SelectItem value="Lunch">Lunch</SelectItem>
                <SelectItem value="Drinks">Drinks</SelectItem>
                <SelectItem value="Desserts">Desserts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="subcategory">Subcategory (Optional)</Label>
            <Select 
              value={formData.subcategory || "none"}
              onValueChange={(value) => setFormData({ ...formData, subcategory: value === "none" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subcategory (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="Tandoori Items">Tandoori Items</SelectItem>
                <SelectItem value="Rice">Rice</SelectItem>
                <SelectItem value="Curries">Curries</SelectItem>
                <SelectItem value="Breads">Breads</SelectItem>
                <SelectItem value="Appetizers">Appetizers</SelectItem>
                <SelectItem value="Beverages">Beverages</SelectItem>
                <SelectItem value="Hot Drinks">Hot Drinks</SelectItem>
                <SelectItem value="Cold Drinks">Cold Drinks</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="allergens">Allergens (comma separated)</Label>
            <Input
              id="allergens"
              value={formData.allergens}
              onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
              placeholder="e.g. Dairy, Nuts, Gluten"
            />
          </div>
          <div>
            <Label>Dish Image</Label>
            <div className="space-y-4">
              {/* Image Preview */}
              {(imagePreview || formData.image) && (
                <div className="relative w-full h-48 border-2 border-dashed rounded-lg overflow-hidden">
                  <img
                    src={imagePreview || formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Upload Button */}
              {!formData.image && (
                <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg hover:border-primary transition-colors cursor-pointer bg-muted/20">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload-edit"
                  />
                  <label
                    htmlFor="image-upload-edit"
                    className="flex flex-col items-center justify-center cursor-pointer w-full h-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium mb-1">Click to upload image</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
                      </>
                    )}
                  </label>
                </div>
              )}

              {/* Manual URL Input (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="image-url-edit" className="text-xs text-muted-foreground">
                  Or paste image URL
                </Label>
                <Input
                  id="image-url-edit"
                  value={formData.image}
                  onChange={(e) => {
                    setFormData({ ...formData, image: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://..."
                  disabled={uploading}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
