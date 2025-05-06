import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase credentials are missing. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.");
}

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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
  additionalProperties?: Record<string, string>;
};

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
    additionalProperties: {},
  };
});

// --- UTIL: Fetch server url once & cache it for all API calls ---
let _serverUrl: string | null = null;
let _fetchServerUrlPromise: Promise<string> | null = null;

export const getServerUrl = async (): Promise<string> => {
  if (_serverUrl) return _serverUrl;
  if (_fetchServerUrlPromise) return _fetchServerUrlPromise;

  if (!supabase) {
    console.error("Supabase client is not initialized");
    return '';
  }

  _fetchServerUrlPromise = supabase
    .from('settings')
    .select('value')
    .eq('key', 'server_url')
    .single()
    .then(({ data, error }) => {
      if (error || !data) {
        _serverUrl = '';
        return '';
      }
      _serverUrl = data.value;
      return _serverUrl;
    })
    .finally(() => {
      _fetchServerUrlPromise = null;
    });

  return _fetchServerUrlPromise;
};

export const setServerUrl = async (url: string): Promise<boolean> => {
  try {
    if (!supabase) {
      console.error("Supabase client is not initialized");
      toast.error("خطا در ذخیره آدرس سرور");
      return false;
    }
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'server_url', value: url });

    if (error) {
      console.error("Error saving server URL:", error);
      toast.error("خطا در ذخیره آدرس سرور");
      return false;
    }
    _serverUrl = url; // update cached value
    toast.success("آدرس سرور با موفقیت ذخیره شد");
    return true;
  } catch (err) {
    console.error("Error in setServerUrl:", err);
    toast.error("خطا در ذخیره آدرس سرور");
    return false;
  }
};

// --- CUSTOMER FILES ---

// Get real files from server using Supabase Edge Function
export const getRealCustomerFiles = async (serverUrl?: string): Promise<Customer[]> => {
  try {
    if (!supabase) {
      console.error("Supabase client is not initialized");
      return mockCustomers;
    }
    if (!serverUrl) {
      serverUrl = await getServerUrl();
    }
    if (!serverUrl) {
      console.error("Server URL not found");
      toast.error("آدرس سرور پیدا نشد");
      return mockCustomers;
    }

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke("get-customer-files", {
      body: { serverUrl },
    });

    if (error || !data || !data.customers) {
      console.error("Error getting customer files:", error);
      toast.error("خطا در دریافت فایل‌های مشتریان");
      return mockCustomers;
    }

    // خروجی فانکشن جدید را به عنوان مشتریان واقعی برمی‌گردانیم
    const customers: Customer[] = data.customers.map((c: any) => ({
      id: c.id,
      zipFileName: c.zipFileName,
      name: c.name || "مشتری جدید",
      status: c.status || "active",
      customerType: c.customerType || "حقیقی",
      registrationDate: c.registrationDate || new Date().toISOString().split("T")[0],
      lastActivity: c.lastActivity || new Date().toISOString().split("T")[0],
      totalTransactions: c.totalTransactions || 0,
      creditScore: c.creditScore || 500,
      contactInfo: c.contactInfo || { email: "", phone: "", address: "" },
      additionalProperties: c.additionalProperties || {},
    }));

    return customers;
  } catch (err) {
    console.error("Error in getRealCustomerFiles:", err);
    toast.error("خطا در دریافت فایل‌های مشتریان");
    return mockCustomers;
  }
};

export const getRecentCustomers = async (): Promise<Customer[]> => {
  try {
    const customers = await getRealCustomerFiles();
    return customers.slice(0, 10);
  } catch (error) {
    console.error("Error in getRecentCustomers:", error);
    return mockCustomers.slice(0, 10);
  }
};

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

export const getAllCustomers = async (): Promise<Customer[]> => {
  try {
    return await getRealCustomerFiles();
  } catch (error) {
    console.error("Error in getAllCustomers:", error);
    return mockCustomers;
  }
};

export const getCustomerStatistics = async () => {
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

// --- FILE DOWNLOAD/DELETE APIS ---

export const downloadCustomerZip = async (zipFileNamePart: string): Promise<boolean> => {
  try {
    if (zipFileNamePart.toLowerCase().endsWith('.zip')) {
      zipFileNamePart = zipFileNamePart.slice(0, -4);
    }

    const serverUrl = await getServerUrl();
    if (!serverUrl) {
      alert("آدرس سرور فایل تنظیم نشده است.");
      return false;
    }
    // دریافت لیست فایل‌ها
    const jsonUrl = `${serverUrl}/files.json.php`;
    const filesResponse = await fetch(jsonUrl);
    if (!filesResponse.ok) {
      alert("خطا در دریافت لیست فایل‌ها از سرور");
      return false;
    }
    const files: { name: string }[] = await filesResponse.json();

    const matchedFiles = files.filter(f =>
      f.name.toLowerCase().startsWith(zipFileNamePart.toLowerCase())
    );
    if (matchedFiles.length === 0) {
      alert(`هیچ فایلی که با "${zipFileNamePart}" شروع شود پیدا نشد.`);
      return false;
    }

    const extractTimestamp = (fileName: string) => {
      const match = fileName.match(/\d{14}/);
      return match ? match[0] : '';
    };
    matchedFiles.sort((a, b) => {
      const tA = extractTimestamp(a.name);
      const tB = extractTimestamp(b.name);
      return tB.localeCompare(tA);
    });
    const latestFile = matchedFiles[0];

    // نکته: مسیر uploads را اضافه می‌کنیم
    const url = `${serverUrl}/uploads/${latestFile.name}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = latestFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    return true;
  } catch (err) {
    console.error("خطا:", err);
    alert(`خطا در دانلود فایل "${zipFileNamePart}"`);
    return false;
  }
};

export const downloadCustomerAllFilesZip = async (customerId: string): Promise<boolean> => {
  try {
    const serverUrl = await getServerUrl();
    if (!serverUrl) {
      alert("آدرس سرور فایل تنظیم نشده است.");
      return false;
    }
    // حذف /uploads انتهای آدرس برای رسیدن به ریشه دامنه
    const baseServerUrl = serverUrl.replace(/\/uploads\/?$/, "");
    const url = `${baseServerUrl}/download_customer_zip.php?customerId=${encodeURIComponent(customerId)}`;

    const a = document.createElement("a");
    a.href = url;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    return true;
  } catch (err) {
    console.error("خطا:", err);
    alert("خطا در دانلود فایل زیپ کلی مشتری");
    return false;
  }
};

export async function deleteCustomerFilesByPattern(pattern: string): Promise<string> {
  const serverUrl = await getServerUrl();
  if (!serverUrl) throw new Error("آدرس سرور فایل تنظیم نشده است.");

  const response = await fetch(`${serverUrl}/delete_customer_files_by_pattern.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `pattern=${encodeURIComponent(pattern)}`
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || "خطا در حذف فایل‌ها");
  return text;
}
