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
    allergens: "",
    image: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const items = await api.getAllMenuItems();
      const categories = [...new Set(items.map((item: any) => item.category))].filter(Boolean);
      setExistingCategories(categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === "other") {
      setShowCustomCategory(true);
      setFormData({ ...formData, category: "" });
    } else {
      setShowCustomCategory(false);
      setFormData({ ...formData, category: value });
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

    if (!finalCategory) {
      toast({
        title: "Error",
        description: "Please select or enter a category",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      await api.createMenuItem({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: finalCategory,
        allergens: formData.allergens.split(",").map((a) => a.trim()).filter(Boolean),
        image: formData.image || null,
        isActive: formData.isActive,
      });
      toast({ title: "Success", description: "Menu item created successfully" });
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        allergens: "",
        image: "",
        isActive: true,
      });
      setShowCustomCategory(false);
      setCustomCategory("");
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (£)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. 299.99"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={handleCategoryChange} value={showCustomCategory ? "other" : formData.category}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {existingCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">+ Add New Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
