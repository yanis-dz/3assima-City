import { useSettings } from "@/hooks/use-server-data";
import { Link } from "wouter";

export function Footer() {
  const { data: settings } = useSettings();

  return (
    <footer className="bg-card border-t border-border py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <img src="/images/logo.png" alt="Assima City" className="w-8 h-8 rounded-lg" />
              <span className="font-display font-bold text-base text-foreground">
                Assima <span className="text-primary">City</span>
              </span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-sm mb-2">
              {settings?.footerText || "أفضل تجربة لعب حياة واقعية في MTA:SA"}
            </p>
            <p className="text-muted-foreground/60 text-[10px] font-mono">
              IP: {settings?.serverIp || "109.176.229.142:22003"}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-3 text-xs">روابط سريعة</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link></li>
              <li><Link href="/rules" className="hover:text-primary transition-colors">القوانين</Link></li>
              <li><Link href="/factions" className="hover:text-primary transition-colors">المنظمات</Link></li>
              <li><Link href="/store" className="hover:text-primary transition-colors">المتجر</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">الدعم</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-3 text-xs">المجتمع</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {settings?.discordLink && (
                <li><a href={settings.discordLink} target="_blank" rel="noopener noreferrer" className="hover:text-[#5865F2] transition-colors">ديسكورد</a></li>
              )}
              {settings?.forumLink && (
                <li><a href={settings.forumLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">المنتدى</a></li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-1 text-center">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} {settings?.serverName || "Assima City"} — {settings?.serverNameAr || "Assima City للحياة الواقعية"} | جميع الحقوق محفوظة
          </p>
          <p className="text-muted-foreground/40 text-[10px] font-mono tracking-wide">
            Designed &amp; Built by <span className="text-primary/60">loay</span> // <span className="text-primary/60">@ut.v</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
