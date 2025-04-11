
import { toast } from "sonner";

// Define Customer type
export type Customer = {
  id: string;
  zipFileName: string;
  name: string;
  status: "active" | "inactive" | "pending";
  customerType: string;
  registrationDate: string;
  lastActivity: string;
  totalTransactions: number;
  creditScore: number;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
};

// Mock customer data
const mockCustomers: Customer[] = Array.from({ length: 20 }, (_, i) => {
  const id = `CUST${String(i + 1).padStart(12, "0")}`;
  return {
    id,
    zipFileName: `${id}_customer_data.zip`,
    name: `مشتری ${i + 1}`,
    status: ["active", "inactive", "pending"][Math.floor(Math.random() * 3)] as "active" | "inactive" | "pending",
    customerType: ["حقیقی", "حقوقی"][Math.floor(Math.random() * 2)],
    registrationDate: new Date(Date.now() - Math.random() * 3e10).toISOString().split("T")[0],
    lastActivity: new Date(Date.now() - Math.random() * 1e9).toISOString().split("T")[0],
    totalTransactions: Math.floor(Math.random() * 100),
    creditScore: Math.floor(Math.random() * 850) + 150,
    contactInfo: {
      email: `customer${i + 1}@example.com`,
      phone: `09${Math.floor(Math.random() * 1000000000)}`,
      address: `آدرس مثال ${i + 1}، تهران، ایران`,
    },
  };
});

// Get recent customers (last 10)
export const getRecentCustomers = async (): Promise<Customer[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockCustomers.slice(0, 10);
};

// Search customer by ID
export const searchCustomerById = async (customerId: string): Promise<Customer | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const customer = mockCustomers.find(c => c.id === customerId || c.id.includes(customerId));
  return customer || null;
};

// Get all customers
export const getAllCustomers = async (): Promise<Customer[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockCustomers;
};

// Get customer statistics
export const getCustomerStatistics = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return {
    totalCustomers: mockCustomers.length,
    activeCustomers: mockCustomers.filter(c => c.status === "active").length,
    inactiveCustomers: mockCustomers.filter(c => c.status === "inactive").length,
    pendingCustomers: mockCustomers.filter(c => c.status === "pending").length,
    individualCustomers: mockCustomers.filter(c => c.customerType === "حقیقی").length,
    corporateCustomers: mockCustomers.filter(c => c.customerType === "حقوقی").length,
    customersByMonth: [4, 6, 9, 12, 8, 10, 7, 5, 8, 11, 9, 13],
  };
};

// Download customer zip file
export const downloadCustomerZip = async (zipFileName: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // In a real application, this would initiate a file download
  // For this demo, we'll just show a success toast
  toast.success(`دریافت فایل "${zipFileName}" شروع شد.`);
  return true;
};
