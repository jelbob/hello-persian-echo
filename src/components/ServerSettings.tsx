
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";
import { toast } from "sonner";
import { setServerUrl, getServerUrl } from "@/lib/api";
import { useTheme } from "@/context/theme-context";

const ServerSettings = () => {
  const { language } = useTheme();
  const [serverUrl, setServerUrlState] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const fetchServerUrl = async () => {
      const url = await getServerUrl();
      setServerUrlState(url || '');
    };
    fetchServerUrl();
  }, []);

  const handleSaveServerUrl = async () => {
    if (!serverUrl) {
      toast.error(language === "fa" ? "لطفا آدرس سرور را وارد کنید" : "Please enter server URL");
      return;
    }

    const success = await setServerUrl(serverUrl);
    if (success) {
      setShowSettings(false);
      window.location.reload();
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
        {showSettings ? (
          <>
            <Input 
              placeholder={language === "fa" ? "آدرس سرور" : "Server URL"}
              value={serverUrl}
              onChange={(e) => setServerUrlState(e.target.value)}
              className="mb-2"
              dir="ltr"
            />
            <Button 
              onClick={handleSaveServerUrl} 
              className="w-full"
            >
              {language === "fa" ? "ذخیره آدرس" : "Save URL"}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm mb-2 truncate" dir="ltr">
              {serverUrl || (language === "fa" ? "آدرس سرور تنظیم نشده" : "Server URL not set")}
            </p>
            <Button 
              onClick={() => setShowSettings(true)} 
              className="w-full"
            >
              {language === "fa" ? "تنظیم آدرس سرور" : "Set Server URL"}
            </Button>
          </>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          {language === "fa" ? "آدرس فولدر: /var/www/html/uploads" : "Folder path: /var/www/html/uploads"}
        </p>
      </CardContent>
    </Card>
  );
};

export default ServerSettings;
