import { useState } from "react";
import { useLocation } from "wouter";
import {
  useAuth, useNews, useStaff, useRules, useProducts, useSettings, useUsers,
  useCreateNews, useUpdateNews, useDeleteNews,
  useCreateStaff, useUpdateStaff, useDeleteStaff,
  useCreateRule, useUpdateRule, useDeleteRule,
  useCreateProduct, useUpdateProduct, useDeleteProduct,
  useUpdateSettings, useUpdateUser, useDeleteUser
} from "@/hooks/use-server-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Save, X, Newspaper, Users, Shield, ShoppingBag, Settings, UserCog, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { News, Staff, Rule, Product, Settings as SettingsType, Faq } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";

export default function Admin() {
  const [, navigate] = useLocation();
  const { isOwner, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: news } = useNews();
  const { data: staff } = useStaff();
  const { data: rules } = useRules();
  const { data: products } = useProducts();
  const { data: settings } = useSettings();
  const { data: users } = useUsers();

  const createNews = useCreateNews();
  const updateNews = useUpdateNews();
  const deleteNews = useDeleteNews();

  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  const createRule = useCreateRule();
  const updateRule = useUpdateRule();
  const deleteRule = useDeleteRule();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const updateSettings = useUpdateSettings();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const { data: faqs = [] } = useQuery<Faq[]>({
    queryKey: ["/api/faqs"],
  });

  const createFaqMutation = useMutation({
    mutationFn: async (data: { question: string; answer: string; category: string }) => {
      return apiRequest("POST", "/api/faqs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({ title: "تم إضافة السؤال" });
      setNewItem(null);
    },
    onError: () => {
      toast({ title: "فشل إضافة السؤال", variant: "destructive" });
    },
  });

  const updateFaqMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<Faq>) => {
      return apiRequest("PUT", `/api/faqs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({ title: "تم تحديث السؤال" });
      setEditingFaq(null);
    },
    onError: () => {
      toast({ title: "فشل تحديث السؤال", variant: "destructive" });
    },
  });

  const deleteFaqMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/faqs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({ title: "تم حذف السؤال" });
    },
    onError: () => {
      toast({ title: "فشل حذف السؤال", variant: "destructive" });
    },
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingFaq, setEditingFaq] = useState<{ id: number; question: string; answer: string; category: string } | null>(null);
  const [newItem, setNewItem] = useState<any>(null);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  const handleOpenProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setNewItem({ 
        name: product.name, 
        description: product.description, 
        price: product.price, 
        category: product.category, 
        type: product.type, 
        currency: product.currency || "game_money",
        discount: product.discount || 0,
        imageUrl: product.imageUrl, 
        inStock: product.inStock 
      });
    } else {
      setEditingProduct(null);
      setNewItem({ 
        name: "", 
        description: "", 
        price: 0, 
        category: "", 
        type: "item", 
        currency: "game_money",
        discount: 0,
        imageUrl: "", 
        inStock: true 
      });
    }
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ 
          id: editingProduct.id, 
          ...newItem
        });
        toast({ title: "تم تعديل المنتج بنجاح" });
      } else {
        await createProduct.mutateAsync(newItem);
        toast({ title: "تم إضافة المنتج" });
      }
      setIsProductDialogOpen(false);
      setNewItem(null);
      setEditingProduct(null);
    } catch {
      toast({ title: "فشل حفظ المنتج", variant: "destructive" });
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
      <div className="text-foreground">جاري التحميل...</div>
    </div>;
  }

  if (!isOwner) {
    navigate("/");
    return null;
  }

  const handleSaveSettings = async (data: Partial<SettingsType>) => {
    try {
      await updateSettings.mutateAsync(data);
      toast({ title: "تم حفظ الإعدادات" });
    } catch {
      toast({ title: "فشل حفظ الإعدادات", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-16 sm:pb-20 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-display font-bold text-foreground mb-1 sm:mb-2">لوحة التحكم</h1>
          <p className="text-sm sm:text-base text-muted-foreground">إدارة محتوى الموقع والإعدادات</p>
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7 mb-4 sm:mb-8 h-auto gap-1 p-1">
            <TabsTrigger value="settings" className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-2 text-xs sm:text-sm">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">الإعدادات</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-2 text-xs sm:text-sm">
              <Newspaper className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">الأخبار</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-2 text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">الفريق</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-2 text-xs sm:text-sm">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">القوانين</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-2 text-xs sm:text-sm">
              <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">المنتجات</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-2 text-xs sm:text-sm">
              <UserCog className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">المستخدمين</span>
            </TabsTrigger>
            <TabsTrigger value="faqs" className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-2 text-xs sm:text-sm">
              <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">الأسئلة</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                <CardTitle className="text-foreground text-base sm:text-lg">إعدادات الموقع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label>اسم السيرفر (إنجليزي)</Label>
                    <Input
                      defaultValue={settings?.serverName}
                      onBlur={(e) => handleSaveSettings({ serverName: e.target.value })}
                      data-testid="input-settings-servername"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>اسم السيرفر (عربي)</Label>
                    <Input
                      defaultValue={settings?.serverNameAr}
                      onBlur={(e) => handleSaveSettings({ serverNameAr: e.target.value })}
                      data-testid="input-settings-servername-ar"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IP السيرفر</Label>
                    <Input
                      defaultValue={settings?.serverIp}
                      onBlur={(e) => handleSaveSettings({ serverIp: e.target.value })}
                      data-testid="input-settings-ip"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رابط الديسكورد</Label>
                    <Input
                      defaultValue={settings?.discordLink}
                      onBlur={(e) => handleSaveSettings({ discordLink: e.target.value })}
                      placeholder="https://discord.gg/..."
                      data-testid="input-settings-discord"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رابط المنتدى</Label>
                    <Input
                      defaultValue={settings?.forumLink}
                      onBlur={(e) => handleSaveSettings({ forumLink: e.target.value })}
                      placeholder="https://..."
                      data-testid="input-settings-forum"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>عنوان الصفحة الرئيسية</Label>
                  <Input
                    defaultValue={settings?.heroTitle}
                    onBlur={(e) => handleSaveSettings({ heroTitle: e.target.value })}
                    data-testid="input-settings-hero-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>وصف الصفحة الرئيسية</Label>
                  <Textarea
                    defaultValue={settings?.heroSubtitle}
                    onBlur={(e) => handleSaveSettings({ heroSubtitle: e.target.value })}
                    data-testid="input-settings-hero-subtitle"
                  />
                </div>
                <div className="space-y-2">
                  <Label>نص التذييل</Label>
                  <Input
                    defaultValue={settings?.footerText}
                    onBlur={(e) => handleSaveSettings({ footerText: e.target.value })}
                    data-testid="input-settings-footer"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-6 py-4 sm:py-6">
                <CardTitle className="text-foreground text-base sm:text-lg">إدارة الأخبار</CardTitle>
                <Button
                  size="sm"
                  className="w-full sm:w-auto text-xs sm:text-sm"
                  onClick={() => setNewItem({ title: "", content: "", author: "", imageUrl: "" })}
                  data-testid="button-add-news"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                  إضافة خبر
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                {newItem && (
                  <div className="p-4 border border-primary/20 rounded-lg space-y-4 bg-primary/5">
                    <Input
                      placeholder="عنوان الخبر"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    />
                    <Textarea
                      placeholder="محتوى الخبر"
                      value={newItem.content}
                      onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                    />
                    <Input
                      placeholder="اسم الكاتب"
                      value={newItem.author}
                      onChange={(e) => setNewItem({ ...newItem, author: e.target.value })}
                    />
                    <Input
                      placeholder="رابط الصورة (اختياري)"
                      value={newItem.imageUrl}
                      onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button onClick={async () => {
                        try {
                          await createNews.mutateAsync(newItem);
                          setNewItem(null);
                          toast({ title: "تم إضافة الخبر" });
                        } catch {
                          toast({ title: "فشل إضافة الخبر", variant: "destructive" });
                        }
                      }}>
                        <Save className="w-4 h-4 ml-2" />
                        حفظ
                      </Button>
                      <Button variant="outline" onClick={() => setNewItem(null)}>
                        <X className="w-4 h-4 ml-2" />
                        إلغاء
                      </Button>
                    </div>
                  </div>
                )}
                {(!news || news.length === 0) && !newItem && (
                  <p className="text-muted-foreground text-center py-8">لا توجد أخبار</p>
                )}
                {news?.map((item) => (
                  <div key={item.id} className="p-4 border border-border rounded-lg flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">بواسطة: {item.author}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذا الخبر؟")) {
                            deleteNews.mutate(item.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-foreground">إدارة الفريق</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setNewItem({ username: "", role: "Moderator", avatarUrl: "" })}
                  data-testid="button-add-staff"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة عضو
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {newItem && newItem.role !== undefined && (
                  <div className="p-4 border border-primary/20 rounded-lg space-y-4 bg-primary/5">
                    <Input
                      placeholder="اسم المستخدم"
                      value={newItem.username}
                      onChange={(e) => setNewItem({ ...newItem, username: e.target.value })}
                    />
                    <Select value={newItem.role} onValueChange={(v) => setNewItem({ ...newItem, role: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="الرتبة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Owner">المؤسس</SelectItem>
                        <SelectItem value="Admin">مدير</SelectItem>
                        <SelectItem value="Moderator">مشرف</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="رابط الصورة الرمزية (اختياري)"
                      value={newItem.avatarUrl || ""}
                      onChange={(e) => setNewItem({ ...newItem, avatarUrl: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button onClick={async () => {
                        try {
                          await createStaff.mutateAsync(newItem);
                          setNewItem(null);
                          toast({ title: "تم إضافة العضو" });
                        } catch {
                          toast({ title: "فشل إضافة العضو", variant: "destructive" });
                        }
                      }}>
                        <Save className="w-4 h-4 ml-2" />
                        حفظ
                      </Button>
                      <Button variant="outline" onClick={() => setNewItem(null)}>
                        <X className="w-4 h-4 ml-2" />
                        إلغاء
                      </Button>
                    </div>
                  </div>
                )}
                {(!staff || staff.length === 0) && !newItem && (
                  <p className="text-muted-foreground text-center py-8">لا يوجد أعضاء فريق</p>
                )}
                {staff?.map((member) => (
                  <div key={member.id} className="p-4 border border-border rounded-lg flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {member.username.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{member.username}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("هل أنت متأكد من حذف هذا العضو؟")) {
                          deleteStaff.mutate(member.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-foreground">إدارة القوانين</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setNewItem({ title: "", description: "", category: "General" })}
                  data-testid="button-add-rule"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة قانون
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {newItem && newItem.category !== undefined && (
                  <div className="p-4 border border-primary/20 rounded-lg space-y-4 bg-primary/5">
                    <Input
                      placeholder="عنوان القانون"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    />
                    <Textarea
                      placeholder="وصف القانون"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    />
                    <Select value={newItem.category} onValueChange={(v) => setNewItem({ ...newItem, category: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="التصنيف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">عام</SelectItem>
                        <SelectItem value="Gameplay">اللعب</SelectItem>
                        <SelectItem value="Chat">الدردشة</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button onClick={async () => {
                        try {
                          await createRule.mutateAsync(newItem);
                          setNewItem(null);
                          toast({ title: "تم إضافة القانون" });
                        } catch {
                          toast({ title: "فشل إضافة القانون", variant: "destructive" });
                        }
                      }}>
                        <Save className="w-4 h-4 ml-2" />
                        حفظ
                      </Button>
                      <Button variant="outline" onClick={() => setNewItem(null)}>
                        <X className="w-4 h-4 ml-2" />
                        إلغاء
                      </Button>
                    </div>
                  </div>
                )}
                {(!rules || rules.length === 0) && !newItem && (
                  <p className="text-muted-foreground text-center py-8">لا توجد قوانين</p>
                )}
                {rules?.map((rule) => (
                  <div key={rule.id} className="p-4 border border-border rounded-lg flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground">{rule.title}</h4>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                      <p className="text-xs text-primary mt-1">{rule.category}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("هل أنت متأكد من حذف هذا القانون؟")) {
                          deleteRule.mutate(rule.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-foreground">إدارة المنتجات</CardTitle>
                <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => handleOpenProductDialog()}
                      data-testid="button-add-product"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة منتج
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
                      <DialogDescription>
                        قم بملء تفاصيل المنتج أدناه. اضغط حفظ عند الانتهاء.
                      </DialogDescription>
                    </DialogHeader>
                    
                    {newItem && (
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>اسم المنتج</Label>
                            <Input
                              placeholder="اسم المنتج"
                              value={newItem.name}
                              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>نوع المنتج</Label>
                            <Select value={newItem.type} onValueChange={(v) => setNewItem({ ...newItem, type: v })}>
                              <SelectTrigger>
                                <SelectValue placeholder="نوع المنتج" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="item">عنصر (Item)</SelectItem>
                                <SelectItem value="vehicle">مركبة (Vehicle)</SelectItem>
                                <SelectItem value="rank">رتبة (Rank)</SelectItem>
                                <SelectItem value="money">أموآل (Money)</SelectItem>
                                <SelectItem value="other">آخر</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>وصف المنتج</Label>
                          <Textarea
                            placeholder="وصف المنتج"
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>نوع العملة</Label>
                            <Select value={newItem.currency || "game_money"} onValueChange={(v) => setNewItem({ ...newItem, currency: v })}>
                              <SelectTrigger>
                                <SelectValue placeholder="نوع العملة" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="game_money">عملة اللعبة</SelectItem>
                                <SelectItem value="real_money">عملة حقيقية (USD)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>السعر</Label>
                            <Input
                              type="number"
                              placeholder="السعر"
                              value={newItem.price}
                              onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>نسبة الخصم (%)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={newItem.discount || 0}
                              onChange={(e) => setNewItem({ ...newItem, discount: Number(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>التصنيف</Label>
                            <Input
                              placeholder="التصنيف (مثال: سيارات رياضية)"
                              value={newItem.category}
                              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>رابط الصورة</Label>
                          <Input
                            placeholder="رابط الصورة (اختياري)"
                            value={newItem.imageUrl || ""}
                            onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                          />
                        </div>
                        
                        <div className="flex items-center gap-2 pt-2">
                          <Switch
                            checked={newItem.inStock}
                            onCheckedChange={(v) => setNewItem({ ...newItem, inStock: v })}
                          />
                          <Label>متوفر في المتجر</Label>
                        </div>
                      </div>
                    )}

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>إلغاء</Button>
                      <Button onClick={handleSaveProduct} disabled={createProduct.isPending || updateProduct.isPending}>
                        {createProduct.isPending || updateProduct.isPending ? "جاري الحفظ..." : "حفظ"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-4">
                {(!products || products.length === 0) && (
                  <p className="text-muted-foreground text-center py-8">لا توجد منتجات</p>
                )}
                
                {products?.map((product) => (
                  <div key={product.id} className="p-4 border border-border rounded-lg flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{product.type}</Badge>
                        {product.currency === "real_money" && <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Real Money</Badge>}
                        {product.discount > 0 && <Badge variant="destructive">-{product.discount}%</Badge>}
                        <h4 className="font-bold text-foreground">{product.name}</h4>
                        {!product.inStock && <Badge variant="destructive" className="text-[10px]">غير متوفر</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className={`font-bold ${product.discount > 0 ? "text-muted-foreground line-through text-xs" : "text-primary"}`}>
                          {product.price.toLocaleString()} {product.currency === "real_money" ? "$" : "ر.س"}
                        </p>
                        {product.discount > 0 && (
                          <p className="text-primary font-bold">
                            {(product.price * (1 - product.discount / 100)).toLocaleString()} {product.currency === "real_money" ? "$" : "ر.س"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenProductDialog(product)}
                      >
                        <Edit className="w-4 h-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
                            deleteProduct.mutate(product.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">إدارة المستخدمين</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(!users || users.length === 0) && (
                  <p className="text-muted-foreground text-center py-8">لا يوجد مستخدمين</p>
                )}
                {users?.map((user) => (
                  <div key={user.id} className="p-4 border border-border rounded-lg flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-foreground">{user.username}</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select
                        value={user.role}
                        onValueChange={async (role) => {
                          try {
                            await updateUser.mutateAsync({ id: user.id, role });
                            toast({ title: "تم تحديث الرتبة" });
                          } catch {
                            toast({ title: "فشل تحديث الرتبة", variant: "destructive" });
                          }
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">مستخدم</SelectItem>
                          <SelectItem value="moderator">مشرف</SelectItem>
                          <SelectItem value="admin">مدير</SelectItem>
                          <SelectItem value="owner">مؤسس</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
                            deleteUser.mutate(user.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faqs">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-6 py-4 sm:py-6">
                <CardTitle className="text-foreground text-base sm:text-lg">إدارة الأسئلة الشائعة</CardTitle>
                <Button
                  size="sm"
                  className="w-full sm:w-auto text-xs sm:text-sm"
                  onClick={() => setNewItem({ question: "", answer: "", category: "عام", type: "faq" })}
                  data-testid="button-add-faq"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                  إضافة سؤال
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                {newItem?.type === "faq" && (
                  <div className="p-4 border border-primary/20 rounded-lg space-y-4 bg-primary/5">
                    <Input
                      placeholder="السؤال"
                      value={newItem.question}
                      onChange={(e) => setNewItem({ ...newItem, question: e.target.value })}
                    />
                    <Textarea
                      placeholder="الجواب"
                      value={newItem.answer}
                      onChange={(e) => setNewItem({ ...newItem, answer: e.target.value })}
                    />
                    <Select
                      value={newItem.category}
                      onValueChange={(category) => setNewItem({ ...newItem, category })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="عام">عام</SelectItem>
                        <SelectItem value="تقني">تقني</SelectItem>
                        <SelectItem value="اللعب">اللعب</SelectItem>
                        <SelectItem value="المتجر">المتجر</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => createFaqMutation.mutate({
                          question: newItem.question,
                          answer: newItem.answer,
                          category: newItem.category,
                        })}
                      >
                        <Save className="w-4 h-4 ml-1" />
                        حفظ
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNewItem(null)}
                      >
                        <X className="w-4 h-4 ml-1" />
                        إلغاء
                      </Button>
                    </div>
                  </div>
                )}

                {faqs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">لا توجد أسئلة شائعة</p>
                ) : (
                  faqs.map((faq) => (
                    <div key={faq.id} className="p-4 border border-border/50 rounded-lg space-y-3">
                      {editingFaq?.id === faq.id ? (
                        <div className="space-y-4">
                          <Input
                            value={editingFaq.question}
                            onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                            placeholder="السؤال"
                          />
                          <Textarea
                            value={editingFaq.answer}
                            onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                            placeholder="الجواب"
                          />
                          <Select
                            value={editingFaq.category}
                            onValueChange={(category) => setEditingFaq({ ...editingFaq, category })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="عام">عام</SelectItem>
                              <SelectItem value="تقني">تقني</SelectItem>
                              <SelectItem value="اللعب">اللعب</SelectItem>
                              <SelectItem value="المتجر">المتجر</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              disabled={updateFaqMutation.isPending}
                              onClick={() => {
                                updateFaqMutation.mutate({
                                  id: editingFaq.id,
                                  question: editingFaq.question,
                                  answer: editingFaq.answer,
                                  category: editingFaq.category,
                                });
                              }}
                            >
                              <Save className="w-4 h-4 ml-1" />
                              {updateFaqMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingFaq(null)}
                            >
                              <X className="w-4 h-4 ml-1" />
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">{faq.category}</Badge>
                              </div>
                              <h4 className="font-bold text-foreground">{faq.question}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingFaq({ id: faq.id, question: faq.question, answer: faq.answer, category: faq.category })}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm("هل أنت متأكد من حذف هذا السؤال؟")) {
                                    deleteFaqMutation.mutate(faq.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
