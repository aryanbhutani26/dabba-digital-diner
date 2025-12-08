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
import { Edit } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface Coupon {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  code: string;
  color: string;
  icon: string;
  discountPercent?: number;
  applicableCategories?: string[];
  applyToAll?: boolean;
}

interface EditCouponDialogProps {
  coupon: Coupon;
  onSuccess: () => void;
}

export const EditCouponDialog = ({ coupon, onSuccess }: EditCouponDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: coupon.title,
    subtitle: coupon.subtitle,
    description: coupon.description,
    code: coupon.code,
    color: coupon.color,
    icon: coupon.icon,
    discountPercent: coupon.discountPercent || 10,
    applicableCategories: coupon.applicableCategories || [],
    applyToAll: coupon.applyToAll !== undefined ? coupon.applyToAll : true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const couponId = (coupon as any)._id || coupon.id;
      await api.updateCoupon(couponId, formData);
      toast({ title: "Success", description: "Coupon updated" });
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update coupon",
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
          <DialogTitle>Edit Coupon</DialogTitle>
          <DialogDescription>Update the coupon details below</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
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
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="color">Color (CSS class)</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="e.g. bg-primary"
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
              placeholder="e.g. Gift"
              required
            />
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
