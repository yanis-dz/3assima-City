import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Play, Newspaper, ChevronLeft, ChevronRight } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { useNews, useServerStatus, useSettings, useMysqlStats } from "@/hooks/use-server-data";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { Link } from "wouter";

const backgrounds = [
  "/images/backgrounds/1.png",
  "/images/backgrounds/2.png",
  "/images/backgrounds/3.png",
  "/images/backgrounds/4.png",
];

function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    started.current = false;
    setCount(0);
  }, [target]);

  useEffect(() => {
    if (!ref.current || started.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          tick();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function StatItem({ value, label, color = "text-primary" }: { value: number; label: string; color?: string }) {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="text-right">
      <div className={`text-2xl sm:text-3xl font-bold font-display ${color} leading-none`}>
        {count.toLocaleString()}
      </div>
      <div className="text-zinc-500 text-xs sm:text-sm mt-1">{label}</div>
    </div>
  );
}

export default function Home() {
  const { data: news, isLoading } = useNews();
  const { data: status } = useServerStatus();
  const { data: settings } = useSettings();
  const { data: mysqlStats } = useMysqlStats();
  const [copied, setCopied] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrentSlide((p) => (p + 1) % backgrounds.length), 5000);
    return () => clearInterval(t);
  }, []);

  const serverIp = settings?.serverIp || "109.176.229.142:22003";
  const copyIp = () => {
    navigator.clipboard.writeText(serverIp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % backgrounds.length);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + backgrounds.length) % backgrounds.length);

  return (
    <div className="min-h-screen bg-zinc-950">

      {/* ═══ HERO ═══ */}
      <section className="relative h-screen flex items-center overflow-hidden">
        {/* Background Slider */}
        <div className="absolute inset-0">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentSlide}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${backgrounds[currentSlide]})` }}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
            />
          </AnimatePresence>
        </div>

        {/* Dark Gradient: heavy on right → light on left */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/95 via-black/70 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

        {/* Content — Right Aligned */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10">
          <motion.div
            className="max-w-lg mr-0 text-right"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Logo + Title */}
            <motion.img
              src="/images/logo.png"
              alt="Assima City"
              className="w-14 h-14 rounded-xl mb-4 mr-0 ml-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 }}
            />

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-2 text-white" style={{ fontFamily: "'Cairo', serif", letterSpacing: "0.05em" }}>
              Assima City<br />
              <span className="text-primary text-glow">للحياة الواقعية</span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-300 mb-5 leading-relaxed font-body">
              حيث القصص والمغامرات التي <span className="text-primary">لا تُنسى</span>
            </p>

            <p className="text-sm sm:text-base text-zinc-400 mb-5 leading-relaxed max-w-sm mr-0 ml-auto">
              {settings?.heroSubtitle || "انضم إلى سيرفرنا واستمتع بأفضل تجربة لعب حياة واقعية"}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 mb-8">
              <button
                onClick={() => window.open("mtasa://" + serverIp, "_self")}
                className="bg-white text-zinc-900 font-bold text-sm px-6 py-3 rounded-2xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
                data-testid="button-play-now"
              >
                <Play className="w-4 h-4 fill-current" />
                ابدأ اللعب الآن
              </button>
              <button
                onClick={copyIp}
                className="border border-zinc-600 hover:border-zinc-400 text-white font-medium text-sm px-6 py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
                data-testid="button-copy-ip"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="font-mono text-xs">{serverIp}</span>
                  </>
                )}
              </button>
            </div>

            {/* Stats Row — Below Text */}
            <div className="grid grid-cols-4 gap-4 pt-6 border-t border-zinc-700/40">
              <StatItem
                value={status?.players || 0}
                label="متصل الآن"
                color="text-emerald-400"
              />
              <StatItem
                value={status?.maxPlayers || 0}
                label="الحد الأقصى"
              />
              <StatItem
                value={mysqlStats?.totalAccounts || 0}
                label="حسابات"
              />
              <StatItem
                value={mysqlStats?.totalCharacters || 0}
                label="شخصيات"
              />
            </div>
          </motion.div>
        </div>

        {/* Slider Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 w-9 h-9 rounded-full flex items-center justify-center transition z-20"
          data-testid="button-prev-slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 w-9 h-9 rounded-full flex items-center justify-center transition z-20"
          data-testid="button-next-slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {backgrounds.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? "bg-white w-5" : "bg-white/30 hover:bg-white/50"}`}
              data-testid={`button-dot-${i}`}
            />
          ))}
        </div>
      </section>

      {/* ═══ ABOUT ═══ */}
      <section className="py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl sm:text-4xl font-bold mb-4 font-display text-white">من نحن؟</h2>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              {settings?.serverNameAr || "Assima City للحياة الواقعية"} — مجتمع عربي يركز على الجودة والاحترافية.
              انضم واستمتع بأفضل تجربة حياة واقعية في MTA:SA.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ NEWS ═══ */}
      <section className="py-14 sm:py-20 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 font-display text-white"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            آخر <span className="text-primary">الأخبار</span>
          </motion.h2>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-zinc-900 rounded-2xl h-64 animate-pulse border border-zinc-800" />
              ))}
            </div>
          ) : !news?.length ? (
            <div className="text-center py-12">
              <Newspaper className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">لا توجد أخبار حالياً</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-5">
              {news.slice(0, 3).map((item, i) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-primary/40 transition-all"
                  data-testid={`card-news-${item.id}`}
                >
                  <div className="aspect-video w-full overflow-hidden bg-zinc-800">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Newspaper className="w-8 h-8 text-zinc-700" /></div>
                    )}
                  </div>
                  <div className="p-5 text-right">
                    <span className="text-xs text-zinc-600">
                      {item.createdAt ? format(new Date(item.createdAt), "d MMMM yyyy", { locale: arSA }) : ""}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5 mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">{item.content}</p>
                    <p className="text-xs text-zinc-600 mt-3">
                      بواسطة <span className="text-zinc-400">{item.author}</span>
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl sm:text-4xl font-bold mb-3 font-display text-white">
              هل أنت جاهز <span className="text-primary">للانضمام؟</span>
            </h2>
            <p className="text-base text-zinc-400 mb-6 sm:mb-8">انضم الآن وابدأ مغامرتك في عالم الحياة الواقعية</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.open("mtasa://" + serverIp, "_self")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm px-8 py-3.5 rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                data-testid="button-play-cta"
              >
                <Play className="w-4 h-4 fill-current" />
                العب الآن
              </button>
              {settings?.discordLink && (
                <a
                  href={settings.discordLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                  data-testid="button-discord-cta"
                >
                  <SiDiscord className="w-4 h-4" />
                  انضم للديسكورد
                </a>
              )}
              <Link href="/rules">
                <button className="border border-zinc-700 hover:border-zinc-500 text-white text-sm px-8 py-3.5 rounded-2xl transition-all w-full" data-testid="button-rules-cta">
                  القوانين
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
