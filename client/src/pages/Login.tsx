import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-server-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Loader2 } from "lucide-react";
import { SiDiscord, SiGoogle } from "react-icons/si";

export default function Login() {
  const [, navigate] = useLocation();
  const { login, register, isLoggedIn } = useAuth();
  const { toast } = useToast();
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  if (isLoggedIn) {
    navigate("/");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ email: loginEmail, password: loginPassword });
      toast({ title: "تم تسجيل الدخول بنجاح" });
      navigate("/");
    } catch (err: any) {
      toast({ 
        title: "فشل تسجيل الدخول", 
        description: err?.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        variant: "destructive" 
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      toast({ title: "كلمة المرور غير متطابقة", variant: "destructive" });
      return;
    }
    try {
      await register.mutateAsync({ 
        username: regUsername, 
        email: regEmail, 
        password: regPassword 
      });
      toast({ title: "تم إنشاء الحساب بنجاح" });
      navigate("/");
    } catch (err: any) {
      toast({ 
        title: "فشل إنشاء الحساب", 
        description: err?.message || "حدث خطأ ما",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-12 px-4 flex items-center justify-center">
      <Card className="w-full max-w-sm border-border bg-card backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center px-5 py-4">
          <CardTitle className="text-lg font-display text-foreground">مرحباً بك</CardTitle>
          <CardDescription className="text-xs">سجل دخولك أو أنشئ حساب جديد</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 h-8 text-xs">
              <TabsTrigger value="login" className="text-xs" data-testid="tab-login">دخول</TabsTrigger>
              <TabsTrigger value="register" className="text-xs" data-testid="tab-register">جديد</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-2.5">
                <div className="space-y-1">
                  <Label htmlFor="login-email" className="text-xs text-muted-foreground">البريد</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    className="h-9 text-sm bg-muted/30 border-border"
                    data-testid="input-login-email"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="login-password" className="text-xs text-muted-foreground">كلمة المرور</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-9 text-sm bg-muted/30 border-border"
                    data-testid="input-login-password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-9 text-xs font-medium rounded-xl" 
                  disabled={login.isPending}
                  data-testid="button-submit-login"
                >
                  {login.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin ml-1" />
                  ) : (
                    <LogIn className="w-3 h-3 ml-1" />
                  )}
                  دخول
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-2.5">
                <div className="space-y-1">
                  <Label htmlFor="reg-username" className="text-xs text-muted-foreground">اسم المستخدم</Label>
                  <Input
                    id="reg-username"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="اسمك"
                    required
                    minLength={3}
                    className="h-9 text-sm bg-muted/30 border-border"
                    data-testid="input-register-username"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="reg-email" className="text-xs text-muted-foreground">البريد</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    className="h-9 text-sm bg-muted/30 border-border"
                    data-testid="input-register-email"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="reg-password" className="text-xs text-muted-foreground">كلمة المرور</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="h-9 text-sm bg-muted/30 border-border"
                    data-testid="input-register-password"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="reg-confirm" className="text-xs text-muted-foreground">تأكيد</Label>
                  <Input
                    id="reg-confirm"
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-9 text-sm bg-muted/30 border-border"
                    data-testid="input-register-confirm"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-9 text-xs font-medium rounded-xl" 
                  disabled={register.isPending}
                  data-testid="button-submit-register"
                >
                  {register.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin ml-1" />
                  ) : (
                    <UserPlus className="w-3 h-3 ml-1" />
                  )}
                  إنشاء
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-center text-xs text-muted-foreground mb-2.5">أو</p>
            <div className="space-y-2">
              <a href="/api/auth/discord" className="block">
                <Button 
                  variant="outline" 
                  className="w-full h-9 text-xs rounded-xl border-border hover:bg-muted"
                  data-testid="button-oauth-discord"
                >
                  <SiDiscord className="w-3.5 h-3.5 ml-1.5 text-[#5865F2]" />
                  Discord
                </Button>
              </a>
              <a href="/api/auth/google" className="block">
                <Button 
                  variant="outline" 
                  className="w-full h-9 text-xs rounded-xl border-border hover:bg-muted"
                  data-testid="button-oauth-google"
                >
                  <SiGoogle className="w-3.5 h-3.5 ml-1.5 text-[#4285F4]" />
                  Google
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-[10px] font-mono text-muted-foreground/30 tracking-wide">
        by : <span className="text-primary/40">loay</span> // <span className="text-primary/40">@ut.v</span>
      </p>
    </div>
  );
}
