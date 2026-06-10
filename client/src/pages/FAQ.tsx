import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Search, ChevronDown, ChevronUp, Loader2, MessageCircle, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Faq } from "@shared/schema";

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const { data: faqs = [], isLoading } = useQuery<Faq[]>({
    queryKey: ["/api/faqs"],
  });

  const categories = useMemo(() => {
    const cats = new Set(faqs.map((faq) => faq.category));
    return Array.from(cats);
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesSearch =
        searchQuery === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || faq.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [faqs, searchQuery, selectedCategory]);

  const categoryColors: Record<string, string> = {
    "عام": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "تقني": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "اللعب": "bg-green-500/20 text-green-400 border-green-500/30",
    "المتجر": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <HelpCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">الأسئلة الشائعة</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            تجد هنا إجابات لأكثر الأسئلة شيوعاً. إذا لم تجد إجابة لسؤالك، يمكنك فتح تذكرة دعم.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث في الأسئلة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 h-12 text-lg"
              data-testid="input-search-faq"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              data-testid="button-category-all"
            >
              <Tag className="w-4 h-4 ml-1" />
              الكل
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                data-testid={`button-category-${category}`}
              >
                {category}
              </Button>
            ))}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredFaqs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <HelpCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">لا توجد نتائج</h3>
              <p className="text-muted-foreground">
                لم نجد أي أسئلة تطابق بحثك. جرب كلمات مختلفة أو{" "}
                <Link href="/tickets" className="text-primary hover:underline">
                  افتح تذكرة دعم
                </Link>
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredFaqs.map((faq, index) => {
                const isExpanded = expandedFaq === faq.id;
                const categoryColor = categoryColors[faq.category] || "bg-gray-500/20 text-gray-400";

                return (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isExpanded ? "ring-2 ring-primary/30" : ""
                      }`}
                      onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                      data-testid={`faq-card-${faq.id}`}
                    >
                      <CardContent className="p-0">
                        <div className="p-4 flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className={categoryColor}>
                                {faq.category}
                              </Badge>
                            </div>
                            <h3 className="text-lg font-semibold">{faq.question}</h3>
                          </div>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </Button>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-2 border-t">
                                <p className="text-muted-foreground leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">لم تجد إجابتك؟</h3>
              <p className="text-muted-foreground mb-4">
                فريق الدعم الخاص بنا جاهز لمساعدتك في أي استفسار
              </p>
              <Link href="/tickets">
                <Button data-testid="button-open-ticket">
                  فتح تذكرة دعم
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      <p className="mt-8 text-center text-[10px] font-mono text-muted-foreground/25 tracking-wide">
        © Assima City — by : <span className="text-primary/40">loay</span> // <span className="text-primary/40">@ut.v</span>
      </p>
      </div>
    </div>
  );
}
