
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "@/context/theme-context";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { language } = useTheme();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-dna-pattern bg-cover flex items-center justify-center p-4">
      <div className="text-center glass-morphism p-8 rounded-lg max-w-md">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl mb-6">
          {language === "fa" 
            ? "صفحه مورد نظر یافت نشد" 
            : "Page not found"}
        </p>
        <Button asChild>
          <Link to="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            {language === "fa" ? "بازگشت به داشبورد" : "Return to Dashboard"}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
