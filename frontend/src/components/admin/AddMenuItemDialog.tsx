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
import { Plus, Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface AddMenuItemDialogProps {
  onSuccess: () => void;
}

export const AddMenuItemDialog = ({ onSuccess }: AddMenuItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    allergens: "",
    image: "",
    isActive: true,
    hasVariants: false,
  });
  const [variants, setVariants] = useState([
    { size: "Small", price: "" },
    { size: "Medium", price: "" },
    { size: "Large", price: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<any[]>([]);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showCustomSubcategory, setShowCustomSubcategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [customSubcategory, setCustomSubcategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Predefined subcategories by category
  const predefinedSubcategories: Record<string, string[]> = {
    "Mains": ["Tandoori Items", "Rice", "Curries", "Breads"],
    "Lunch": ["Appetizers", "Lunch Specials"],
    "Drinks": ["Hot Drinks", "Cold Drinks", "Beverages"],
    "Desserts": []
  };

  // Get subcategories for selected category
  const getSubcategoriesForCategory = (category: string) => {
    const predefined = predefinedSubcategories[category] || [];
    const existing = allSubcategories.find(s => s.category === category)?.subcategories || [];
    const combined = [...new Set([...predefined, ...existing])];
    return combined;
  };

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const items = await api.getAllMenuItems();
      const categories = [...new Set(items.map((item: any) => item.category))].filter(Boolean);
      
      // Group subcategories by category
      const subcategoriesMap = items.reduce((acc: any, item: any) => {
        if (item.subcategory && item.category) {
          if (!acc[item.category]) {
            acc[item.category] = new Set();
          }
          acc[item.category].add(item.subcategory);
        }
        return acc;
      }, {});
      
      // Convert to array format
      const subcategoriesArray = Object.entries(subcategoriesMap).map(([category, subs]: [string, any]) => ({
        category,
        subcategories: Array.from(subs)
      }));
      
      setExistingCategories(categories);
      setAllSubcategories(subcategoriesArray);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === "other") {
      setShowCustomCategory(true);
      setFormData({ ...formData, category: "", subcategory: "" });
    } else {
      setShowCustomCategory(false);
      // Reset subcategory when category changes
      setFormData({ ...formData, category: value, subcategory: "" });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
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
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          
          // Upload to ImageKit
          const result = await api.uploadImage(
            base64,
            file.name,
            '/menu-items'
          );

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

    const finalCategory = showCustomCategory ? customCategory : formData.category;
    const finalSubcategory = showCustomSubcategory ? customSubcategory : formData.subcategory;

    if (!finalCategory) {
      toast({
        title: "Error",
        description: "Please select or enter a category",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

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
      const menuItemData: any = {
        name: formData.name,
        description: formData.description,
        category: finalCategory,
        subcategory: finalSubcategory || null,
        allergens: formData.allergens.split(",").map((a) => a.trim()).filter(Boolean),
        image: formData.image || null,
        isActive: formData.isActive,
      };

      // Add price or variants based on selection
      if (formData.hasVariants) {
        menuItemData.hasVariants = true;
        menuItemData.variants = variants
          .filter(v => v.price && parseFloat(v.price) > 0)
          .map(v => ({
            size: v.size,
            price: parseFloat(v.price)
          }));
      } else {
        menuItemData.price = parseFloat(formData.price);
        menuItemData.hasVariants = false;
      }

      await api.createMenuItem(menuItemData);
      toast({ title: "Success", description: "Menu item created successfully" });
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        subcategory: "",
        allergens: "",
        image: "",
        isActive: true,
        hasVariants: false,
      });
      setVariants([
        { size: "Small", price: "" },
        { size: "Medium", price: "" },
        { size: "Large", price: "" },
      ]);
      setShowCustomCategory(false);
      setShowCustomSubcategory(false);
      setCustomCategory("");
      setCustomSubcategory("");
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create menu item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="h-4 w-4 mr-2" />
          Add Menu Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Menu Item</DialogTitle>
          <DialogDescription>Create a new menu item</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Grilled Salmon"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Fresh Atlantic salmon with herbs"
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
            <Select onValueChange={handleCategoryChange} value={showCustomCategory ? "other" : formData.category}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mains">Mains</SelectItem>
                <SelectItem value="Lunch">Lunch</SelectItem>
                <SelectItem value="Drinks">Drinks</SelectItem>
                <SelectItem value="Desserts">Desserts</SelectItem>
                {existingCategories.filter(cat => !['Mains', 'Lunch', 'Drinks', 'Desserts'].includes(cat)).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
                <SelectItem value="other">+ Add New Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {showCustomCategory && (
            <div>
              <Label htmlFor="customCategory">New Category Name</Label>
              <Input
                id="customCategory"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Appetizers, Beverages"
                required
              />
            </div>
          )}
          <div>
            <Label htmlFor="subcategory">Subcategory (Optional)</Label>
            <Select 
              onValueChange={(value) => {
                if (value === "other") {
                  setShowCustomSubcategory(true);
                  setFormData({ ...formData, subcategory: "" });
                } else if (value === "none") {
                  setShowCustomSubcategory(false);
                  setFormData({ ...formData, subcategory: "" });
                } else {
                  setShowCustomSubcategory(false);
                  setFormData({ ...formData, subcategory: value });
                }
              }} 
              value={showCustomSubcategory ? "other" : (formData.subcategory || "none")}
              disabled={!formData.category}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.category ? "Select subcategory (optional)" : "Select category first"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {formData.category && getSubcategoriesForCategory(formData.category).map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
                <SelectItem value="other">+ Add New Subcategory</SelectItem>
              </SelectContent>
            </Select>
            {formData.category && (
              <p className="text-xs text-muted-foreground mt-1">
                Showing subcategories for: {formData.category}
              </p>
            )}
          </div>
          {showCustomSubcategory && (
            <div>
              <Label htmlFor="customSubcategory">New Subcategory Name</Label>
              <Input
                id="customSubcategory"
                value={customSubcategory}
                onChange={(e) => setCustomSubcategory(e.target.value)}
                placeholder="e.g. Grilled Items, Soups"
              />
            </div>
          )}
          <div>
            <Label htmlFor="allergens">Allergens (comma separated)</Label>
            <Input
              id="allergens"
              value={formData.allergens}
              onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
              placeholder="e.g. Fish, Dairy, Gluten"
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
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
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
                <Label htmlFor="image-url" className="text-xs text-muted-foreground">
                  Or paste image URL
                </Label>
                <Input
                  id="image-url"
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
              {loading ? "Creating..." : "Create Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
