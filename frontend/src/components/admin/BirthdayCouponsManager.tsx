import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { 
  Loader2, 
  Gift, 
  Calendar, 
  Users, 
  Percent,
  Clock,
  Mail,
  Phone,
  Cake,
  Sparkles
} from "lucide-react";

interface BirthdayCoupon {
  _id: string;
  code: string;
  discountPercentage: number;
  expiryDate: string;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
  type: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  createdAt: string;
}

interface UpcomingBirthday {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  birthdayDate: string;
  daysUntilBirthday: number;
  age: number;
}

export const BirthdayCouponsManager = () => {
  const [birthdayCoupons, setBirthdayCoupons] = useState<BirthdayCoupon[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<UpcomingBirthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    discountPercentage: 15,
    validDays: 7,
    daysInAdvance: 3,
    message: "🎉 Happy Birthday! Enjoy your special discount on us!"
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [couponsData, birthdaysData] = await Promise.all([
        api.getAllBirthdayCoupons(),
        api.getUpcomingBirthdays(30) // Get birthdays for next 30 days
      ]);
      setBirthdayCoupons(couponsData);
      setUpcomingBirthdays(birthdaysData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch birthday data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoupons = async () => {
    if (formData.discountPercentage < 1 || formData.discountPercentage > 100) {
      toast({
        title: "Validation Error",
        description: "Discount percentage must be between 1 and 100",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      console.log('Generating birthday coupons with data:', formData);
      const result = await api.generateBirthdayCoupons({
        discountPercentage: formData.discountPercentage,
        validDays: formData.validDays,
        message: formData.message,
        daysInAdvance: formData.daysInAdvance
      });
      console.log('Birthday coupon generation result:', result);
      
      const message = result.couponsGenerated > 0 
        ? `Generated ${result.couponsGenerated} birthday coupons and sent ${result.emailsSent} emails`
        : `No coupons generated. ${result.message}`;
      
      toast({
        title: result.couponsGenerated > 0 ? "Success" : "Info",
        description: message,
        variant: result.couponsGenerated > 0 ? "default" : "destructive",
      });
      
      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Birthday coupon generation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate birthday coupons",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleAutoGenerate = async () => {
    setGenerating(true);
    try {
      console.log('Auto-generating birthday coupons...');
      const result = await api.autoGenerateBirthdayCoupons();
      console.log('Auto-generation result:', result);
      
      toast({
        title: "Success",
        description: `Auto-generated ${result.couponsGenerated} birthday coupons for users with birthdays in 3 days`,
      });
      
      fetchData();
    } catch (error: any) {
      console.error('Auto-generation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to auto-generate birthday coupons",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateRange = async () => {
    setGenerating(true);
    try {
      console.log('Generating birthday coupons for next 7 days...');
      const result = await api.generateBirthdayCouponsRange({
        discountPercentage: 15,
        validDays: 7,
        message: "🎉 Happy Birthday! Enjoy your special discount on us!",
        maxDaysAhead: 7
      });
      console.log('Range generation result:', result);
      
      toast({
        title: "Success",
        description: `Generated ${result.couponsGenerated} birthday coupons for ${result.usersWithBirthdays} users with upcoming birthdays`,
      });
      
      fetchData();
    } catch (error: any) {
      console.error('Range generation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate birthday coupons for range",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const getStatusColor = (coupon: BirthdayCoupon) => {
    const isExpired = new Date(coupon.expiryDate) < new Date();
    const isUsed = coupon.usedCount >= coupon.usageLimit;
    
    if (isExpired) return 'bg-gray-500';
    if (isUsed) return 'bg-red-500';
    if (!coupon.isActive) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusText = (coupon: BirthdayCoupon) => {
    const isExpired = new Date(coupon.expiryDate) < new Date();
    const isUsed = coupon.usedCount >= coupon.usageLimit;
    
    if (isExpired) return 'Expired';
    if (isUsed) return 'Used';
    if (!coupon.isActive) return 'Inactive';
    return 'Active';
  };

  const getBirthdayIcon = (daysUntil: number) => {
    if (daysUntil === 0) return '🎂';
    if (daysUntil <= 3) return '🎉';
    if (daysUntil <= 7) return '🎈';
    return '📅';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Cake className="h-5 w-5" />
                Birthday Coupons Management
              </CardTitle>
              <CardDescription>
                Generate and manage birthday coupons for your customers
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAutoGenerate}
                disabled={generating}
                variant="outline"
              >
                {generating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Sparkles className="h-4 w-4 mr-2" />
                Auto Generate (3 Days)
              </Button>
              <Button
                onClick={handleGenerateRange}
                disabled={generating}
                variant="outline"
              >
                {generating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Calendar className="h-4 w-4 mr-2" />
                Generate Next 7 Days
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Gift className="h-4 w-4 mr-2" />
                    Generate Coupons
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate Birthday Coupons</DialogTitle>
                    <DialogDescription>
                      Create birthday coupons for users with birthdays in the specified number of days. Emails will be sent automatically.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="discountPercentage">Discount Percentage</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="discountPercentage"
                          type="number"
                          min="1"
                          max="100"
                          value={formData.discountPercentage}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            discountPercentage: parseInt(e.target.value) || 0 
                          })}
                        />
                        <Percent className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="validDays">Valid for (days)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="validDays"
                          type="number"
                          min="1"
                          max="365"
                          value={formData.validDays}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            validDays: parseInt(e.target.value) || 1 
                          })}
                        />
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="daysInAdvance">Generate (days in advance)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="daysInAdvance"
                          type="number"
                          min="0"
                          max="30"
                          value={formData.daysInAdvance}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            daysInAdvance: parseInt(e.target.value) || 0 
                          })}
                        />
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        0 = today's birthdays, 3 = birthdays in 3 days
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="message">Birthday Message</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Personalized birthday message for the coupon"
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleGenerateCoupons} disabled={generating}>
                      {generating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Generate Coupons
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="coupons" className="space-y-4">
            <TabsList>
              <TabsTrigger value="coupons">
                <Gift className="h-4 w-4 mr-2" />
                Birthday Coupons
              </TabsTrigger>
              <TabsTrigger value="birthdays">
                <Calendar className="h-4 w-4 mr-2" />
                Upcoming Birthdays
              </TabsTrigger>
            </TabsList>

            <TabsContent value="coupons">
              {birthdayCoupons.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Birthday Coupons</h3>
                  <p className="text-muted-foreground mb-4">
                    No birthday coupons have been generated yet.
                  </p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Gift className="h-4 w-4 mr-2" />
                    Generate First Coupons
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {birthdayCoupons.map((coupon) => (
                    <div
                      key={coupon._id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{coupon.code}</h3>
                            <Badge className={getStatusColor(coupon)}>
                              {getStatusText(coupon)}
                            </Badge>
                            <Badge variant="outline">
                              {coupon.discountPercentage}% OFF
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            For: {coupon.userName} ({coupon.userEmail})
                          </p>
                          <p className="text-sm italic text-muted-foreground">
                            "{coupon.message}"
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Created:</span>
                          <p>{new Date(coupon.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="font-medium">Expires:</span>
                          <p>{new Date(coupon.expiryDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="font-medium">Usage:</span>
                          <p>{coupon.usedCount} / {coupon.usageLimit}</p>
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>
                          <p className="capitalize">{getStatusText(coupon)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="birthdays">
              {upcomingBirthdays.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Birthdays</h3>
                  <p className="text-muted-foreground">
                    No customers have birthdays in the next 30 days.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBirthdays.map((birthday) => (
                    <div
                      key={birthday._id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {getBirthdayIcon(birthday.daysUntilBirthday)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{birthday.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Turning {birthday.age} years old
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={birthday.daysUntilBirthday === 0 ? "default" : "outline"}
                            className={birthday.daysUntilBirthday === 0 ? "bg-[#c3a85c]" : ""}
                          >
                            {birthday.daysUntilBirthday === 0 
                              ? "Today!" 
                              : `In ${birthday.daysUntilBirthday} day${birthday.daysUntilBirthday > 1 ? 's' : ''}`
                            }
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{birthday.email}</span>
                        </div>
                        {birthday.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{birthday.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(birthday.birthdayDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};