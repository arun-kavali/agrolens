import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, ScanLine, History, BookOpen, Info, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSelector from "@/components/results/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/languages";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { lang, setLang } = useLanguage();

  const navItems = [
    { to: "/scan", labelKey: "scan", icon: ScanLine },
    { to: "/history", labelKey: "history", icon: History },
    { to: "/guide", labelKey: "plantGuide", icon: BookOpen },
    { to: "/about", labelKey: "about", icon: Info },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-primary">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">
            Agro<span className="text-gradient">Lens</span> AI
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}>
              <Button
                variant={location.pathname === item.to ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <item.icon className="w-4 h-4" />
                {t(lang, item.labelKey)}
              </Button>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <LanguageSelector value={lang} onChange={setLang} />
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-b bg-background"
          >
            <div className="flex flex-col p-4 gap-1">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}>
                  <Button
                    variant={location.pathname === item.to ? "default" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    <item.icon className="w-4 h-4" />
                    {t(lang, item.labelKey)}
                  </Button>
                </Link>
              ))}
              <div className="pt-2 border-t mt-2">
                <LanguageSelector value={lang} onChange={setLang} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
