import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const { serverUrl } = await req.json();
    if (!serverUrl) throw new Error("Server URL is required");
    const response = await fetch(`${serverUrl}/files.json`);
    if (!response.ok) throw new Error("Failed to fetch files from server");
    const files = await response.json();
    // گروه‌بندی فایل‌ها بر اساس شناسه مشتری و ساخت ویژگی‌ها
    const customers = {};
    for (const file of files){
      // فرض می‌کنیم customerId هنوز از ابتدای اسم فایل تا قبل از property است (مثلاً 16 کاراکتر)
      const customerId = file.name.substring(0, 16);
      // جدا کردن property: فقط حروف اول تا اولین عدد
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      const match = fileNameWithoutExt.substring(16).match(/^([^\d]+)/);
      const property = match ? match[1] : fileNameWithoutExt.substring(16);
      if (!customers[customerId]) {
        customers[customerId] = {
          id: customerId,
          zipFileName: file.name,
          name: "مشتری جدید",
          status: "active",
          customerType: "حقیقی",
          registrationDate: new Date().toISOString().split("T")[0],
          lastActivity: new Date().toISOString().split("T")[0],
          totalTransactions: 0,
          creditScore: 500,
          contactInfo: {
            email: "",
            phone: "",
            address: ""
          },
          additionalProperties: {}
        };
      }
      customers[customerId].additionalProperties[property] = file.content || "";
    }
    return new Response(JSON.stringify({
      customers: Object.values(customers)
    }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error("Error in get-customer-files:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});
