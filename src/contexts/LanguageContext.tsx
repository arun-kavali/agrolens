import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from "react";

interface LanguageContextType {
  lang: string;
  setLang: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({ lang: "en", setLang: () => {} });

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState(() => localStorage.getItem("agrolens-lang") || "en");

  const setLang = useCallback((newLang: string) => {
    setLangState(newLang);
    localStorage.setItem("agrolens-lang", newLang);
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
