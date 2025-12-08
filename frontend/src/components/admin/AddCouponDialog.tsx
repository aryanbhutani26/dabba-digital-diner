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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface AddCouponDialogProps {
  onSuccess: () => void;
}

export const AddCouponDialog = ({ onSuccess }: AddCouponDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    code: "",
    color: "from-amber-500 to-amber-600",
    icon: "Tag",
    isActive: true,
    discountPercent: 10,
    applicableCategories: [] as string[],
    applyToAll: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createCoupon(formData);
      toast({ title: "Success", description: "Coupon created" });
      setOpen(false);
      setFormData({
        title: "",
        subtitle: "",
        description: "",
        code: "",
        color: "from-amber-500 to-amber-600",
        icon: "Tag",
        isActive: true,
        discountPercent: 10,
        applicableCategories: [],
        applyToAll: true,
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create coupon",
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
          Add Coupon
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Coupon</DialogTitle>
          <DialogDescription>Create a new coupon for customers</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 20% OFF"
              required
            />
          </div>
          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. Weekend Dinner"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Valid on Fri-Sun from 6 PM onwards"
              required
            />
          </div>
          <div>
            <Label htmlFor="code">Coupon Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. WEEKEND20"
              required
            />
          </div>
          <div>
            <Label htmlFor="discountPercent">Discount Percentage (%)</Label>
            <Input
              id="discountPercent"
              type="number"
              min="1"
              max="100"
              value={formData.discountPercent}
              onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) || 0 })}
              placeholder="e.g. 20"
              required
            />
          </div>
          <div>
            <Label htmlFor="icon">Icon (Lucide icon name)</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="e.g. Gift, Tag, Percent"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Common icons: Percent, Gift, Tag, Star, Sparkles
            </p>
          </div>
          
          {/* Category Selection */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="applyToAll"
                checked={formData.applyToAll}
                onCheckedChange={(checked) => 
                  setFormData({ 
                    ...formData, 
                    applyToAll: checked as boolean,
                    applicableCategories: checked ? [] : formData.applicableCategories
                  })
                }
              />
              <Label htmlFor="applyToAll" className="text-base font-semibold cursor-pointer">
                Apply to All Categories
              </Label>
            </div>
            
            {!formData.applyToAll && (
              <div className="space-y-3 pl-6">
                <Label className="text-sm text-muted-foreground">Select Applicable Categories:</Label>
                {['Mains', 'Lunch', 'Drinks', 'Desserts'].map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={formData.applicableCategories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            applicableCategories: [...formData.applicableCategories, category]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            applicableCategories: formData.applicableCategories.filter(c => c !== category)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`category-${category}`} className="cursor-pointer">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
