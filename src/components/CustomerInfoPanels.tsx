
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/context/theme-context";
import { downloadCustomerZip, setServerUrl, getServerUrl } from "@/lib/api";
import { toast } from "sonner";
import type { Customer } from "@/lib/api";
import { 
  User, Calendar, Clock, CreditCard, Phone, Mail, 
  MapPin, FileIcon, Activity, Shield, Settings
} from "lucide-react";

interface CustomerInfoPanelsProps {
  customer: Customer;
}

const CustomerInfoPanels = ({ customer }: CustomerInfoPanelsProps) => {
  const { language } = useTheme();
  const [downloading, setDownloading] = useState(false);
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [serverUrl, setServerUrlState] = useState('');
  
  useEffect(() => {
    const fetchServerUrl = async () => {
      const url = await getServerUrl();
      setServerUrlState(url);
    };
    fetchServerUrl();
  }, []);
  
  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadCustomerZip(customer.zipFileName);
    } finally {
      setDownloading(false);
    }
  };
  
  const handleSaveServerUrl = async () => {
    if (!serverUrl) {
      toast.error("لطفا آدرس سرور را وارد کنید");
      return;
    }
    
    const success = await setServerUrl(serverUrl);
    if (success) {
      setShowServerSettings(false);
      // Trigger a page reload to fetch new data
      window.location.reload();
    }
  };
  
  // Extract any additional properties to show in panels
  const additionalProps = customer.additionalProperties || {};
  
  const panels = [
    {
      title: language === "fa" ? "اطلاعات پایه" : "Basic Info",
      icon: User,
      content: (
        <div className="space-y-2">
          <p><strong>{language === "fa" ? "نام" : "Name"}:</strong> {customer.name}</p>
          <p><strong>ID:</strong> {customer.id}</p>
          <p>
            <strong>{language === "fa" ? "وضعیت" : "Status"}:</strong> 
            <span className={
              customer.status === "active" ? "text-green-500" : 
              customer.status === "inactive" ? "text-red-500" : "text-yellow-500"
            }>
              {" "}{customer.status === "active" ? (language === "fa" ? "فعال" : "Active") : 
                customer.status === "inactive" ? (language === "fa" ? "غیرفعال" : "Inactive") : 
                (language === "fa" ? "در انتظار" : "Pending")}
            </span>
          </p>
        </div>
      ),
      color: "bg-blue-100 dark:bg-blue-900/20",
      hoverColor: "hover:bg-blue-200 dark:hover:bg-blue-800/30"
    },
    {
      title: language === "fa" ? "نوع مشتری" : "Customer Type",
      icon: Shield,
      content: (
        <div className="space-y-2">
          <p className="text-xl font-bold">{additionalProps['نوع'] || customer.customerType}</p>
        </div>
      ),
      color: "bg-purple-100 dark:bg-purple-900/20",
      hoverColor: "hover:bg-purple-200 dark:hover:bg-purple-800/30"
    },
    {
      title: language === "fa" ? "تاریخ ثبت" : "Registration Date",
      icon: Calendar,
      content: (
        <div className="space-y-2">
          <p className="text-xl font-bold">{additionalProps['تاریخ'] || customer.registrationDate}</p>
        </div>
      ),
      color: "bg-green-100 dark:bg-green-900/20",
      hoverColor: "hover:bg-green-200 dark:hover:bg-green-800/30"
    },
    {
      title: language === "fa" ? "آخرین فعالیت" : "Last Activity",
      icon: Clock,
      content: (
        <div className="space-y-2">
          <p className="text-xl font-bold">{additionalProps['فعالیت'] || customer.lastActivity}</p>
        </div>
      ),
      color: "bg-yellow-100 dark:bg-yellow-900/20",
      hoverColor: "hover:bg-yellow-200 dark:hover:bg-yellow-800/30"
    },
    {
      title: language === "fa" ? "تراکنش ها" : "Transactions",
      icon: CreditCard,
      content: (
        <div className="space-y-2">
          <p className="text-xl font-bold">{additionalProps['تراکنش'] || customer.totalTransactions}</p>
        </div>
      ),
      color: "bg-red-100 dark:bg-red-900/20",
      hoverColor: "hover:bg-red-200 dark:hover:bg-red-800/30"
    },
    {
      title: language === "fa" ? "امتیاز اعتباری" : "Credit Score",
      icon: Activity,
      content: (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-pistachio-500 h-2.5 rounded-full" 
              style={{ width: `${((Number(additionalProps['امتیاز']) || customer.creditScore) / 1000) * 100}%` }}
            ></div>
          </div>
          <p className="text-xl font-bold">{additionalProps['امتیاز'] || customer.creditScore}</p>
        </div>
      ),
      color: "bg-indigo-100 dark:bg-indigo-900/20",
      hoverColor: "hover:bg-indigo-200 dark:hover:bg-indigo-800/30"
    },
    {
      title: language === "fa" ? "اطلاعات تماس" : "Contact Info",
      icon: Phone,
      content: (
        <div className="space-y-2 text-sm">
          <p className="flex items-center">
            <Mail className="h-4 w-4 mr-1" /> {additionalProps['ایمیل'] || customer.contactInfo.email}
          </p>
          <p className="flex items-center">
            <Phone className="h-4 w-4 mr-1" /> {additionalProps['تلفن'] || customer.contactInfo.phone}
          </p>
        </div>
      ),
      color: "bg-pink-100 dark:bg-pink-900/20",
      hoverColor: "hover:bg-pink-200 dark:hover:bg-pink-800/30"
    },
    {
      title: language === "fa" ? "آدرس" : "Address",
      icon: MapPin,
      content: (
        <div className="space-y-2">
          <p className="text-sm">{additionalProps['آدرس'] || customer.contactInfo.address}</p>
        </div>
      ),
      color: "bg-orange-100 dark:bg-orange-900/20",
      hoverColor: "hover:bg-orange-200 dark:hover:bg-orange-800/30"
    },
    {
      title: language === "fa" ? "تنظیمات سرور" : "Server Settings",
      icon: Settings,
      content: (
        <div className="space-y-2">
          {showServerSettings ? (
            <>
              <Input 
                placeholder={language === "fa" ? "آدرس سرور" : "Server URL"}
                value={serverUrl}
                onChange={(e) => setServerUrlState(e.target.value)}
                className="mb-2"
              />
              <Button 
                size="sm" 
                onClick={handleSaveServerUrl} 
                className="w-full"
              >
                {language === "fa" ? "ذخیره آدرس" : "Save URL"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm mb-2 truncate">{serverUrl || (language === "fa" ? "آدرس سرور تنظیم نشده" : "Server URL not set")}</p>
              <Button 
                size="sm" 
                onClick={() => setShowServerSettings(true)} 
                className="w-full"
              >
                {language === "fa" ? "تنظیم آدرس سرور" : "Set Server URL"}
              </Button>
            </>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {language === "fa" ? "آدرس فولدر: /var/www/html/uploads" : "Folder path: /var/www/html/uploads"}
          </p>
        </div>
      ),
      color: "bg-cyan-100 dark:bg-cyan-900/20",
      hoverColor: "hover:bg-cyan-200 dark:hover:bg-cyan-800/30"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
      {panels.map((panel, index) => (
        <Card 
          key={index} 
          className={`glass-morphism transition-all ${panel.color} ${panel.hoverColor} shadow-md hover:shadow-lg transform hover:-translate-y-1 duration-300`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <panel.icon className="mr-2 h-5 w-5" />
              {panel.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {panel.content}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CustomerInfoPanels;
