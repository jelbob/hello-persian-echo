
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, Settings, LogOut, BarChart, Command, ChevronDown, Moon, Sun, Globe, 
  BarChart2, Users, AlertCircle, Layers
} from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomerInfoPanels from "@/components/CustomerInfoPanels";
import RecentCustomersList from "@/components/RecentCustomersList";
import CustomerStatistics from "@/components/CustomerStatistics";
import { searchCustomerById } from "@/lib/api";
import type { Customer } from "@/lib/api";

const Dashboard = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme, language, toggleLanguage, t } = useTheme();
  const [searchId, setSearchId] = useState("");
  const [showStatistics, setShowStatistics] = useState(false);
  
  const { data: searchedCustomer, refetch: searchCustomer } = useQuery({
    queryKey: ["customer", searchId],
    queryFn: () => searchCustomerById(searchId),
    enabled: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim().length > 0) {
      searchCustomer();
      setShowStatistics(false);
    }
  };

  const handleShowStatistics = () => {
    setShowStatistics(true);
    setSearchId("");
  };

  return (
    <div 
      className={`min-h-screen bg-dna-pattern bg-cover flex ${language === "fa" ? "font-vazir" : ""}`}
      dir={language === "fa" ? "rtl" : "ltr"}
    >
      {/* Left Sidebar */}
      <div className="w-64 h-screen bg-sidebar glass-morphism border-r border-border/50 flex flex-col">
        <div className="p-4 border-b border-border/50">
          <h1 className="text-xl font-bold">DNA Admin</h1>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <nav className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="commands" className="border-b-0">
                <AccordionTrigger className="py-2 px-3 rounded-md hover:bg-sidebar-accent transition-colors">
                  <div className="flex items-center">
                    <Command className="mr-2 h-5 w-5" />
                    <span>{t('commands')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="py-2 pl-7 space-y-2">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <Button
                        key={i}
                        variant="ghost"
                        className="w-full justify-start text-sm"
                      >
                        {language === "fa" ? `دستور ${i + 1}` : `Command ${i + 1}`}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={handleShowStatistics}
            >
              <BarChart className="mr-2 h-5 w-5" />
              <span>{t('statistics')}</span>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-5 w-5" />
              <span>{t('settings')}</span>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" onClick={logout}>
              <LogOut className="mr-2 h-5 w-5" />
              <span>{t('logout')}</span>
            </Button>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 h-screen flex flex-col">
        {/* Top Navigation Bar */}
        <div className="h-14 bg-background/50 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4">
          <h2 className="text-lg font-semibold">{t('dashboard')}</h2>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleLanguage}>
              <Globe size={20} />
            </Button>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {/* Search Box */}
          <div className="w-full max-w-xl mx-auto mb-8">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <Input
                placeholder={t('searchCustomer')}
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                {t('search')}
              </Button>
            </form>
          </div>
          
          {showStatistics ? (
            <CustomerStatistics />
          ) : searchedCustomer ? (
            <div className="max-w-6xl mx-auto">
              <CustomerInfoPanels customer={searchedCustomer} />
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-green-100 dark:bg-green-900/20 glass-morphism animate-fade-in">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <Users className="mr-2 h-5 w-5" />
                      {language === "fa" ? "مشتریان فعال" : "Active Customers"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">156</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-100 dark:bg-blue-900/20 glass-morphism animate-fade-in">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <Layers className="mr-2 h-5 w-5" />
                      {language === "fa" ? "کل پرونده‌ها" : "Total Files"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">843</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-orange-100 dark:bg-orange-900/20 glass-morphism animate-fade-in">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <AlertCircle className="mr-2 h-5 w-5" />
                      {language === "fa" ? "نیاز به بررسی" : "Needs Review"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">24</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Right Sidebar */}
      <div className="w-64 h-screen bg-sidebar glass-morphism border-l border-border/50 flex flex-col">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold">{t('recentCustomers')}</h3>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <RecentCustomersList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
