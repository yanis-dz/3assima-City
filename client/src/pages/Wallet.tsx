import { useQuery } from "@tanstack/react-query";
import { useAuth, useGameData } from "@/hooks/use-server-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet as WalletIcon, DollarSign, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, AlertCircle, CreditCard, Gamepad2, Landmark } from "lucide-react";
import { useLocation } from "wouter";
import type { Balance, Transaction } from "@shared/schema";

const currencyLabels: Record<string, { label: string; symbol: string; color: string }> = {
  usd: { label: "دولار أمريكي", symbol: "$", color: "text-green-400" },
  sar: { label: "ريال سعودي", symbol: "﷼", color: "text-blue-400" },
  points: { label: "نقاط", symbol: "⭐", color: "text-yellow-400" },
};

const transactionTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
  deposit: { label: "إيداع", icon: ArrowDownLeft, color: "text-green-400" },
  withdrawal: { label: "سحب", icon: ArrowUpRight, color: "text-red-400" },
  purchase: { label: "شراء", icon: CreditCard, color: "text-orange-400" },
  refund: { label: "استرداد", icon: ArrowDownLeft, color: "text-blue-400" },
  bonus: { label: "مكافأة", icon: CheckCircle, color: "text-purple-400" },
  transfer: { label: "تحويل", icon: ArrowUpRight, color: "text-cyan-400" },
};

const statusLabels: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: "قيد الانتظار", icon: Clock, color: "bg-yellow-500/20 text-yellow-400" },
  completed: { label: "مكتمل", icon: CheckCircle, color: "bg-green-500/20 text-green-400" },
  failed: { label: "فشل", icon: XCircle, color: "bg-red-500/20 text-red-400" },
  cancelled: { label: "ملغي", icon: AlertCircle, color: "bg-gray-500/20 text-gray-400" },
};

export default function Wallet() {
  const [, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { data: gameData, isLoading: gameDataLoading } = useGameData();

  const { data: balance, isLoading: balanceLoading } = useQuery<Balance>({
    queryKey: ["/api/wallet/balance"],
    enabled: !!user,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/wallet/transactions"],
    enabled: !!user,
  });

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
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <WalletIcon className="w-8 h-8 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">المحفظة</h1>
            </div>
            <p className="text-muted-foreground">إدارة رصيدك ومتابعة المعاملات</p>
          </div>
          <Button onClick={() => navigate("/topup")} className="w-full sm:w-auto" data-testid="button-topup">
            <CreditCard className="w-4 h-4 ml-2" />
            شحن الرصيد
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Real Money Wallet */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground/80">
              <CreditCard className="w-5 h-5 text-green-500" />
              الرصيد الحقيقي
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {balanceLoading ? (
                <>
                  <div className="h-28 bg-muted rounded animate-pulse"></div>
                  <div className="h-28 bg-muted rounded animate-pulse"></div>
                </>
              ) : (
                <>
                  <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-muted-foreground text-sm font-medium">دولار أمريكي (USD)</span>
                        <div className="p-2 bg-green-500/10 rounded-full">
                          <DollarSign className="w-5 h-5 text-green-500" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-green-500 font-mono" data-testid="text-balance-usd">
                        ${(balance?.usd || 0).toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-muted-foreground text-sm font-medium">نقاط الولاء</span>
                        <div className="p-2 bg-yellow-500/10 rounded-full">
                          <span className="text-xl">⭐</span>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-yellow-500 font-mono" data-testid="text-balance-points">
                        {balance?.points || 0}
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>

          {/* In-Game Wallet */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground/80">
              <Gamepad2 className="w-5 h-5 text-primary" />
              رصيد اللعبة (الشخصية الحالية)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gameDataLoading ? (
                <>
                  <div className="h-28 bg-muted rounded animate-pulse"></div>
                  <div className="h-28 bg-muted rounded animate-pulse"></div>
                </>
              ) : !gameData?.linked ? (
                 <div className="col-span-2 h-28 bg-muted/20 border border-dashed border-border flex items-center justify-center rounded-xl text-muted-foreground">
                   يجب ربط حساب اللعبة لعرض الرصيد
                 </div>
              ) : (
                <>
                  <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-muted-foreground text-sm font-medium">الكاش (Cash)</span>
                        <div className="p-2 bg-emerald-500/10 rounded-full">
                          <WalletIcon className="w-5 h-5 text-emerald-500" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-emerald-500 font-mono">
                        ${gameData.characters?.[0]?.money?.toLocaleString() || 0}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-muted-foreground text-sm font-medium">البنك (Bank)</span>
                        <div className="p-2 bg-blue-500/10 rounded-full">
                          <Landmark className="w-5 h-5 text-blue-500" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-blue-500 font-mono">
                        ${gameData.characters?.[0]?.bankmoney?.toLocaleString() || 0}
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5" />
              سجل المعاملات المالية
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">لا توجد معاملات حتى الآن</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => {
                  const typeConfig = transactionTypeLabels[transaction.type];
                  const statusConfig = statusLabels[transaction.status];
                  const currencyConfig = currencyLabels[transaction.currency];
                  const TypeIcon = typeConfig.icon;
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/10 transition-colors"
                      data-testid={`transaction-item-${transaction.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-card border border-border/50 ${typeConfig.color}`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm sm:text-base">{typeConfig.label}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{transaction.description}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-1 font-mono">
                            {new Date(transaction.createdAt).toLocaleDateString("ar-SA", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className={`font-bold text-sm sm:text-lg font-mono ${transaction.type === "withdrawal" || transaction.type === "purchase" ? "text-red-400" : "text-green-400"}`}>
                          {transaction.type === "withdrawal" || transaction.type === "purchase" ? "-" : "+"}
                          {currencyConfig.symbol}{transaction.amount.toFixed(2)}
                        </p>
                        <Badge variant="outline" className={`text-[10px] h-5 mt-1 ${statusConfig.color} border-0`}>
                          <StatusIcon className="w-3 h-3 ml-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
