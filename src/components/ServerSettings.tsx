import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, RefreshCcw, CheckCircle2, AlertTriangle, Link2 } from "lucide-react";
import { toast } from "sonner";
import { setServerUrl, getServerUrl } from "@/lib/api";
import { useTheme } from "@/context/theme-context";

const DEFAULT_SERVER_URL = "https://example.com/api"; // مقدار پیش‌فرض دلخواه

const ServerSettings = () => {
  const { language } = useTheme();
  const [serverUrl, setServerUrlState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<null | "success" | "error">(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    const fetchServerUrl = async () => {
      const url = await getServerUrl();
      setServerUrlState(url || '');
      setLastSaved(url ? new Date().toLocaleString() : null);
    };
    fetchServerUrl();
  }, []);

  const isValidUrl = (url: string) => /^https?:\/\/[^ ]+$/.test(url);

  const handleSaveServerUrl = async () => {
    if (!serverUrl) {
      toast.error(language === "fa" ? "لطفا آدرس سرور را وارد کنید" : "Please enter server URL");
      return;
    }
    if (!isValidUrl(serverUrl)) {
      toast.error(language === "fa" ? "فرمت آدرس صحیح نیست" : "Invalid URL format");
      return;
    }

    setIsLoading(true);
    try {
      const success = await setServerUrl(serverUrl);
      if (success) {
        setLastSaved(new Date().toLocaleString());
        toast.success(language === "fa" ? "آدرس سرور با موفقیت ذخیره شد" : "Server URL saved successfully");
        // window.location.reload(); // Optional: حذف بشه برای UX بهتر
      }
    } catch (error) {
      console.error("Error saving server URL:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDefault = () => {
    setServerUrlState(DEFAULT_SERVER_URL);
    toast.info(language === "fa" ? "مقدار پیش‌فرض بارگذاری شد" : "Loaded default value");
  };

  const handleTestConnection = async () => {
  if (!isValidUrl(serverUrl)) {
    toast.error(language === "fa" ? "فرمت آدرس صحیح نیست" : "Invalid URL format");
    return;
  }
  setIsTesting(true);
  setTestResult(null);
  try {
    // آدرس تست را بساز
    let testUrl = serverUrl;
    if (testUrl.endsWith("/")) testUrl = testUrl.slice(0, -1);
    testUrl += "/files.json.php";

    const res = await fetch(testUrl, { method: "GET" });
    if (res.ok) {
      setTestResult("success");
      toast.success(language === "fa" ? "ارتباط با سرور برقرار شد" : "Server connection successful");
    } else {
      setTestResult("error");
      toast.error(language === "fa" ? "پاسخ از سرور دریافت نشد" : "No response from server");
    }
  } catch (e) {
    setTestResult("error");
    toast.error(language === "fa" ? "ارتباط با سرور برقرار نشد" : "Failed to connect to server");
  } finally {
    setIsTesting(false);
  }
};

  return (
    <Card className="mb-4 bg-cyan-100 dark:bg-cyan-900/20 hover:bg-cyan-200 dark:hover:bg-cyan-800/30 transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Settings className="mr-2 h-5 w-5" />
          {language === "fa" ? "تنظیمات سرور" : "Server Settings"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 items-center mb-2">
          <Input 
            placeholder={language === "fa" ? "آدرس سرور" : "Server URL"}
            value={serverUrl}
            onChange={(e) => setServerUrlState(e.target.value)}
            className="flex-1"
            dir="ltr"
            isInvalid={!!serverUrl && !isValidUrl(serverUrl)}
          />
          <Button 
            onClick={handleTestConnection} 
            variant="outline"
            disabled={isTesting || !serverUrl || !isValidUrl(serverUrl)}
            title={language === "fa" ? "تست اتصال" : "Test Connection"}
          >
            <Link2 className="w-4 h-4" />
          </Button>
          <Button 
            onClick={handleResetDefault}
            variant="ghost"
            title={language === "fa" ? "بازگردانی به پیش‌فرض" : "Reset to Default"}
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mb-2 min-h-[24px]">
          {testResult === "success" && (
            <span className="text-green-600 flex items-center"><CheckCircle2 className="mr-1 w-4 h-4" />{language === "fa" ? "اتصال موفق" : "Success"}</span>
          )}
          {testResult === "error" && (
            <span className="text-yellow-600 flex items-center"><AlertTriangle className="mr-1 w-4 h-4" />{language === "fa" ? "خطا در اتصال" : "Failed"}</span>
          )}
        </div>
        <Button 
          onClick={handleSaveServerUrl} 
          className="w-full"
          disabled={isLoading || !serverUrl || !isValidUrl(serverUrl)}
        >
          {isLoading 
            ? (language === "fa" ? "در حال ذخیره..." : "Saving...") 
            : (language === "fa" ? "ذخیره آدرس" : "Save URL")}
        </Button>
        <div className="text-xs text-muted-foreground mt-2 flex flex-row-reverse justify-between">
          {lastSaved && (
            <span>
              {language === "fa" ? "آخرین ذخیره: " : "Last saved: "} {lastSaved}
            </span>
          )}
          <span className="opacity-60">v1.0.0</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServerSettings;
