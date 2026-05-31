import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface LanguageContextType {
  lang: string;
  setLang: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({ lang: "en", setLang: () => {} });

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState(() => localStorage.getItem("agrolens-lang") || "en");

  const setLang = (newLang: string) => {
    setLangState(newLang);
    localStorage.setItem("agrolens-lang", newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
