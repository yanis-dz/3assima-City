import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useServerStatus, useAuth, useSettings } from "@/hooks/use-server-data";
import {
  Users, Shield, Home, ShoppingBag, LogIn, LogOut,
  Settings, Menu, X, Moon, Sun, UserCircle, HelpCircle, Wallet,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeProvider";

const navItems = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/rules", label: "القوانين", icon: Shield },
  { href: "/factions", label: "المنظمات", icon: Users },
  { href: "/store", label: "المتجر", icon: ShoppingBag },
  { href: "/faq", label: "الدعم", icon: HelpCircle },
];

const isActivePath = (loc: string, href: string) =>
  href === "/" ? loc === href : loc === href || loc.startsWith(`${href}/`);

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: status } = useServerStatus();
  const { user, isLoggedIn, isOwner, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMobileOpen(false), [location]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const playerCount = status ? `${status.players}/${status.maxPlayers}` : "—";
  const isOnline = status?.online ?? false;

  return (
    <>
      {/* ─── Desktop Navbar ─────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 hidden md:flex items-center justify-between px-6 h-14 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/[0.05]">

        {/* Left — Logo + Server name */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0" data-testid="link-logo">
          <img src="/images/logo.png" alt="Assima City" className="w-8 h-8 rounded-xl" />
          <div className="flex flex-col leading-none">
            <span className="font-display text-sm font-bold text-white tracking-wide">Assima</span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">City</span>
          </div>
        </Link>

        {/* Center — Navigation Pills */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-white/[0.04] border border-white/[0.07] rounded-2xl p-1 gap-0.5">
          {navItems.map((item) => {
            const active = isActivePath(location, item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} data-testid={`link-nav-${item.href.replace("/", "") || "home"}`}>
                <div className={cn(
                  "relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer select-none",
                  active
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                )}>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
          {isOwner && (
            <Link href="/admin" data-testid="link-nav-admin">
              <div className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer select-none",
                isActivePath(location, "/admin")
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
              )}>
                <Settings className="w-3.5 h-3.5 shrink-0" />
                <span>لوحة التحكم</span>
              </div>
            </Link>
          )}
        </div>

        {/* Right — Status + Actions */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Server Status Badge */}
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium",
            isOnline
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", isOnline ? "bg-emerald-400 animate-pulse" : "bg-red-400")} />
            <span>{playerCount}</span>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-white/[0.08]" />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.07] transition-colors"
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Auth */}
          {isLoggedIn ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] transition-colors text-sm text-slate-300 hover:text-white"
                data-testid="button-user-menu"
              >
                <UserCircle className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium max-w-[80px] truncate">{user?.username || "حسابي"}</span>
                <ChevronDown className={cn("w-3 h-3 text-slate-500 transition-transform duration-200", userMenuOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-2 w-44 bg-[#12121a] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-1.5 space-y-0.5">
                      <DropdownItem href="/wallet" icon={Wallet} label="المحفظة" />
                      <DropdownItem href="/account" icon={UserCircle} label="الحساب" />
                      <div className="border-t border-white/[0.06] my-1" />
                      <button
                        onClick={() => { logout.mutate(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        data-testid="button-logout"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/login" data-testid="link-login">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-colors shadow-lg shadow-primary/20 cursor-pointer">
                <LogIn className="w-3.5 h-3.5" />
                <span>دخول</span>
              </div>
            </Link>
          )}
        </div>
      </nav>

      {/* ─── Mobile Navbar ───────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 md:hidden flex items-center justify-between px-4 h-14 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <Link href="/" className="flex items-center gap-2" data-testid="link-logo-mobile">
          <img src="/images/logo.png" alt="Assima City" className="w-7 h-7 rounded-xl" />
          <span className="font-display text-sm font-bold text-white">Assima <span className="text-primary">City</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[10px] font-medium",
            isOnline
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", isOnline ? "bg-emerald-400 animate-pulse" : "bg-red-400")} />
            <span>{playerCount}</span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.07] transition-colors"
            data-testid="button-mobile-menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-3 top-16 z-50 bg-[#12121a] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden md:hidden"
          >
            <div className="p-2 space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(location, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors",
                      active ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                    {active && <span className="mr-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                  </Link>
                );
              })}
              {isOwner && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className={cn("flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors", isActivePath(location, "/admin") ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-white hover:bg-white/[0.05]")}>
                  <Settings className="w-4 h-4" />
                  <span>لوحة التحكم</span>
                </Link>
              )}

              <div className="border-t border-white/[0.06] pt-1 mt-1 space-y-0.5">
                <button onClick={() => { toggleTheme(); setMobileOpen(false); }} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors">
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span>{theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}</span>
                </button>
                {isLoggedIn ? (
                  <>
                    <Link href="/wallet" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"><Wallet className="w-4 h-4" /><span>المحفظة</span></Link>
                    <Link href="/account" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"><UserCircle className="w-4 h-4" /><span>الحساب</span></Link>
                    <button onClick={() => { logout.mutate(); setMobileOpen(false); }} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"><LogOut className="w-4 h-4" /><span>تسجيل الخروج</span></button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-primary hover:bg-primary/10 transition-colors"><LogIn className="w-4 h-4" /><span>تسجيل الدخول</span></Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DropdownItem({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
        <span>{label}</span>
      </div>
    </Link>
  );
}
