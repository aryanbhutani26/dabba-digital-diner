import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Plus } from "lucide-react";

interface AddNavItemDialogProps {
  onSuccess: () => void;
}

export const AddNavItemDialog = ({ onSuccess }: AddNavItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    path: "",
    sortOrder: 10,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createNavbarItem(formData);
      toast({ title: "Success", description: "Navigation item created" });
      setOpen(false);
      setFormData({
        name: "",
        path: "",
        sortOrder: 10,
        isActive: true,
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create navigation item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Nav Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Navigation Item</DialogTitle>
          <DialogDescription>Create a new navigation menu item</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Blog"
              required
            />
          </div>
          <div>
            <Label htmlFor="path">Path</Label>
            <Input
              id="path"
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
              placeholder="e.g. /blog"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Must start with / (e.g. /about, /menu)
            </p>
          </div>
          <div>
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input
              id="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Lower numbers appear first (e.g. 1, 2, 3...)
            </p>
          </div>
          <DialogFooter>
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
