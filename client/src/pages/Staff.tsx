import { useFactions } from "@/hooks/use-server-data";
import { motion } from "framer-motion";
import { Building2, Users, Shield, Briefcase, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Factions() {
  const { data: factions, isLoading } = useFactions();

  const getFactionTypeLabel = (type: number) => {
    // Force "Government" label for all
    return "حكومية";
  };

  const getFactionTypeColor = (type: number) => {
    // Force "Government" color for all
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  };

  const getFactionBackground = (name: string) => {
    const lowerName = name.toLowerCase();
    
    // Explicitly exclude "Facility Security" (امن المنشآت)
    if (lowerName.includes("منشآت") || lowerName.includes("منشات") || lowerName.includes("facility")) return null;

    // More permissive matching for police/security
    if (
      lowerName.includes("أمن") || 
      lowerName.includes("امن") || 
      lowerName.includes("شرط") || 
      lowerName.includes("police") || 
      lowerName.includes("security") ||
      lowerName.includes("pd") ||
      lowerName.includes("sapd") ||
      lowerName.includes("lspd") ||
      lowerName.includes("sfpd") ||
      lowerName.includes("lvpd")
    ) return "/images/police.jpg";
    
    if (lowerName.includes("صحة") || lowerName.includes("اسعاف") || lowerName.includes("medic") || lowerName.includes("health") || lowerName.includes("hospital")) return "/images/اسعاف.jpg";
    
    if (lowerName.includes("مباحث") || lowerName.includes("fbi") || lowerName.includes("investigation") || lowerName.includes("cid")) return "/images/fbi.jpg";
    
    return null;
  };

  const getFactionPriority = (name: string) => {
    const lowerName = name.toLowerCase();
    
    // Check for Facility Security specifically to give it low priority
    if (lowerName.includes("منشآت") || lowerName.includes("منشات") || lowerName.includes("facility")) return 90;

    if (lowerName.includes("أمن") || lowerName.includes("امن") || lowerName.includes("شرط") || lowerName.includes("police")) return 1;
    if (lowerName.includes("مباحث") || lowerName.includes("fbi")) return 2;
    if (lowerName.includes("صحة") || lowerName.includes("اسعاف") || lowerName.includes("medic")) return 3;
    
    return 99;
  };

  const hasFactions = factions && factions.length > 0;

  const sortedFactions = factions ? [...factions].sort((a, b) => {
    return getFactionPriority(a.name) - getFactionPriority(b.name);
  }) : [];

  return (
    <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-16 sm:pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-2 sm:mb-4">
            المنظمات <span className="text-primary">والقطاعات</span>
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            تعرف على القطاعات الحكومية والعصابات والشركات في السيرفر
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : !hasFactions ? (
          <div className="text-center py-16 sm:py-20">
            <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">لا توجد منظمات حالياً</h3>
            <p className="text-sm sm:text-base text-muted-foreground">سيتم إضافة المنظمات قريباً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedFactions.map((faction) => {
              const bgImage = getFactionBackground(faction.name);
              return (
              <div
                key={faction.id}
                className="animate-in fade-in duration-500"
              >
                <Card className="h-full bg-card/50 border-border/50 hover:border-primary/30 transition-colors duration-300 overflow-hidden group relative">
                  {bgImage && (
                    <div className="absolute inset-0 z-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/80 to-transparent z-10" />
                      <img 
                        src={bgImage} 
                        alt={faction.name} 
                        loading="lazy"
                        className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-500 object-bottom"
                      />
                    </div>
                  )}
                  <div className="relative z-20 h-full flex flex-col">
                    <CardHeader className="pb-3 border-b border-border/30 bg-muted/10 backdrop-blur-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300")}>
                            <Shield className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold">{faction.name}</CardTitle>
                            <span className="text-xs text-muted-foreground font-mono">ID: {faction.id}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn("text-xs backdrop-blur-sm", getFactionTypeColor(faction.type))}>
                          {getFactionTypeLabel(faction.type)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4 flex-1 flex flex-col justify-end">
                      <div className="flex items-center justify-between p-4 bg-muted/40 backdrop-blur-sm rounded-xl border border-border/30 group-hover:border-primary/20 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Users className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">عدد الأعضاء</span>
                        </div>
                        <span className="text-2xl font-bold text-foreground font-mono">{faction.memberCount}</span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            )})}
          </div>
        )}
      <p className="mt-8 text-center text-[10px] font-mono text-muted-foreground/25 tracking-wide">
        © Assima City — by : <span className="text-primary/40">loay</span> // <span className="text-primary/40">@ut.v</span>
      </p>
      </div>
    </div>
  );
}
