import { useRules } from "@/hooks/use-server-data";
import { motion } from "framer-motion";
import { Shield, MessageSquare, Sword, AlertTriangle, FileText } from "lucide-react";

export default function Rules() {
  const { data: rules, isLoading } = useRules();

  const categories = rules?.reduce((acc, rule) => {
    if (!acc[rule.category]) acc[rule.category] = [];
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, typeof rules>);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'gameplay': return Sword;
      case 'chat': return MessageSquare;
      default: return Shield;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category.toLowerCase()) {
      case 'gameplay': return 'قوانين اللعب';
      case 'chat': return 'قوانين الدردشة';
      case 'general': return 'قوانين عامة';
      default: return category;
    }
  };

  const hasRules = rules && rules.length > 0;

  if (isLoading) {
    return (
      <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 max-w-5xl mx-auto">
        <div className="h-10 sm:h-12 w-36 sm:w-48 bg-card rounded-lg mb-8 sm:mb-12 animate-pulse" />
        <div className="space-y-4 sm:space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 sm:h-40 bg-card rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-16 sm:pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-2 sm:mb-4">
            قوانين <span className="text-primary">السيرفر</span>
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            يرجى قراءة واتباع القوانين لضمان تجربة عادلة للجميع
          </p>
        </div>

        {!hasRules ? (
          <div className="text-center py-16 sm:py-20">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">لا توجد قوانين حالياً</h3>
            <p className="text-sm sm:text-base text-muted-foreground">سيتم إضافة القوانين قريباً</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-8">
            {categories && Object.entries(categories).map(([category, categoryRules], idx) => {
              const Icon = getCategoryIcon(category);
              return (
                <motion.div 
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-card/50 backdrop-blur border border-border rounded-lg sm:rounded-xl p-4 sm:p-6"
                  data-testid={`section-rules-${category}`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-border">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h2 className="text-base sm:text-xl font-display font-bold text-foreground">{getCategoryLabel(category)}</h2>
                  </div>

                  <div className="space-y-2 sm:space-y-4">
                    {categoryRules.map((rule, ruleIdx) => (
                      <div 
                        key={rule.id} 
                        className="flex gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-white/5 transition-colors"
                        data-testid={`rule-${rule.id}`}
                      >
                        <div className="font-mono text-primary/60 font-bold text-xs sm:text-sm pt-0.5 shrink-0">
                          {String(ruleIdx + 1).padStart(2, '0')}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-foreground mb-0.5 sm:mb-1 text-sm sm:text-base">
                            {rule.title}
                          </h3>
                          <p className="text-muted-foreground text-xs sm:text-sm break-words">
                            {rule.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {hasRules && (
          <div className="mt-6 sm:mt-8 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2 sm:gap-3">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-foreground mb-0.5 sm:mb-1 text-sm sm:text-base">تنبيه</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                القوانين قابلة للتغيير. عدم معرفة القوانين ليس عذراً. قرار الإدارة نهائي.
              </p>
            </div>
          </div>
        )}
      <p className="mt-8 text-center text-[10px] font-mono text-muted-foreground/25 tracking-wide">
        © Assima City — by : <span className="text-primary/40">loay</span> // <span className="text-primary/40">@ut.v</span>
      </p>
      </div>
    </div>
  );
}
