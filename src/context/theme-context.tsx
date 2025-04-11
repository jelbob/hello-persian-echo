
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type Language = "en" | "fa";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
};

const translations = {
  en: {
    dashboard: "Dashboard",
    settings: "Settings",
    logout: "Logout",
    search: "Search",
    commands: "Commands",
    customers: "Customers",
    statistics: "Statistics",
    recentCustomers: "Recent Customers",
    login: "Login",
    email: "Email",
    password: "Password",
    loginButton: "Login",
    searchCustomer: "Search by Customer ID",
    customerInfo: "Customer Information",
  },
  fa: {
    dashboard: "داشبورد",
    settings: "تنظیمات",
    logout: "خروج",
    search: "جستجو",
    commands: "دستورات",
    customers: "مشتریان",
    statistics: "آمار",
    recentCustomers: "مشتریان جدید",
    login: "ورود",
    email: "ایمیل",
    password: "رمز عبور",
    loginButton: "ورود",
    searchCustomer: "جستجو با شناسه مشتری",
    customerInfo: "اطلاعات مشتری",
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    return savedTheme || "light";
  });

  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    return savedLanguage || "fa";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
  }, [language]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === "en" ? "fa" : "en"));
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
