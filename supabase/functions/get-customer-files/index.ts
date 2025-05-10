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
    let filesUrl = serverUrl.endsWith("/") ? serverUrl.slice(0, -1) : serverUrl;
    filesUrl += "/files.json.php";
    const response = await fetch(filesUrl);
    if (!response.ok) throw new Error("Failed to fetch files from server");
    const files = await response.json();
    const customers = {};
    for (const file of files){
      const customerId = file.name.substring(0, 16);
      const afterId = file.name.substring(16);
      const property = afterId.match(/^[^\d]+/)?.[0] || "Unknown";
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
      // مقدار property را نام فایل قرار بده
      customers[customerId].additionalProperties[property] = file.name;
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
