import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  User, Shield, Key, Globe, Lock, Eye, EyeOff, Save, Trash2, LogOut,
  Settings, History, CreditCard, UserCircle, AlertTriangle, Gamepad2,
  Users as UsersIcon, Droplets, Coffee, MapPin, Briefcase, Dna, Heart,
  Calendar, Monitor, Clock, Wallet as WalletIcon, ShieldAlert,
  Car, Lock as LockIcon, Unlock, Hash, Crown, Zap, Info
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useGameData } from "@/hooks/use-server-data";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type UserData = { id: number; username: string; email: string; role: string };

function CharacterCard({ char }: { char: any }) {
  return (
    <div className="group relative bg-card border border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all">
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center gap-3 lg:w-1/4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-xl bg-muted/30 border border-border flex items-center justify-center overflow-hidden">
                {char.skin > 0 ? (
                  <img
                    src={`https://www.mtasa-sa.com/skins/${char.skin}.png`}
                    alt={`Skin ${char.skin}`}
                    loading="lazy"
                    className="w-full h-full object-contain p-0.5"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.style.display = 'none';
                      const parent = t.parentElement;
                      if (parent) {
                        parent.innerText = char.charactername.charAt(0);
                        parent.setAttribute('class', (parent.getAttribute('class') || '') + " text-2xl font-bold text-muted-foreground");
                      }
                    }}
                  />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">{char.charactername.charAt(0)}</span>
                )}
              </div>
              {char.cked > 0 && (
                <div className="absolute -bottom-1 -right-1 bg-destructive text-destructive-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">CK</div>
              )}
            </div>
            <div className="text-right flex-1">
              <h4 className="text-sm font-bold font-display truncate">{char.charactername.replace(/_/g, " ")}</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="outline" className="font-mono text-muted-foreground h-4 text-[9px] px-1">ID: {char.id}</Badge>
                <span className="text-muted-foreground text-[10px] flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{char.hoursplayed}h</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {char.pdjail > 0 && <Badge variant="destructive" className="text-[9px] h-4 px-1.5">مسجون</Badge>}
                {char.duty > 0 && <Badge className="bg-blue-500/90 text-[9px] h-4 px-1.5">خدمة</Badge>}
                {char.admin > 0 && <Badge className="bg-red-500/90 text-[9px] h-4 px-1.5">Admin</Badge>}
              </div>
            </div>
          </div>

          <Separator className="lg:hidden" />

          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: Heart, label: "صحة", val: Math.round(parseFloat(char.health || "100")), color: "red" },
                { icon: Shield, label: "درع", val: Math.round(parseFloat(char.armor || "0")), color: "blue" },
                { icon: Droplets, label: "عطش", val: char.thirst, color: "cyan" },
                { icon: Coffee, label: "جوع", val: char.hunger, color: "orange" },
              ].map((s) => (
                <div key={s.label} className="bg-muted/20 rounded-lg p-1.5 border border-border/30">
                  <div className="flex justify-between text-[9px] font-bold text-muted-foreground mb-1">
                    <span className="flex items-center gap-0.5"><s.icon className={`w-2.5 h-2.5 text-${s.color}-500`} />{s.label}</span>
                    <span>{s.val}%</span>
                  </div>
                  <Progress value={s.val} className={`h-1 bg-${s.color}-500/10`} indicatorClassName={`bg-${s.color}-500`} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/20 rounded-lg p-2 border border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WalletIcon className="w-3.5 h-3.5 text-green-500" />
                  <div>
                    <p className="text-[9px] text-muted-foreground">كاش</p>
                    <p className="font-bold font-mono text-green-500 text-sm">${char.money?.toLocaleString()}</p>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <div className="text-right">
                  <p className="text-[9px] text-muted-foreground">بنك</p>
                  <p className="font-bold font-mono text-blue-500 text-sm">${char.bankmoney?.toLocaleString()}</p>
                </div>
                <CreditCard className="w-3.5 h-3.5 text-blue-500 mr-1" />
              </div>
              <div className="bg-muted/20 rounded-lg p-2 border border-border/30 flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-primary" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-[9px] text-muted-foreground">الوظيفة</p>
                  <p className="text-xs font-bold truncate">
                    {char.faction_id > 0 ? <span className="text-primary">فصيل #{char.faction_id} <span className="text-muted-foreground text-[9px]">رتبة {char.faction_rank}</span></span> : (char.job || "عاطل")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full mt-3 border-t border-border/30">
          <AccordionItem value="details" className="border-none">
            <AccordionTrigger className="py-2 text-[10px] text-muted-foreground hover:text-primary hover:no-underline bg-muted/10 rounded-lg px-3 mt-2">
              <span className="flex items-center gap-1.5"><Settings className="w-3 h-3" />تفاصيل</span>
            </AccordionTrigger>
            <AccordionContent className="px-0.5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-3">
                <div className="space-y-2">
                  <div className="bg-muted/10 rounded-lg p-3 border border-border/30">
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1"><Dna className="w-3 h-3" />شخصية</h5>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <div className="flex justify-between p-2 rounded bg-card/50 border border-border/20"><span className="text-muted-foreground text-[10px]">العمر</span><span className="font-bold font-mono">{char.age || "—"}</span></div>
                      <div className="flex justify-between p-2 rounded bg-card/50 border border-border/20"><span className="text-muted-foreground text-[10px]">الجنس</span><span className="font-bold">{char.gender === 0 ? "ذكر" : "أنثى"}</span></div>
                      <div className="flex justify-between p-2 rounded bg-card/50 border border-border/20 col-span-2"><span className="text-muted-foreground text-[10px]">الهاتف</span><span className="font-bold font-mono">{char.phonenumber || "—"}</span></div>
                    </div>
                  </div>
                  <div className="bg-muted/10 rounded-lg p-3 border border-border/30">
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1"><ShieldAlert className="w-3 h-3" />تراخيص</h5>
                    <div className="space-y-1">
                      {[
                        { label: "قيادة", val: char.car_license },
                        { label: "سلاح", val: char.gun_license },
                        { label: "طيران", val: char.pilot_license },
                      ].map((l) => (
                        <div key={l.label} className="flex items-center justify-between p-2 rounded bg-card/50 border border-border/20">
                          <span className="text-[10px]">{l.label}</span>
                          {l.val > 0 ? <Badge className="bg-green-500/15 text-green-600 text-[9px] h-4 px-1.5">سارية</Badge> : <Badge variant="outline" className="text-muted-foreground text-[9px] h-4">—</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-muted/10 rounded-lg p-3 border border-border/30">
                  <h5 className="text-[10px] font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1"><Car className="w-3 h-3" />مركبات ({char.vehicles?.length || 0})</h5>
                  {!char.vehicles?.length ? (
                    <div className="flex flex-col items-center py-6 text-muted-foreground text-[10px] border border-dashed border-border/30 rounded-lg"><Car className="w-6 h-6 mb-1 opacity-20" /><p>لا يوجد</p></div>
                  ) : (
                    <ScrollArea className="h-48">
                      <div className="space-y-1.5">
                        {char.vehicles.map((v: any) => (
                          <div key={v.id} className="p-2 rounded-lg border border-border/30 bg-card/50">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <Car className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-xs font-bold">Model {v.model}</span>
                                <span className="text-[9px] font-mono text-muted-foreground bg-muted/50 px-1 rounded">{v.plate || "—"}</span>
                              </div>
                              {v.locked == 1 ? <Badge variant="outline" className="text-[8px] h-3.5 px-1 gap-0.5"><LockIcon className="w-2 h-2" />مقفل</Badge> : <Badge variant="outline" className="text-[8px] h-3.5 px-1 text-green-600 gap-0.5"><Unlock className="w-2 h-2" />مفتوح</Badge>}
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-[9px]">
                              <div className="bg-muted/30 p-1 rounded text-center"><span className={v.hp > 700 ? "text-green-500 font-bold" : "text-red-500 font-bold"}>{Math.round((v.hp / 1000) * 100)}%</span></div>
                              <div className="bg-muted/30 p-1 rounded text-center"><span className="text-blue-500 font-bold">{Math.round(v.fuel)}% وقود</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
function LinkCodeBox() {
  const { data, isLoading } = useQuery<{ code: string }>({
    queryKey: ["/api/mta/link-code"],
    queryFn: () => fetch("/api/mta/link-code").then(r => r.json()),
  });

  const { toast } = useToast();

  const copyCode = () => {
    if (data?.code) {
      navigator.clipboard.writeText(data.code);
      toast({ title: "تم نسخ الكود!" });
    }
  };

  if (isLoading) return <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary mx-auto" />;

  return (
    <div className="mt-4 space-y-3">
      <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-primary/10 border border-primary/20">
        <span className="font-mono font-bold text-2xl text-primary tracking-widest">{data?.code}</span>
        <button onClick={copyCode} className="text-muted-foreground hover:text-primary transition-colors">
          <Key className="w-4 h-4" />
        </button>
      </div>
      <p className="text-muted-foreground text-xs">في السيرفر اكتب: <span className="font-mono text-primary">/linkaccount {data?.code}</span></p>
    </div>
  );
}

function GameAccountTab({ gameData, isLoading }: { gameData: any; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-card/30 rounded-xl border border-dashed border-border/50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4" />
        <p className="text-muted-foreground text-xs">جاري تحميل البيانات...</p>
      </div>
    );
  }

if (!gameData?.linked) {
    return (
      <Card className="bg-card border-dashed border-2 border-border/60">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gamepad2 className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-lg font-display font-bold mb-2">حساب اللعبة غير مرتبط</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">اربط حسابك في اللعبة عبر الكود أدناه</p>
          <LinkCodeBox />
        </CardContent>
      </Card>
    );
  }

  const { account, characters } = gameData;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-display font-bold text-2xl border-4 border-card shrink-0">
              {account.username.charAt(0).toUpperCase()}
            </div>
            <div className="text-center sm:text-right flex-1 space-y-1.5">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <h2 className="text-xl font-display font-bold">{account.username}</h2>
                {account.activated ? (
                  <Badge className="bg-green-500/20 text-green-600 border-green-500/20 text-[10px] h-5 gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />مفعل</Badge>
                ) : (
                  <Badge variant="destructive" className="text-[10px] h-5">غير مفعل</Badge>
                )}
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded"><Hash className="w-3 h-3" />ID: <span className="font-mono font-bold text-foreground">{account.id}</span></span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{account.registerdate ? new Date(account.registerdate).toLocaleDateString('ar-SA') : "—"}</span>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                {account.admin > 0 && <Badge className="bg-red-500/15 text-red-500 text-[10px] h-5"><Crown className="w-2.5 h-2.5 mr-0.5" />Admin {account.admin}</Badge>}
                {account.supporter > 0 && <Badge className="bg-green-500/15 text-green-500 text-[10px] h-5">Supporter {account.supporter}</Badge>}
                {account.scripter > 0 && <Badge className="bg-blue-500/15 text-blue-500 text-[10px] h-5">Dev</Badge>}
                {account.mapper > 0 && <Badge className="bg-purple-500/15 text-purple-500 text-[10px] h-5">Mapper</Badge>}
                {account.admin === 0 && account.supporter === 0 && <Badge variant="outline" className="text-muted-foreground text-[10px] h-5">لاعب</Badge>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 min-w-[180px]">
              <div className="bg-muted/20 rounded-lg p-2.5 border border-border/40 text-center">
                <Zap className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-[9px] text-muted-foreground">الرصيد</p>
                <p className="text-lg font-bold">{account.credits}</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-2.5 border border-border/40 text-center">
                <History className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <p className="text-[9px] text-muted-foreground">آخر تواجد</p>
                <p className="text-xs font-bold">{account.lastlogin ? new Date(account.lastlogin).toLocaleDateString('en-US') : "—"}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/30 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/10">
              <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="overflow-hidden">
                <p className="text-[9px] text-muted-foreground">Serial</p>
                <p className="text-[10px] font-mono truncate opacity-70">{account.mtaserial || account.MTASERIAL || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/10">
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              <div>
                <p className="text-[9px] text-muted-foreground">IP</p>
                <p className="text-[10px] font-mono opacity-70">{account.ip || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <UsersIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-display font-bold">شخصياتك</h3>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{characters?.length || 0}</Badge>
        </div>
        {!characters?.length ? (
          <div className="py-10 text-center border border-dashed border-border/50 rounded-xl bg-muted/5">
            <UsersIcon className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm font-bold mb-1">لا توجد شخصيات</p>
            <p className="text-muted-foreground text-xs">ادخل السيرفر لإنشاء شخصيتك الأولى</p>
          </div>
        ) : (
          <div className="space-y-3">
            {characters.map((c: any) => <CharacterCard key={c.id} char={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("game");
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: user, isLoading } = useQuery<UserData>({ queryKey: ["/api/auth/me"] });
  const { data: gameData, isLoading: isLoadingGame } = useGameData();

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] }); setLocation("/"); toast({ title: "تم تسجيل الخروج" }); },
    onError: () => { toast({ title: "فشل تسجيل الخروج", variant: "destructive" }); }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => apiRequest("POST", "/api/auth/change-password", data),
    onSuccess: () => { toast({ title: "تم تغيير كلمة المرور" }); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); },
    onError: () => { toast({ title: "فشل تغيير كلمة المرور", variant: "destructive" }); }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/auth/delete-account"),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] }); setLocation("/"); toast({ title: "تم حذف الحساب" }); },
    onError: () => { toast({ title: "فشل حذف الحساب", variant: "destructive" }); }
  });

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) { toast({ title: "كلمات المرور غير متطابقة", variant: "destructive" }); return; }
    if (newPassword.length < 6) { toast({ title: "كلمة المرور يجب 6 أحرف على الأقل", variant: "destructive" }); return; }
    updatePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const navItems = [
    { id: "game", label: "اللعبة", icon: Gamepad2, color: "text-primary", bg: "bg-primary/10" },
    { id: "profile", label: "الملف", icon: UserCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "security", label: "الأمان", icon: Shield, color: "text-green-500", bg: "bg-green-500/10" },
    { id: "danger", label: "خطر", icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <Card className="bg-card border-border max-w-xs w-full mx-4">
          <CardContent className="py-8 text-center">
            <Lock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <h2 className="text-base font-bold mb-1">يجب تسجيل الدخول</h2>
            <p className="text-muted-foreground text-xs mb-3">سجل دخولك للوصول إلى حسابك</p>
            <Button size="sm" onClick={() => setLocation("/login")} data-testid="button-login-redirect">دخول</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    const m: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      owner: { label: "مالك", variant: "destructive" }, admin: { label: "مدير", variant: "default" },
      moderator: { label: "مشرف", variant: "secondary" }, user: { label: "عضو", variant: "secondary" }
    };
    const { label, variant } = m[role] || { label: role, variant: "secondary" as const };
    return <Badge variant={variant} className="text-[10px] h-5">{label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-3">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <h1 className="text-lg font-display font-bold">إعدادات الحساب</h1>
          <p className="text-xs text-muted-foreground">إدارة حسابك</p>
        </div>

        <div className="flex items-center mb-4" dir="rtl">
          <div className="flex items-center p-1 rounded-xl bg-card border border-border/50 gap-0.5 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const isHovered = hoveredTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  onMouseEnter={() => setHoveredTab(item.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={cn(
                    "flex items-center justify-center h-9 px-3 rounded-lg transition-all duration-200 text-xs",
                    isActive || isHovered ? `${item.bg} ${item.color} font-bold` : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className={cn("whitespace-nowrap overflow-hidden transition-all duration-200", isActive || isHovered ? "max-w-24 opacity-100 mr-1.5" : "max-w-0 opacity-0")}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          {activeTab === "game" && <GameAccountTab gameData={gameData} isLoading={isLoadingGame} />}

          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="py-6 text-center flex flex-col items-center">
                  <Avatar className="w-20 h-20 ring-2 ring-primary/10 mb-3">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-2xl font-display font-bold">
                      {user.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-base font-bold mb-0.5">{user.username}</h3>
                  <p className="text-muted-foreground font-mono text-xs mb-2">{user.email}</p>
                  {getRoleBadge(user.role)}
                </CardContent>
              </Card>
              <div className="lg:col-span-2">
                <Card className="bg-card border-border">
                  <CardHeader className="py-4 px-5">
                    <CardTitle className="flex items-center gap-1.5 text-sm"><User className="w-4 h-4 text-primary" />المعلومات</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><Label className="text-xs">المستخدم</Label><Input value={user.username} disabled className="h-8 text-xs bg-muted/30" /></div>
                      <div className="space-y-1"><Label className="text-xs">البريد</Label><Input value={user.email} disabled className="h-8 text-xs bg-muted/30" /></div>
                      <div className="space-y-1"><Label className="text-xs">الاسم</Label><Input placeholder="اسمك" className="h-8 text-xs" /></div>
                      <div className="space-y-1"><Label className="text-xs">الهاتف</Label><Input placeholder="+966 5XX" className="h-8 text-xs" /></div>
                    </div>
                    <div className="space-y-1"><Label className="text-xs">نبذة</Label><textarea className="w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" placeholder="نبذة مختصرة..." /></div>
                    <div className="flex justify-end"><Button size="sm" className="h-8 text-xs"><Save className="w-3 h-3 ml-1" />حفظ</Button></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="py-4 px-5">
                  <CardTitle className="flex items-center gap-1.5 text-sm"><Key className="w-4 h-4 text-primary" />تغيير كلمة المرور</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">الحالية</Label>
                    <div className="relative">
                      <Input type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="h-8 text-xs pl-8" />
                      <Button type="button" variant="ghost" size="icon" className="absolute left-0 top-0 h-8 w-8" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                        {showCurrentPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">الجديدة</Label>
                    <div className="relative">
                      <Input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-8 text-xs pl-8" />
                      <Button type="button" variant="ghost" size="icon" className="absolute left-0 top-0 h-8 w-8" onClick={() => setShowNewPassword(!showNewPassword)}>
                        {showNewPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">تأكيد</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-8 text-xs" />
                  </div>
                  <Button size="sm" className="w-full h-8 text-xs" onClick={handlePasswordChange} disabled={updatePasswordMutation.isPending}>
                    <Key className="w-3 h-3 ml-1" />{updatePasswordMutation.isPending ? "جاري..." : "تحديث"}
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader className="py-4 px-5">
                  <CardTitle className="flex items-center gap-1.5 text-sm"><History className="w-4 h-4 text-primary" />سجل النشاط</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <div><p className="text-xs font-bold">دخول ناجح</p><p className="text-[10px] text-muted-foreground">Chrome</p></div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] h-5">الآن</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border/30 opacity-60">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <div><p className="text-xs">دخول سابق</p><p className="text-[10px] text-muted-foreground">Chrome</p></div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">أمس</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "danger" && (
            <Card className="bg-destructive/5 border-destructive/20">
              <div className="h-1 bg-destructive/20 w-full" />
              <CardHeader className="py-4 px-5">
                <CardTitle className="flex items-center gap-1.5 text-sm text-destructive"><AlertTriangle className="w-4 h-4" />منطقة الخطر</CardTitle>
                <CardDescription className="text-xs">إجراءات لا يمكن التراجع عنها</CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-lg border border-border/50 bg-background/50">
                  <div className="flex items-center gap-2 mb-2"><LogOut className="w-4 h-4" /><h4 className="text-xs font-bold">تسجيل الخروج</h4></div>
                  <p className="text-[10px] text-muted-foreground mb-3">خروج من الجلسة الحالية</p>
                  <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>خروج</Button>
                </div>
                <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div className="flex items-center gap-2 mb-2"><Trash2 className="w-4 h-4 text-destructive" /><h4 className="text-xs font-bold text-destructive">حذف الحساب</h4></div>
                  <p className="text-[10px] text-muted-foreground mb-3">حذف نهائي لجميع البيانات</p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="destructive" size="sm" className="w-full h-8 text-xs">حذف نهائي</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm">هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs">سيتم حذف حسابك وجميع البيانات نهائياً.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="text-xs h-8">إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteAccountMutation.mutate()} className="bg-destructive hover:bg-destructive/90 text-xs h-8">نعم، احذف</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
