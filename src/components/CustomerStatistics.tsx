
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/context/theme-context";
import { getCustomerStatistics } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const CustomerStatistics = () => {
  const { language } = useTheme();
  
  const { data: statistics, isLoading } = useQuery({
    queryKey: ["customerStatistics"],
    queryFn: getCustomerStatistics,
  });

  if (isLoading || !statistics) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle>
              {language === "fa" ? "در حال بارگذاری آمار..." : "Loading statistics..."}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80"></CardContent>
        </Card>
      </div>
    );
  }

  const monthNames = language === "fa" 
    ? ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const monthlyData = statistics.customersByMonth.map((value, index) => ({
    name: monthNames[index],
    value,
  }));

  const statusData = [
    { 
      name: language === "fa" ? "فعال" : "Active", 
      value: statistics.activeCustomers,
      color: "#57a44c"
    },
    { 
      name: language === "fa" ? "غیرفعال" : "Inactive", 
      value: statistics.inactiveCustomers,
      color: "#ef4444"
    },
    { 
      name: language === "fa" ? "در انتظار" : "Pending", 
      value: statistics.pendingCustomers,
      color: "#eab308"
    },
  ];

  const typeData = [
    { 
      name: language === "fa" ? "حقیقی" : "Individual", 
      value: statistics.individualCustomers,
      color: "#3b82f6" 
    },
    { 
      name: language === "fa" ? "حقوقی" : "Corporate", 
      value: statistics.corporateCustomers,
      color: "#8b5cf6"
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-morphism col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {language === "fa" ? "مشتریان جدید در ماه" : "New Customers by Month"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#57a44c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-morphism">
        <CardHeader>
          <CardTitle>
            {language === "fa" ? "وضعیت مشتریان" : "Customer Status"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-morphism">
        <CardHeader>
          <CardTitle>
            {language === "fa" ? "نوع مشتریان" : "Customer Types"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerStatistics;
