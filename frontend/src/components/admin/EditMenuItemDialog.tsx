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
import { Edit, Upload, X, Loader2 } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  allergens?: string[];
  image?: string;
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
    allergens: item.allergens?.join(", ") || "",
    image: item.image || "",
  });
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

    try {
      const itemId = (item as any)._id || item.id;
      await api.updateMenuItem(itemId, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        allergens: formData.allergens.split(",").map((a) => a.trim()).filter(Boolean),
        image: formData.image || null,
      });
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
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
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
