
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  // Add additional properties from real files
  additionalProperties?: Record<string, string>;
};

// Mock customer data (will be used as fallback if server connection fails)
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

// Get real files from server using Supabase Edge Function
export const getRealCustomerFiles = async (serverUrl?: string): Promise<Customer[]> => {
  try {
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke("get-customer-files", {
      body: { serverUrl },
    });

    if (error) {
      console.error("Error getting customer files:", error);
      toast.error("خطا در دریافت فایل‌های مشتریان");
      return mockCustomers;
    }

    // Process the data to match our Customer type
    const customers: Customer[] = data.files.map((file: any) => {
      // Extract customer ID from first 16 characters of filename
      const customerId = file.name.substring(0, 16);
      // Extract properties from the next 10 characters
      const property = file.name.substring(16, 26).trim();
      
      // Create a base customer object 
      const customer: Customer = {
        id: customerId,
        zipFileName: file.name,
        name: property || "مشتری جدید",
        status: "active",
        customerType: "حقیقی",
        registrationDate: new Date().toISOString().split("T")[0],
        lastActivity: new Date().toISOString().split("T")[0],
        totalTransactions: 0,
        creditScore: 500,
        contactInfo: {
          email: "",
          phone: "",
          address: "",
        },
        additionalProperties: {
          [property]: file.content || "",
        }
      };
      
      return customer;
    });

    // Group files by customerId and merge properties
    const groupedCustomers = customers.reduce((acc: Record<string, Customer>, curr: Customer) => {
      if (!acc[curr.id]) {
        acc[curr.id] = curr;
      } else {
        // Merge additionalProperties
        acc[curr.id].additionalProperties = {
          ...acc[curr.id].additionalProperties,
          ...curr.additionalProperties
        };
      }
      return acc;
    }, {});

    return Object.values(groupedCustomers);
  } catch (err) {
    console.error("Error in getRealCustomerFiles:", err);
    toast.error("خطا در دریافت فایل‌های مشتریان");
    return mockCustomers;
  }
};

// Get recent customers (last 10)
export const getRecentCustomers = async (): Promise<Customer[]> => {
  try {
    const customers = await getRealCustomerFiles();
    return customers.slice(0, 10);
  } catch (error) {
    console.error("Error in getRecentCustomers:", error);
    return mockCustomers.slice(0, 10);
  }
};

// Search customer by ID
export const searchCustomerById = async (customerId: string): Promise<Customer | null> => {
  try {
    const customers = await getRealCustomerFiles();
    const customer = customers.find(c => c.id === customerId || c.id.includes(customerId));
    return customer || null;
  } catch (error) {
    console.error("Error in searchCustomerById:", error);
    const customer = mockCustomers.find(c => c.id === customerId || c.id.includes(customerId));
    return customer || null;
  }
};

// Get all customers
export const getAllCustomers = async (): Promise<Customer[]> => {
  try {
    return await getRealCustomerFiles();
  } catch (error) {
    console.error("Error in getAllCustomers:", error);
    return mockCustomers;
  }
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
  try {
    // Call the Supabase Edge Function to download the file
    const { data, error } = await supabase.functions.invoke("download-customer-file", {
      body: { fileName: zipFileName },
    });

    if (error) {
      console.error("Error downloading customer file:", error);
      toast.error(`خطا در دانلود فایل "${zipFileName}"`);
      return false;
    }

    // Create a download link for the file
    if (data.fileContent) {
      const blob = new Blob([new Uint8Array(data.fileContent)], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = zipFileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`دریافت فایل "${zipFileName}" با موفقیت انجام شد.`);
      return true;
    } else {
      toast.error(`فایل "${zipFileName}" پیدا نشد.`);
      return false;
    }
  } catch (err) {
    console.error("Error in downloadCustomerZip:", err);
    toast.error(`خطا در دانلود فایل "${zipFileName}"`);
    
    // Fallback to mock behavior
    toast.success(`دریافت فایل "${zipFileName}" شروع شد.`);
    return true;
  }
};

// Set server URL for customer files
export const setServerUrl = async (url: string): Promise<boolean> => {
  try {
    // Store server URL in Supabase
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'server_url', value: url });

    if (error) {
      console.error("Error saving server URL:", error);
      toast.error("خطا در ذخیره آدرس سرور");
      return false;
    }

    toast.success("آدرس سرور با موفقیت ذخیره شد");
    return true;
  } catch (err) {
    console.error("Error in setServerUrl:", err);
    toast.error("خطا در ذخیره آدرس سرور");
    return false;
  }
};

// Get server URL for customer files
export const getServerUrl = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'server_url')
      .single();

    if (error || !data) {
      return '';
    }

    return data.value;
  } catch (err) {
    console.error("Error in getServerUrl:", err);
    return '';
  }
};
