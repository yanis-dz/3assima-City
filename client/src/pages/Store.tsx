import { useProducts, useGameData } from "@/hooks/use-server-data";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Wallet, CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

import { useLocation } from "wouter";

export default function Store() {
  const [, navigate] = useLocation();
  const { data: products, isLoading } = useProducts();
  const { data: gameData } = useGameData();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank" | "wallet">("cash");

  const purchaseMutation = useMutation({
    mutationFn: async (data: { productId: number; method: "cash" | "bank" | "wallet" }) => {
      return apiRequest("POST", "/api/store/purchase", data);
    },
    onSuccess: () => {
      toast({ title: "تم الشراء بنجاح", description: "تم إضافة المنتج إلى حسابك" });
      queryClient.invalidateQueries({ queryKey: ["/api/game-data"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      setSelectedProduct(null);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "تأكد من توفر رصيد كافي";
      
      if (errorMessage.includes("رصيد المحفظة غير كافي") || errorMessage.includes("رصيد غير كافي")) {
        toast({ 
          title: "رصيد غير كافي", 
          description: "ليس لديك رصيد كافي لإتمام العملية. سيتم تحويلك لصفحة الشحن.", 
          variant: "destructive" 
        });
        setTimeout(() => {
          navigate("/topup");
        }, 2000);
      } else {
        toast({ 
          title: "فشل عملية الشراء", 
          description: errorMessage, 
          variant: "destructive" 
        });
      }
    },
  });

  const handlePurchase = () => {
    if (!selectedProduct) return;
    
    // Auto-select wallet for real money items
    const method = selectedProduct.currency === "real_money" ? "wallet" : paymentMethod;
    
    purchaseMutation.mutate({
      productId: selectedProduct.id,
      method: method,
    });
  };

  const hasProducts = products && products.length > 0;

  // Helper to get type badge color
  const getTypeBadgeColor = (type: string) => {
    switch(type) {
      case 'vehicle': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'rank': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'money': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  // Helper to translate type
  const translateType = (type: string) => {
    switch(type) {
      case 'vehicle': return 'مركبة';
      case 'rank': return 'رتبة';
      case 'money': return 'أموآل';
      case 'item': return 'عنصر';
      default: return 'منتج';
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-16 sm:pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-2 sm:mb-4">
            المتجر <span className="text-primary">الرسمي</span>
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            استخدم أموال اللعبة لشراء مركبات، رتب، ومميزات حصرية
          </p>
          
          {gameData && gameData.linked && (
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-card/80 border border-green-500/20 px-4 py-2 rounded-lg shadow-sm">
                <Wallet className="w-4 h-4 text-green-500" />
                <span className="text-sm text-muted-foreground">الكاش:</span>
                <span className="font-bold text-green-500 font-mono">${gameData.characters?.[0]?.money?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center gap-2 bg-card/80 border border-blue-500/20 px-4 py-2 rounded-lg shadow-sm">
                <CreditCard className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">البنك:</span>
                <span className="font-bold text-blue-500 font-mono">${gameData.characters?.[0]?.bankmoney?.toLocaleString() || 0}</span>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 sm:h-80 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : !hasProducts ? (
          <div className="text-center py-16 sm:py-20">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">لا توجد منتجات حالياً</h3>
            <p className="text-sm sm:text-base text-muted-foreground">سيتم إضافة منتجات قريباً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <Card 
                key={product.id} 
                className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden group flex flex-col"
                data-testid={`card-product-${product.id}`}
              >
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card to-muted">
                      <Package className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className={getTypeBadgeColor(product.type)} variant="outline">
                      {translateType(product.type)}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm sm:text-lg text-foreground line-clamp-1">{product.name}</CardTitle>
                    <Badge variant={product.inStock ? "default" : "secondary"} className="text-[10px] sm:text-xs shrink-0 h-5">
                      {product.inStock ? "متوفر" : "نفذ"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2 px-3 sm:px-4 flex-grow">
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                </CardContent>
                
                <CardFooter className="flex items-center justify-between gap-2 pt-2 px-3 sm:px-4 pb-3 sm:pb-4 border-t border-border/30 mt-auto bg-card/30">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg sm:text-xl font-bold ${product.discount > 0 ? 'text-red-500 line-through text-sm' : 'text-green-500'} font-mono`}>
                        {product.currency === "real_money" ? "$" : "$"}{product.price.toLocaleString()}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-lg sm:text-xl font-bold text-green-500 font-mono">
                          {product.currency === "real_money" ? "$" : "$"}{(product.price * (1 - product.discount / 100)).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {product.discount > 0 && (
                      <span className="text-[10px] text-destructive font-bold bg-destructive/10 px-1.5 py-0.5 rounded w-fit">
                        خصم {product.discount}%
                      </span>
                    )}
                  </div>
                  
                  <Dialog open={selectedProduct?.id === product.id} onOpenChange={(open) => !open && setSelectedProduct(null)}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        disabled={!product.inStock} 
                        className="text-xs sm:text-sm" 
                        onClick={() => setSelectedProduct(product)}
                        data-testid={`button-buy-${product.id}`}
                      >
                        <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                        شراء
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>تأكيد الشراء</DialogTitle>
                        <DialogDescription>
                          أنت على وشك شراء <strong>{product.name}</strong> بسعر <span className="text-green-500 font-bold">
                            {product.currency === "real_money" ? "$" : "$"}{(product.price * (1 - (product.discount || 0) / 100)).toLocaleString()}
                          </span>
                        </DialogDescription>
                      </DialogHeader>
                      
                      {product.currency === "real_money" ? (
                        <div className="py-6 text-center">
                          <p className="text-muted-foreground mb-4">سيتم خصم المبلغ من محفظتك الإلكترونية.</p>
                          <div className="bg-primary/5 p-4 rounded-lg mb-4">
                            <p className="font-bold text-lg">الرصيد المطلوب: ${product.price.toLocaleString()}</p>
                          </div>
                          <Button className="w-full" onClick={handlePurchase} disabled={purchaseMutation.isPending}>
                            {purchaseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            شراء من المحفظة
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="py-4">
                            <Label className="mb-3 block">اختر طريقة الدفع:</Label>
                            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "cash" | "bank")} className="grid grid-cols-2 gap-4">
                              <div>
                                <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                                <Label
                                  htmlFor="cash"
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                  <Wallet className="mb-2 h-6 w-6 text-green-500" />
                                  <span className="font-bold">الكاش (Cash)</span>
                                </Label>
                              </div>
                              <div>
                                <RadioGroupItem value="bank" id="bank" className="peer sr-only" />
                                <Label
                                  htmlFor="bank"
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                  <CreditCard className="mb-2 h-6 w-6 text-blue-500" />
                                  <span className="font-bold">البنك (Bank)</span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedProduct(null)}>إلغاء</Button>
                            <Button onClick={handlePurchase} disabled={purchaseMutation.isPending}>
                              {purchaseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              تأكيد الدفع
                            </Button>
                          </DialogFooter>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      <p className="mt-8 text-center text-[10px] font-mono text-muted-foreground/25 tracking-wide">
        © Assima City — by : <span className="text-primary/40">loay</span> // <span className="text-primary/40">@ut.v</span>
      </p>
      </div>
    </div>
  );
}
