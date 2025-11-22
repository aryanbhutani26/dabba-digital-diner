import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Promotion {
  _id: string;
  title: string;
  description: string;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  minOrderValue: number;
  maxDiscount?: number;
  priority: number;
  isActive: boolean;
}

interface PromotionsManagerProps {
  promotions: Promotion[];
  onRefresh: () => void;
}

export const PromotionsManager = ({ promotions, onRefresh }: PromotionsManagerProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    startDate: "",
    endDate: "",
    minOrderValue: 0,
    maxDiscount: 0,
    priority: 0,
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingPromotion
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/promotions/${editingPromotion._id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/promotions`;
      
      const response = await fetch(url, {
        method: editingPromotion ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save promotion');

      toast({
        title: "Success",
        description: `Promotion ${editingPromotion ? 'updated' : 'created'} successfully`,
      });

      setOpen(false);
      setEditingPromotion(null);
      setFormData({
        title: "",
        description: "",
        discountType: "percentage",
        discountValue: 0,
        startDate: "",
        endDate: "",
        minOrderValue: 0,
        maxDiscount: 0,
        priority: 0,
        isActive: true,
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      startDate: promotion.startDate.split('T')[0],
      endDate: promotion.endDate.split('T')[0],
      minOrderValue: promotion.minOrderValue,
      maxDiscount: promotion.maxDiscount || 0,
      priority: promotion.priority,
      isActive: promotion.isActive,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/promotions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });

      if (!response.ok) throw new Error('Failed to delete promotion');

      toast({
        title: "Success",
        description: "Promotion deleted successfully",
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isActive = (promo: Promotion) => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    return promo.isActive && now >= start && now <= end;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Promotions Management</CardTitle>
            <CardDescription>Create and manage time-based promotions</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button" onClick={() => { setEditingPromotion(null); setFormData({
                title: "",
                description: "",
                discountType: "percentage",
                discountValue: 0,
                startDate: "",
                endDate: "",
                minOrderValue: 0,
                maxDiscount: 0,
                priority: 0,
                isActive: true,
              }); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Promotion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPromotion ? 'Edit' : 'Add'} Promotion</DialogTitle>
                <DialogDescription>
                  Create time-based promotions with discounts
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Flash Sale"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Description</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Get 20% off on all orders"
                      required
                    />
                  </div>
                  <div>
                    <Label>Discount Type</Label>
                    <Select value={formData.discountType} onValueChange={(value) => setFormData({ ...formData, discountType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Discount Value</Label>
                    <Input
                      type="number"
                      value={formData.discountValue || ''}
                      onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                      placeholder={formData.discountType === 'percentage' ? '20' : '100'}
                      required
                    />
                  </div>
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Min Order Value (₹)</Label>
                    <Input
                      type="number"
                      value={formData.minOrderValue || ''}
                      onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Max Discount (₹)</Label>
                    <Input
                      type="number"
                      value={formData.maxDiscount || ''}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
                      placeholder="0 for unlimited"
                    />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Input
                      type="number"
                      value={formData.priority || ''}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label>Active</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPromotion ? 'Update' : 'Create'} Promotion
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {promotions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No promotions yet</p>
          ) : (
            promotions.map((promo) => (
              <div key={promo._id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{promo.title}</h3>
                      {isActive(promo) ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{promo.description}</p>
                    <div className="text-sm space-y-1">
                      <p><strong>Discount:</strong> {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `₹${promo.discountValue}`}</p>
                      <p><strong>Period:</strong> {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}</p>
                      {promo.minOrderValue > 0 && <p><strong>Min Order:</strong> ₹{promo.minOrderValue}</p>}
                      {promo.maxDiscount && promo.maxDiscount > 0 && <p><strong>Max Discount:</strong> ₹{promo.maxDiscount}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(promo)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(promo._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
