
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/context/theme-context";
import { getRecentCustomers, searchCustomerById } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const RecentCustomersList = () => {
  const { language } = useTheme();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  const { data: recentCustomers, isLoading } = useQuery({
    queryKey: ["recentCustomers"],
    queryFn: getRecentCustomers,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div>
              <Skeleton className="h-3 w-3 rounded-full" />
            </div>
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recentCustomers?.map((customer) => (
        <Button
          key={customer.id}
          variant="ghost"
          className={`w-full justify-start text-sm ${
            selectedCustomerId === customer.id ? "bg-primary/10" : ""
          }`}
          onClick={() => {
            setSelectedCustomerId(customer.id);
            // In a real app, you'd dispatch an action to show this customer in main area
          }}
        >
          <span className="h-2 w-2 mr-2 rounded-full bg-green-500 animate-pulse-green"></span>
          <span className="truncate">{customer.id}</span>
        </Button>
      ))}
    </div>
  );
};

export default RecentCustomersList;
