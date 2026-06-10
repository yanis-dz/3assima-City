import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-server-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, ArrowRight, DollarSign, Loader2, CheckCircle, AlertCircle, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function Topup() {
  const [, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState("10");
  const [currency, setCurrency] = useState("USD");
  const [isProcessing, setIsProcessing] = useState(false);

  // This is a simulation of a payment gateway response
  const topupMutation = useMutation({
    mutationFn: async (data: { amount: number, currency: string }) => {
      // In a real scenario, this would redirect to a payment gateway
      // For this demo, we'll simulate a direct API call that adds balance
      return apiRequest("POST", "/api/wallet/topup-simulate", data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      toast({ 
        title: "تم شحن الرصيد بنجاح",
        description: `تم إضافة ${data.amount} ${data.currency} إلى محفظتك`
      });
      setIsProcessing(false);
      navigate("/wallet");
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "فشل في شحن الرصيد",
        description: error?.message || "حدث خطأ ما",
        variant: "destructive",
      });
    },
  });

  const handleTopup = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "يرجى إدخال مبلغ صالح", variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);
    // Simulate payment processing delay
    setTimeout(() => {
      topupMutation.mutate({ 
        amount: parseFloat(amount), 
        currency 
      });
    }, 1500);
  };

  const presetAmounts = ["5", "10", "25", "50", "100"];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="text-foreground">جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-16 sm:pb-20 px-3 sm:px-4" dir="rtl">
      <div className="max-w-md mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-8 h-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">شحن الرصيد</h1>
          </div>
          <p className="text-muted-foreground">اشحن رصيدك بشكل فوري وآمن</p>
        </div>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-xl">اختر المبلغ</CardTitle>
            <CardDescription>حدد المبلغ الذي تريد شحنه إلى محفظتك</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>مبلغ الشحن السريع</Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {presetAmounts.map((preset) => (
                  <Button
                    key={preset}
                    variant={amount === preset ? "default" : "outline"}
                    className={amount === preset ? "bg-primary text-primary-foreground" : "bg-background/50"}
                    onClick={() => setAmount(preset)}
                  >
                    ${preset}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-2">
                <Label>أو أدخل مبلغاً مخصصاً</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-bold">
                      {currency === "USD" ? "$" : "SAR"}
                    </div>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8 text-left ltr"
                      placeholder="0.00"
                    />
                  </div>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      {/* <SelectItem value="SAR">SAR (﷼)</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">المبلغ:</span>
                <span className="font-bold">${parseFloat(amount || "0").toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">الرسوم:</span>
                <span className="font-bold text-green-500">مجاناً</span>
              </div>
              <div className="border-t border-primary/10 pt-3 flex justify-between items-center">
                <span className="font-bold">الإجمالي للدفع:</span>
                <span className="font-bold text-xl text-primary">${parseFloat(amount || "0").toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
              onClick={handleTopup}
              disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 ml-2" />
                  شحن الآن
                </>
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>عملية دفع آمنة ومشفرة 100%</span>
            </div>
          </CardContent>
        </Card>

        <Button
          variant="ghost"
          className="w-full mt-4"
          onClick={() => navigate("/wallet")}
        >
          العودة للمحفظة
        </Button>
      </div>
    </div>
  );
}
