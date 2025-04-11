import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme-context";
import { downloadCustomerZip } from "@/lib/api";
import type { Customer } from "@/lib/api";
import { 
  User, Calendar, Clock, CreditCard, Phone, Mail, 
  MapPin, FileIcon, Activity, Shield
} from "lucide-react";

interface CustomerInfoPanelsProps {
  customer: Customer;
}

const CustomerInfoPanels = ({ customer }: CustomerInfoPanelsProps) => {
  const { language } = useTheme();
  const [downloading, setDownloading] = useState(false);
  
  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadCustomerZip(customer.zipFileName);
    } finally {
      setDownloading(false);
    }
  };
  
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
      color: "bg-blue-500/10",
    },
    {
      title: language === "fa" ? "نوع مشتری" : "Customer Type",
      icon: Shield,
      content: (
        <div className="space-y-2">
          <p className="text-xl font-bold">{customer.customerType}</p>
        </div>
      ),
      color: "bg-purple-500/10",
    },
    {
      title: language === "fa" ? "تاریخ ثبت" : "Registration Date",
      icon: Calendar,
      content: (
        <div className="space-y-2">
          <p className="text-xl font-bold">{customer.registrationDate}</p>
        </div>
      ),
      color: "bg-green-500/10",
    },
    {
      title: language === "fa" ? "آخرین فعالیت" : "Last Activity",
      icon: Clock,
      content: (
        <div className="space-y-2">
          <p className="text-xl font-bold">{customer.lastActivity}</p>
        </div>
      ),
      color: "bg-yellow-500/10",
    },
    {
      title: language === "fa" ? "تراکنش ها" : "Transactions",
      icon: CreditCard,
      content: (
        <div className="space-y-2">
          <p className="text-xl font-bold">{customer.totalTransactions}</p>
        </div>
      ),
      color: "bg-red-500/10",
    },
    {
      title: language === "fa" ? "امتیاز اعتباری" : "Credit Score",
      icon: Activity,
      content: (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-pistachio-500 h-2.5 rounded-full" 
              style={{ width: `${(customer.creditScore / 1000) * 100}%` }}
            ></div>
          </div>
          <p className="text-xl font-bold">{customer.creditScore}</p>
        </div>
      ),
      color: "bg-indigo-500/10",
    },
    {
      title: language === "fa" ? "اطلاعات تماس" : "Contact Info",
      icon: Phone,
      content: (
        <div className="space-y-2 text-sm">
          <p className="flex items-center">
            <Mail className="h-4 w-4 mr-1" /> {customer.contactInfo.email}
          </p>
          <p className="flex items-center">
            <Phone className="h-4 w-4 mr-1" /> {customer.contactInfo.phone}
          </p>
        </div>
      ),
      color: "bg-pink-500/10",
    },
    {
      title: language === "fa" ? "آدرس" : "Address",
      icon: MapPin,
      content: (
        <div className="space-y-2">
          <p className="text-sm">{customer.contactInfo.address}</p>
        </div>
      ),
      color: "bg-orange-500/10",
    },
    {
      title: language === "fa" ? "فایل پرونده" : "Customer File",
      icon: FileIcon,
      content: (
        <div className="space-y-2">
          <p className="text-sm mb-2">{customer.zipFileName}</p>
          <Button 
            size="sm" 
            onClick={handleDownload} 
            disabled={downloading}
            className="w-full"
          >
            {downloading 
              ? (language === "fa" ? "در حال دانلود..." : "Downloading...") 
              : (language === "fa" ? "دانلود فایل" : "Download File")}
          </Button>
        </div>
      ),
      color: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {panels.map((panel, index) => (
        <Card 
          key={index} 
          className={`glass-morphism animate-fade-in ${panel.color}`}
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
